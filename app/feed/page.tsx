"use client";
import { useState } from "react";

export default function FeedPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/feed/scan", { method: "POST", body: form });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    setDownloadUrl(url);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Feed Fixer</h1>
      <form onSubmit={handleUpload} className="space-y-4">
        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
        <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? "Processing..." : "Upload & Fix"}
        </button>
      </form>
      {downloadUrl && (
        <a href={downloadUrl} download="fixed_feed.csv" className="text-blue-500 underline block mt-4">
          Download fixed_feed.csv
        </a>
      )}
    </div>
  );
}
