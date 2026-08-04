import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import type Stripe from "stripe";

export async function setSubscriptionStatus(
  uid: string,
  data: {
    status: string;
    tier: string;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    currentPeriodEnd?: Date | null;
  }
) {
  const ref = adminDb.collection("users").doc(uid).collection("subscriptions").doc("status");

  await ref.set(
    {
      status: data.status,
      tier: data.tier,
      stripeCustomerId: data.stripeCustomerId ?? null,
      stripeSubscriptionId: data.stripeSubscriptionId ?? null,
      current_period_end: data.currentPeriodEnd
        ? Timestamp.fromDate(data.currentPeriodEnd)
        : null,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

export async function syncSubscriptionFromStripe(
  uid: string,
  subscription: Stripe.Subscription,
  customerId?: string | null
) {
  const isActive =
    subscription.status === "active" || subscription.status === "trialing";

  await setSubscriptionStatus(uid, {
    status: isActive ? "active" : subscription.status,
    tier: "premium",
    stripeCustomerId: customerId ?? (subscription.customer as string),
    stripeSubscriptionId: subscription.id,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  });
}
