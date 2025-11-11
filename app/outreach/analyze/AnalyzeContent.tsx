"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ProductIssue {
  id: string;
  title: string;
  price: string;
  issues: string[];
  suggestions: string[];
}

export default function AnalyzeContent() {
  const params = useSearchParams();
  const storesParam = params.get("stores");
  const storeIds = storesParam ? storesParam.split(",") : [];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<Record<string, ProductIssue[]> | null>(
    null
  );

  useEffect(() => {
    async function fetchAnalysis() {
      if (storeIds.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/outreach/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stores: storeIds }),
        });

        if (!res.ok) throw new Error("Failed to analyze");

        const json = await res.json();
        setIssues(json.issues);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [storesParam]);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Analyze Products</h1>

      {storeIds.length === 0 ? (
        <p className="text-gray-600">
          Please select stores from the Discover page to analyze.
        </p>
      ) : loading ? (
        <p>Loading analysis…</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : issues ? (
        <div className="space-y-6">
          {Object.entries(issues).map(([store, products]) => (
            <div key={store} className="border rounded p-4 bg-white">
              <h2 className="text-xl font-semibold mb-2">{store}</h2>

              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-2 py-1 text-left">Product</th>
                    <th className="px-2 py-1 text-left">Issues</th>
                    <th className="px-2 py-1 text-left">Suggestions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td className="px-2 py-1">
                        <div className="font-medium">{p.title}</div>
                        <div className="text-xs text-gray-500">
                          Price: {p.price}
                        </div>
                      </td>

                      <td className="px-2 py-1">
                        <ul className="list-disc list-inside text-xs text-gray-700">
                          {p.issues.map((i, idx) => (
                            <li key={idx}>{i}</li>
                          ))}
                        </ul>
                      </td>

                      <td className="px-2 py-1">
                        <ul className="list-disc list-inside text-xs text-gray-700">
                          {p.suggestions.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <p>No analysis data available.</p>
      )}
    </main>
  );
}
