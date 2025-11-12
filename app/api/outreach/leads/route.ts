import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const leads = await prisma.outreachLead.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ leads });
}

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")!;
  const body = await req.json();

  await prisma.outreachLead.update({
    where: { id },
    data: { stage: body.stage },
  });

  return NextResponse.json({ success: true });
}
