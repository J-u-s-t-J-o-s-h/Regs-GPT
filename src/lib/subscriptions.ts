import type Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

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
  const { error } = await getSupabaseAdmin()
    .from("subscriptions")
    .upsert(
      {
        user_id: uid,
        status: data.status,
        tier: data.tier,
        stripe_customer_id: data.stripeCustomerId ?? null,
        stripe_subscription_id: data.stripeSubscriptionId ?? null,
        current_period_end: data.currentPeriodEnd
          ? data.currentPeriodEnd.toISOString()
          : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) {
    throw new Error(`Failed to write subscription status: ${error.message}`);
  }
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
