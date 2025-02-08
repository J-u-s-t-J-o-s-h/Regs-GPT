import { useState, useEffect, useRef } from 'react';
import { useAssistant } from '@/hooks/useAssistant';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

export default function ChatInterface() {
  const { messages, isLoading, error, sendMessage } = useAssistant();
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Improved smooth scrolling with intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          entry.target.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      },
      { threshold: 0.5 }
    );

    if (chatEndRef.current) {
      observer.observe(chatEndRef.current);
    }

    return () => observer.disconnect();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput('');
    await sendMessage(message);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#2F3D1C] rounded-lg shadow-lg overflow-hidden">
        {error && (
          <div className="bg-red-50 p-4 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        >
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
            />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={chatEndRef} className="h-4" />
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="p-4 border-t border-[#3A4D25] bg-[#26331B]"
        >
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Army regulations..."
              className="flex-1 p-3 bg-[#2F3D1C] text-white rounded-lg border border-[#3A4D25] focus:outline-none focus:ring-2 focus:ring-[#4A5D35] disabled:bg-[#1F2D16]"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-[#4A5D35] text-white rounded-lg hover:bg-[#5A6D45] focus:outline-none focus:ring-2 focus:ring-[#4A5D35] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? 'Processing...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 