import type { NextApiRequest, NextApiResponse } from "next";
import { requireUser } from "@/lib/auth-api";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  FREE_DAILY_MESSAGE_LIMIT,
  PREMIUM_HARD_CAP_TOKENS,
  checkRateLimit,
  getTodayTokenUsage,
  getTodayUsageCount,
  incrementTodayUsage,
  recordTokenUsage,
  throttleDelayMs,
} from "@/lib/chat-usage";
import {
  ensureConversation,
  saveMessage,
  touchConversation,
} from "@/lib/chat-history";
import {
  generateAnswer,
  retrieveContext,
  type ChatMessage,
} from "@/lib/gemini";

// Gemini has no server-side threads, so the client replays recent turns.
// Cap them so a large payload cannot blow up the prompt.
const MAX_HISTORY_MESSAGES = 12;

// A real question doesn't need more than this. Without a cap, a single
// message can blow up embedding + generation input cost regardless of the
// daily message/token limits below.
const MAX_MESSAGE_CHARS = 4000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Gemini doesn't report embedding token usage; chars/4 is a close enough estimate. */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function sanitizeHistory(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is ChatMessage =>
        !!item &&
        typeof item === "object" &&
        ((item as ChatMessage).role === "user" ||
          (item as ChatMessage).role === "assistant") &&
        Array.isArray((item as ChatMessage).content)
    )
    .map((item) => ({
      role: item.role,
      content: item.content.filter(
        (part): part is string => typeof part === "string"
      ),
    }))
    .slice(-MAX_HISTORY_MESSAGES);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { uid } = await requireUser(req);

    // Applies to every user regardless of tier — stops a scripted loop from
    // firing requests faster than a human could, independent of the
    // message/token caps below.
    const withinRateLimit = await checkRateLimit(uid);
    if (!withinRateLimit) {
      return res.status(429).json({
        error: "You're sending messages too quickly. Please slow down and try again shortly.",
        code: "rate_limited",
      });
    }

    const { message, history, conversationId } = req.body as {
      message?: string;
      history?: unknown;
      conversationId?: string;
    };

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (message.trim().length > MAX_MESSAGE_CHARS) {
      return res.status(400).json({
        error: `Messages are limited to ${MAX_MESSAGE_CHARS} characters. Please shorten your question.`,
        code: "message_too_long",
      });
    }

    const question = message.trim();

    const { data: subscription, error: subscriptionError } =
      await getSupabaseAdmin()
        .from("subscriptions")
        .select("status")
        .eq("user_id", uid)
        .maybeSingle();

    if (subscriptionError) {
      throw new Error(
        `Failed to read subscription: ${subscriptionError.message}`
      );
    }

    const isPremium = subscription?.status === "active";
    let usageCount = 0;

    if (!isPremium) {
      usageCount = await getTodayUsageCount(uid);

      if (usageCount >= FREE_DAILY_MESSAGE_LIMIT) {
        return res.status(403).json({
          error: `You've used all ${FREE_DAILY_MESSAGE_LIMIT} free messages for today. Upgrade to Premium for unlimited access.`,
          code: "free_limit_reached",
        });
      }
    } else {
      // Stripe bills premium flat; Gemini bills per token. "Unlimited" still
      // needs a ceiling so one account can't run up costs past what its
      // subscription covers. Below the soft threshold this is invisible;
      // past it, requests slow down before hitting a hard stop.
      const tokensToday = await getTodayTokenUsage(uid);

      if (tokensToday >= PREMIUM_HARD_CAP_TOKENS) {
        return res.status(429).json({
          error: "You've reached today's usage limit. It resets tomorrow — contact support if you need a higher limit.",
          code: "daily_token_limit_reached",
        });
      }

      const delay = throttleDelayMs(tokensToday);
      if (delay > 0) {
        await sleep(delay);
      }
    }

    const resolvedConversationId = await ensureConversation(
      uid,
      conversationId,
      question
    );
    await saveMessage(resolvedConversationId, "user", question);

    const chunks = await retrieveContext(question);
    const { text: answer, inputTokens, outputTokens } = await generateAnswer(
      question,
      sanitizeHistory(history),
      chunks
    );

    const citations = chunks.map((chunk) => ({
      docId: chunk.doc_id,
      title: chunk.title,
      page: chunk.page,
      sourceUrl: chunk.source_url,
    }));

    await saveMessage(resolvedConversationId, "assistant", answer, citations);
    await touchConversation(resolvedConversationId);

    if (!isPremium) {
      await incrementTodayUsage(uid, usageCount);
    }
    await recordTokenUsage(uid, inputTokens + estimateTokens(question), outputTokens);

    return res.status(200).json({
      reply: { role: "assistant", content: [answer] },
      citations,
      conversationId: resolvedConversationId,
    });
  } catch (error) {
    const statusCode =
      typeof error === "object" &&
      error &&
      "statusCode" in error &&
      typeof (error as { statusCode: unknown }).statusCode === "number"
        ? (error as { statusCode: number }).statusCode
        : 500;

    if (statusCode === 401) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.error("Error in assistant chat:", error);
    return res.status(500).json({
      error: "An error occurred while processing your request",
    });
  }
}
