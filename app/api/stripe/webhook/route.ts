import Stripe from "stripe";
import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export async function POST(req: NextRequest) {
  const body = await req.text(); // ← important: raw body, not JSON
  const sig = headers().get("stripe-signature");

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // ✅ Handle successful checkout
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("✅ Stored checkout event:", session.id);

      // Optional: record in DB
      await prisma.order.create({
  data: {
    stripeSessionId: session.id, // ✅ matches your schema
    email: session.customer_email ?? "",
    amount: session.amount_total ? Math.floor(session.amount_total / 100) : 0,
    status: "paid",
  },
});
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return new Response("Webhook Error", { status: 400 });
  }
}
