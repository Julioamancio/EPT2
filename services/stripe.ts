import { loadStripe } from '@stripe/stripe-js';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

export const STRIPE_CONFIG = {
  priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
  paymentUrl: import.meta.env.VITE_STRIPE_PAYMENT_URL,
};
