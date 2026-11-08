"use client";

import React from "react";
import Link from "next/link";
import { Radio, ExternalLink } from "lucide-react";
import LiveStudioEditor from "@/components/live/LiveStudioEditor";

export default function SellerLiveStudioPage() {
  return (
    <div className="space-y-4 w-full">
      {/* Page Header - Dark Studio Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-1.5 border border-amber-800">
            <Radio className="w-3 h-3 text-amber-500 animate-pulse" />
            <span>Artisan Live Broadcast & Selling Studio</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>In-Browser OBS Studio & Live Auction Console</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-3xl">
            Stream directly using your device webcam, external USB capture card, or attach local system video files (.mp4). Control scenes, audio mixing, lower-thirds overlays, and auction lots in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Link
            href="/live/2"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Launch Live Selling Room</span>
          </Link>
        </div>
      </div>

      {/* Embedded Full In-Browser OBS Studio Editor for Sellers */}
      <div className="w-full">
        <LiveStudioEditor
          roomId={2}
          roomTitle="Bhaktapur Master Woodcarver's Live Atelier & Peacock Window Auction"
          hostName="Bikash Shrestha"
          hostRole="Master Wood Sculptor & Traditional Newar Carpenter"
          defaultStreamKey="live_wood_master_key_88"
          portalType="seller"
        />
      </div>
    </div>
  );
}
