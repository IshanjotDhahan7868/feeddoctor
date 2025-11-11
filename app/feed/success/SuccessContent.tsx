"use client";

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface FulfillResponse {
  downloadUrls: { name: string; url: string }[];
  message?: string;
}

export default function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<FulfillResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fulfill() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/feed/fulfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, sessionId }),
      });

      if (!res.ok) throw new Error('Fulfillment failed');

      const json = await res.json();
      setResult(json);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (!sessionId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Missing session</h1>
        <p className="text-gray-600">The session_id parameter is required.</p>
      </div>
    );
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Thank you for your purchase!</h1>

      {!submitted ? (
        <>
          <p className="mb-4 text-gray-600">
            Please enter your email so we can deliver your Fix Pack.
          </p>

          <input
            type="email"
            className="w-full p-2 border rounded mb-4"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            onClick={fulfill}
            disabled={!email || loading}
            className="bg-secondary text-white px-4 py-2 rounded hover:bg-green-600 transition disabled:opacity-50"
          >
            {loading ? 'Generating…' : 'Generate Deliverables'}
          </button>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </>
      ) : (
        <div className="space-y-4">
          <p>Your deliverables are ready. Download below:</p>

          {result?.downloadUrls.map(({ name, url }) => (
            <a
              key={name}
              href={url}
              className="block underline text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              {name}
            </a>
          ))}

          {result?.message && <p className="text-gray-600 mt-4">{result.message}</p>}
        </div>
      )}
    </main>
  );
}
