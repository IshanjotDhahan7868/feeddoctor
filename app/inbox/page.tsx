"use client";
import { useState } from 'react';

interface ReplySuggestion {
  classification: string;
  replies: string[];
}

export default function InboxPage() {
  const [mode, setMode] = useState<'manual' | 'gmail'>('manual');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<ReplySuggestion | null>(null);

  const handleSubmit = async () => {
    if (!input.trim()) {
      setError('Please paste an email or message');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/inbox/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });
      if (!res.ok) throw new Error('Failed to get suggestions');
      const json = await res.json();
      setSuggestion(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">Inbox Assistant</h1>
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => setMode('manual')}
          className={`px-4 py-2 rounded ${mode === 'manual' ? 'bg-primary text-white' : 'bg-gray-200'}`}
        >
          Manual Mode
        </button>
        <button
          onClick={() => setMode('gmail')}
          className={`px-4 py-2 rounded ${mode === 'gmail' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          disabled
          title="Gmail mode not implemented in demo"
        >
          Gmail Mode
        </button>
      </div>
      {mode === 'manual' && (
        <div className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            className="w-full p-2 border rounded"
            placeholder="Paste inbound email or webform content here"
          ></textarea>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-secondary text-white px-4 py-2 rounded hover:bg-green-600 transition disabled:opacity-50"
          >
            {loading ? 'Analyzing…' : 'Suggest Replies'}
          </button>
          {error && <p className="text-red-500">{error}</p>}
          {suggestion && (
            <div className="mt-4 space-y-3">
              <p className="font-medium">Classification: {suggestion.classification}</p>
              <p className="font-medium">Suggested Replies:</p>
              <ul className="list-disc list-inside space-y-2">
                {suggestion.replies.map((reply, idx) => (
                  <li key={idx} className="bg-gray-50 p-3 rounded">
                    <p className="whitespace-pre-line">{reply}</p>
                    <div className="mt-2 flex gap-2 text-sm">
                      <button
                        onClick={() => navigator.clipboard.writeText(reply)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Copy
                      </button>
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=&su=&body=${encodeURIComponent(reply)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Open Gmail Draft
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {mode === 'gmail' && (
        <p className="text-gray-500 mt-4">Gmail integration requires OAuth and is not available in this demo.</p>
      )}
    </main>
  );
}