import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string[];
}

interface ChatResponse {
  threadId: string;
  messages: Message[];
}

export function useAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          threadId: threadId,
        }),
      });

      const data: ChatResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.messages?.[0]?.content?.[0] || 'Failed to send message');
      }

      setThreadId(data.threadId);
      setMessages(data.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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