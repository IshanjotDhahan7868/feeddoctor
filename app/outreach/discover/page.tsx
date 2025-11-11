"use client";
import { useState } from 'react';

interface StoreResult {
  storeName: string;
  storeUrl: string;
  isShopify: boolean;
  contactPageUrl?: string;
  publicEmail?: string;
  instagramUrl?: string;
  productUrls: string[];
}

export default function OutreachDiscoverPage() {
  const [niche, setNiche] = useState('');
  const [country, setCountry] = useState('');
  const [maxStores, setMaxStores] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<StoreResult[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch('/api/outreach/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, country, maxStores }),
      });
      if (!res.ok) {
        throw new Error('Discover failed');
      }
      const json = await res.json();
      setResults(json.stores);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Discover Stores</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="Niche keyword (e.g. running shoes)"
          className="p-2 border rounded"
        />
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Country (optional)"
          className="p-2 border rounded"
        />
        <input
          type="number"
          value={maxStores}
          onChange={(e) => setMaxStores(parseInt(e.target.value))}
          min={10}
          max={1000}
          className="p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white py-2 px-4 rounded hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? 'Discovering…' : 'Discover'}
        </button>
      </form>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {results && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 font-semibold">Store Name</th>
                <th className="px-2 py-1 font-semibold">URL</th>
                <th className="px-2 py-1 font-semibold">Shopify?</th>
                <th className="px-2 py-1 font-semibold">Email</th>
                <th className="px-2 py-1 font-semibold">Instagram</th>
              </tr>
            </thead>
            <tbody>
              {results.map((store, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-2 py-1">{store.storeName}</td>
                  <td className="px-2 py-1">
                    <a href={store.storeUrl} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                      {new URL(store.storeUrl).hostname}
                    </a>
                  </td>
                  <td className="px-2 py-1">{store.isShopify ? 'Yes' : 'No'}</td>
                  <td className="px-2 py-1">{store.publicEmail || '—'}</td>
                  <td className="px-2 py-1">{store.instagramUrl ? <a href={store.instagramUrl} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">IG</a> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}