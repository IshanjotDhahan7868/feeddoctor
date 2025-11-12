import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    // Example generated drafts; in production you’d load these from DB
    const drafts = [
      {
        storeUrl: "https://petparadise.myshopify.com",
        to: "owner@petparadise.com",
        subject: "Fix your Google Shopping feed in 24h",
        body: "Hi there! We noticed your feed has image-size and GTIN issues.\nFeedDoctor can fix your Google Shopping feed in under 24 hours.",
      },
      {
        storeUrl: "https://glowcosmetics.myshopify.com",
        to: "owner@glowcosmetics.com",
        subject: "Quick fix for your Shopping feed disapprovals",
        body: "We analyzed your products and found small errors that could affect visibility.\nFeedDoctor automatically repairs feed disapprovals and ensures compliance.",
      },
    ];

    const results: any[] = [];

    for (const msg of drafts) {
      try {
        // 1️⃣ Send email via Resend
        const res = await resend.emails.send({
          from: "FeedDoctor <outreach@feeddoctor.app>",
          to: msg.to,
          subject: msg.subject,
          text: msg.body,
        });

        // 2️⃣ Create or update lead record
        await prisma.outreachLead.upsert({
          where: { storeUrl: msg.storeUrl },
          update: {
            stage: "contacted",
            notes: `Email sent to ${msg.to} (Resend ID: ${res.id ?? "none"})`,
          },
          create: {
            storeUrl: msg.storeUrl,
            stage: "contacted",
            notes: `Email sent to ${msg.to} (Resend ID: ${res.id ?? "none"})`,
          },
        });

        results.push({ to: msg.to, status: "sent" });
      } catch (err: any) {
        results.push({ to: msg.to, status: "failed", error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Emails sent & leads updated",
      count: results.length,
      results,
    });
  } catch (err: any) {
    console.error("Send error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
