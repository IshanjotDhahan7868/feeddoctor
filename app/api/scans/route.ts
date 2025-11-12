import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * API endpoint to retrieve past orders (scans) for a given email. This
 * endpoint expects a query parameter `email` and returns a list of orders
 * sorted by most recent first. Each order includes basic fields like id,
 * createdAt, status and deliverableUrl.
 *
 * Example: GET /api/scans?email=user@example.com
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: { email },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      stripeSessionId: true,
      createdAt: true,
      status: true,
      deliverableUrl: true,
      amount: true,
    },
  });

  return NextResponse.json({ orders });
}