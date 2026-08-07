import Head from "next/head";
import Link from "next/link";
import { Chakra_Petch } from "next/font/google";
import LoginButton from "@/components/auth/LoginButton";
import TacticalHero from "@/components/Home/TacticalHero";
import { useAuth } from "@/contexts/AuthContext";

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <>
      <Head>
        <title>RegsGPT — Army Regulations, Plain Language</title>
      </Head>
      <main className="relative flex min-h-[calc(100vh-2rem)] flex-col items-center justify-center overflow-hidden px-4 text-center">
        <TacticalHero />

        {/* Targeting-frame corner marks */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-8 md:inset-16"
        >
          <span className="absolute left-0 top-0 h-6 w-6 border-l border-t border-primary-light/30" />
          <span className="absolute right-0 top-0 h-6 w-6 border-r border-t border-primary-light/30" />
          <span className="absolute bottom-0 left-0 h-6 w-6 border-b border-l border-primary-light/30" />
          <span className="absolute bottom-0 right-0 h-6 w-6 border-b border-r border-primary-light/30" />
        </div>

        <div className="relative">
          <div
            className={`${chakraPetch.className} animate-fade-in-up flex items-center justify-center gap-2 text-xs uppercase tracking-[0.35em] text-primary-light/80`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[rgb(232,184,92)]" />
            Doctrine, decoded
          </div>

          <div className="mt-3 flex items-center justify-center gap-3 overflow-hidden">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="currentColor"
              className="animate-fade-in-up h-9 w-9 text-primary-light md:h-10 md:w-10"
              style={{ animationDelay: "80ms" }}
            >
              <path d="M12 1.5l2.6 6.3 6.8.6-5.2 4.5 1.6 6.6L12 15.9 6.2 19.5l1.6-6.6-5.2-4.5 6.8-.6L12 1.5z" />
            </svg>
            <h1
              className={`${chakraPetch.className} animate-headline-reveal text-4xl font-bold tracking-tight text-white md:text-6xl`}
              style={{ animationDelay: "150ms" }}
            >
              RegsGPT
            </h1>
          </div>

          <p
            className="animate-fade-in-up mx-auto mt-4 max-w-xl text-lg text-gray-300"
            style={{ animationDelay: "260ms" }}
          >
            Ask questions about Army regulations and get clear,
            citation-backed answers — without digging through PDFs.
          </p>

          <div
            className="animate-fade-in-up mt-8 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "380ms" }}
          >
            {!loading && !user && <LoginButton />}
            {user && (
              <>
                <Link
                  href="/chat"
                  className="btn-shine inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-white shadow-lg shadow-black/20 transition-colors no-underline hover:bg-primary-light"
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
            className={`${chakraPetch.className} animate-fade-in-up mt-10 text-xs uppercase tracking-[0.3em] text-gray-500`}
            style={{ animationDelay: "480ms" }}
          >
            Grounded in official Army publications
          </p>
        </div>
      </main>
    </>
  );
}
