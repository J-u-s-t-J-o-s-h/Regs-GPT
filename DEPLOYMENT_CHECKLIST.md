# RegsGPT Deployment Checklist

## Environment Variables
- [ ] NEXT_PUBLIC_FIREBASE_API_KEY
- [ ] NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- [ ] NEXT_PUBLIC_FIREBASE_PROJECT_ID
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- [ ] STRIPE_SECRET_KEY
- [ ] NEXT_PUBLIC_APP_URL
- [ ] OPENAI_API_KEY

## Pre-Deployment Tests
1. Authentication
   - [ ] Sign up flow works
   - [ ] Login flow works
   - [ ] Password reset works

2. Subscription
   - [ ] Stripe checkout works
   - [ ] Premium features are properly gated
   - [ ] Subscription status updates correctly

3. Chat Functionality
   - [ ] Messages send successfully
   - [ ] AI responses are received
   - [ ] Chat history loads correctly

4. UI/UX
   - [ ] Responsive on mobile devices
   - [ ] Loading states work correctly
   - [ ] Error messages are displayed properly

## Deployment Steps
1. Run build locally
   ```bash
   npm run build
   ```

2. Test production build
   ```bash
   npm run start
   ```

3. Deploy to Firebase
   ```bash
   npm run deploy:prod
   ```

4. Verify deployment
   - [ ] Visit production URL
   - [ ] Test core functionality
   - [ ] Check console for errors
   - [ ] Verify analytics tracking

## Post-Deployment
- [ ] Monitor error reporting
- [ ] Check subscription webhooks
- [ ] Verify database connections
- [ ] Test OpenAI integration 