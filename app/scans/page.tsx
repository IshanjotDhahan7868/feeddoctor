"use client";

import { useState } from "react";

interface OrderSummary {
  id: string;
  stripeSessionId: string | null;
  createdAt: string;
  status: string;
  deliverableUrl: string | null;
  amount: number | null;
}

/**
 * Displays a simple dashboard of past paid orders (scans) for a user. A
 * visitor enters their email and the app fetches any orders associated with
 * that email via the `/api/scans` endpoint. Results show the order date,
 * status and a download link if a deliverable is available.
 */
export default function ScansPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadOrders() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/scans?email=${encodeURIComponent(email)}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to load orders");
      }
      setOrders(json.orders || []);
    } catch (err: any) {
      setError(err.message || "Unknown error");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Past Scans</h1>
      <p className="text-gray-600 mb-4">
        Enter the email you used at checkout to see your past orders and
        download links.
      </p>
      <div className="flex gap-2 mb-6">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={loadOrders}
          disabled={!email || loading}
          className="px-4 py-2 rounded bg-black text-white"
        >
          {loading ? "Loading…" : "Load"}
        </button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <ul className="space-y-3">
        {orders.map((order) => (
          <li
            key={order.id}
            className="border rounded p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleString()} — {order.status}
              </p>
            </div>
            {order.deliverableUrl ? (
              <a
                className="underline text-blue-600"
                href={order.deliverableUrl}
                target="_blank"
              >
                Download
              </a>
            ) : (
              <span className="text-sm text-gray-600">Processing…</span>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}