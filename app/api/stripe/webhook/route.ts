import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Normally verify Stripe signature and update order status.
  // In demo mode just return 200.
  return new Response('ok', { status: 200 });
}