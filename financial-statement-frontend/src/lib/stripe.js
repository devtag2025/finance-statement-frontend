// lib/stripe.js
import { loadStripe } from '@stripe/stripe-js';

const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!pk) {
  throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
}

export const stripePromise = loadStripe(pk);
