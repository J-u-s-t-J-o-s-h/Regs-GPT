import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface Message {
  role: "user" | "assistant";
  content: string[];
}

export interface Citation {
  docId: string;
  title: string | null;
  page: number | null;
  sourceUrl: string | null;
}

interface ChatResponse {
  reply?: Message;
  citations?: Citation[];
  error?: string;
}

export function useAssistant() {
  const { user, getAccessToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    if (!user) {
      setError("Please sign in to chat");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Snapshot the turns before this one — the API is stateless, so prior
    // turns are replayed with each request.
    const history = messages;

    setMessages((prev) => [...prev, { role: "user", content: [content] }]);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("Your session expired. Please sign in again.");
      }

      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: content, history }),
      });

      const data: ChatResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      if (data.reply) {
        setMessages((prev) => [...prev, data.reply as Message]);
      }

      setCitations(data.citations ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    citations,
    isLoading,
    error,
    sendMessage,
  };
}
