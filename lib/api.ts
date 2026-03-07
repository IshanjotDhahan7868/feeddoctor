import { NextResponse } from "next/server";

export function apiError(
  error: string,
  status: number,
  extras: Record<string, unknown> = {}
) {
  return NextResponse.json(
    {
      success: false,
      error,
      ...extras,
    },
    { status }
  );
}
