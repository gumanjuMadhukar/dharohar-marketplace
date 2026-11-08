"use client";

import React from "react";
import Link from "next/link";
import { Radio, ExternalLink, Sparkles, ShieldCheck } from "lucide-react";
import LiveStudioEditor from "@/components/live/LiveStudioEditor";

export default function CreatorLiveStudioPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-black uppercase tracking-wider mb-2 border border-red-200">
            <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span>Master Creator Live Broadcasting Suite</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <span>OBS Studio Live Broadcast & Auction Controller</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Broadcast live directly from your device camera (webcam, phone, or USB capture rig) with zero external software, or connect external OBS Studio via RTMP. Control scenes, audio mixing, lower-thirds overlays, and auction lots in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/live/1"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Launch Audience Live Room</span>
          </Link>
        </div>
      </div>

      {/* Embedded Full In-Browser OBS Studio Editor */}
      <LiveStudioEditor
        roomId={1}
        roomTitle="Sacred Newar Lost-Wax Bronze & Thangka Live Auction"
        hostName="Umesh Shakya"
        hostRole="7th Gen Master Sculptor of Newar Lost-Wax Bronze Deities"
        defaultStreamKey="live_bronze_master_key_99"
        portalType="creator"
      />
    </div>
  );
}
