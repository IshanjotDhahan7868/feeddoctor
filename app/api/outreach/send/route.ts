import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

/**
 * /api/outreach/send
 * -------------------
 * Sends outreach emails via Resend and updates your CRM (Outreach table).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Expected: { to: string, subject: string, html: string, storeUrl: string }
    const { to, subject, html, storeUrl } = body;

    if (!to || !subject || !html || !storeUrl) {
      return apiError("Missing parameters", 400);
    }

    if (!resend) {
      return apiError("Email provider is not configured", 503);
    }

    // 1️⃣ Send email via Resend
    const res = await resend.emails.send({
      from: "FeedDoctor <noreply@feeddoctor.com>",
      to,
      subject,
      html,
    });

    console.log("✅ Resend response:", res.data);

    // 2️⃣ Upsert outreach record in database
    await prisma.outreachLead.upsert({
      where: { storeUrl },
      update: {
        stage: "contacted",
        notes: `Email sent to ${to} (Resend ID: ${res.data?.id ?? "none"})`,
      },
      create: {
        storeUrl,
        stage: "contacted",
        notes: `Email sent to ${to} (Resend ID: ${res.data?.id ?? "none"})`,
      },
    });

    console.log("📨 Outreach log saved for:", to);

    return NextResponse.json({
      ok: true,
      message: `Email successfully sent to ${to}`,
      resendId: res.data?.id ?? "none",
    });
  } catch (err: any) {
    console.error("❌ Outreach send error:", err);
    return apiError(err.message || "Outreach send failed", 500);
  }
}
