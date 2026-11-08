"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  MessageSquare,
  Search,
} from "lucide-react";

export default function StaffDisputesPage() {
  const [toast, setToast] = useState<string | null>(null);

  const [disputes, setDisputes] = useState([
    {
      id: 101,
      orderNumber: "DH-98214",
      buyer: "Kiran Gurung",
      seller: "Bhaktapur Woodcraft & Heritage",
      amount: "Rs. 45,000",
      reason: "Package transit delay past 7-day guarantee window",
      status: "open",
    },
    {
      id: 102,
      orderNumber: "DH-97812",
      buyer: "Anjali Shrestha",
      seller: "Himalayan Chyangra Pashmina",
      amount: "Rs. 18,500",
      reason: "Item arrived with slight color variation in weave dye",
      status: "open",
    },
  ]);

  const handleResolve = (id: number, resolution: string) => {
    setDisputes((prev) => prev.filter((d) => d.id !== id));
    setToast(`Dispute #${id} resolved: ${resolution}. Escrow ledger updated.`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
          <span>Customer & Artisan Dispute Mediation Desk</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Resolve order disputes, review shipping delivery proof, and arbitrate 7-day buyer protection escrow funds.
        </p>
      </div>

      {toast && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-md space-y-4">
        <h2 className="text-sm font-black text-white pb-3 border-b border-slate-800">
          Open Mediation Cases ({disputes.length})
        </h2>

        {disputes.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            🎉 All customer disputes resolved! Clean mediation queue.
          </div>
        ) : (
          <div className="space-y-3">
            {disputes.map((d) => (
              <div
                key={d.id}
                className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-lg border border-indigo-800">
                      {d.orderNumber}
                    </span>
                    <span className="text-xs font-bold text-white">Dispute #{d.id}</span>
                  </div>
                  <span className="text-sm font-black text-amber-400">Escrow Value: {d.amount}</span>
                </div>

                <div className="text-xs text-slate-300">
                  Claim: <strong className="text-white">&quot;{d.reason}&quot;</strong>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <span>Buyer: <strong className="text-slate-200">{d.buyer}</strong></span>
                  <span>•</span>
                  <span>Artisan: <strong className="text-slate-200">{d.seller}</strong></span>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-800">
                  <button
                    onClick={() => handleResolve(d.id, "50% partial goodwill voucher issued")}
                    className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                  >
                    Issue Partial Credit
                  </button>
                  <button
                    onClick={() => handleResolve(d.id, "Full refund processed back to buyer eSewa/Khalti")}
                    className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-bold transition"
                  >
                    Refund Buyer
                  </button>
                  <button
                    onClick={() => handleResolve(d.id, "Carrier verified delivery, escrow released to artisan")}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition ml-auto"
                  >
                    Release Escrow to Artisan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
