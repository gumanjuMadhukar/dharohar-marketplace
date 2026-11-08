"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Palette,
  Radio,
  FileCheck2,
  Award,
  Sparkles,
  ExternalLink,
  Flame,
  CheckCircle2,
} from "lucide-react";

export default function CreatorDashboardPage() {
  const [metrics] = useState({
    activeStreamViewers: 1420,
    liveLeadingBid: "Rs. 145,000",
    openCommissions: 3,
    certifiedLots: 12,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              Master Artisan Atelier Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase flex items-center gap-1 border border-amber-300">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Verified Heritage Master
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Manage your live broadcast atelier, sacred iconography provenance, and collector commission orders.
          </p>
        </div>

        <Link
          href="/creator/live-studio"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow-lg transition self-start sm:self-auto"
        >
          <Radio className="w-4 h-4 animate-pulse" />
          <span>Go to Live Broadcast Studio</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-1">
          <div className="text-[10px] uppercase font-bold text-stone-400">Live Broadcaster Audience</div>
          <div className="text-2xl font-black text-red-600 flex items-center gap-2">
            <span>{metrics.activeStreamViewers.toLocaleString()}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
          </div>
          <div className="text-[11px] text-stone-500">Watching Patan Bronze Auction</div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-1">
          <div className="text-[10px] uppercase font-bold text-stone-400">Current High Bid on Floor</div>
          <div className="text-2xl font-black text-amber-600">{metrics.liveLeadingBid}</div>
          <div className="text-[11px] text-emerald-600 font-bold">Reserve Met ✅</div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-1">
          <div className="text-[10px] uppercase font-bold text-stone-400">Custom Commissions</div>
          <div className="text-2xl font-black text-stone-900">{metrics.openCommissions} In Progress</div>
          <div className="text-[11px] text-stone-500">Deity sculpting orders</div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-1">
          <div className="text-[10px] uppercase font-bold text-stone-400">Provenance Verified</div>
          <div className="text-2xl font-black text-emerald-700">{metrics.certifiedLots} Artworks</div>
          <div className="text-[11px] text-emerald-600 font-semibold">Archaeology Dept Certified</div>
        </div>
      </div>

      {/* Active Studio Live View Card */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-950 rounded-3xl p-6 text-white border border-stone-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-bold border border-red-500/30">
            <Radio className="w-3.5 h-3.5 animate-pulse text-red-500" />
            <span>Currently Live & Broadcasting</span>
          </div>
          <h2 className="text-lg font-black text-white">
            Sacred Newar Lost-Wax Bronze & Thangka Live Auction
          </h2>
          <p className="text-xs text-stone-400 leading-relaxed">
            Lot #1 Shakyamuni Buddha Bronze is currently active on the bidding floor with 1,420 collectors connected.
          </p>
        </div>

        <Link
          href="/live/1"
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-xl transition flex items-center gap-2 flex-shrink-0"
        >
          <span>Open Full Live Room & Paddle</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
