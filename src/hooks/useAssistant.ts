import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface Message {
  role: "user" | "assistant";
  content: string[];
}

interface ChatResponse {
  threadId?: string;
  messages?: Message[];
  error?: string;
}

export function useAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    if (!user) {
      setError("Please sign in to chat");
      return;
    }

    setIsLoading(true);
    setError(null);

    const optimisticUserMessage: Message = {
      role: "user",
      content: [content],
    };
    setMessages((prev) => [...prev, optimisticUserMessage]);

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: content,
          threadId,
        }),
      });

      const data: ChatResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      if (data.threadId) {
        setThreadId(data.threadId);
      }

      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
}
