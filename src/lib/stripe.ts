import { loadStripe } from "@stripe/stripe-js";

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

export const SUBSCRIPTION_TIERS = {
  PREMIUM: {
    id: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
    name: "Premium",
    price: "$9.99",
    features: [
      "Unlimited AI chat on Army regulations",
      "Answers grounded with File Search citations",
      "Ad-free experience",
      "Priority support",
    ],
  },
};
