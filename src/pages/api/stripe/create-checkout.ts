import { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth } from '@/lib/firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId } = req.body;
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const { email, uid } = decodedToken;

    // Get base URL from request headers if NEXT_PUBLIC_APP_URL is not set
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
      `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: email,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${new URL('/dashboard', baseUrl).href}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${new URL('/pricing', baseUrl).href}`,
        metadata: { uid },
      });
      

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
} 