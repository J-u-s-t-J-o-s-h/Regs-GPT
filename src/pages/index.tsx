import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>RegsGPT</title>
        <meta
          name="description"
          content="AI-powered search and understanding of U.S. Army regulations."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <span className="mb-6 rounded-full border border-primary-light/40 px-4 py-1 text-sm font-medium text-primary-light">
          Early scaffold
        </span>

        <h1 className="text-5xl font-bold tracking-tight text-gray-100 sm:text-6xl">
          Regs<span className="text-primary-light">GPT</span>
        </h1>

        <p className="mt-4 max-w-xl text-lg text-gray-300">
          AI-powered search and understanding of U.S. Army regulations.
        </p>

        <p className="mt-8 max-w-md text-sm text-gray-400">
          This is a clean starting point. Authentication, AI chat, and
          subscriptions will be built here from the ground up.
        </p>
      </main>
    </>
  );
}
