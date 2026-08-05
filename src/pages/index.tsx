import Head from "next/head";
import Link from "next/link";
import LoginButton from "@/components/auth/LoginButton";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <>
      <Head>
        <title>RegsGPT — Army Regulations, Plain Language</title>
      </Head>
      <main className="relative flex min-h-[calc(100vh-2rem)] flex-col items-center justify-center overflow-hidden px-4 text-center">
        {/* Faint tactical grid backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(90,109,69,0.09) 0px, rgba(90,109,69,0.09) 1px, transparent 1px, transparent 48px), repeating-linear-gradient(90deg, rgba(90,109,69,0.09) 0px, rgba(90,109,69,0.09) 1px, transparent 1px, transparent 48px)",
            maskImage:
              "radial-gradient(ellipse at center, black 0%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 0%, transparent 75%)",
          }}
        />
        {/* Soft glow behind the wordmark */}
        <div
          aria-hidden
          className="animate-pulse-glow pointer-events-none absolute left-1/2 top-1/3 h-[28rem] w-[28rem] rounded-full bg-primary-light/25 blur-[110px]"
        />

        <div className="relative">
          <div className="animate-fade-in-up flex items-center justify-center gap-3">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-9 w-9 text-primary-light md:h-10 md:w-10"
            >
              <path d="M12 1.5l2.6 6.3 6.8.6-5.2 4.5 1.6 6.6L12 15.9 6.2 19.5l1.6-6.6-5.2-4.5 6.8-.6L12 1.5z" />
            </svg>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
              RegsGPT
            </h1>
          </div>

          <p
            className="animate-fade-in-up mx-auto mt-4 max-w-xl text-lg text-gray-300"
            style={{ animationDelay: "120ms" }}
          >
            Ask questions about Army regulations and get clear,
            citation-backed answers — without digging through PDFs.
          </p>

          <div
            className="animate-fade-in-up mt-8 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "240ms" }}
          >
            {!loading && !user && <LoginButton />}
            {user && (
              <>
                <Link
                  href="/chat"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-white shadow-lg shadow-black/20 transition-colors no-underline hover:bg-primary-light"
                >
                  Open Chat
                </Link>
                <LoginButton />
              </>
            )}
            {!user && (
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-lg border border-[#3A4D25] px-5 py-2.5 text-gray-200 transition-colors no-underline hover:bg-[#2F3D1C]"
              >
                View Pricing
              </Link>
            )}
          </div>

          <p
            className="animate-fade-in-up mt-10 text-xs uppercase tracking-[0.3em] text-gray-500"
            style={{ animationDelay: "360ms" }}
          >
            Grounded in official Army publications
          </p>
        </div>
      </main>
    </>
  );
}
