"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { AlertTriangle, CheckCircle, Scale, Shield, User, MessageSquare } from "lucide-react";

export default function AdminDisputesPage() {
  const [disputesList, setDisputesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolveId, setResolveId] = useState<number | null>(null);
  const [resolution, setResolution] = useState("");
  const [statusAction, setStatusAction] = useState<"resolved" | "rejected">("resolved");

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/disputes");
      if (res.data?.data) {
        setDisputesList(res.data.data.data || res.data.data);
      }
    } catch (err: any) {
      console.warn("Failed to load disputes:", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveId) return;
    try {
      const res = await api.post(`/admin/disputes/${resolveId}/resolve`, {
        resolution,
        status: statusAction,
      });
      if (res.data?.success) {
        setDisputesList(
          disputesList.map((d) =>
            d.id === resolveId ? { ...d, status: statusAction, resolution } : d
          )
        );
        setResolveId(null);
        setResolution("");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Overview Notice */}
      <div className="bg-gradient-to-r from-purple-950/80 to-slate-900 border border-purple-900/60 text-white p-5 sm:p-6 rounded-2xl shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-400" />
          <h3 className="font-black text-sm tracking-tight text-white">Dharohar Consumer & Merchant Arbitration Tribunal</h3>
        </div>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          Mediating order quality issues, shipping transit delays, authenticity disputes, and escrow release. All resolutions are legally binding across buyer and seller accounts.
        </p>
      </div>

      {disputesList.length === 0 ? (
        <div className="bg-slate-900 rounded-2xl p-12 text-center border border-slate-800 space-y-2 shadow-xl">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
          <div className="font-bold text-white text-sm">Dispute Queue Clean</div>
          <p className="text-xs text-slate-500">No active customer or artisan disputes requiring platform mediation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputesList.map((d) => (
            <div key={d.id} className="bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-purple-400 font-bold">Claim #{d.id}</span>
                  <span className="font-black text-white text-sm">{d.reason}</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    d.status === "resolved"
                      ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                      : d.status === "rejected"
                      ? "bg-slate-950 text-slate-400 border-slate-800"
                      : "bg-amber-950/80 text-amber-300 border-amber-800"
                  }`}
                >
                  {d.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl">{d.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
                <div>Raised By: <strong className="text-white">{d.raised_by?.name || "Customer"}</strong> ({d.raised_by?.email})</div>
                <div>Against Merchant: <strong className="text-white">{d.against_user?.name || "Artisan"}</strong></div>
              </div>

              {d.resolution && (
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-emerald-900/60 text-xs text-emerald-300 space-y-1">
                  <div className="font-black flex items-center gap-1.5 text-emerald-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Official Mediator Ruling:</span>
                  </div>
                  <div className="text-slate-300">{d.resolution}</div>
                </div>
              )}

              {d.status === "open" && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setResolveId(d.id);
                      setStatusAction("resolved");
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition"
                  >
                    Enter Arbitration Settlement
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolve Modal */}
      {resolveId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleResolve} className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-black text-sm text-white">Arbitration Settlement Terms</h3>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Mediation Verdict</label>
              <select
                value={statusAction}
                onChange={(e) => setStatusAction(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
              >
                <option value="resolved" className="bg-slate-900 text-white">Accept Claim & Execute Settlement / Refund</option>
                <option value="rejected" className="bg-slate-900 text-white">Dismiss Claim (Found in Favor of Merchant)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Formal Legal Ruling Notes</label>
              <textarea
                rows={4}
                required
                placeholder="State escrow release, replacement item shipment, or partial credit agreement..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResolveId(null)}
                className="px-4 py-2 border border-slate-800 bg-slate-950 text-slate-400 hover:text-white text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition">
                Issue Settlement Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
