import Head from "next/head";
import Link from "next/link";
import LoginButton from "@/components/auth/LoginButton";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

export default function Home() {
  const { user, loading } = useAuth();
  const { subscription } = useSubscription();

  return (
    <>
      <Head>
        <title>RegsGPT — Army Regulations, Plain Language</title>
      </Head>
      <main className="min-h-[calc(100vh-2rem)] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          RegsGPT
        </h1>
        <p className="mt-4 max-w-xl text-lg text-gray-300">
          Ask questions about Army regulations and get clear, citation-backed
          answers — without digging through PDFs.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {!loading && !user && <LoginButton />}
          {user && (
            <>
              <Link
                href={subscription?.isActive ? "/chat" : "/pricing"}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-light transition-colors no-underline"
              >
                {subscription?.isActive ? "Open Chat" : "Get Premium Access"}
              </Link>
              <LoginButton />
            </>
          )}
          {!user && (
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-[#3A4D25] text-gray-200 hover:bg-[#2F3D1C] transition-colors no-underline"
            >
              View Pricing
            </Link>
          )}
        </div>
      </main>
    </>
  );
}
