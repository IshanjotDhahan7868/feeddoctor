"use client";
import { useState } from 'react';

export default function ExportPage() {
  const [csvUrl, setCsvUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/export', { method: 'GET' });
      if (!res.ok) throw new Error('Failed to export');
      const json = await res.json();
      setCsvUrl(json.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Export Data</h1>
      <p className="text-gray-600 mb-4">Download a CSV of your leads, issues, suggested fixes and outreach drafts.</p>
      <button
        onClick={handleExport}
        disabled={loading}
        className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
      >
        {loading ? 'Generating…' : 'Export CSV'}
      </button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {csvUrl && (
        <div className="mt-4">
          <a href={csvUrl} download="export.csv" className="text-blue-600 underline">
            Download export.csv
          </a>
        </div>
      )}
    </main>
  );
}