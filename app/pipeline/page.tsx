"use client";
import { useEffect, useState } from "react";

interface Lead {
  id: string;
  name: string;
  storeUrl: string;
}

type Stage = "NEW" | "CONTACTED" | "INTERESTED" | "CLOSED";

const emptyBoard: Record<Stage, Lead[]> = {
  NEW: [],
  CONTACTED: [],
  INTERESTED: [],
  CLOSED: [],
};

const stages: { key: Stage; label: string }[] = [
  { key: "NEW", label: "New" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "INTERESTED", label: "Interested" },
  { key: "CLOSED", label: "Closed" },
];

export default function PipelinePage() {
  const [board, setBoard] = useState<Record<Stage, Lead[]>>(emptyBoard);
  const [dragged, setDragged] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBoard() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/pipeline", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load pipeline");
        const json = await res.json();
        setBoard(json.board ?? emptyBoard);
      } catch (err: any) {
        setError(err.message ?? "Failed to load pipeline");
      } finally {
        setLoading(false);
      }
    }

    loadBoard();
  }, []);

  const handleDragStart = (lead: Lead) => () => {
    setDragged(lead);
  };

  const persistStage = async (storeUrl: string, stage: Stage) => {
    const res = await fetch("/api/pipeline", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeUrl, stage }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || "Failed to update stage");
    }
  };

  const handleDrop = (stageKey: Stage) => async (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragged) return;

    const previousBoard = board;

    setBoard((prev) => {
      const next = { ...prev } as Record<Stage, Lead[]>;
      (Object.keys(next) as Stage[]).forEach((key) => {
        next[key] = next[key].filter((l) => l.id !== dragged.id);
      });
      next[stageKey] = [...next[stageKey], dragged];
      return next;
    });

    setDragged(null);

    try {
      await persistStage(dragged.storeUrl, stageKey);
      setError(null);
    } catch (err: any) {
      setBoard(previousBoard);
      setError(err.message ?? "Failed to update stage");
    }
  };

  const allowDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-2">Pipeline</h1>
      <p className="text-sm text-gray-600 mb-6">Stages are now persisted to the database.</p>

      {loading && <p className="mb-4 text-gray-500">Loading pipeline…</p>}
      {error && <p className="mb-4 text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {stages.map(({ key, label }) => (
          <div
            key={key}
            onDragOver={allowDrop}
            onDrop={handleDrop(key)}
            className="bg-gray-50 border rounded p-3 min-h-[200px] flex flex-col"
          >
            <h2 className="text-xl font-semibold mb-2">{label}</h2>
            <div className="flex-1 space-y-2">
              {board[key].map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={handleDragStart(lead)}
                  className="bg-white p-2 rounded shadow cursor-grab hover:bg-gray-100"
                  title={lead.storeUrl}
                >
                  {lead.name}
                </div>
              ))}
              {!loading && board[key].length === 0 && (
                <p className="text-xs text-gray-400">No leads in this stage.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
