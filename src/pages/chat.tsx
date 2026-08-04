import Head from "next/head";
import { withAuth } from "@/components/auth/withAuth";
import { withSubscription } from "@/components/auth/withSubscription";
import ChatInterface from "@/components/Chat/ChatInterface";

function ChatPage() {
  return (
    <>
      <Head>
        <title>Chat — RegsGPT</title>
      </Head>
      <div className="min-h-[calc(100vh-2rem)]">
        <main className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-6 text-white">
            Army Regulations Assistant
          </h1>
          <ChatInterface />
        </main>
      </div>
    </>
  );
}

export default withAuth(withSubscription(ChatPage));
