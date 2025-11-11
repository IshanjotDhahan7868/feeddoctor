"use client";
import { useState } from 'react';

interface Draft {
  storeName: string;
  subject: string;
  firstLine: string;
  emailBody: string;
  dmBody: string;
}

export default function OutreachDraftsPage() {
  const [storesInput, setStoresInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    const stores = storesInput
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (stores.length === 0) {
      setError('Please enter at least one store name');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/outreach/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stores }),
      });
      if (!res.ok) throw new Error('Failed to generate drafts');
      const json = await res.json();
      setDrafts(json.drafts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">Generate Outreach Drafts</h1>
      <p className="text-gray-600">Enter one or more store names (each on a new line or comma separated).</p>
      <textarea
        value={storesInput}
        onChange={(e) => setStoresInput(e.target.value)}
        rows={4}
        className="w-full p-2 border rounded"
        placeholder="Store One\nStore Two\nStore Three"
      ></textarea>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-secondary text-white px-4 py-2 rounded hover:bg-green-600 transition disabled:opacity-50"
      >
        {loading ? 'Generating…' : 'Generate Drafts'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {drafts && (
        <div className="space-y-6 mt-6">
          {drafts.map((draft, idx) => (
            <div key={idx} className="border rounded p-4 bg-white">
              <h2 className="text-xl font-semibold mb-2">{draft.storeName}</h2>
              <p className="font-medium">Subject:</p>
              <p className="mb-2">{draft.subject}</p>
              <p className="font-medium">First Line:</p>
              <p className="mb-2">{draft.firstLine}</p>
              <p className="font-medium">Email Body:</p>
              <p className="whitespace-pre-line mb-2">{draft.emailBody}</p>
              <p className="font-medium">DM Body:</p>
              <p className="whitespace-pre-line">{draft.dmBody}</p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => navigator.clipboard.writeText(draft.emailBody)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Copy Email
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(draft.dmBody)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Copy DM
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}