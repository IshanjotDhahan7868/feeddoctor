import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // In a real implementation you would query the database and compile a CSV.
  // We provide a sample file in mock mode.
  const rows = [
    [
      'store_name',
      'store_url',
      'contact_email',
      'instagram',
      'product_url_1',
      'product_url_2',
      'product_url_3',
      'issues_found',
      'suggested_fixes',
      'email_subject',
      'email_body',
      'dm_body',
      'pipeline_stage',
    ],
    [
      'Example Store',
      'https://examplestore.com',
      'owner@examplestore.com',
      'https://instagram.com/examplestore',
      'https://examplestore.com/product/1',
      'https://examplestore.com/product/2',
      '',
      'Missing GTIN; Long title',
      'Add GTIN; Shorten titles',
      'Fix your feed issues with FeedDoctor',
      'Hi Example Store team,\n\nWe noticed some issues with your feed...',
      'Hi! We found some feed issues. Check FeedDoctor.',
      'NEW',
    ],
  ];
  const csvContent = rows.map((r) => r.join(',')).join('\n');
  const base64 = Buffer.from(csvContent).toString('base64');
  const url = `data:text/csv;base64,${base64}`;
  return NextResponse.json({ url });
}