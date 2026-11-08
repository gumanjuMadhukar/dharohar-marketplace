"use client";

import React, { useState } from "react";
import {
  FileText,
  Shield,
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react";

export default function StaffLogsPage() {
  const [logs] = useState([
    {
      id: 201,
      action: "KYC_APPROVED",
      target: "Artisan Bikash Shrestha",
      actor: "Sunita Sharma (Staff)",
      ip: "103.10.29.11",
      time: "25 minutes ago",
      details: "Approved citizenship certificate & PAN tax registration.",
    },
    {
      id: 202,
      action: "STREAM_SLOW_MODE",
      target: "Stream #1: Sacred Bronze",
      actor: "Sunita Sharma (Staff)",
      ip: "103.10.29.11",
      time: "40 minutes ago",
      details: "Activated 10s chat interval due to high audience traffic.",
    },
    {
      id: 203,
      action: "DISPUTE_RESOLVED",
      target: "Dispute #99: Pashmina Shawl",
      actor: "Sunita Sharma (Staff)",
      ip: "103.10.29.11",
      time: "2 hours ago",
      details: "Released buyer protection escrow after courier confirmation.",
    },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600" />
          <span>Staff Operations Audit Log</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical record of moderation decisions, KYC approvals, and stream interventions taken by operations staff.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase text-slate-400">Recorded Staff Actions</h2>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Immutable Log
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {logs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/80 transition flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800 text-[11px] bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                    {log.action}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{log.target}</span>
                </div>
                <p className="text-xs text-slate-600">{log.details}</p>
                <div className="text-[10px] text-slate-400 font-mono">
                  Actor: {log.actor} • IP: {log.ip} • {log.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
