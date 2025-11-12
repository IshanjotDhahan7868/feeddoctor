// /app/api/stripe/checkout/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Initialize Stripe once with your API key. See: https://stripe.com/docs/api?lang=node
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
} as any);

/**
 * Create a Stripe checkout session.
 *
 * Accepts an optional `sku` (defaults to "fixpack") and buyer `email`.
 * The `sku` is mapped to a single price ID defined in your environment via
 * `STRIPE_PRICE_ID`. On success the caller is redirected to your success
 * page with the checkout session id.
 */
type Body = { sku?: string; email?: string };

export async function POST(req: Request) {
  try {
    const { sku = "fixpack", email } = (await req.json()) as Body;

    const priceId = process.env.STRIPE_PRICE_ID;
    const site = (process.env.SITE_URL || "").trim().replace(/\/+$/, "");

    if (!priceId) {
      return NextResponse.json({ error: "Missing STRIPE_PRICE_ID" }, { status: 500 });
    }
    if (!site || !site.startsWith("http")) {
      return NextResponse.json({ error: "SITE_URL is not a valid URL" }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${site}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/checkout?canceled=1`,
      // capture the email if provided so you know who purchased
      customer_email: email || undefined,
      metadata: { sku },
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      automatic_tax: { enabled: false },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Checkout creation failed" },
      { status: 500 }
    );
  }
}
