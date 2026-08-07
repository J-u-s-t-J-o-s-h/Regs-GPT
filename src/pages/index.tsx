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

const TRUST_PILLS = [
  { label: "Official publications only" },
  { label: "Every answer cited" },
  { label: "Built for soldiers" },
];

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <>
      <Head>
        <title>RegsGPT — Army Regulations, Plain Language</title>
      </Head>
      <main className="relative flex min-h-[calc(100vh-2rem)] flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
        {/* Large layered glow, sits behind the scan grid for real visual weight */}
        <div
          aria-hidden
          className="animate-pulse-glow pointer-events-none absolute left-1/2 top-[38%] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(90,109,69,0.45)_0%,rgba(232,184,92,0.12)_45%,transparent_72%)] blur-[90px]"
        />

        <TacticalHero />

        {/* Targeting-frame corner marks */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-6 md:inset-10"
        >
          <span className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-primary-light/50" />
          <span className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-primary-light/50" />
          <span className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-primary-light/50" />
          <span className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-primary-light/50" />
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
              className="animate-fade-in-up h-12 w-12 text-primary-light md:h-14 md:w-14"
              style={{ animationDelay: "80ms" }}
            >
              <circle
                cx="24"
                cy="24"
                r="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.5"
              />
              <circle
                cx="24"
                cy="24"
                r="17"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.35"
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
            className="animate-fade-in-up mt-6 flex flex-wrap items-center justify-center gap-2"
            style={{ animationDelay: "320ms" }}
          >
            {TRUST_PILLS.map((pill) => (
              <span
                key={pill.label}
                className="flex items-center gap-1.5 rounded-full border border-[#3A4D25] bg-[#26331B]/70 px-3 py-1 text-xs text-gray-300"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-3 w-3 text-primary-light"
                >
                  <path
                    d="M4 10.5l3.5 3.5L16 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {pill.label}
              </span>
            ))}
          </div>

          <div
            className="animate-fade-in-up mt-8 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "380ms" }}
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
            className="animate-fade-in-up animate-card-float mx-auto mt-12 max-w-md text-left"
            style={{ animationDelay: "460ms" }}
          >
            <div className="rounded-xl border border-[#3A4D25] bg-[#26331B]/85 p-4 shadow-xl shadow-black/30 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Example
              </p>
              <p className="mt-2 text-sm text-gray-300">
                Can I wear a wristwatch with my dress uniform?
              </p>
              <div className="mt-3 rounded-lg bg-[#1F2D16] p-3">
                <p className="text-sm text-gray-200">
                  Yes — a conservative wristwatch is authorized. Full
                  guidance is in AR 670-1, Wear and Appearance of Army
                  Uniforms.
                </p>
                <span
                  className={`${chakraPetch.className} mt-2 inline-block rounded border border-primary-light/30 px-2 py-0.5 text-[11px] tracking-wide text-primary-light`}
                >
                  AR 670-1
                </span>
              </div>
            </div>
          </div>

          <p
            className={`${chakraPetch.className} animate-fade-in-up mt-10 text-xs uppercase tracking-[0.3em] text-gray-500`}
            style={{ animationDelay: "540ms" }}
          >
            Grounded in official Army publications
          </p>
        </div>
      </main>
    </>
  );
}
