"use client";
import { useState } from 'react';

interface Lead {
  id: string;
  name: string;
}

const initialLeads: Record<string, Lead[]> = {
  NEW: [
    { id: 'lead1', name: 'Example Store 1' },
    { id: 'lead2', name: 'Example Store 2' },
  ],
  CONTACTED: [],
  INTERESTED: [],
  CLOSED: [],
};

const stages: { key: string; label: string }[] = [
  { key: 'NEW', label: 'New' },
  { key: 'CONTACTED', label: 'Contacted' },
  { key: 'INTERESTED', label: 'Interested' },
  { key: 'CLOSED', label: 'Closed' },
];

export default function PipelinePage() {
  const [board, setBoard] = useState<Record<string, Lead[]>>(initialLeads);
  const [dragged, setDragged] = useState<Lead | null>(null);

  const handleDragStart = (lead: Lead) => () => {
    setDragged(lead);
  };

  const handleDrop = (stageKey: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragged) return;
    setBoard((prev) => {
      // remove from previous column
      const newBoard: Record<string, Lead[]> = {};
      Object.entries(prev).forEach(([key, leads]) => {
        newBoard[key] = leads.filter((l) => l.id !== dragged.id);
      });
      // add to target
      newBoard[stageKey] = [...newBoard[stageKey], dragged];
      return newBoard;
    });
    setDragged(null);
  };

  const allowDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Pipeline</h1>
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
                >
                  {lead.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}