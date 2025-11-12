"use client";

import { useState } from "react";

/**
 * Feed scan page
 *
 * This page lets a user upload a product feed (CSV/TSV) and see an instant
 * fixed version. It also collects an email address so the user can
 * optionally purchase a full fix via Stripe. On clicking "Fix Now" a
 * checkout session is created and the user is redirected to Stripe.
 */
export default function FeedScanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/feed/scan", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setUploading(false);
    }
  }

  async function handleCheckout() {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: "fixpack", email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout failed to initialize.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong starting checkout.");
    }
  }

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Feed Fixer</h1>
      <p className="text-gray-600 mb-4">
        Upload your CSV/TSV feed to see a quick preview. Enter your email
        to purchase a full fix.
      </p>
      <div className="space-y-4 mb-6">
        <input
          type="file"
          accept=".csv,.tsv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full border p-2 rounded"
        />
        <button
          disabled={!file || uploading}
          onClick={handleUpload}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
        >
          {uploading ? "Processing…" : "Upload & Preview"}
        </button>
      </div>
      {resultUrl && (
        <div className="mb-6">
          <a
            href={resultUrl}
            download="fixed_preview.csv"
            className="text-blue-600 underline"
          >
            Download Preview
          </a>
        </div>
      )}
      <div className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full border p-2 rounded"
        />
        <button
          onClick={handleCheckout}
          disabled={!email}
          className="inline-block bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition w-full"
        >
          Fix Now ($299)
        </button>
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </main>
  );
}