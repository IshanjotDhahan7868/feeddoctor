"use client";
import React, { useState } from "react";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resultUrl, setResultUrl] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/feed/scan", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      console.error(err);
      alert("Error fixing feed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center px-6 bg-white">
      {/* Hero Section */}
      <section className="py-24">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Fix Your Google Shopping Feed
        </h1>
        <p className="text-gray-600 text-lg max-w-xl mx-auto mb-8">
          Upload your product feed and get a clean, Google-approved version in
          24–48 hours. Instant fixes for GTINs, titles, images, and more.
        </p>

        <div className="flex flex-col items-center space-y-4">
          <input
            type="file"
            accept=".csv,.tsv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border border-gray-300 p-2 rounded-md w-64"
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition disabled:bg-gray-300"
          >
            {uploading ? "Fixing..." : "Upload Feed"}
          </button>
        </div>

        {resultUrl && (
          <div className="mt-6">
            <a
              href={resultUrl}
              download="fixed_feed.csv"
              className="text-blue-600 underline"
            >
              Download Fixed Feed
            </a>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 w-full">
        <h2 className="text-3xl font-bold mb-8">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              step: "1",
              title: "Upload Feed",
              desc: "Upload your CSV or link to your product data.",
            },
            {
              step: "2",
              title: "Automatic Fix",
              desc: "FeedDoctor analyzes and corrects titles, GTINs, and images.",
            },
            {
              step: "3",
              title: "Download Ready",
              desc: "Get a clean CSV ready for Google Merchant Center.",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="p-6 bg-white rounded-xl shadow-sm border"
            >
              <div className="text-2xl font-bold text-blue-600 mb-2">
                Step {s.step}
              </div>
              <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
              <p className="text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold mb-8">Pricing</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-6">
          {[
            { name: "Starter Fix", price: 299, desc: "Up to 25 SKUs" },
            { name: "Pro Fix", price: 499, desc: "Up to 100 SKUs + priority" },
            {
              name: "Enterprise Audit",
              price: 799,
              desc: "Full feed audit + resubmission",
            },
          ].map((p) => (
            <div key={p.name} className="border rounded-2xl p-8 bg-white shadow">
              <h3 className="text-xl font-semibold mb-2">{p.name}</h3>
              <p className="text-4xl font-bold mb-4">${p.price}</p>
              <p className="mb-6">{p.desc}</p>
              <a
                href="https://buy.stripe.com/test_..." // replace with live Stripe link
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
              >
                Buy Now
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white w-full">
        <h2 className="text-3xl font-bold mb-8">FAQ</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {[
            {
              q: "How fast will I get my fixed feed?",
              a: "Most orders are completed within 24 hours after payment.",
            },
            {
              q: "Do you support Shopify or WooCommerce feeds?",
              a: "Yes, any standard CSV/TSV export works.",
            },
            {
              q: "What if my feed still gets disapproved?",
              a: "We'll recheck and adjust it at no cost.",
            },
          ].map((f) => (
            <div key={f.q} className="border-b pb-4 text-left">
              <p className="font-semibold">{f.q}</p>
              <p className="text-gray-600 mt-1">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-gray-500 text-sm mt-12 pb-8">
        FeedDoctor © {new Date().getFullYear()}
      </footer>
    </main>
  );
}
