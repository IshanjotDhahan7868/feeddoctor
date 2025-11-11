import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

// Initialize Stripe only if secret key is provided
export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2023-08-16' }) : null;

export async function createCheckoutSession(): Promise<{ url: string }> {
  if (!stripe) {
    // In demo mode return dummy URL
    return { url: '/feed/success?session_id=dummy' };
  }
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'USD',
          product_data: {
            name: 'Feed Fix Pack',
            description: 'Up to 25 SKUs',
          },
          unit_amount: 29900,
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/feed/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/feed/scan`,
  });
  return { url: session.url || '' };
}