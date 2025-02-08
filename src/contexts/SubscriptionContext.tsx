import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

interface SubscriptionStatus {
  isActive: boolean;
  tier: string | null;
  endDate: Date | null;
}

interface SubscriptionContextType {
  subscription: SubscriptionStatus | null;
  isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid, 'subscriptions', 'status'),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setSubscription({
            isActive: data.status === 'active',
            tier: data.tier,
            endDate: data.current_period_end?.toDate() || null,
          });
        } else {
          setSubscription({
            isActive: false,
            tier: null,
            endDate: null,
          });
        }
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <SubscriptionContext.Provider value={{ subscription, isLoading }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}; 