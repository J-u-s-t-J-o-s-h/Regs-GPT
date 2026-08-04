import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

export type ChatMessage = {
  role: "user" | "assistant";
  content: string[];
};

const REGULATION_INSTRUCTIONS = `
You are RegsGPT, an assistant for U.S. Army personnel.
Answer questions using the Army regulations available via File Search.
Cite specific regulation numbers, paragraphs, and titles when possible.
If you cannot find supporting regulation text, say so clearly and do not invent requirements.
Keep answers clear and practical for soldiers in the field.
`.trim();

function extractTextParts(
  content: OpenAI.Beta.Threads.Messages.MessageContent[]
): string[] {
  return content
    .filter(
      (part): part is OpenAI.Beta.Threads.Messages.TextContentBlock =>
        part.type === "text"
    )
    .map((part) => part.text.value)
    .filter(Boolean);
}

export async function createThread() {
  const thread = await openai.beta.threads.create();
  return thread.id;
}

export async function createMessage(threadId: string, content: string) {
  return openai.beta.threads.messages.create(threadId, {
    role: "user",
    content,
  });
}

export async function runAssistant(threadId: string) {
  if (!ASSISTANT_ID) {
    throw new Error("OPENAI_ASSISTANT_ID is not defined");
  }

  return openai.beta.threads.runs.create(threadId, {
    assistant_id: ASSISTANT_ID,
    additional_instructions: REGULATION_INSTRUCTIONS,
  });
}

export async function getRunStatus(threadId: string, runId: string) {
  return openai.beta.threads.runs.retrieve(threadId, runId);
}

export async function getChatMessages(threadId: string): Promise<ChatMessage[]> {
  const messages = await openai.beta.threads.messages.list(threadId, {
    order: "asc",
  });

  return messages.data
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      role: message.role as "user" | "assistant",
      content: extractTextParts(message.content),
    }));
}
