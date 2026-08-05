import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Google's Generative Language REST API is called directly rather than through
// an SDK: it keeps the dependency surface small and the v1beta request shapes
// below are stable across SDK releases.
const API_ROOT = "https://generativelanguage.googleapis.com/v1beta";

// "-latest" is a rolling alias Google repoints at their current recommended
// flash model, so this stays valid as older generations get sunset for new
// API keys (gemini-2.0-flash and gemini-2.5-flash already are, as of this
// writing).
export const CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || "gemini-flash-latest";
export const EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004";

// Must match the vector(768) column in the regulation_chunks migration.
export const EMBEDDING_DIMENSIONS = 768;

const SYSTEM_INSTRUCTION = `
You are RegsGPT, an assistant for U.S. Army personnel.

Answer using ONLY the regulation excerpts provided in the CONTEXT block.
Cite the regulation number and paragraph for every claim, e.g. "AR 670-1, para 3-2".
If the context does not contain the answer, say so plainly and tell the user which
publication to check. Never invent a requirement, paragraph number, or citation.
Keep answers clear and practical for soldiers in the field.
`.trim();

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string[];
}

export interface RegulationChunk {
  id: number;
  doc_id: string;
  title: string | null;
  source_url: string | null;
  page: number | null;
  content: string;
  similarity: number;
}

function apiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("Missing GEMINI_API_KEY. Get one at https://aistudio.google.com/apikey");
  }
  return key;
}

async function callGemini<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_ROOT}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${detail}`);
  }

  return (await response.json()) as T;
}

/** Embeds a single string into a 768-dimension vector. */
export async function embedText(text: string): Promise<number[]> {
  const data = await callGemini<{ embedding?: { values?: number[] } }>(
    `models/${EMBEDDING_MODEL}:embedContent`,
    {
      model: `models/${EMBEDDING_MODEL}`,
      content: { parts: [{ text }] },
      outputDimensionality: EMBEDDING_DIMENSIONS,
    }
  );

  const values = data.embedding?.values;
  if (!values?.length) {
    throw new Error("Gemini returned an empty embedding");
  }

  return values;
}

/** Finds the regulation chunks most similar to the question. */
export async function retrieveContext(
  question: string,
  matchCount = 6
): Promise<RegulationChunk[]> {
  const embedding = await embedText(question);

  const { data, error } = await getSupabaseAdmin().rpc(
    "match_regulation_chunks",
    {
      query_embedding: embedding,
      match_count: matchCount,
      similarity_threshold: 0.5,
    }
  );

  if (error) {
    throw new Error(`Regulation lookup failed: ${error.message}`);
  }

  return (data ?? []) as RegulationChunk[];
}

function formatContext(chunks: RegulationChunk[]): string {
  if (chunks.length === 0) {
    return "CONTEXT: (no matching regulation excerpts were found)";
  }

  const blocks = chunks.map((chunk, index) => {
    const label = [chunk.doc_id, chunk.title].filter(Boolean).join(" — ");
    const page = chunk.page ? `, p. ${chunk.page}` : "";
    return `[${index + 1}] ${label}${page}\n${chunk.content}`;
  });

  return `CONTEXT:\n${blocks.join("\n\n")}`;
}

/**
 * Answers a question using retrieved regulation excerpts.
 * `history` is prior turns, oldest first, and is sent for conversational
 * continuity — Gemini has no server-side threads.
 */
export async function generateAnswer(
  question: string,
  history: ChatMessage[],
  chunks: RegulationChunk[]
): Promise<string> {
  const contents = [
    ...history.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content.join("\n\n") }],
    })),
    {
      role: "user",
      parts: [{ text: `${formatContext(chunks)}\n\nQUESTION: ${question}` }],
    },
  ];

  const data = await callGemini<{
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  }>(`models/${CHAT_MODEL}:generateContent`, {
    contents,
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  });

  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return text;
}
