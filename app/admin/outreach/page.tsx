"use client";
import { useState } from "react";

export default function AdminOutreachPage() {
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const ADMIN_PASS = "shan123"; // Uses your ENV password in prod

  const appendLog = (msg: string) =>
    setLogs((prev) => [`${new Date().toLocaleTimeString()} — ${msg}`, ...prev]);

  const runEndpoint = async (endpoint: string, label: string) => {
    appendLog(`▶ Running ${label}...`);
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        appendLog(`⚠️ Non-JSON response: ${text}`);
        return;
      }

      appendLog(`✅ ${label} done`);
      appendLog(JSON.stringify(data, null, 2));
    } catch (err: any) {
      appendLog(`❌ ${label} failed: ${err.message}`);
    }
  };

  if (!auth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 max-w-sm w-full">
          <h1 className="text-2xl mb-4 font-semibold text-center">🔒 Admin Access</h1>
          <input
            type="password"
            className="w-full px-3 py-2 mb-3 rounded-md bg-gray-800 border border-gray-700 text-white"
            placeholder="Enter Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={() => {
              if (password === ADMIN_PASS) setAuth(true);
              else alert("Incorrect password!");
            }}
            className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-md font-medium"
          >
            Unlock
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6 text-purple-400">
        🧠 FeedDoctor Admin — Outreach Dashboard
      </h1>
      <p className="text-gray-400 mb-6">
        Use this panel to find stores, analyze feeds, and send outreach emails.
      </p>

      <div className="grid gap-6 md:grid-cols-3 mb-10">
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
          <h2 className="text-lg font-semibold mb-2 text-purple-300">Discover</h2>
          <p className="text-gray-400 mb-3">
            Find Shopify stores in a given niche (e.g. pets, cosmetics, apparel).
          </p>
          <button
            onClick={() => runEndpoint("/api/outreach/discover", "Run Discovery")}
            className="bg-purple-600 hover:bg-purple-700 w-full py-2 rounded-md"
          >
            Run Discovery
          </button>
        </div>

        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
          <h2 className="text-lg font-semibold mb-2 text-purple-300">Analyze</h2>
          <p className="text-gray-400 mb-3">
            Check each store for Google Merchant Center feed issues.
          </p>
          <button
            onClick={() => runEndpoint("/api/outreach/analyze", "Run Analysis")}
            className="bg-purple-600 hover:bg-purple-700 w-full py-2 rounded-md"
          >
            Run Analysis
          </button>
        </div>

        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
          <h2 className="text-lg font-semibold mb-2 text-purple-300">Outreach</h2>
          <p className="text-gray-400 mb-3">
            Generate and send personalized outreach messages.
          </p>
          <button
            onClick={() => runEndpoint("/api/outreach/drafts", "Generate Messages")}
            className="bg-purple-600 hover:bg-purple-700 w-full py-2 rounded-md"
          >
            Generate Messages
          </button>
        </div>
      </div>

      <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 max-h-[400px] overflow-y-auto font-mono text-sm whitespace-pre-wrap">
        {logs.length === 0 ? (
          <p className="text-gray-500 text-center">No logs yet. Run a task above.</p>
        ) : (
          logs.map((line, i) => <div key={i}>{line}</div>)
        )}
      </div>
    </main>
  );
}
