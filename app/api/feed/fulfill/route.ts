import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { Resend } from "resend";
import fs from "fs";

export const runtime = "nodejs";

export async function POST() {
  try {
    // 1️⃣ Get latest paid order
    const order = await prisma.order.findFirst({
      where: { status: "paid" },
      orderBy: { createdAt: "desc" },
    });

    if (!order) {
      return NextResponse.json({ error: "No paid orders yet" });
    }

    // 2️⃣ Confirm feed file exists
    const filePath = "./fixed_feed.csv";
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Feed file not found" });
    }

    // 3️⃣ Upload file to Vercel Blob
    const file = fs.readFileSync(filePath);
    const blobName = `feeds/${Date.now()}_fixed.csv`;
    const { url } = await put(blobName, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    });

    // 4️⃣ Update DB
    await prisma.order.update({
      where: { id: order.id },
      data: { deliverableUrl: url },
    });

    // 5️⃣ Send confirmation email
    const resend = new Resend(process.env.RESEND_API_KEY!);
    await resend.emails.send({
      from: "FeedDoctor <support@feeddoctor.app>",
      to: order.email || "feeddoctor-test@proton.me",
      subject: "✅ Your FeedDoctor Fix Is Ready",
      html: `
        <h2>Your feed fix is complete!</h2>
        <p>Download your optimized feed below:</p>
        <a href="${url}" target="_blank">${url}</a>
        <br><br>
        <p>Thank you for trusting FeedDoctor 🚀</p>
      `,
    });

    return NextResponse.json({ success: true, download: url });
  } catch (error) {
    console.error("❌ Fulfillment error:", error);
    return NextResponse.json({ error: "Fulfillment failed", details: String(error) });
  }
}
