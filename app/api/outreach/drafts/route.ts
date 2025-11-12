import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Example generated outreach messages
    const messages = [
      {
        to: "owner@petparadise.com",
        subject: "Fix your Google Shopping feed in 24h",
        body: `Hi there! We noticed your feed has image-size and GTIN issues. 
FeedDoctor can fix your Google Shopping feed in under 24 hours.`,
      },
      {
        to: "owner@glowcosmetics.com",
        subject: "Quick fix for your Shopping feed disapprovals",
        body: `We analyzed your products and found small errors that could affect visibility. 
FeedDoctor automatically repairs feed disapprovals and ensures compliance.`,
      },
      {
        to: "owner@fitzone.com",
        subject: "Resolve feed issues fast and boost visibility",
        body: `We can help FitZone fix your disapproved Shopping products quickly. 
FeedDoctor delivers a clean, validated feed ready to upload.`,
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
