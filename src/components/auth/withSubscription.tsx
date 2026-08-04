import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { ComponentType } from "react";

export function withSubscription<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  return function WithSubscriptionComponent(props: P) {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { subscription, isLoading } = useSubscription();

    if (authLoading || isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-gray-300">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      router.replace("/");
      return null;
    }

    if (!subscription?.isActive) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full px-6 py-8 bg-[#26331B] border border-[#3A4D25] rounded-lg">
            <h2 className="text-2xl font-bold text-center text-white mb-4">
              Premium Feature
            </h2>
            <p className="text-gray-300 text-center mb-6">
              AI chat requires a premium subscription.
            </p>
            <button
              onClick={() => router.push("/pricing")}
              className="w-full bg-primary text-white rounded-lg py-2 px-4 hover:bg-primary/90 transition-colors"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
