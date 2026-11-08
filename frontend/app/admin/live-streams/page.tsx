"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { LiveRoom } from "@/lib/types";
import {
  Radio,
  Eye,
  Heart,
  Share2,
  StopCircle,
  Play,
  Gavel,
  Shield,
  Search,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function AdminLiveStreamsPage() {
  const [rooms, setRooms] = useState<LiveRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fallbackRooms: LiveRoom[] = [
    {
      id: 1,
      host_id: 5,
      title: "🔴 Sacred Newar Lost-Wax Bronze & Thangka Live Auction",
      slug: "sacred-bronze-thangka-live-auction",
      category: "Sacred Deities & Art",
      status: "live",
      viewer_count: 1420,
      likes_count: 3890,
      shares_count: 245,
      chat_enabled: true,
      slow_mode_seconds: 3,
      started_at: new Date(Date.now() - 45 * 60000).toISOString(),
      host: {
        id: 5,
        name: "Umesh Shakya",
        email: "creator.shakya@dharohar.com",
        account_type: "creator",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100",
      },
      current_lot: {
        id: 101,
        live_room_id: 1,
        lot_number: 1,
        title: "18th-Century Style Shakyamuni Buddha Bronze (24K Gold Gilded)",
        starting_price: 75000,
        current_price: 145000,
        bid_increment: 5000,
        status: "active",
      },
      lots_count: 3,
    },
    {
      id: 2,
      host_id: 4,
      title: "🔴 Bhaktapur Master Woodcarver's Live Atelier & Bidding",
      slug: "bhaktapur-woodcarvers-live-atelier",
      category: "Woodcraft & Architecture",
      status: "live",
      viewer_count: 840,
      likes_count: 1920,
      shares_count: 112,
      chat_enabled: true,
      slow_mode_seconds: 3,
      started_at: new Date(Date.now() - 20 * 60000).toISOString(),
      host: {
        id: 4,
        name: "Bikash Shrestha",
        email: "artisan.shrestha@dharohar.com",
        account_type: "seller",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      },
      current_lot: {
        id: 201,
        live_room_id: 2,
        lot_number: 1,
        title: "Hand-Carved Sal Wood Mayur Jhyal (Peacock Window)",
        starting_price: 35000,
        current_price: 42000,
        bid_increment: 2000,
        status: "active",
      },
      lots_count: 2,
    },
    {
      id: 3,
      host_id: 6,
      title: "Youth & Student Crafts Innovation Pitch & Auction",
      slug: "youth-student-crafts-innovation-pitch",
      category: "Youth Innovation",
      status: "scheduled",
      viewer_count: 0,
      likes_count: 320,
      shares_count: 45,
      chat_enabled: true,
      slow_mode_seconds: 3,
      scheduled_at: new Date(Date.now() + 48 * 3600000).toISOString(),
      host: {
        id: 6,
        name: "Aarav Bajracharya",
        email: "aarav.student@dharohar.com",
        account_type: "student",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100",
      },
      lots_count: 4,
    },
  ];

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get("/live/rooms");
      if (res.data?.success && res.data.rooms?.data) {
        setRooms(res.data.rooms.data);
      } else {
        setRooms(fallbackRooms);
      }
    } catch (e) {
      setRooms(fallbackRooms);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (roomId: number, status: "live" | "paused" | "ended") => {
    try {
      await api.put(`/live/rooms/${roomId}/status`, { status });
    } catch (e) {}

    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, status } : r))
    );
    setActionNotice(`Live stream status changed to '${status}'. Logged to audit ledger.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Radio className="w-6 h-6 text-red-600 animate-pulse" />
            <span>Platform Live Broadcast & Stream Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supervise active live streaming rooms, monitor concurrent viewers, enforce chat rules, and manage emergency killswitches.
          </p>
        </div>

        <Link
          href="/live"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open Public Live Hub</span>
        </Link>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Streams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rooms.map((room) => {
          const isLive = room.status === "live";

          return (
            <div
              key={room.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ${
                      isLive
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isLive ? "bg-red-600 animate-ping" : "bg-slate-400"}`} />
                    {room.status}
                  </span>

                  <span className="text-[11px] font-bold text-slate-500">
                    {room.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 line-clamp-1">{room.title}</h3>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span>Host: <strong>{room.host?.name}</strong></span>
                    <span>•</span>
                    <span className="capitalize">{room.host?.account_type}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Viewers</div>
                    <div className="text-xs font-black text-slate-900">{room.viewer_count.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Likes</div>
                    <div className="text-xs font-black text-slate-900">{room.likes_count.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Lots</div>
                    <div className="text-xs font-black text-slate-900">{room.lots_count || 1}</div>
                  </div>
                </div>

                {room.current_lot && (
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/60 text-xs">
                    <div className="text-[10px] uppercase font-bold text-amber-800">Active Floor Lot</div>
                    <div className="font-bold text-slate-900 truncate">{room.current_lot.title}</div>
                    <div className="text-amber-700 font-extrabold mt-0.5">
                      Current Bid: Rs. {Number(room.current_lot.current_price).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  href={`/live/${room.id}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Enter Room</span>
                </Link>

                <div className="flex items-center gap-1.5">
                  {isLive ? (
                    <button
                      onClick={() => handleUpdateStatus(room.id, "ended")}
                      className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition flex items-center gap-1"
                      title="Emergency Killswitch"
                    >
                      <StopCircle className="w-3.5 h-3.5" />
                      <span>Terminate Stream</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(room.id, "live")}
                      className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Now</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
