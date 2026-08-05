# RegsGPT

AI-powered web app that helps U.S. Army personnel search, understand, and reference Army regulations in plain language.

Soldiers can ask questions in chat ("What are the requirements for X?") and receive answers grounded in Army regulations, with citations. Sign-in is free; AI chat requires a paid subscription.

## Tech Stack

- Next.js (Pages Router) + TypeScript + Tailwind CSS
- **Supabase** — Google auth, Postgres, and `pgvector` for retrieval
- **Google Gemini** — chat completions and embeddings
- **Stripe** — subscriptions

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.local.example` to `.env.local` and fill in the values.
3. Enable **Google** as an auth provider in the Supabase dashboard
   (Authentication → Providers), and add `http://localhost:3000` to the
   allowed redirect URLs.
4. Add regulation PDFs and build the search index — see
   [`data/regulations/README.md`](data/regulations/README.md):
   ```bash
   npm run ingest
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## How retrieval works

Gemini has no managed retrieval, so RegsGPT does RAG itself:

1. `npm run ingest` parses each PDF in `data/regulations/`, splits it into
   overlapping chunks, embeds each chunk with Gemini, and stores the vectors in
   the `regulation_chunks` table.
2. On each question, `/api/assistant/chat` embeds the question, finds the
   closest chunks via the `match_regulation_chunks` SQL function (cosine
   similarity over a HNSW index), and passes them to Gemini as context.
3. The model is instructed to answer only from that context and to cite the
   regulation and paragraph — reducing invented requirements.

**The chat endpoint is stateless.** Gemini has no server-side threads, so the
client replays recent turns with each request.

## Database

Two tables, both with row level security enabled:

| Table | Purpose | Access |
| --- | --- | --- |
| `subscriptions` | Stripe state, one row per user | Users read their own row; only the service role writes |
| `regulation_chunks` | Embedded regulation text | Signed-in users read; ingestion writes with the service role |

## Local Stripe webhooks

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

Checkout success also syncs subscription status via `/api/stripe/sync-session`,
so local testing works even without a webhook.

## Deploy

Deploy to **Vercel** (or another Next.js host that supports API routes). Add
every variable from `.env.local` to the project, and add the deployed URL to
Supabase's allowed redirect URLs.

## License

MIT
