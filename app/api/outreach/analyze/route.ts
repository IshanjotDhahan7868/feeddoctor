import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const analyzeSchema = z.object({ stores: z.array(z.string()).min(1) });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = analyzeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { stores } = parsed.data;
  if (process.env.MOCK_MODE === 'true') {
    const issues: Record<string, any[]> = {};
    stores.forEach((store) => {
      issues[store] = [
        {
          id: `${store}-prod1`,
          title: 'Example Product 1',
          price: '$29.99',
          issues: ['Missing GTIN', 'Title too long'],
          suggestions: [
            'Add a valid GTIN (UPC/EAN/ISBN)',
            'Shorten title to under 150 characters',
          ],
        },
        {
          id: `${store}-prod2`,
          title: 'Example Product 2',
          price: '$59.99',
          issues: ['Missing brand'],
          suggestions: ['Specify a brand'],
        },
      ];
    });
    return NextResponse.json({ issues });
  }
  // Real implementation would scrape product pages for each store
  return NextResponse.json({ issues: {} });
}