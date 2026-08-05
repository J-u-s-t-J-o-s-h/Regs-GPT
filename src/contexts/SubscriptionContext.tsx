import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";

interface SubscriptionStatus {
  isActive: boolean;
  tier: string | null;
  endDate: Date | null;
}

interface SubscriptionContextType {
  subscription: SubscriptionStatus | null;
  isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

const INACTIVE: SubscriptionStatus = {
  isActive: false,
  tier: null,
  endDate: null,
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    let active = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("status, tier, current_period_end")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active) return;

      if (error || !data) {
        setSubscription(INACTIVE);
      } else {
        setSubscription({
          isActive: data.status === "active",
          tier: data.tier ?? null,
          endDate: data.current_period_end
            ? new Date(data.current_period_end)
            : null,
        });
      }

      setIsLoading(false);
    };

    load();

    // Reflect webhook-driven changes without a page refresh.
    const channel = supabase
      .channel(`subscriptions:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: `user_id=eq.${user.id}`,
        },
        load
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
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
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
};
