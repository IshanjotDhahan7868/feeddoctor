"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function LeadsPage() {
  const { data, mutate } = useSWR("/api/outreach/leads", fetcher);

  async function updateStage(id: string, stage: string) {
    await fetch(`/api/outreach/leads?id=${id}`, {
      method: "PUT",
      body: JSON.stringify({ stage }),
    });
    mutate();
  }

  if (!data) return <p className="text-white p-8">Loading...</p>;

  return (
    <main className="p-8 bg-black min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-purple-400">📊 Leads Dashboard</h1>
      <div className="grid gap-3">
        {data.leads.map((lead: any) => (
          <div key={lead.id} className="p-4 bg-gray-900 rounded-lg border border-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{lead.storeUrl}</p>
                <p className="text-sm text-gray-400">{lead.notes || "No notes"}</p>
              </div>
              <div className="flex gap-2">
                {["new", "contacted", "replied", "closed"].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStage(lead.id, s)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      lead.stage === s
                        ? "bg-purple-600"
                        : "bg-gray-800 hover:bg-gray-700"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
