import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import MainLayout from "@/components/Layout/MainLayout";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
      </SubscriptionProvider>
    </AuthProvider>
  );
}
