/**
 * Ingests Army regulation PDFs into the Supabase RAG corpus.
 *
 *   1. Put PDFs in data/regulations/
 *   2. npm run ingest
 *
 * Re-running replaces the chunks for each file it processes, so it is safe to
 * run repeatedly. Self-contained on purpose (no "@/..." imports) so it runs
 * under tsx without relying on path-alias resolution.
 */
import { createClient } from "@supabase/supabase-js";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join, resolve } from "path";
import pdf from "pdf-parse";

const REGULATIONS_DIR = resolve(process.cwd(), "data/regulations");
const TARGET_CHUNK_CHARS = 1500;
const CHUNK_OVERLAP_CHARS = 200;
// Hard ceiling for a single chunk. Packing prepends up to CHUNK_OVERLAP_CHARS
// of the previous chunk, so a chunk can legitimately reach target + overlap.
const MAX_CHUNK_CHARS = TARGET_CHUNK_CHARS + CHUNK_OVERLAP_CHARS;

/** Minimal .env.local loader so the script needs no dotenv dependency. */
function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  for (const rawLine of readFileSync(envPath, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

// Must run before EMBEDDING_MODEL is read below, so a .env.local override applies.
loadEnvLocal();
const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004";
// Matches the fixed width of the regulation_chunks.embedding vector column in Supabase.
const EMBEDDING_DIMENSIONS = 768;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in .env.local`);
  return value;
}

/**
 * Breaks an over-length paragraph into pieces that fit TARGET_CHUNK_CHARS,
 * preferring sentence boundaries.
 *
 * Regulations routinely contain single paragraphs several thousand characters
 * long (tables, enumerated sub-paragraphs flattened by PDF extraction). Packing
 * alone never splits those, so without this they became one oversized chunk —
 * which dilutes the embedding and wastes prompt budget at query time.
 */
function splitLongParagraph(paragraph: string): string[] {
  if (paragraph.length <= TARGET_CHUNK_CHARS) return [paragraph];

  // Keep terminal punctuation attached to the sentence it ends.
  const sentences = paragraph.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g) ?? [paragraph];

  const pieces: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    // A single "sentence" can still exceed the target when extraction produces
    // long unpunctuated runs, so fall back to a hard character split.
    if (sentence.length > TARGET_CHUNK_CHARS) {
      if (current.trim()) {
        pieces.push(current.trim());
        current = "";
      }
      for (let i = 0; i < sentence.length; i += TARGET_CHUNK_CHARS) {
        pieces.push(sentence.slice(i, i + TARGET_CHUNK_CHARS).trim());
      }
      continue;
    }

    if (current && current.length + sentence.length > TARGET_CHUNK_CHARS) {
      pieces.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }

  if (current.trim()) pieces.push(current.trim());
  return pieces.filter(Boolean);
}

/** Splits on paragraph boundaries, packing up to TARGET_CHUNK_CHARS with overlap. */
function chunkText(text: string): string[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .flatMap(splitLongParagraph);

  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length + 1 > TARGET_CHUNK_CHARS) {
      chunks.push(current);
      current = current.slice(-CHUNK_OVERLAP_CHARS) + " " + paragraph;
    } else {
      current = current ? `${current} ${paragraph}` : paragraph;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function embed(text: string, apiKey: string): Promise<number[]> {
  const maxAttempts = 6;
  let response: Response | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          model: `models/${EMBEDDING_MODEL}`,
          content: { parts: [{ text }] },
          outputDimensionality: EMBEDDING_DIMENSIONS,
        }),
      }
    );

    if (response.status !== 429 || attempt === maxAttempts) break;

    const retryAfterHeader = Number(response.headers.get("retry-after"));
    const waitMs = Number.isFinite(retryAfterHeader) && retryAfterHeader > 0
      ? retryAfterHeader * 1000
      : 2 ** attempt * 1000;
    process.stdout.write(`\n  rate limited, waiting ${Math.round(waitMs / 1000)}s... `);
    await sleep(waitMs);
  }

  if (!response!.ok) {
    throw new Error(`Embedding failed (${response!.status}): ${await response!.text()}`);
  }

  const data = (await response!.json()) as { embedding?: { values?: number[] } };
  const values = data.embedding?.values;
  if (!values?.length) throw new Error("Empty embedding returned");

  return values;
}

async function main() {
  const supabase = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );
  const geminiKey = requireEnv("GEMINI_API_KEY");

  if (!existsSync(REGULATIONS_DIR)) {
    throw new Error(`No such directory: ${REGULATIONS_DIR}`);
  }

  const files = readdirSync(REGULATIONS_DIR).filter((f) =>
    f.toLowerCase().endsWith(".pdf")
  );

  if (files.length === 0) {
    console.log(`No PDFs found in ${REGULATIONS_DIR}. Nothing to do.`);
    return;
  }

  console.log(`Found ${files.length} PDF(s) in ${REGULATIONS_DIR}\n`);

  for (const file of files) {
    const docId = file.replace(/\.pdf$/i, "");
    process.stdout.write(`${docId}: parsing... `);

    const parsed = await pdf(readFileSync(join(REGULATIONS_DIR, file)));
    const chunks = chunkText(parsed.text);

    const largest = chunks.reduce((max, chunk) => Math.max(max, chunk.length), 0);
    console.log(`${chunks.length} chunks (largest ${largest} chars)`);

    const oversized = chunks.filter((chunk) => chunk.length > MAX_CHUNK_CHARS);
    if (oversized.length > 0) {
      console.warn(
        `  warning: ${oversized.length} chunk(s) exceed ${MAX_CHUNK_CHARS} chars`
      );
    }

    // Replace any previous run for this document.
    const { error: deleteError } = await supabase
      .from("regulation_chunks")
      .delete()
      .eq("doc_id", docId);

    if (deleteError) {
      throw new Error(`Failed clearing ${docId}: ${deleteError.message}`);
    }

    for (let i = 0; i < chunks.length; i += 1) {
      const embedding = await embed(chunks[i], geminiKey);

      const { error } = await supabase.from("regulation_chunks").insert({
        doc_id: docId,
        title: parsed.info?.Title || docId,
        content: chunks[i],
        embedding,
      });

      if (error) throw new Error(`Insert failed for ${docId}: ${error.message}`);

      if ((i + 1) % 10 === 0 || i === chunks.length - 1) {
        process.stdout.write(`\r  embedded ${i + 1}/${chunks.length}`);
      }
    }

    console.log("\n  done\n");
  }

  console.log("Ingestion complete.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
