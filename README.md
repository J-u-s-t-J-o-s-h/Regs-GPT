# RegsGPT

AI-powered web app that helps U.S. Army personnel search, understand, and reference Army regulations in plain language.

Soldiers can ask questions in chat ("What are the requirements for X?") and receive answers grounded in Army regulations. Sign-in is free; AI chat requires a paid subscription.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.local.example` to `.env.local` and fill in your environment variables
4. Create an OpenAI Assistant with **File Search** enabled, upload Army regulation PDFs, and set `OPENAI_ASSISTANT_ID`
5. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Features

- Google sign-in (Firebase Auth)
- Stripe subscription gating for AI chat
- OpenAI Assistants chat grounded via File Search
- Subscription status synced to Firestore

## Tech Stack

- Next.js (Pages Router)
- TypeScript
- Tailwind CSS
- Firebase Auth + Firestore
- OpenAI Assistants API
- Stripe

## Local Stripe webhooks

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

Checkout success also syncs subscription status via `/api/stripe/sync-session` so local testing works even without a webhook.

## Deploy

Deploy to **Vercel** (or another Next.js host). Firebase Hosting alone cannot serve Next.js API routes.

## License

MIT
