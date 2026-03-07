import { NextResponse } from "next/server";
import { getEnvHealth } from "@/lib/env";
import { apiError } from "@/lib/api";

export async function GET() {
  try {
    return NextResponse.json({ success: true, ...getEnvHealth() });
  } catch (error: any) {
    return apiError(error?.message ?? "Environment validation failed", 500);
  }
}
