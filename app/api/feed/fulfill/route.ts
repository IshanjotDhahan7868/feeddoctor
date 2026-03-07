import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { sendEmail } from "@/lib/resend";
import { apiError } from "@/lib/api";
import fs from "fs";
import { createHash } from "crypto";

export const runtime = "nodejs";

function buildArtifactPath(orderId: string, version: number) {
  return `feeds/${orderId}/v${version}/fixed_feed.csv`;
}

function computeChecksum(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { sessionId, email } = await req.json();
    if (!sessionId) {
      return apiError("Missing sessionId", 400);
    }

    const order = await prisma.order.findFirst({
      where: { stripeSessionId: sessionId },
      include: { artifact: true },
    });

    if (!order) {
      return apiError("Order not found", 404);
    }

    // Recovery path: prefer existing order URL, then artifact URL
    if (order.deliverableUrl) {
      return NextResponse.json({ success: true, download: order.deliverableUrl, reused: true });
    }
    if (order.artifact?.url) {
      await prisma.order.update({
        where: { id: order.id },
        data: { deliverableUrl: order.artifact.url, status: "FULFILLED" },
      });
      return NextResponse.json({ success: true, download: order.artifact.url, recovered: true });
    }

    const lock = await prisma.order.updateMany({
      where: {
        id: order.id,
        deliverableUrl: null,
        status: { in: ["PAID", "paid", "PENDING"] },
      },
      data: { status: "FULFILLING" },
    });

    if (lock.count === 0) {
      const current = await prisma.order.findUnique({
        where: { id: order.id },
        include: { artifact: true },
      });
      const resolvedUrl = current?.deliverableUrl || current?.artifact?.url;
      if (resolvedUrl) {
        return NextResponse.json({ success: true, download: resolvedUrl, reused: true });
      }
      return NextResponse.json({ success: true, processing: true });
    }

    const filePath = "./fixed_feed.csv";
    if (!fs.existsSync(filePath)) {
      await prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } });
      return apiError("Feed file not found", 500);
    }

    const file = fs.readFileSync(filePath);
    const version = 1;
    const artifactPath = buildArtifactPath(order.id, version);
    const checksum = computeChecksum(file);

    const { url } = await put(artifactPath, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    });

    await prisma.$transaction([
      prisma.fulfillmentArtifact.upsert({
        where: { orderId: order.id },
        update: {
          version,
          path: artifactPath,
          checksum,
          url,
        },
        create: {
          orderId: order.id,
          version,
          path: artifactPath,
          checksum,
          url,
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { deliverableUrl: url, status: "FULFILLED" },
      }),
    ]);

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

    return NextResponse.json({ success: true, download: url, artifact: { version, path: artifactPath, checksum } });
  } catch (error: any) {
    console.error("❌ Fulfillment error:", error);
    return apiError(error?.message || "Fulfillment failed", 500);
  }
}
