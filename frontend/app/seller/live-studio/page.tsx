"use client";

import React from "react";
import Link from "next/link";
import { Radio, ExternalLink } from "lucide-react";
import LiveStudioEditor from "@/components/live/LiveStudioEditor";

export default function SellerLiveStudioPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black uppercase tracking-wider mb-2 border border-amber-200">
            <Radio className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
            <span>Artisan Live Broadcast & Selling Studio</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>In-Browser OBS Studio & Live Auction Console</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Stream directly using your device webcam, external USB capture card, or phone camera. Control scenes, lower thirds, multi-channel audio, and lot hammer decisions right from your browser.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/live/2"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Launch Live Selling Room</span>
          </Link>
        </div>
      </div>

      {/* Embedded Full In-Browser OBS Studio Editor for Sellers */}
      <LiveStudioEditor
        roomId={2}
        roomTitle="Bhaktapur Master Woodcarver's Live Atelier & Peacock Window Auction"
        hostName="Bikash Shrestha"
        hostRole="Master Wood Sculptor & Traditional Newar Carpenter"
        defaultStreamKey="live_wood_master_key_88"
        portalType="seller"
      />
    </div>
  );
}
