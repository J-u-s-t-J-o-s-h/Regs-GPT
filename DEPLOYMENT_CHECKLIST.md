# RegsGPT Deployment Checklist

## Environment Variables
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` (or `FIREBASE_SERVICE_ACCOUNT_PATH` locally)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `OPENAI_API_KEY`
- [ ] `OPENAI_ASSISTANT_ID` (Assistant with File Search + regulation PDFs)

## Pre-Deployment Tests
1. Authentication
   - [ ] Google sign-in works
   - [ ] Logout works
2. Subscription
   - [ ] Stripe checkout redirects correctly
   - [ ] `/dashboard` syncs subscription after payment
   - [ ] Webhook updates Firestore on renew/cancel
   - [ ] Chat is gated without an active subscription
3. Chat
   - [ ] Authenticated premium users can send messages
   - [ ] Assistant answers cite regulations from File Search
4. UI
   - [ ] Landing, pricing, chat, dashboard work on mobile

## Deployment
1. Prefer **Vercel** for Next.js + API routes
2. `npm run build` locally
3. Configure Stripe webhook endpoint: `https://<your-domain>/api/stripe/webhook`
4. Enable Google provider in Firebase Auth and authorize your domain

## Post-Deployment
- [ ] Monitor Stripe webhook deliveries
- [ ] Verify Firestore `users/{uid}/subscriptions/status`
- [ ] Confirm OpenAI Assistant File Search corpus is current
