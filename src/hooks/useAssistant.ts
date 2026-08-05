import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

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
  conversationId?: string;
  error?: string;
  code?: string;
}

export function useAssistant(
  conversationId: string | null,
  onNewConversation: (id: string) => void
) {
  const { user, getAccessToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  // Load history when switching to an existing conversation; clear it for a
  // fresh one.
  useEffect(() => {
    setError(null);
    setCitations([]);

    if (!user || !conversationId) {
      setMessages([]);
      return;
    }

    let active = true;

    supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .then(({ data, error: fetchError }) => {
        if (!active) return;
        if (fetchError || !data) return;
        setMessages(
          data.map((m) => ({
            role: m.role as Message["role"],
            content: [m.content as string],
          }))
        );
      });

    return () => {
      active = false;
    };
  }, [user, conversationId]);

  const sendMessage = async (content: string) => {
    if (!user) {
      setError("Please sign in to chat");
      return;
    }

    setIsLoading(true);
    setError(null);
    setLimitReached(false);

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
        body: JSON.stringify({ message: content, history, conversationId }),
      });

      const data: ChatResponse = await response.json();

      if (!response.ok) {
        if (data.code === "free_limit_reached") {
          setLimitReached(true);
        }
        throw new Error(data.error || "Failed to send message");
      }

      if (data.reply) {
        setMessages((prev) => [...prev, data.reply as Message]);
      }

      setCitations(data.citations ?? []);

      if (data.conversationId && data.conversationId !== conversationId) {
        onNewConversation(data.conversationId);
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
    citations,
    isLoading,
    error,
    limitReached,
    sendMessage,
  };
}
