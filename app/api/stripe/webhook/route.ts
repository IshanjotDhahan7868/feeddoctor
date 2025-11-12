import { headers } from "next/headers";
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const runtime = "nodejs";

/**
 * Stripe webhook handler for FeedDoctor
 * -------------------------------------
 * Receives payment events and triggers the fulfillment pipeline.
 * Must verify Stripe signature with the RAW request body.
 */
export async function POST(req: Request) {
  const sig = (await headers()).get("stripe-signature")!;
  const body = await req.text(); // ✅ must be raw text, not JSON

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Stripe signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // ✅ Log incoming event
  console.log("🔔 Received event:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email =
          session.customer_details?.email ?? session.customer_email ?? "";
        const scanId = session.metadata?.scanId ?? null;

        console.log("✅ Checkout complete for:", email, "Scan ID:", scanId);

        // 1️⃣ Record payment in DB
        await prisma.order.upsert({
          where: { stripeSessionId: session.id },
          update: {
            status: "PAID",
            amount: session.amount_total ?? 0,
            currency: session.currency ?? "usd",
          },
          create: {
            stripeSessionId: session.id,
            status: "PAID",
            amount: session.amount_total ?? 0,
            currency: session.currency ?? "usd",
            email,
            scanId,
          },
        });

        // 2️⃣ Trigger fulfillment job (sends CSV + email)
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/feed/fulfill`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            scanId,
            stripeSessionId: session.id,
          }),
        });

        break;
      }

      case "payment_intent.succeeded": {
        console.log("💰 Payment intent succeeded");
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("⚠️ Webhook handling error:", err);
    return new NextResponse(`Webhook handler error: ${err.message}`, {
      status: 500,
    });
  }
}
