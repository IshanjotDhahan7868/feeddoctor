"use client";

import { useState } from 'react';

interface ScanIssue {
  type: string;
  message: string;
}

interface ScanResponse {
  issues: ScanIssue[];
  samples: string[];
  rowsToPatch: any[];
  mock?: boolean;
}

export default function FeedScanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      if (url) formData.append('url', url);
      const res = await fetch('/api/feed/scan', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        throw new Error('Scan failed');
      }
      const json = await res.json();
      setResult(json);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Feed Scanner</h1>
      <p className="text-gray-600">Upload your product feed (CSV/TSV) or provide a store URL to scan up to 25 SKUs. We’ll return sample issues and suggested title fixes.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Feed File (CSV/TSV)</label>
          <input
            type="file"
            accept=".csv,.tsv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-1 block w-full border border-gray-300 rounded p-2"
          />
        </div>
        <div>
          <label className="block font-medium">Store URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="mt-1 block w-full border border-gray-300 rounded p-2"
          />
          <p className="text-sm text-gray-500 mt-1">You can either upload a file or provide a URL. If both are provided, the file takes precedence.</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? 'Scanning…' : 'Run Scan'}
        </button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
      {result && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Scan Results</h2>
          {result.mock && (
            <p className="text-sm text-gray-500">*Mock mode enabled – results are prefilled for demo purposes*</p>
          )}
          <div className="space-y-4">
            <h3 className="font-medium">Issues Found:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {result.issues.map((issue, idx) => (
                <li key={idx}><strong>{issue.type}:</strong> {issue.message}</li>
              ))}
            </ul>
            <h3 className="font-medium mt-4">Sample Title Fixes:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {result.samples.map((samp, idx) => (
                <li key={idx}>{samp}</li>
              ))}
            </ul>
            <h3 className="font-medium mt-4">First Rows to Patch:</h3>
            <pre className="bg-gray-50 border border-gray-200 p-4 rounded text-sm overflow-x-auto">
{JSON.stringify(result.rowsToPatch.slice(0, 5), null, 2)}
            </pre>
          </div>
          <div className="mt-6">
            <a
              href="/feed/checkout"
              className="inline-block bg-secondary text-white px-6 py-3 rounded hover:bg-green-600 transition"
            >
              Checkout $299 for Full Fix Pack
            </a>
          </div>
        </div>
      )}
    </main>
  );
}