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
    return NextResponse.json(
      { success: false, error: err.message || "Unknown error", mockMode: isMockMode() },
      { status: 500 }
    );
  }
}
