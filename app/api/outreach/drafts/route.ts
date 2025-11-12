import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Demo messages — replace with AI-generated drafts later
    const messages = [
      {
        to: "owner@petparadise.com",
        subject: "Fix your Google Shopping feed issues fast",
        body: `Hi there! We noticed your store has image-size disapprovals.
FeedDoctor can fix your feed and boost visibility in under 24h.`,
      },
      {
        to: "owner@glowcosmetics.com",
        subject: "Quick fix for your Google feed disapprovals",
        body: `We analyzed your feed and found small GTIN errors.
FeedDoctor can automatically fix and validate them.`,
      },
    ];

    return NextResponse.json({
      success: true,
      message: "Draft generation completed",
      count: messages.length,
      messages,
    });
  } catch (err: any) {
    console.error("DRAFT ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
