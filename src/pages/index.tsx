import Head from 'next/head'
import LoginButton from '@/components/auth/LoginButton'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>RegsGPT</title>
      </Head>
      <main className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold">Welcome to RegsGPT</h1>
        <p className="mt-2">Your AI-powered assistant for Army regulations.</p>
        <LoginButton />
      </main>
    </>
  )
}
