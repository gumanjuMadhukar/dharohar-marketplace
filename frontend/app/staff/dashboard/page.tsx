"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Radio,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function StaffDashboardPage() {
  const [stats] = useState({
    active_streams: 2,
    pending_kyc: 5,
    open_disputes: 2,
    flagged_comments: 4,
    actions_today: 18,
  });

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Staff Operations & Moderation Desk
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time oversight over active live stream rooms, pending artisan/student KYC submissions, and buyer disputes.
        </p>
      </div>

      {/* KPI Cards - Dark Theme */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-md space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Live Streams Under Supervision</div>
          <div className="text-xl sm:text-2xl font-black text-red-500 flex items-center gap-2">
            <span>{stats.active_streams}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          </div>
          <div className="text-[11px] text-slate-400">2,260 Concurrent viewers</div>
        </div>

        <div className="p-4 sm:p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-md space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Pending KYC Documents</div>
          <div className="text-xl sm:text-2xl font-black text-amber-400">{stats.pending_kyc}</div>
          <div className="text-[11px] text-amber-400 font-semibold">Requires ID Review</div>
        </div>

        <div className="p-4 sm:p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-md space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Escrow Disputes</div>
          <div className="text-xl sm:text-2xl font-black text-indigo-400">{stats.open_disputes}</div>
          <div className="text-[11px] text-slate-400">Avg resolution 4.2 hrs</div>
        </div>

        <div className="p-4 sm:p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-md space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Moderation Actions Today</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">{stats.actions_today}</div>
          <div className="text-[11px] text-emerald-400 font-semibold">100% Policy Adherence</div>
        </div>
      </div>

      {/* Quick Action Queues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Streams Monitor */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              <h2 className="text-sm font-black text-white">Active Live Streams (In Progress)</h2>
            </div>
            <Link href="/staff/live-streams" className="text-xs font-bold text-indigo-400 hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 1,
                title: "🔴 Sacred Newar Lost-Wax Bronze & Thangka Live Auction",
                host: "Umesh Shakya",
                viewers: 1420,
                lot: "Lot #1: Shakyamuni Buddha Bronze (Rs. 145,000)",
              },
              {
                id: 2,
                title: "🔴 Bhaktapur Master Woodcarver's Live Atelier",
                host: "Bikash Shrestha",
                viewers: 840,
                lot: "Lot #1: Peacock Window (Rs. 42,000)",
              },
            ].map((stream) => (
              <div key={stream.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-white truncate max-w-[240px]">{stream.title}</div>
                  <span className="text-[10px] text-red-400 font-extrabold uppercase">● LIVE</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Host: <strong className="text-slate-300">{stream.host}</strong> • {stream.viewers.toLocaleString()} watching
                </div>
                <div className="text-[11px] text-amber-400 font-semibold">
                  {stream.lot}
                </div>
                <div className="pt-2 flex items-center justify-end">
                  <Link
                    href={`/live/${stream.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:underline"
                  >
                    <span>Supervise Room</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority KYC & Disputes Tasks */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-black text-white">Compliance & KYC Queue</h2>
            </div>
            <Link href="/staff/kyc" className="text-xs font-bold text-indigo-400 hover:underline">
              Review Queue →
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                name: "Aarav Bajracharya",
                type: "Student Creator (Age 17)",
                doc: "Student ID + Guardian Co-Sign",
                date: "25 mins ago",
              },
              {
                name: "Pashmina Weavers Guild",
                type: "Artisan Vendor",
                doc: "PAN Certificate & Citizenship Card",
                date: "1 hour ago",
              },
              {
                name: "Sneha Tamang",
                type: "Student Innovator (Age 16)",
                doc: "High School ID Card",
                date: "3 hours ago",
              },
            ].map((task, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{task.name}</div>
                  <div className="text-[11px] text-slate-400">{task.type} • {task.doc}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{task.date}</div>
                </div>
                <Link
                  href="/staff/kyc"
                  className="px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 text-xs font-bold transition"
                >
                  Inspect
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
