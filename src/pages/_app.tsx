<<<<<<< HEAD
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
=======
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '@/contexts/AuthContext'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <Component {...pageProps} />
      </SubscriptionProvider>
    </AuthProvider>
  )
} 
>>>>>>> 1bd1e39 (Initial commit: Full project setup including Auth, AI, Stripe, and UI refactor)
