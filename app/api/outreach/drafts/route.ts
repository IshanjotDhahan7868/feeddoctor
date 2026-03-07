import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { isMockMode } from "@/lib/runtime";

export async function POST() {
  try {
    if (!isMockMode()) {
      return apiError("Outreach endpoint is only available in MOCK_MODE for now", 501, {
        code: "NOT_IMPLEMENTED",
        mockMode: false,
      });
    }

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

    // ✅ Always return JSON — otherwise frontend .json() fails
    return NextResponse.json({
      mockMode: true,
      success: true,
      message: "Draft generation completed",
      count: messages.length,
      messages,
    });
  } catch (error: any) {
    console.error("DRAFT ERROR:", error);
    return apiError(error.message || "Unknown error", 500, { mockMode: isMockMode() });
  }
}
