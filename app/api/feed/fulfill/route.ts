import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { sendEmail } from "@/lib/resend";
import fs from "fs";

export const runtime = "nodejs";

/**
 * Fulfill a paid order by generating or locating the fixed CSV, uploading it
 * to Vercel Blob Storage, updating the order record and emailing the
 * customer their download link. This route expects a JSON body with
 * `sessionId` (Stripe session id) and an optional `email`. If the order
 * corresponding to the session cannot be found an error is returned.
 */
export async function POST(req: Request) {
  try {
    const { sessionId, email } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // Look up the order by its Stripe session id
    const order = await prisma.order.findFirst({ where: { stripeSessionId: sessionId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If deliverable already exists, return existing link
    if (order.deliverableUrl) {
      return NextResponse.json({ success: true, download: order.deliverableUrl });
    }

    // Path to your generated feed fix. For demo purposes we expect a file
    // called `fixed_feed.csv` in the repo root. Replace this with your actual
    // generation logic (e.g. run your feed fixer engine on the input).
    const filePath = "./fixed_feed.csv";
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Feed file not found" }, { status: 500 });
    }

    // Upload the file to Vercel Blob so it can be served publicly
    const file = fs.readFileSync(filePath);
    const blobName = `feeds/${Date.now()}_fixed.csv`;
    const { url } = await put(blobName, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    });

    // Update the order with the deliverable URL and mark as fulfilled
    await prisma.order.update({
      where: { id: order.id },
      data: { deliverableUrl: url, status: "fulfilled" },
    });

    // Send the download link via email. Prefer the email supplied by the
    // customer at checkout or fall back to the email stored on the order.
    const recipient = email || order.email;
    if (recipient) {
      await sendEmail({
        to: recipient,
        subject: "Your FeedDoctor Fix is ready",
        html: `
          <h2>Your feed has been fixed!</h2>
          <p>You can download your cleaned CSV here:</p>
          <p><a href="${url}" target="_blank">Download CSV</a></p>
          <p>Thank you for choosing FeedDoctor.</p>
        `,
      });
    }

    return NextResponse.json({ success: true, download: url });
  } catch (error: any) {
    console.error("❌ Fulfillment error:", error);
    return NextResponse.json(
      { error: "Fulfillment failed", details: error.message || String(error) },
      { status: 500 }
    );
  }
}
