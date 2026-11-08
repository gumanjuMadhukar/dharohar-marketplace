"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Radio,
  Camera,
  Gavel,
  Plus,
  ExternalLink,
  CheckCircle,
  Copy,
  Users,
} from "lucide-react";

export default function SellerLiveStudioPage() {
  const [toast, setToast] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setToast(`${label} copied to clipboard.`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Radio className="w-6 h-6 text-red-600 animate-pulse" />
            <span>Artisan Live Broadcast & Selling Studio</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Broadcast your workshop in real-time to collectors worldwide, introduce handcrafted lots, and take live bids.
          </p>
        </div>

        <Link
          href="/live/2"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow transition self-start sm:self-auto"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Launch My Live Selling Room</span>
        </Link>
      </div>

      {toast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Broadcasting Ingestion */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Camera className="w-4 h-4 text-amber-700" />
          <span>Live Video Feed Configuration (OBS Studio or WebRTC)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Stream Ingest URL</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-900">rtmp://stream.dharohar.com/live</span>
              <button
                onClick={() => copyToClipboard("rtmp://stream.dharohar.com/live", "Ingest URL")}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Store Stream Key</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-900">••••••••••••••••••••</span>
              <button
                onClick={() => copyToClipboard("live_wood_key_88", "Stream Key")}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Lot Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Gavel className="w-4 h-4 text-amber-700" />
            <h2 className="text-sm font-black text-slate-900">Active Live Bidding Lots</h2>
          </div>
          <Link
            href="/live/2"
            className="text-xs font-bold text-red-600 hover:underline"
          >
            Enter Hammer Console →
          </Link>
        </div>

        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-extrabold uppercase animate-pulse">
              Lot #1 ON THE FLOOR
            </span>
            <div className="text-sm font-black text-slate-900 mt-1">
              Hand-Carved Sal Wood Mayur Jhyal (Peacock Window)
            </div>
            <div className="text-xs text-amber-800 font-bold mt-0.5">
              Current Bid: Rs. 42,000 (Paddle #14)
            </div>
          </div>

          <Link
            href="/live/2"
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow transition self-end sm:self-auto"
          >
            Gavel SOLD / Next
          </Link>
        </div>
      </div>
    </div>
  );
}
