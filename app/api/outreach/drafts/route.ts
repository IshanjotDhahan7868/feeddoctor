import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const draftsSchema = z.object({ stores: z.array(z.string().min(1)).min(1) });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = draftsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { stores } = parsed.data;
  const drafts = stores.map((store: string) => {
    const subject = `Fix your Google Shopping disapprovals for ${store}`;
    const firstLine = `Hi ${store} team,`;
    const emailBody = `Hi ${store} team,\n\nWe noticed some issues with your product listings on Google Shopping such as missing GTINs and long titles. FeedDoctor can generate a ready‑to‑upload CSV and a checklist to get your products approved within 48h.\n\nIf you’d like to see a quick preview, reply to this email or use our free scanner.\n\nBest regards,\nFeedDoctor`;
    const dmBody = `Hi! We spotted a few feed issues on your Google Shopping listings. FeedDoctor can help fix missing GTINs and long titles. Get a free scan on our site.\n\n(Unsubscribe by replying ‘stop’).`;
    return { storeName: store, subject, firstLine, emailBody, dmBody };
  });
  return NextResponse.json({ drafts });
}