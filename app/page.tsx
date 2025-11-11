import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useState } from 'react';

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-16">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-extrabold sm:text-5xl">
          Fix your Google Shopping disapprovals in 24–48h.
        </h1>
        <p className="text-lg text-gray-600">
          We generate a ready‑to‑upload CSV and a clear Google Merchant Center checklist.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href="/feed/scan"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-white font-medium shadow hover:bg-blue-600 transition"
          >
            Free Quick Scan
          </Link>
          <Link
            href="/feed/scan?checkout=1"
            className="inline-flex items-center justify-center rounded-md bg-secondary px-6 py-3 text-white font-medium shadow hover:bg-green-600 transition"
          >
            Buy Fix Pack ($299)
          </Link>
        </div>
        <div className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <ol className="list-decimal list-inside text-left space-y-2 text-gray-700">
            <li>Upload your existing product feed file (CSV/TSV) or enter your store URL.</li>
            <li>We run a quick scan and show you sample issues and suggested fixes.</li>
            <li>Purchase a full Fix Pack for up to 25 SKUs for a one‑time $299.</li>
            <li>Receive a ready‑to‑upload feed patch, title suggestions, image briefs and a GMC checklist.</li>
          </ol>
        </div>
        <div className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold">FAQ</h2>
          <div className="space-y-3 text-left">
            <h3 className="font-medium">What counts as a SKU?</h3>
            <p className="text-gray-700">Each unique product ID in your feed counts as one SKU. Our Fix Pack covers up to 25 SKUs per order.</p>
            <h3 className="font-medium">How do you respect Google policies?</h3>
            <p className="text-gray-700">We only suggest changes. You retain full control to review and upload. We respect robots.txt when scraping public product pages.</p>
            <h3 className="font-medium">Do you offer refunds?</h3>
            <p className="text-gray-700">Yes. If you’re not satisfied with our deliverables, contact us within 7 days for a full refund.</p>
          </div>
        </div>
        <div className="mt-12 text-gray-500 text-sm">
          <p>
            *This product is fully compliant with CASL and CAN‑SPAM. Outreach drafts include an unsubscribe line and are only sent manually.
          </p>
        </div>
      </div>
    </main>
  );
}