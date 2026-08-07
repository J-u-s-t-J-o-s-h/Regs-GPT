import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Chakra_Petch } from "next/font/google";
import TacticalHero from "@/components/Home/TacticalHero";
import { useAuth } from "@/contexts/AuthContext";

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

function GoogleIcon() {
  return (
    <svg aria-hidden viewBox="0 0 18 18" className="h-[18px] w-[18px]">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

export default function SignIn() {
  const { user, loading, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/chat");
    }
  }, [loading, user, router]);

  const handleSignIn = async () => {
    setError(null);
    setIsRedirecting(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setIsRedirecting(false);
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't start sign-in. Please try again."
      );
    }
  };

  return (
    <>
      <Head>
        <title>Sign In — RegsGPT</title>
      </Head>
      <main className="relative flex min-h-[calc(100vh-2rem)] flex-col items-center justify-center overflow-hidden px-4 text-center">
        <TacticalHero />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-8 md:inset-16"
        >
          <span className="absolute left-0 top-0 h-6 w-6 border-l border-t border-primary-light/30" />
          <span className="absolute right-0 top-0 h-6 w-6 border-r border-t border-primary-light/30" />
          <span className="absolute bottom-0 left-0 h-6 w-6 border-b border-l border-primary-light/30" />
          <span className="absolute bottom-0 right-0 h-6 w-6 border-b border-r border-primary-light/30" />
        </div>

        <div className="relative w-full max-w-sm">
          <Link
            href="/"
            className={`${chakraPetch.className} animate-fade-in-up inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-primary-light/80 no-underline hover:text-primary-light`}
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-3 w-3"
            >
              <path d="M12 1.5l2.6 6.3 6.8.6-5.2 4.5 1.6 6.6L12 15.9 6.2 19.5l1.6-6.6-5.2-4.5 6.8-.6L12 1.5z" />
            </svg>
            RegsGPT
          </Link>

          <h1
            className={`${chakraPetch.className} animate-fade-in-up mt-6 text-3xl font-bold text-white md:text-4xl`}
            style={{ animationDelay: "80ms" }}
          >
            Sign in
          </h1>
          <p
            className="animate-fade-in-up mt-3 text-gray-300"
            style={{ animationDelay: "160ms" }}
          >
            One click with Google — the same button creates your account if
            you&apos;re new here.
          </p>

          <div
            className="animate-fade-in-up mt-8 rounded-xl border border-[#3A4D25] bg-[#26331B]/80 p-6 backdrop-blur-sm"
            style={{ animationDelay: "240ms" }}
          >
            <button
              onClick={handleSignIn}
              disabled={isRedirecting || loading}
              className="btn-shine flex w-full items-center justify-center gap-3 rounded-lg bg-white px-5 py-3 font-semibold text-[#26331B] shadow-lg shadow-black/20 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <GoogleIcon />
              {isRedirecting ? "Redirecting to Google…" : "Continue with Google"}
            </button>

            {error && (
              <p role="alert" className="mt-4 text-sm text-red-300">
                {error}
              </p>
            )}

            <p className="mt-4 text-xs text-gray-500">
              For reference only — always verify requirements against the
              official publication.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
