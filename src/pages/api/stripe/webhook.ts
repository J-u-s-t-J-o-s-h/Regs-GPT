import type { NextApiRequest, NextApiResponse } from "next";
import type Stripe from "stripe";
import { buffer } from "micro";
import { stripe } from "@/lib/stripe-server";
import {
  setSubscriptionStatus,
  syncSubscriptionFromStripe,
} from "@/lib/subscriptions";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getUidFromSubscription(subscription: Stripe.Subscription) {
  if (subscription.metadata?.uid) {
    return subscription.metadata.uid;
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return null;

  return customer.metadata?.uid || null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const signature = req.headers["stripe-signature"];
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ error: "Missing webhook signature or secret" });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return res.status(400).json({ error: "Invalid signature" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.metadata?.uid || session.client_reference_id;
        if (!uid || !session.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id
        );

        await syncSubscriptionFromStripe(
          uid,
          subscription,
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id
        );
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const uid = await getUidFromSubscription(subscription);
        if (!uid) break;

        if (event.type === "customer.subscription.deleted") {
          await setSubscriptionStatus(uid, {
            status: "canceled",
            tier: "premium",
            stripeCustomerId:
              typeof subscription.customer === "string"
                ? subscription.customer
                : subscription.customer.id,
            stripeSubscriptionId: subscription.id,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          });
        } else {
          await syncSubscriptionFromStripe(uid, subscription);
        }
        break;
      }
      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}
