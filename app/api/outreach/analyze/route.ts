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
    return apiError(err.message || "Unknown error", 500, { mockMode: isMockMode() });
  }
}
