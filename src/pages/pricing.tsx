import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { SUBSCRIPTION_TIERS } from "@/lib/stripe";
import { useState } from "react";

export default function PricingPage() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (!user) {
      setError("Please sign in to subscribe");
      return;
    }

    if (!SUBSCRIPTION_TIERS.PREMIUM.id) {
      setError("Stripe price ID is not configured");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId: SUBSCRIPTION_TIERS.PREMIUM.id,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to start checkout");
      }

      if (!data.url) {
        throw new Error("Checkout URL missing");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Subscription error:", err);
      setError(err instanceof Error ? err.message : "Failed to start subscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Pricing — RegsGPT</title>
      </Head>
      <div className="min-h-[calc(100vh-2rem)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-xl text-gray-300">
              Free to sign in. Subscribe to use AI chat grounded in Army
              regulations.
            </p>
          </div>

          <div className="mt-12 max-w-lg mx-auto">
            <div className="rounded-lg border border-[#3A4D25] bg-[#26331B] overflow-hidden">
              <div className="px-6 py-8">
                <h3 className="text-center text-3xl font-bold text-white">
                  {SUBSCRIPTION_TIERS.PREMIUM.name}
                </h3>
                <p className="mt-6 text-center text-5xl font-extrabold text-white">
                  {SUBSCRIPTION_TIERS.PREMIUM.price}
                  <span className="text-xl font-medium text-gray-400">
                    /month
                  </span>
                </p>
                <ul className="mt-6 space-y-4">
                  {SUBSCRIPTION_TIERS.PREMIUM.features.map((feature) => (
                    <li key={feature} className="flex items-center text-gray-200">
                      <svg
                        className="flex-shrink-0 h-5 w-5 text-green-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-3 text-base">{feature}</span>
                    </li>
                  ))}
                </ul>

                {error && (
                  <p className="mt-4 text-center text-red-300 text-sm">{error}</p>
                )}

                <button
                  onClick={handleSubscribe}
                  disabled={isLoading || !!subscription?.isActive}
                  className="mt-8 w-full bg-primary text-white rounded-md py-3 px-4 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subscription?.isActive
                    ? "Already Subscribed"
                    : isLoading
                      ? "Processing..."
                      : user
                        ? "Subscribe Now"
                        : "Sign in to Subscribe"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
