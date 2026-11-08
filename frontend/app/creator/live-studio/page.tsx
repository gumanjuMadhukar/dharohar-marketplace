"use client";

import React from "react";
import Link from "next/link";
import { Radio, ExternalLink } from "lucide-react";
import LiveStudioEditor from "@/components/live/LiveStudioEditor";

export default function CreatorLiveStudioPage() {
  return (
    <div className="space-y-4 w-full">
      {/* Page Header - Dark Studio Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 text-red-300 text-[10px] font-black uppercase tracking-wider mb-1.5 border border-red-800">
            <Radio className="w-3 h-3 text-red-500 animate-pulse" />
            <span>Master Creator Live Broadcasting Suite</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>OBS Studio Live Broadcast & Auction Controller</span>
          </h1>
          <p className="text-xs text-stone-400 mt-0.5 max-w-3xl">
            Broadcast live directly from your device camera (webcam, phone, or USB capture rig), attach local system video files (.mp4), or share your screen. Control scenes, audio mixing, lower-thirds overlays, and auction lots in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Link
            href="/live/1"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Launch Audience Live Room</span>
          </Link>
        </div>
      </div>

      {/* Embedded Full In-Browser OBS Studio Editor */}
      <div className="w-full">
        <LiveStudioEditor
          roomId={1}
          roomTitle="Sacred Newar Lost-Wax Bronze & Thangka Live Auction"
          hostName="Umesh Shakya"
          hostRole="7th Gen Master Sculptor of Newar Lost-Wax Bronze Deities"
          defaultStreamKey="live_bronze_master_key_99"
          portalType="creator"
        />
      </div>
    </div>
  );
}
