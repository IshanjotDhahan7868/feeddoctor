// /app/api/stripe/webhook/route.ts
import Stripe from "stripe";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 40;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
} as any);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get("stripe-signature");

  if (!sig) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature error:", err?.message);
    return new Response(`Webhook Error: ${err?.message}`, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Fetch full session with line items if you need priceId later:
      // const full = await stripe.checkout.sessions.retrieve(session.id, { expand: ["line_items.data.price"] });

      await prisma.order.create({
        data: {
          email: session.customer_details?.email ?? session.customer_email ?? "unknown@unknown",
          stripeSessionId: session.id,
          // priceId: (full.line_items?.data?.[0]?.price?.id as string | undefined) ?? null,
          priceId: null,               // keep null unless you expand line_items above
          amount: session.amount_total ?? null,
          status: "paid",
        },
      });

      console.log("✅ checkout.session.completed stored:", session.id);
    }

    // You can optionally handle payment_intent.succeeded, etc. here.

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return new Response("Handler Error", { status: 500 });
  }
}
