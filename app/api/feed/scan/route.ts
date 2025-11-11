import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// In‑memory rate limiter: maps IP → { count, timestamp }
const rateLimit = new Map<string, { count: number; ts: number }>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX || '5', 10);

const inputSchema = z.object({
  url: z.string().url().optional(),
});

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delimiter).map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < Math.min(lines.length, 101); i++) {
    const cols = lines[i].split(delimiter);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] || '';
    });
    rows.push(row);
  }
  return rows;
}

export async function POST(req: NextRequest) {
  // Rate limit by IP (x-forwarded-for or remote address)
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'global';
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (entry) {
    if (now - entry.ts < WINDOW_MS) {
      if (entry.count >= MAX_REQUESTS) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please wait a minute and try again.' },
          { status: 429 }
        );
      }
      entry.count++;
    } else {
      rateLimit.set(ip, { count: 1, ts: now });
    }
  } else {
    rateLimit.set(ip, { count: 1, ts: now });
  }

  // Handle mock mode: return sample output without processing
  if (process.env.MOCK_MODE === 'true') {
    return NextResponse.json({
      mock: true,
      issues: [
        { type: 'Missing GTIN', message: 'Several products lack a GTIN/MPN/Brand.' },
        { type: 'Long Title', message: 'Product titles exceed 150 characters.' },
      ],
      samples: [
        'Acme Running Shoes – Blue, Size 10',
        'Premium Cotton T‑Shirt – Black, Medium',
        'Stainless Steel Water Bottle – 500ml',
      ],
      rowsToPatch: [
        { id: 'SKU123', title: 'Old title', price: '29.99', gtin: '', brand: 'Acme' },
        { id: 'SKU456', title: 'Another product title', price: '39.99', gtin: '1234567890123', brand: '' },
      ],
    });
  }

  // Parse multipart form
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const url = formData.get('url') as string | null;

  if (!file && !url) {
    return NextResponse.json(
      { error: 'Please provide a file or a URL.' },
      { status: 400 }
    );
  }

  let rows: Record<string, string>[] = [];
  if (file) {
    // Read file content
    const text = await file.text();
    rows = parseCSV(text);
  } else if (url) {
    // Validate URL using Zod
    const parsed = inputSchema.safeParse({ url });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
    try {
      const resp = await fetch(url, { headers: { 'User-Agent': 'FeedDoctorBot/1.0' } });
      if (!resp.ok || !resp.headers.get('content-type')?.includes('text/html')) {
        return NextResponse.json({ error: 'Failed to fetch HTML from URL' }, { status: 400 });
      }
      const html = await resp.text();
      // Simple scraping: find product names, prices using regex; this is not robust but works without cheerio
      const productMatches = Array.from(html.matchAll(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi)).map((m) => m[1]).slice(0, 5);
      rows = productMatches.map((title, idx) => ({ id: `URL${idx}`, title, price: '', brand: '', gtin: '' }));
    } catch (err) {
      return NextResponse.json({ error: 'Failed to scrape URL' }, { status: 400 });
    }
  }

  // Evaluate issues
  const issues: { type: string; message: string }[] = [];
  const titles: string[] = [];
  const seenIds = new Set<string>();
  rows.forEach((row) => {
    const id = row.id || row['id'];
    const title = row.title || row['title'];
    const brand = row.brand || row['brand'];
    const gtin = row.gtin || row['gtin'];
    // Duplicate IDs
    if (id) {
      if (seenIds.has(id)) {
        issues.push({ type: 'Duplicate ID', message: `Duplicate product ID ${id}` });
      } else {
        seenIds.add(id);
      }
    }
    if (!brand) {
      issues.push({ type: 'Missing Brand', message: `Product ${id} has no brand` });
    }
    if (!gtin) {
      issues.push({ type: 'Missing GTIN', message: `Product ${id} has no GTIN/MPN` });
    }
    if (title && title.length > 150) {
      issues.push({ type: 'Long Title', message: `Product ${id} title exceeds 150 characters` });
    }
    if (title) titles.push(title);
  });
  // Suggest sample titles: take first 3 titles and add suffix/prefix
  const samples = titles.slice(0, 3).map((t) => {
    return t.replace(/[^a-zA-Z0-9 ]/g, '').trim().slice(0, 50) + ' – Improved';
  });

  return NextResponse.json({ issues, samples, rowsToPatch: rows.slice(0, 5) });
}