import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Demo data — replace with real analysis
    const analysis = [
      { store: "Pet Paradise", issues: ["Missing GTIN", "Image too small"] },
      { store: "Glow Cosmetics", issues: [] },
      { store: "FitZone", issues: ["Title too long", "No brand field"] },
    ];

    return NextResponse.json({
      success: true,
      message: "Analysis completed",
      analyzed: analysis.length,
      results: analysis,
    });
  } catch (err: any) {
    console.error("ANALYZE ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
