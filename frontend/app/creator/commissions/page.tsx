"use client";

import React, { useState } from "react";
import {
  FileCheck2,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export default function CreatorCommissionsPage() {
  const [toast, setToast] = useState<string | null>(null);

  const [commissions] = useState([
    {
      id: "COM-991",
      patron: "Dr. Jonathan Hayes (Collector, Geneva)",
      deity: "24-inch Standing White Tara (Gold Gilded)",
      budget: "Rs. 320,000",
      stage: "Lost-Wax Chasing & Fire Gilding (Stage 3/4)",
      depositStatus: "60% Escrow Released",
      deadline: "December 15, 2026",
    },
    {
      id: "COM-992",
      patron: "Monastery of Namobuddha",
      deity: "Sacred Vajrasattva Altar Deity with Inlaid Rubies",
      budget: "Rs. 480,000",
      stage: "Clay Mold Formulation (Stage 1/4)",
      depositStatus: "30% Initial Deposit in Escrow",
      deadline: "January 20, 2027",
    },
  ]);

  const handleUpdateStage = (id: string) => {
    setToast(`Updated milestone progress for ${id}. Patron notified & proof photos uploaded.`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-amber-400" />
            <span>Bespoke Collector Commissions Desk</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Manage custom commissioned bronze deities, Thangka paintings, milestone progress, and escrow release gates.
          </p>
        </div>
      </div>

      {toast && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {commissions.map((c) => (
          <div
            key={c.id}
            className="p-5 bg-stone-900 rounded-2xl border border-stone-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                  {c.id}
                </span>
                <span className="text-sm font-black text-white">{c.deity}</span>
              </div>
              <div className="text-xs text-stone-400">
                Patron: <strong className="text-stone-200">{c.patron}</strong>
              </div>
              <div className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Current Milestone: {c.stage}</span>
              </div>
              <div className="text-[11px] text-stone-500">
                Deadline: {c.deadline} • Deposit: <span className="text-emerald-400 font-semibold">{c.depositStatus}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end md:self-auto">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-stone-500">Total Budget</div>
                <div className="text-base font-black text-white">{c.budget}</div>
              </div>

              <button
                onClick={() => handleUpdateStage(c.id)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow transition"
              >
                Advance Milestone
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
