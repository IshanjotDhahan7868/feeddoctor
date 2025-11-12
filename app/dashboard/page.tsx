"use client";
import { useState } from "react";

export default function Dashboard() {
  const [keyword, setKeyword] = useState("");
  const [stores, setStores] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDiscover = async () => {
    setLoading(true);
    setStores([]);
    const res = await fetch("/api/outreach/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword }),
    });
    const data = await res.json();
    setStores(data.stores || []);
    setLoading(false);
  };

  const handleAnalyze = async (store: string) => {
    setSelected(store);
    const res = await fetch("/api/outreach/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeUrl: store }),
    });
    const data = await res.json();
    setIssues(data.issues || []);
  };

  const handleDraft = async () => {
    if (!selected) return;
    const res = await fetch("/api/outreach/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeUrl: selected, issues }),
    });
    const data = await res.json();
    setDraft(data.draft || "");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-purple-400">
          FeedDoctor Dashboard
        </h1>
        <p className="text-gray-400 mb-8">
          Discover Shopify stores, analyze their feeds, and generate outreach drafts — all in one place.
        </p>

        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none"
            placeholder="Enter niche keyword (e.g., pet store, gym gear)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button
            onClick={handleDiscover}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-white font-semibold"
          >
            {loading ? "Discovering..." : "Discover"}
          </button>
        </div>

        {stores.length > 0 && (
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <h2 className="text-2xl mb-2 font-semibold">Discovered Stores</h2>
            <ul className="space-y-2">
              {stores.map((store, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center border-b border-gray-800 pb-2"
                >
                  <a
                    href={store}
                    target="_blank"
                    className="text-blue-400 hover:underline"
                  >
                    {store}
                  </a>
                  <button
                    onClick={() => handleAnalyze(store)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
                  >
                    Analyze
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {issues.length > 0 && (
          <div className="mt-6 bg-gray-900 p-4 rounded-lg border border-gray-800">
            <h2 className="text-2xl mb-2 font-semibold">Detected Issues</h2>
            <ul className="list-disc ml-5 text-gray-300">
              {issues.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
            <button
              onClick={handleDraft}
              className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-white font-semibold"
            >
              Generate Draft
            </button>
          </div>
        )}

        {draft && (
          <div className="mt-6 bg-gray-900 p-4 rounded-lg border border-gray-800">
            <h2 className="text-2xl mb-2 font-semibold">Outreach Draft</h2>
            <textarea
              readOnly
              value={draft}
              className="w-full h-48 p-3 bg-black border border-gray-800 rounded-md text-gray-200"
            />
            <button
              onClick={() => navigator.clipboard.writeText(draft)}
              className="mt-3 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-white font-semibold"
            >
              Copy Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
