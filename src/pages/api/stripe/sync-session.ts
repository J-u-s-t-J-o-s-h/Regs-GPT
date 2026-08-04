import type { NextApiRequest, NextApiResponse } from "next";
import { requireUser } from "@/lib/auth-api";
import { stripe } from "@/lib/stripe-server";
import { syncSubscriptionFromStripe } from "@/lib/subscriptions";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const decodedToken = await requireUser(req);
    const { sessionId } = req.body as { sessionId?: string };

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    const uid = session.metadata?.uid || session.client_reference_id;
    if (!uid || uid !== decodedToken.uid) {
      return res.status(403).json({ error: "Session does not belong to this user" });
    }

    if (session.status !== "complete") {
      return res.status(400).json({ error: "Checkout session is not complete" });
    }

    const subscription = session.subscription;
    if (!subscription || typeof subscription === "string") {
      return res.status(400).json({ error: "Subscription not found on session" });
    }

    await syncSubscriptionFromStripe(
      uid,
      subscription,
      typeof session.customer === "string" ? session.customer : session.customer?.id
    );

    return res.status(200).json({ ok: true, status: subscription.status });
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

    console.error("Stripe sync-session error:", error);
    return res.status(500).json({ error: "Failed to sync subscription" });
  }
}
