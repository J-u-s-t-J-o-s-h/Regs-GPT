import type { NextApiRequest, NextApiResponse } from "next";
import { requireUser } from "@/lib/auth-api";
import { stripe } from "@/lib/stripe-server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const decodedToken = await requireUser(req);
    const { email, uid } = decodedToken;
    const { priceId } = req.body as { priceId?: string };

    if (!priceId) {
      return res.status(400).json({ error: "priceId is required" });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${new URL("/dashboard", baseUrl).href}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${new URL("/pricing", baseUrl).href}`,
      client_reference_id: uid,
      metadata: { uid },
      subscription_data: {
        metadata: { uid },
      },
    });

    if (!session.url) {
      return res.status(500).json({ error: "Checkout session URL missing" });
    }

    return res.status(200).json({ sessionId: session.id, url: session.url });
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

    console.error("Stripe checkout error:", error);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
