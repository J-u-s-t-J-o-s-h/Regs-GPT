import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { withAuth } from "@/components/auth/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

function DashboardPage() {
  const router = useRouter();
  const { user, getAccessToken } = useAuth();
  const { subscription, isLoading } = useSubscription();
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const syncedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    const sessionId = router.query.session_id;
    if (!router.isReady || !user || typeof sessionId !== "string") return;
    if (syncedSessionRef.current === sessionId) return;

    syncedSessionRef.current = sessionId;
    let cancelled = false;

    const sync = async () => {
      setSyncing(true);
      setError(null);
      try {
        const token = await getAccessToken();
        if (!token) {
          throw new Error("Your session expired. Please sign in again.");
        }

        const response = await fetch("/api/stripe/sync-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionId }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to sync subscription");
        }
        if (!cancelled) {
          await router.replace("/dashboard");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Sync failed");
          syncedSessionRef.current = null;
        }
      } finally {
        if (!cancelled) setSyncing(false);
      }
    };

    void sync();

    return () => {
      cancelled = true;
    };
  }, [user, router, getAccessToken]);

  return (
    <>
      <Head>
        <title>Dashboard — RegsGPT</title>
      </Head>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-gray-300">Signed in as {user?.email}</p>

        <div className="mt-8 rounded-lg border border-[#3A4D25] bg-[#26331B] p-6">
          <h2 className="text-xl font-semibold text-white">Subscription</h2>
          {isLoading || syncing ? (
            <p className="mt-3 text-gray-300">
              {syncing
                ? "Confirming your payment..."
                : "Loading subscription..."}
            </p>
          ) : subscription?.isActive ? (
            <p className="mt-3 text-green-300">
              Premium active
              {subscription.endDate
                ? ` through ${subscription.endDate.toLocaleDateString()}`
                : ""}
            </p>
          ) : (
            <p className="mt-3 text-gray-300">
              Free plan — 5 chat messages per day.{" "}
              <Link href="/pricing" className="text-blue-300 underline">
                Upgrade to Premium
              </Link>{" "}
              for unlimited access.
            </p>
          )}
          {error && <p className="mt-3 text-red-300 text-sm">{error}</p>}
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href="/chat"
            className="inline-flex px-5 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-light no-underline"
          >
            Start chatting
          </Link>
          {!subscription?.isActive && (
            <Link
              href="/pricing"
              className="inline-flex px-5 py-2.5 rounded-lg border border-[#3A4D25] text-white hover:bg-[#26331B] no-underline"
            >
              View pricing
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export default withAuth(DashboardPage);
