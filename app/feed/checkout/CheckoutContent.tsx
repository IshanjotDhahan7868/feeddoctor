"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function CheckoutContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    async function createSession() {
      try {
        const sku = params.get("sku") || "fixpack";

        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sku }),
        });

        if (!res.ok) {
          const errTxt = await res.text();
          throw new Error("Failed to create checkout session: " + errTxt);
        }

        const json = await res.json();

        if (json.url) {
          window.location.href = json.url;
        } else {
          throw new Error("Invalid response from checkout API");
        }

      } catch (err: any) {
        setError(err.message || "Something went wrong");
        setLoading(false);
      }
    }

    createSession();
  }, [router, params]);

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Checkout Error</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Redirecting to payment…</h1>
      <p className="text-gray-600">Please wait while we create your Stripe checkout session.</p>
    </div>
  );
}
