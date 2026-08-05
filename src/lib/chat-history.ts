import { getSupabaseAdmin } from "@/lib/supabase-admin";

interface CitationRecord {
  docId: string;
  title: string | null;
  page: number | null;
  sourceUrl: string | null;
}

const TITLE_MAX_CHARS = 60;

function titleFromMessage(message: string): string {
  const trimmed = message.trim();
  return trimmed.length > TITLE_MAX_CHARS
    ? `${trimmed.slice(0, TITLE_MAX_CHARS)}…`
    : trimmed;
}

/**
 * Resolves the conversation a message belongs to. Reuses `conversationId`
 * when it's provided and owned by this user; otherwise (missing, or owned by
 * someone else) starts a new conversation titled from the first message.
 */
export async function ensureConversation(
  uid: string,
  conversationId: string | undefined,
  firstMessage: string
): Promise<string> {
  const admin = getSupabaseAdmin();

  if (conversationId) {
    const { data, error } = await admin
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", uid)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to look up conversation: ${error.message}`);
    }
    if (data) return data.id;
  }

  const { data, error } = await admin
    .from("conversations")
    .insert({ user_id: uid, title: titleFromMessage(firstMessage) })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create conversation: ${error.message}`);
  }

  return data.id;
}

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  citations: CitationRecord[] = []
): Promise<void> {
  const { error } = await getSupabaseAdmin().from("chat_messages").insert({
    conversation_id: conversationId,
    role,
    content,
    citations,
  });

  if (error) {
    throw new Error(`Failed to save message: ${error.message}`);
  }
}

export async function touchConversation(conversationId: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  if (error) {
    throw new Error(`Failed to update conversation: ${error.message}`);
  }
}
