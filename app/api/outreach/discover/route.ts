import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Demo data — replace with real discovery logic later
    const stores = [
      { name: "Pet Paradise", url: "https://petparadise.myshopify.com" },
      { name: "Glow Cosmetics", url: "https://glowcosmetics.myshopify.com" },
      { name: "FitZone", url: "https://fitzone.myshopify.com" },
    ];

    return NextResponse.json({
      success: true,
      message: "Store discovery completed",
      count: stores.length,
      stores,
    });
  } catch (err: any) {
    console.error("DISCOVER ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
