"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  // simple admin pass gate using local state
  const [authorized, setAuthorized] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // check if already authorized via sessionStorage
    if (typeof window !== 'undefined') {
      const ok = sessionStorage.getItem('feeddoctor_admin');
      if (ok) {
        setAuthorized(true);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pass = process.env.NEXT_PUBLIC_ADMIN_PASS || process.env.ADMIN_PASS;
    // For security reasons, we read only the NEXT_PUBLIC version
    if (!pass) {
      // If no password set, allow access
      setAuthorized(true);
      return;
    }
    if (input === pass) {
      sessionStorage.setItem('feeddoctor_admin', '1');
      setAuthorized(true);
    } else {
      setError('Invalid password');
    }
  };

  if (!authorized) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6 space-y-4">
          <h1 className="text-xl font-semibold">Admin Login</h1>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter admin password"
            className="w-full p-2 border rounded"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded hover:bg-blue-600 transition"
          >
            Enter
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r p-4 space-y-6">
        <h2 className="text-2xl font-bold">FeedDoctor</h2>
        <nav className="space-y-2">
          <SidebarLink href="/dashboard" label="Dashboard" />
          <SidebarLink href="/feed/scan" label="FeedDoctor" />
          <SidebarLink href="/outreach/discover" label="Outreach" />
          <SidebarLink href="/inbox" label="Inbox" />
          <SidebarLink href="/pipeline" label="Pipeline" />
          <SidebarLink href="/export" label="Export" />
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard title="Scans Run" value="0" />
          <StatCard title="Fix Packs Delivered" value="0" />
          <StatCard title="Leads Discovered" value="0" />
          <StatCard title="Drafts Generated" value="0" />
          <StatCard title="Replies Suggested" value="0" />
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="block px-3 py-2 rounded hover:bg-gray-100 text-gray-700">
      {label}
    </Link>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded shadow p-4 text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}