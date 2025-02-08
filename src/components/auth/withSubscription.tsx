import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { ComponentType } from 'react';

export function withSubscription<P extends object>(WrappedComponent: ComponentType<P>) {
  return function WithSubscriptionComponent(props: P) {
    const router = useRouter();
    const { user } = useAuth();
    const { subscription, isLoading } = useSubscription();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      router.push('/login');
      return null;
    }

    if (!subscription?.isActive) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full px-6 py-8 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Premium Feature
            </h2>
            <p className="text-gray-600 text-center mb-6">
              This feature requires a premium subscription to access.
            </p>
            <button
              onClick={() => router.push('/pricing')}
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