import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const discoverSchema = z.object({
  niche: z.string().min(1),
  country: z.string().optional(),
  maxStores: z.number().min(10).max(1000),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parse = discoverSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { niche, country, maxStores } = parse.data;
  // In mock mode return dummy data
  if (process.env.MOCK_MODE === 'true') {
    const stores = Array.from({ length: Math.min(maxStores, 10) }).map((_, idx) => ({
      storeName: `${niche} Store ${idx + 1}`,
      storeUrl: `https://example${idx + 1}.com`,
      isShopify: idx % 2 === 0,
      contactPageUrl: `https://example${idx + 1}.com/contact`,
      publicEmail: idx % 3 === 0 ? `owner${idx + 1}@example.com` : undefined,
      instagramUrl: idx % 4 === 0 ? `https://instagram.com/example${idx + 1}` : undefined,
      productUrls: [
        `https://example${idx + 1}.com/products/product-1`,
        `https://example${idx + 1}.com/products/product-2`,
      ],
    }));
    return NextResponse.json({ stores });
  }

  // In real implementation you would search for Shopify stores via search engines and scrape.
  return NextResponse.json({ stores: [] });
}