import { NextRequest, NextResponse } from 'next/server';

// This endpoint would normally create a Stripe Checkout Session.
// In demo mode we return a dummy URL that redirects back to the success page.

export async function POST(req: NextRequest) {
  const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/feed/success?session_id=dummy-session`;
  return NextResponse.json({ url: successUrl });
}