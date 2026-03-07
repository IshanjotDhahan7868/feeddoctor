import { headers } from "next/headers";
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey);
}

/**
 * Stripe webhook handler for FeedDoctor
 * -------------------------------------
 * Receives payment events and triggers the fulfillment pipeline.
 * Must verify Stripe signature with the RAW request body.
 */
export async function POST(req: Request) {
  const stripe = getStripeClient();
  if (!stripe) {
    return apiError("Missing STRIPE_SECRET_KEY", 500);
  }

  const sig = (await headers()).get("stripe-signature");
  if (!sig) {
    return apiError("Missing stripe-signature header", 400);
  }

  const body = await req.text(); // ✅ must be raw text, not JSON
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return apiError("Missing STRIPE_WEBHOOK_SECRET", 500);
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
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
            sessionId: session.id,
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
