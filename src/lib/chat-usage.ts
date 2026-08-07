import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Daily cap for signed-in users without an active subscription.
export const FREE_DAILY_MESSAGE_LIMIT = 5;

// Requests per rolling window, enforced for every user regardless of tier.
// Generous for real typing speed, tight enough to stop a scripted loop.
export const RATE_LIMIT_MAX_REQUESTS = 10;
export const RATE_LIMIT_WINDOW_SECONDS = 60;

// Premium is billed flat by Stripe but Gemini bills per token, so "unlimited"
// still needs a ceiling. Below the soft threshold, premium users never notice
// anything. Past it, requests get progressively delayed (see throttleDelayMs)
// rather than blocked. The hard cap is the last-resort cutoff.
export const PREMIUM_SOFT_THROTTLE_TOKENS = 300_000;
export const PREMIUM_HARD_CAP_TOKENS = 1_000_000;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns how many free messages this user has sent today. */
export async function getTodayUsageCount(uid: string): Promise<number> {
  const { data, error } = await getSupabaseAdmin()
    .from("chat_usage")
    .select("count")
    .eq("user_id", uid)
    .eq("day", today())
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to read chat usage: ${error.message}`);
  }

  return data?.count ?? 0;
}

/** Records one free message against today's count and returns the new total. */
export async function incrementTodayUsage(uid: string, currentCount: number): Promise<number> {
  const nextCount = currentCount + 1;

  const { error } = await getSupabaseAdmin().from("chat_usage").upsert(
    {
      user_id: uid,
      day: today(),
      count: nextCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,day" }
  );

  if (error) {
    throw new Error(`Failed to record chat usage: ${error.message}`);
  }

  return nextCount;
}

/**
 * Allows or rejects a request against a per-user rolling-window request cap.
 * Applies to every user regardless of tier — a message-count/token cap alone
 * doesn't stop a script from firing requests as fast as the network allows.
 */
export async function checkRateLimit(uid: string): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin().rpc("check_rate_limit", {
    p_user_id: uid,
    p_limit: RATE_LIMIT_MAX_REQUESTS,
    p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
  });

  if (error) {
    throw new Error(`Failed to check rate limit: ${error.message}`);
  }

  return data as boolean;
}

/** Returns this user's total Gemini token usage (input + output) for today. */
export async function getTodayTokenUsage(uid: string): Promise<number> {
  const { data, error } = await getSupabaseAdmin()
    .from("chat_usage")
    .select("input_tokens, output_tokens")
    .eq("user_id", uid)
    .eq("day", today())
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to read token usage: ${error.message}`);
  }

  return (data?.input_tokens ?? 0) + (data?.output_tokens ?? 0);
}

/** Records actual token usage from a completed Gemini call. */
export async function recordTokenUsage(
  uid: string,
  inputTokens: number,
  outputTokens: number
): Promise<void> {
  const { error } = await getSupabaseAdmin().rpc("record_token_usage", {
    p_user_id: uid,
    p_input_tokens: inputTokens,
    p_output_tokens: outputTokens,
  });

  if (error) {
    throw new Error(`Failed to record token usage: ${error.message}`);
  }
}

/**
 * Delay to apply before an expensive Gemini call once a premium user has
 * crossed the soft-throttle threshold. Scales with how far over they are,
 * capped at 5s so it discourages tight loops without punishing a heavy but
 * legitimate user with a broken-feeling UI.
 */
export function throttleDelayMs(tokensUsedToday: number): number {
  if (tokensUsedToday <= PREMIUM_SOFT_THROTTLE_TOKENS) return 0;
  const overage = tokensUsedToday - PREMIUM_SOFT_THROTTLE_TOKENS;
  return Math.min(5000, Math.floor(overage / 1000) * 100);
}
