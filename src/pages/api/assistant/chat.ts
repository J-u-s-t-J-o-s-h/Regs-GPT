import type { NextApiRequest, NextApiResponse } from "next";
import { requireUser } from "@/lib/auth-api";
import { adminDb } from "@/lib/firebase-admin";
import {
  createThread,
  createMessage,
  runAssistant,
  getRunStatus,
  getChatMessages,
} from "@/lib/openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const decodedToken = await requireUser(req);
    const { uid } = decodedToken;

    const subscriptionSnap = await adminDb
      .collection("users")
      .doc(uid)
      .collection("subscriptions")
      .doc("status")
      .get();

    if (!subscriptionSnap.exists || subscriptionSnap.data()?.status !== "active") {
      return res.status(403).json({ error: "Premium subscription required" });
    }

    const { message, threadId } = req.body as {
      message?: string;
      threadId?: string | null;
    };

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const currentThreadId = threadId || (await createThread());
    await createMessage(currentThreadId, message.trim());

    const run = await runAssistant(currentThreadId);

    let runStatus = await getRunStatus(currentThreadId, run.id);
    while (runStatus.status === "in_progress" || runStatus.status === "queued") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await getRunStatus(currentThreadId, run.id);
    }

    if (runStatus.status !== "completed") {
      return res.status(500).json({
        error: `Run ended with status: ${runStatus.status}`,
      });
    }

    const messages = await getChatMessages(currentThreadId);

    return res.status(200).json({
      threadId: currentThreadId,
      messages,
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
