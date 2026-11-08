"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Radio,
  Camera,
  Gavel,
  Key,
  ExternalLink,
  CheckCircle,
  Copy,
} from "lucide-react";

export default function CreatorLiveStudioPage() {
  const [toast, setToast] = useState<string | null>(null);
  const [streamKey] = useState("live_bronze_master_key_99");
  const [rtmpUrl] = useState("rtmp://stream.dharohar.com/live");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setToast(`${label} copied to clipboard! Ready to paste into OBS or Web Broadcaster.`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Radio className="w-6 h-6 text-red-600 animate-pulse" />
            <span>Master Artisan Live Broadcasting Studio</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Configure your video broadcast input (OBS or in-browser camera), queue auction lots, and control live gavel decisions.
          </p>
        </div>

        <Link
          href="/live/1"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow transition self-start sm:self-auto"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Launch Fullscreen Auction Room</span>
        </Link>
      </div>

      {toast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Broadcasting Credentials */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-black text-stone-900 pb-2 border-b border-stone-100 flex items-center gap-2">
          <Camera className="w-4 h-4 text-amber-700" />
          <span>RTMP / OBS Live Stream Ingestion Credentials</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
            <div className="text-[10px] uppercase font-bold text-stone-400">RTMP Ingest URL</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-stone-900 truncate">{rtmpUrl}</span>
              <button
                onClick={() => copyToClipboard(rtmpUrl, "RTMP Server URL")}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
            <div className="text-[10px] uppercase font-bold text-stone-400">Private Stream Key</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-stone-900 truncate">••••••••••••••••••••</span>
              <button
                onClick={() => copyToClipboard(streamKey, "Private Stream Key")}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduled Lots Queue */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-black text-stone-900 pb-2 border-b border-stone-100 flex items-center gap-2">
          <Gavel className="w-4 h-4 text-amber-700" />
          <span>Bidding Queue for Tonight&apos;s Broadcast</span>
        </h2>

        <div className="space-y-3">
          {[
            {
              lotNumber: 1,
              title: "18th-Century Style Shakyamuni Buddha Bronze (24K Gold Gilded)",
              currentBid: "Rs. 145,000",
              status: "ON THE FLOOR NOW (Active)",
              statusColor: "bg-red-100 text-red-700 border-red-200",
            },
            {
              lotNumber: 2,
              title: "Mineral Pigment Chenrezig Mandalas on Cotton Canvas",
              currentBid: "Rs. 45,000 (Floor Open)",
              status: "Up Next",
              statusColor: "bg-amber-100 text-amber-800 border-amber-200",
            },
            {
              lotNumber: 3,
              title: "Hand-Forged 7-Metal Full Moon Singing Bowl",
              currentBid: "Rs. 28,000 (Starting)",
              status: "Queued",
              statusColor: "bg-stone-100 text-stone-700 border-stone-200",
            },
          ].map((lot) => (
            <div
              key={lot.lotNumber}
              className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-stone-900">Lot #{lot.lotNumber}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase border ${lot.statusColor}`}>
                    {lot.status}
                  </span>
                </div>
                <div className="text-xs text-stone-700 font-medium mt-1">{lot.title}</div>
                <div className="text-[11px] text-amber-700 font-bold">{lot.currentBid}</div>
              </div>

              <Link
                href="/live/1"
                className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition flex items-center gap-1.5 self-end sm:self-auto"
              >
                <Gavel className="w-3.5 h-3.5 text-amber-400" />
                <span>Hammer Control</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
