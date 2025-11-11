import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Buffer } from 'buffer';

// Input validation
const fulfillSchema = z.object({
  email: z.string().email(),
  sessionId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = fulfillSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { email, sessionId } = parsed.data;

  // In a real implementation you would verify sessionId with Stripe and fetch the scan payload from storage or DB.
  // For demo purposes we skip verification and return static files.
  const files = [
    {
      name: 'feed_patch.csv',
      content: 'id,title,price\nSKU123,Improved title,29.99\n',
    },
    {
      name: 'title_suggestions.csv',
      content: 'id,suggestion1,suggestion2,suggestion3\nSKU123,Improved Title A,Improved Title B,Improved Title C\n',
    },
    {
      name: 'image_briefs.txt',
      content: 'SKU123: 1000x1000, white background, no watermark\n',
    },
    {
      name: 'GMC_checklist.pdf',
      content: 'FeedDoctor GMC checklist placeholder. Please follow GTIN/MPN/Brand policies.',
    },
  ];

  // Convert files to data URIs for demonstration
  const downloadUrls = files.map(({ name, content }) => {
    const mime = name.endsWith('.pdf')
      ? 'application/pdf'
      : name.endsWith('.csv')
      ? 'text/csv'
      : 'text/plain';
    const base64 = Buffer.from(content).toString('base64');
    const url = `data:${mime};base64,${base64}`;
    return { name, url };
  });

  return NextResponse.json({ downloadUrls, message: 'Deliverables generated in demo mode.' });
}