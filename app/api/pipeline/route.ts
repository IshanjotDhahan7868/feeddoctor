import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api";

const STAGES = ["NEW", "CONTACTED", "INTERESTED", "CLOSED"] as const;
type Stage = (typeof STAGES)[number];

const patchSchema = z.object({
  storeUrl: z.string().url(),
  stage: z.enum(STAGES),
});

function toUiStage(value: string): Stage {
  const normalized = value.toUpperCase();
  if ((STAGES as readonly string[]).includes(normalized)) {
    return normalized as Stage;
  }
  return "NEW";
}

export async function GET() {
  try {
    const leads = await prisma.outreachLead.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const board: Record<Stage, { id: string; name: string; storeUrl: string }[]> = {
      NEW: [],
      CONTACTED: [],
      INTERESTED: [],
      CLOSED: [],
    };

    for (const lead of leads) {
      const stage = toUiStage(lead.stage);
      board[stage].push({
        id: lead.id,
        name: lead.storeUrl.replace(/^https?:\/\//, ""),
        storeUrl: lead.storeUrl,
      });
    }

    return NextResponse.json({ success: true, board });
  } catch (error: any) {
    return apiError(error?.message ?? "Failed to fetch pipeline leads", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Invalid payload", 400, { issues: parsed.error.flatten() });
    }

    const { storeUrl, stage } = parsed.data;

    const updated = await prisma.outreachLead.upsert({
      where: { storeUrl },
      update: { stage: stage.toLowerCase() },
      create: { storeUrl, stage: stage.toLowerCase() },
    });

    return NextResponse.json({
      success: true,
      lead: {
        id: updated.id,
        storeUrl: updated.storeUrl,
        stage,
      },
    });
  } catch (error: any) {
    return apiError(error?.message ?? "Failed to update pipeline lead", 500);
  }
}
