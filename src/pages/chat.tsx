import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { withAuth } from "@/components/auth/withAuth";
import ChatInterface from "@/components/Chat/ChatInterface";
import ConversationList from "@/components/Chat/ConversationList";

function ChatPage() {
  const router = useRouter();
  const [refreshToken, setRefreshToken] = useState(0);

  const conversationId =
    typeof router.query.c === "string" ? router.query.c : null;

  const selectConversation = (id: string | null) => {
    router.push(id ? `/chat?c=${id}` : "/chat", undefined, { shallow: true });
  };

  const handleNewConversation = (id: string) => {
    setRefreshToken((t) => t + 1);
    router.replace(`/chat?c=${id}`, undefined, { shallow: true });
  };

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
          <div className="flex gap-4">
            <ConversationList
              activeId={conversationId}
              onSelect={selectConversation}
              refreshToken={refreshToken}
            />
            <div className="flex-1 min-w-0">
              <ChatInterface
                conversationId={conversationId}
                onNewConversation={handleNewConversation}
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default withAuth(ChatPage);
