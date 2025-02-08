import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SUBSCRIPTION_TIERS } from '@/lib/stripe';
import { useState } from 'react';

export default function PricingPage() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      alert('Please sign in to subscribe');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: SUBSCRIPTION_TIERS.PREMIUM.id,
        }),
      });

      const { sessionId } = await response.json();
      if (sessionId) {
        window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start subscription process');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Get unlimited access to Army regulations with AI-powered assistance
          </p>
        </div>

        <div className="mt-12 max-w-lg mx-auto">
          <div className="rounded-lg shadow-lg overflow-hidden">
            <div className="bg-white px-6 py-8">
              <h3 className="text-center text-3xl font-bold text-gray-900">
                {SUBSCRIPTION_TIERS.PREMIUM.name}
              </h3>
              <div className="mt-4 flex justify-center">
                <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
                  Most Popular
                </span>
              </div>
              <p className="mt-6 text-center text-5xl font-extrabold text-gray-900">
                {SUBSCRIPTION_TIERS.PREMIUM.price}
                <span className="text-xl font-medium text-gray-500">/month</span>
              </p>
              <ul className="mt-6 space-y-4">
                {SUBSCRIPTION_TIERS.PREMIUM.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <svg
                      className="flex-shrink-0 h-5 w-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-3 text-base text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleSubscribe}
                disabled={isLoading || subscription?.isActive}
                className="mt-8 w-full bg-primary text-white rounded-md py-3 px-4 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {subscription?.isActive
                  ? 'Already Subscribed'
                  : isLoading
                  ? 'Processing...'
                  : 'Subscribe Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 