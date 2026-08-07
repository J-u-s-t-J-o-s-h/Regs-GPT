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
      <main className="relative flex min-h-[calc(100vh-2rem)] flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
        {/* One soft anchor of light behind the scan grid — the only other
            moving element, so it stays calm rather than competing. */}
        <div
          aria-hidden
          className="animate-pulse-glow pointer-events-none absolute left-1/2 top-[38%] h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(90,109,69,0.35)_0%,transparent_70%)] blur-[100px]"
        />

        <TacticalHero />

        {/* Faint targeting-frame corner marks */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-8 md:inset-16"
        >
          <span className="absolute left-0 top-0 h-6 w-6 border-l border-t border-primary-light/25" />
          <span className="absolute right-0 top-0 h-6 w-6 border-r border-t border-primary-light/25" />
          <span className="absolute bottom-0 left-0 h-6 w-6 border-b border-l border-primary-light/25" />
          <span className="absolute bottom-0 right-0 h-6 w-6 border-b border-r border-primary-light/25" />
        </div>

        <div className="relative">
          <div
            className={`${chakraPetch.className} animate-fade-in-up flex items-center justify-center gap-2 text-xs uppercase tracking-[0.35em] text-primary-light/80`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[rgb(232,184,92)]" />
            Doctrine, decoded
          </div>

          <div className="mt-4 flex items-center justify-center gap-4">
            <svg
              aria-hidden
              viewBox="0 0 48 48"
              className="animate-fade-in-up h-11 w-11 text-primary-light md:h-12 md:w-12"
              style={{ animationDelay: "80ms" }}
            >
              <circle
                cx="24"
                cy="24"
                r="21"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                opacity="0.4"
              />
              <path
                fill="currentColor"
                d="M24 11l3.6 8.7 9.4.8-7.1 6.2 2.2 9.2L24 30.9l-8.1 5 2.2-9.2-7.1-6.2 9.4-.8L24 11z"
              />
            </svg>
            <h1
              className={`${chakraPetch.className} animate-headline-reveal text-5xl font-bold tracking-tight text-white md:text-7xl`}
              style={{ animationDelay: "150ms" }}
            >
              RegsGPT
            </h1>
          </div>

          <p
            className="animate-fade-in-up mx-auto mt-5 max-w-xl text-lg text-gray-300 md:text-xl"
            style={{ animationDelay: "260ms" }}
          >
            Ask questions about Army regulations and get clear,
            citation-backed answers — without digging through PDFs.
          </p>

          <div
            className="animate-fade-in-up mt-8 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "340ms" }}
          >
            {!loading && !user && <LoginButton />}
            {user && (
              <>
                <Link
                  href="/chat"
                  className="btn-shine inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-white shadow-lg shadow-black/20 transition-colors no-underline hover:bg-primary-light"
                >
                  Open Chat
                </Link>
                <LoginButton />
              </>
            )}
            {!user && (
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-lg border border-[#3A4D25] px-6 py-3 font-medium text-gray-200 transition-colors no-underline hover:bg-[#2F3D1C]"
              >
                View Pricing
              </Link>
            )}
          </div>

          {/* Proof: show the product answering, not just describe it */}
          <div
            className="animate-fade-in-up mx-auto mt-12 max-w-md text-left"
            style={{ animationDelay: "420ms" }}
          >
            <div className="rounded-xl border border-[#3A4D25] bg-[#26331B]/85 p-4 backdrop-blur-sm">
              <p className="text-sm text-gray-400">
                <span className="text-gray-500">Q:</span> Can I wear a
                wristwatch with my dress uniform?
              </p>
              <p className="mt-2 text-sm text-gray-100">
                <span className="text-primary-light">A:</span> Yes — a
                conservative wristwatch is authorized, per{" "}
                <span
                  className={`${chakraPetch.className} text-primary-light`}
                >
                  AR 670-1
                </span>
                .
              </p>
            </div>
          </div>

          <p
            className={`${chakraPetch.className} animate-fade-in-up mt-10 text-xs uppercase tracking-[0.3em] text-gray-500`}
            style={{ animationDelay: "500ms" }}
          >
            Grounded in official Army publications
          </p>
        </div>
      </main>
    </>
  );
}
