"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { LiveRoom } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import {
  Radio,
  Eye,
  Heart,
  Share2,
  Calendar,
  Gavel,
  Plus,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Video,
} from "lucide-react";

// Fallback initial rooms if backend is offline or empty
const fallbackRooms: LiveRoom[] = [
  {
    id: 1,
    host_id: 5,
    title: "🔴 Sacred Newar Lost-Wax Bronze & Thangka Live Auction",
    slug: "sacred-bronze-thangka-live-auction",
    description: "Exclusive live casting exhibition and live paddle auction of hand-chased sacred Vajrayana deities and gold-illuminated mandalas.",
    category: "Sacred Deities & Art",
    cover_image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200",
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
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
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
    description: "Watch Master Bikash carve intricate peacock windows in real-time, with exclusive bidding on finished heritage artifacts.",
    category: "Woodcraft & Architecture",
    cover_image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200",
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
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
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
    description: "High-school and university innovators pitch contemporary Lokta crafts, eco-friendly prototypes, and digital cultural arts.",
    category: "Youth Innovation",
    cover_image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200",
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
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200",
    },
    lots_count: 4,
  },
];

export default function LiveLobbyPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<LiveRoom[]>(fallbackRooms);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "live" | "scheduled">("all");
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New room state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Sacred Deities & Art");
  const [newDesc, setNewDesc] = useState("");
  const [newCover, setNewCover] = useState("https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200");
  const [startNow, setStartNow] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [filter, category]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter !== "all") params.status = filter;
      if (category !== "all") params.category = category;
      if (search) params.search = search;

      const res = await api.get("/live/rooms", { params });
      if (res.data?.success && res.data.rooms?.data && res.data.rooms.data.length > 0) {
        setRooms(res.data.rooms.data);
      } else {
        const filtered = fallbackRooms.filter((r) => {
          if (filter === "live" && r.status !== "live") return false;
          if (filter === "scheduled" && r.status !== "scheduled") return false;
          if (category !== "all" && r.category !== category) return false;
          if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
          return true;
        });
        setRooms(filtered.length > 0 ? filtered : fallbackRooms);
      }
    } catch (e) {
      const filtered = fallbackRooms.filter((r) => {
        if (filter === "live" && r.status !== "live") return false;
        if (filter === "scheduled" && r.status !== "scheduled") return false;
        if (category !== "all" && r.category !== category) return false;
        return true;
      });
      setRooms(filtered.length > 0 ? filtered : fallbackRooms);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post("/live/rooms", {
        title: newTitle,
        category: newCategory,
        description: newDesc,
        cover_image: newCover,
        start_now: startNow,
      });
      if (res.data?.success && res.data.room) {
        window.location.href = `/live/${res.data.room.id}`;
        return;
      }
    } catch (err) {
      console.warn("API offline, creating local simulated stream:", err);
    }

    // Fallback simulated room
    const simulatedId = Date.now();
    window.location.href = `/live/${simulatedId}?title=${encodeURIComponent(newTitle)}&cat=${encodeURIComponent(newCategory)}`;
  };

  const canHostStream = user && ["admin", "staff", "owner", "seller", "creator", "student"].includes(user.account_type);

  return (
    <div className="min-w-0 pb-16 bg-gradient-to-b from-stone-900 via-stone-950 to-black text-stone-100 min-h-screen">
      {/* Hero Banner */}
      <div className="relative border-b border-stone-800 bg-gradient-to-r from-red-950/40 via-stone-900 to-amber-950/40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-widest">
                <Radio className="w-3.5 h-3.5 animate-pulse text-red-500" />
                <span>Live Event Broadcasts</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Live Heritage Bidding & Atelier Streams
              </h1>
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
                Step inside master artisans&apos; studios in real-time. Experience lost-wax casting, woodcarving, and sacred painting live — and raise your digital paddle for one-of-a-kind heritage lots.
              </p>
            </div>

            {canHostStream && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-red-900/40 transition transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Start Live Broadcast</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-stone-800">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 bg-stone-900/80 p-1.5 rounded-2xl border border-stone-800 self-start">
            {[
              { id: "all", label: "All Broadcasts" },
              { id: "live", label: "🔴 Streaming Now" },
              { id: "scheduled", label: "Upcoming Events" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  filter === tab.id
                    ? "bg-red-600 text-white shadow"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Categories */}
          <div className="flex items-center gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-stone-900 border border-stone-800 text-stone-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="all">All Categories</option>
              <option value="Sacred Deities & Art">Sacred Deities & Art</option>
              <option value="Woodcraft & Architecture">Woodcraft & Architecture</option>
              <option value="Youth Innovation">Youth Innovation</option>
              <option value="Pashmina & Handloom">Pashmina & Handloom</option>
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Search live rooms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchRooms()}
                className="bg-stone-900 border border-stone-800 text-stone-200 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-red-500 w-48 sm:w-64"
              />
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-3" />
            </div>
          </div>
        </div>

        {/* Live Rooms Grid */}
        {rooms.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-500">
              <Radio className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-lg font-black text-white">No Broadcasts In This Filter</h3>
            <p className="text-xs text-stone-400 max-w-md mx-auto">
              Explore authentic Patan bronze casting, Bhaktapur woodcarving, and youth innovator streams.
            </p>
            <button
              onClick={() => {
                setFilter("all");
                setCategory("all");
                setSearch("");
                setRooms(fallbackRooms);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold transition shadow-lg"
            >
              Reset Filters & Show All Live Broadcasts
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {rooms.map((room) => {
              const isLive = room.status === "live";
              return (
                <Link
                  key={room.id}
                  href={`/live/${room.id}`}
                  className="group relative bg-stone-900/90 rounded-3xl overflow-hidden border border-stone-800 hover:border-red-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-950/50 flex flex-col"
                >
                  {/* Thumbnail & Video Banner */}
                  <div className="relative aspect-video overflow-hidden bg-stone-950">
                    <img
                      src={room.cover_image || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800"}
                      alt={room.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-black/60" />

                    {/* Live Status Pill */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      {isLive ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-wider shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          LIVE
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800/90 text-stone-300 text-[11px] font-bold border border-stone-700">
                          <Calendar className="w-3 h-3 text-amber-400" />
                          SCHEDULED
                        </span>
                      )}

                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-stone-300 text-[10px] font-semibold border border-white/10">
                        {room.category}
                      </span>
                    </div>

                    {/* Viewers & Likes */}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold">
                        <Eye className="w-3.5 h-3.5 text-red-400" />
                        <span>{room.viewer_count.toLocaleString()}</span>
                      </span>
                    </div>

                    {/* Current Active Lot Banner if Live */}
                    {isLive && room.current_lot && (
                      <div className="absolute bottom-3 left-3 right-3 bg-stone-900/90 backdrop-blur-md p-2.5 rounded-2xl border border-white/15 flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wide">
                            Active Lot #{room.current_lot.lot_number}
                          </span>
                          <div className="text-xs font-bold text-white truncate">
                            {room.current_lot.title}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-[10px] text-stone-400 uppercase font-semibold">Current Bid</div>
                          <div className="text-xs font-black text-amber-400">
                            Rs. {Number(room.current_lot.current_price).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-base font-black text-white group-hover:text-red-400 transition line-clamp-2">
                        {room.title}
                      </h3>
                      <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                        {room.description}
                      </p>
                    </div>

                    {/* Host Info & Action */}
                    <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={room.host?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"}
                          alt={room.host?.name || "Artisan"}
                          className="w-8 h-8 rounded-full object-cover border border-amber-500/50"
                        />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1">
                            <span>{room.host?.name}</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          </div>
                          <div className="text-[10px] text-stone-400 capitalize">
                            {room.host?.account_type === "creator" ? "Heritage Master" : room.host?.account_type}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-red-400 group-hover:translate-x-1 transition">
                        <span>Enter Room</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Broadcast Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 space-y-5 text-stone-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-black text-white">Create Live Streaming Room</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-stone-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Broadcast Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Woodcarver Peacock Window Live Auction"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="Sacred Deities & Art">Sacred Deities & Art</option>
                  <option value="Woodcraft & Architecture">Woodcraft & Architecture</option>
                  <option value="Pashmina & Handloom">Pashmina & Handloom</option>
                  <option value="Youth Innovation">Youth Innovation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Description & Story</label>
                <textarea
                  rows={3}
                  placeholder="Describe the craft exhibition and live bidding lots..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={newCover}
                  onChange={(e) => setNewCover(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="startNow"
                  checked={startNow}
                  onChange={(e) => setStartNow(e.target.checked)}
                  className="rounded bg-stone-950 border-stone-800 text-red-600 focus:ring-0"
                />
                <label htmlFor="startNow" className="text-xs text-stone-300 font-semibold cursor-pointer">
                  Go LIVE immediately upon creation
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-700 text-xs text-stone-300 hover:bg-stone-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition"
                >
                  {creating ? "Launching Stream..." : "Launch Live Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
