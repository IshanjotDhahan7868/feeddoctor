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

    // Demo data — replace with real discovery logic later
    const stores = [
      { name: "Pet Paradise", url: "https://petparadise.myshopify.com" },
      { name: "Glow Cosmetics", url: "https://glowcosmetics.myshopify.com" },
      { name: "FitZone", url: "https://fitzone.myshopify.com" },
    ];

    return NextResponse.json({
      mockMode: true,
      success: true,
      message: "Store discovery completed",
      count: stores.length,
      stores,
    });
  } catch (err: any) {
    console.error("DISCOVER ERROR:", err);
    return apiError(err.message || "Unknown error", 500, { mockMode: isMockMode() });
  }
}
