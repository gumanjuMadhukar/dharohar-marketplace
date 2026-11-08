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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-amber-700" />
            <span>Bespoke Collector Commissions Desk</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage custom commissioned bronze deities, Thangka paintings, milestone progress, and escrow release gates.
          </p>
        </div>
      </div>

      {toast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-black text-stone-900 pb-2 border-b border-stone-100">
          Active Bespoke Commissions ({commissions.length})
        </h2>

        <div className="space-y-4">
          {commissions.map((c) => (
            <div
              key={c.id}
              className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200">
                    {c.id}
                  </span>
                  <span className="text-sm font-black text-stone-900 ml-2">{c.deity}</span>
                </div>
                <div className="text-sm font-black text-emerald-800">{c.budget}</div>
              </div>

              <div className="text-xs text-stone-600">
                Patron: <strong className="text-stone-800">{c.patron}</strong>
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] uppercase font-bold text-stone-400">Current Milestone</div>
                  <div className="font-bold text-amber-700">{c.stage}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Escrow Security</div>
                  <div className="font-bold text-emerald-700">{c.depositStatus}</div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-stone-400">Deadline: {c.deadline}</span>
                <button
                  onClick={() => handleUpdateStage(c.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition"
                >
                  Update Milestone & Photos
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
