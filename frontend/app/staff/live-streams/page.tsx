"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Radio,
  Eye,
  Shield,
  MessageSquare,
  AlertTriangle,
  ExternalLink,
  VolumeX,
  UserX,
  CheckCircle,
  Sliders,
} from "lucide-react";

export default function StaffLiveStreamsPage() {
  const [toast, setToast] = useState<string | null>(null);

  const activeStreams = [
    {
      id: 1,
      title: "🔴 Sacred Newar Lost-Wax Bronze & Thangka Live Auction",
      host: "Umesh Shakya (Master Creator)",
      viewers: 1420,
      currentLot: "Lot #1: Shakyamuni Buddha Bronze (Rs. 145,000)",
      chatHealth: "Clean (0 flagged comments)",
      status: "live",
    },
    {
      id: 2,
      title: "🔴 Bhaktapur Master Woodcarver's Live Atelier",
      host: "Bikash Shrestha (Master Artisan)",
      viewers: 840,
      currentLot: "Lot #1: Peacock Window (Rs. 42,000)",
      chatHealth: "1 user timed out for spam",
      status: "live",
    },
  ];

  const handleMuteChat = (streamId: number) => {
    setToast(`Chat slow-mode toggled to 10s for Stream #${streamId}. Action recorded in audit log.`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleTimeoutTrolls = (streamId: number) => {
    setToast(`Spam filters automatically purged 2 repetitive messages. User paddle restricted.`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Radio className="w-6 h-6 text-red-600 animate-pulse" />
            <span>Live Stream Supervisory Console</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor active live rooms, review flagged audience comments in real-time, and enforce anti-spam rules.
          </p>
        </div>
      </div>

      {toast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeStreams.map((stream) => (
          <div
            key={stream.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black uppercase flex items-center gap-1.5 border border-red-200">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                SUPERVISION ACTIVE
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <Eye className="w-3.5 h-3.5 text-red-500" />
                <span>{stream.viewers.toLocaleString()} Watchers</span>
              </div>
            </div>

            <div>
              <h2 className="text-base font-black text-slate-900">{stream.title}</h2>
              <div className="text-xs text-slate-500 mt-1">Host: {stream.host}</div>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/60 text-xs">
              <div className="text-[10px] uppercase font-bold text-amber-800">Active Bidding Floor</div>
              <div className="font-bold text-slate-900">{stream.currentLot}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex items-center justify-between">
              <span className="text-slate-600">Audience Chat Status:</span>
              <span className="font-bold text-slate-800">{stream.chatHealth}</span>
            </div>

            {/* Moderator Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleMuteChat(stream.id)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Slow Chat (10s)</span>
              </button>
              <button
                onClick={() => handleTimeoutTrolls(stream.id)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <UserX className="w-3.5 h-3.5 text-red-600" />
                <span>Purge Troll Messages</span>
              </button>
              <Link
                href="/creator/live-studio"
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>OBS Studio</span>
              </Link>
              <Link
                href={`/live/${stream.id}`}
                className="ml-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>Enter Room HUD</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
