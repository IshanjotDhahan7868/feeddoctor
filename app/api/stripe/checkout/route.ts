// /app/api/stripe/checkout/route.ts
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Your installed stripe SDK expects this version.
  apiVersion: "2022-11-15",
} as any);

type Body = { sku?: string; email?: string };

export async function POST(req: Request) {
  try {
    const { sku = "fixpack" } = (await req.json()) as Body;

    // map sku → price id (extend later if you add more SKUs)
    const priceId = process.env.STRIPE_PRICE_ID!;
    if (!priceId) {
      return new Response(JSON.stringify({ error: "Missing STRIPE_PRICE_ID" }), { status: 500 });
    }

    const site = (process.env.SITE_URL || "").trim().replace(/\/+$/, "");
    if (!site.startsWith("http")) {
      return new Response(JSON.stringify({ error: "SITE_URL is not a valid URL" }), { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${site}/feed/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/feed/checkout?sku=${encodeURIComponent(sku)}`,
      metadata: { sku },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      automatic_tax: { enabled: false },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message ?? "Checkout creation failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
