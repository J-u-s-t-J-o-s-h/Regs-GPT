import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Conversation {
  id: string;
  title: string;
}

interface ConversationListProps {
  activeId: string | null;
  onSelect: (id: string | null) => void;
  refreshToken: number;
}

export default function ConversationList({
  activeId,
  onSelect,
  refreshToken,
}: ConversationListProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    supabase
      .from('conversations')
      .select('id, title')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data) setConversations(data);
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user, refreshToken]);

  return (
    <aside className="w-64 shrink-0 bg-[#26331B] border border-[#3A4D25] rounded-lg p-3 h-[calc(100vh-8rem)] overflow-y-auto">
      <button
        onClick={() => onSelect(null)}
        className={`w-full text-left p-2 rounded-lg mb-2 text-white transition-colors ${
          activeId === null
            ? 'bg-[#4A5D35]'
            : 'bg-[#2F3D1C] hover:bg-[#3A4D25]'
        }`}
      >
        + New chat
      </button>

      {isLoading ? (
        <p className="text-sm text-gray-400 px-2">Loading…</p>
      ) : conversations.length === 0 ? (
        <p className="text-sm text-gray-400 px-2">No conversations yet.</p>
      ) : (
        <ul className="space-y-1">
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => onSelect(c.id)}
                title={c.title}
                className={`w-full text-left p-2 rounded-lg text-sm truncate text-gray-200 transition-colors ${
                  activeId === c.id ? 'bg-[#3A4D25]' : 'hover:bg-[#2F3D1C]'
                }`}
              >
                {c.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
