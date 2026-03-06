import { NextResponse } from "next/server";
import { isMockMode } from "@/lib/runtime";

export async function POST() {
  try {
    if (!isMockMode()) {
      return NextResponse.json(
        {
          success: false,
          error: "Outreach endpoint is only available in MOCK_MODE for now",
          code: "NOT_IMPLEMENTED",
          mockMode: false,
        },
        { status: 501 }
      );
    }

    // Demo data — replace with real analysis
    const analysis = [
      { store: "Pet Paradise", issues: ["Missing GTIN", "Image too small"] },
      { store: "Glow Cosmetics", issues: [] },
      { store: "FitZone", issues: ["Title too long", "No brand field"] },
    ];

    return NextResponse.json({
      mockMode: true,
      success: true,
      message: "Analysis completed",
      analyzed: analysis.length,
      results: analysis,
    });
  } catch (err: any) {
    console.error("ANALYZE ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Unknown error", mockMode: isMockMode() },
      { status: 500 }
    );
  }
}
