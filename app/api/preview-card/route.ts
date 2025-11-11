import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// @ts-ignore – skia-canvas is available globally in this environment
import { Canvas, loadImage } from 'skia-canvas';

const schema = z.object({
  storeName: z.string().min(1),
  topIssues: z.array(z.string()).min(1).max(2),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const { storeName, topIssues } = parsed.data;
  // Create a 600x300 canvas
  const canvas = new Canvas(600, 300);
  const ctx = canvas.getContext('2d');
  // Background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Header
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(0, 0, canvas.width, 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('FeedDoctor Report', 20, 40);
  // Store name
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(storeName, 20, 100);
  // Issues list
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#334155';
  topIssues.forEach((issue: string, idx: number) => {
    ctx.fillText(`${idx + 1}. ${issue}`, 20, 140 + idx * 24);
  });
  // Generate PNG
  const buffer = await canvas.png;
  const base64 = buffer.toString('base64');
  const url = `data:image/png;base64,${base64}`;
  return NextResponse.json({ url });
}