import Stripe from "stripe";
import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export async function POST(req: NextRequest) {
  const body = await req.text(); // ✅ raw body — required by Stripe
  const signature = headers().get("stripe-signature");

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // ✅ Log the event type for visibility
    console.log(`🔔 Received event: ${event.type}`);

    // ✅ Handle checkout session completion
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("✅ Stored checkout event:", session.id);

      await prisma.order.create({
        data: {
          stripeSessionId: session.id, // ✅ matches your Prisma schema
          email: session.customer_email ?? "",
          amount: session.amount_total
            ? Math.floor(session.amount_total / 100)
            : 0,
          status: "paid",
        },
      });
    }

    // ✅ (Optional) Log other events you want to handle later
    else {
      await prisma.webhookEvent.create({
        data: {
          type: event.type,
          raw: event as any,
        },
      });
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return new Response(
      `Webhook Error: ${(err as Error).message}`,
      { status: 400 }
    );
  }
}
