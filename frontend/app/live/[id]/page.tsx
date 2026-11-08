"use client";

import React, { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { LiveRoom, LiveLot, LiveMessage } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import {
  Radio,
  Eye,
  Heart,
  Share2,
  Gavel,
  ShieldCheck,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Clock,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Settings,
  ChevronRight,
  Pin,
  Trash2,
  Copy,
  ExternalLink,
  Camera,
} from "lucide-react";

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
}

export default function LiveRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.id;
  const { user } = useAuth();

  const [room, setRoom] = useState<LiveRoom | null>(null);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [activeLot, setActiveLot] = useState<LiveLot | null>(null);
  const [allLots, setAllLots] = useState<LiveLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const [activeCamera, setActiveCamera] = useState<1 | 2 | 3>(1);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAuctioneerModal, setShowAuctioneerModal] = useState(false);
  const [customBidAmount, setCustomBidAmount] = useState<string>("");
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);

  // Timer countdown for active lot
  const [secondsRemaining, setSecondsRemaining] = useState<number>(240);

  // Cross-Tab Broadcast Synchronization from Studio Editor
  const [studioLive, setStudioLive] = useState(false);
  const [studioSceneName, setStudioSceneName] = useState<string | null>(null);
  const [studioSoldNotice, setStudioSoldNotice] = useState<string | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Fallback room data
  const fallbackRoom: LiveRoom = {
    id: Number(roomId) || 1,
    host_id: 5,
    title: "🔴 Sacred Newar Lost-Wax Bronze & Thangka Live Auction",
    slug: "sacred-bronze-thangka-live-auction",
    description: "Exclusive live casting exhibition and live paddle auction of hand-chased sacred Vajrayana deities and gold-illuminated mandalas.",
    category: "Sacred Deities & Art",
    cover_image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200",
    stream_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    status: "live",
    viewer_count: 1420,
    likes_count: 3890,
    shares_count: 245,
    chat_enabled: true,
    slow_mode_seconds: 3,
    host: {
      id: 5,
      name: "Umesh Shakya",
      email: "creator.shakya@dharohar.com",
      account_type: "creator",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
      bio: "7th Generation Master Sculptor of Newar Lost-Wax Bronze Deities.",
    },
    current_lot: {
      id: 101,
      live_room_id: Number(roomId) || 1,
      lot_number: 1,
      title: "18th-Century Style Shakyamuni Buddha Bronze (24K Gold Gilded)",
      description: "Hand-chased in Patan using generational lost-wax casting with gold gilding and Department of Archaeology certification.",
      image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      starting_price: 75000,
      reserve_price: 120000,
      current_price: 145000,
      bid_increment: 5000,
      status: "active",
      highest_bidder: {
        id: 7,
        name: "Pradeep Thapa",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
      },
    },
    lots: [
      {
        id: 101,
        live_room_id: Number(roomId) || 1,
        lot_number: 1,
        title: "18th-Century Style Shakyamuni Buddha Bronze (24K Gold Gilded)",
        image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
        starting_price: 75000,
        current_price: 145000,
        bid_increment: 5000,
        status: "active",
      },
      {
        id: 102,
        live_room_id: Number(roomId) || 1,
        lot_number: 2,
        title: "Mineral Pigment Chenrezig Mandalas on Cotton Canvas",
        image_url: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=800",
        starting_price: 45000,
        current_price: 45000,
        bid_increment: 2500,
        status: "pending",
      },
      {
        id: 103,
        live_room_id: Number(roomId) || 1,
        lot_number: 3,
        title: "Hand-Forged 7-Metal Full Moon Singing Bowl",
        image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800",
        starting_price: 28000,
        current_price: 28000,
        bid_increment: 1500,
        status: "pending",
      },
    ],
  };

  const initialMessages: LiveMessage[] = [
    {
      id: 1,
      live_room_id: Number(roomId) || 1,
      user_name: "Dharohar Live Auctioneer",
      user_role: "admin",
      badge: "Auctioneer",
      message: "🔔 Welcome collectors and patrons to tonight's live heritage auction! All bids are binding NPR.",
      is_pinned: true,
      is_system: true,
      created_at: "Just now",
    },
    {
      id: 2,
      live_room_id: Number(roomId) || 1,
      user_name: "Sunita Sharma",
      user_role: "staff",
      badge: "Moderator",
      message: "Please keep all comments respectful. Anti-sniping auto-extension is ACTIVE (+2 min on bids placed <60s).",
      is_pinned: false,
      created_at: "2m ago",
    },
    {
      id: 3,
      live_room_id: Number(roomId) || 1,
      user_name: "Umesh Shakya",
      user_role: "creator",
      badge: "Master Artisan & Host",
      message: "Namaste everyone! I am demonstrating the face chasing of the Buddha right now on Camera 2.",
      is_pinned: false,
      created_at: "1m ago",
    },
    {
      id: 4,
      live_room_id: Number(roomId) || 1,
      user_name: "Pradeep Thapa",
      user_role: "customer",
      badge: "High Bidder",
      message: "Bid placed: Rs. 145,000. Exceptional fire gilding technique!",
      is_pinned: false,
      created_at: "30s ago",
    },
  ];

  useEffect(() => {
    fetchRoomDetails();
  }, [roomId]);

  // Lot countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Synchronize with In-Browser OBS Studio Editor
  useEffect(() => {
    try {
      const stored = localStorage.getItem("dharohar_active_broadcast_state");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.is_live) {
          setStudioLive(true);
          if (parsed.scene_name) setStudioSceneName(parsed.scene_name);
        }
      }
    } catch {}

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("dharohar_live_broadcast");
        broadcastChannelRef.current = bc;
        bc.onmessage = (event) => {
          if (event.data?.type === "BROADCAST_STATE_UPDATE") {
            const payload = event.data.payload;
            if (payload.is_live !== undefined) setStudioLive(payload.is_live);
            if (payload.scene_name) setStudioSceneName(payload.scene_name);
            if (payload.active_lot) {
              setActiveLot((prev) => ({
                ...prev,
                ...payload.active_lot,
              }));
            }
            if (payload.seconds_remaining !== undefined) {
              setSecondsRemaining(payload.seconds_remaining);
            }
            if (payload.event === "LOT_HAMMER_DOWN") {
              const soldLot = payload.sold_lot;
              const soldPrice = payload.sold_price;
              setStudioSoldNotice(`SOLD! Lot #${soldLot?.lot_number || 1} knocked down for NPR ${(soldPrice || 0).toLocaleString()}!`);
              setTimeout(() => setStudioSoldNotice(null), 7000);
            }
          }
        };
      } catch {}
    }

    return () => {
      broadcastChannelRef.current?.close();
    };
  }, []);

  const fetchRoomDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/live/rooms/${roomId}`);
      if (res.data?.success && res.data.room) {
        setRoom(res.data.room);
        setActiveLot(res.data.room.current_lot || res.data.room.lots?.[0] || null);
        setAllLots(res.data.room.lots || []);
        if (res.data.messages && res.data.messages.length > 0) {
          setMessages(res.data.messages);
        } else {
          setMessages(initialMessages);
        }
      } else {
        useFallback();
      }
    } catch (e) {
      useFallback();
    } finally {
      setLoading(false);
    }
  };

  const useFallback = () => {
    setRoom(fallbackRoom);
    setActiveLot(fallbackRoom.current_lot || fallbackRoom.lots![0]);
    setAllLots(fallbackRoom.lots || []);
    setMessages(initialMessages);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: LiveMessage = {
      id: Date.now(),
      live_room_id: Number(roomId) || 1,
      user_name: user?.name || "Guest Collector",
      user_role: user?.account_type || "customer",
      badge: user?.account_type === "admin"
        ? "Platform Admin"
        : user?.account_type === "staff"
        ? "Moderator"
        : user?.account_type === "creator"
        ? "Heritage Creator"
        : user?.account_type === "seller"
        ? "Master Artisan"
        : user?.account_type === "student"
        ? "Student Creator"
        : "Bidder",
      message: inputMessage.trim(),
      created_at: "Just now",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");

    try {
      await api.post(`/live/rooms/${roomId}/message`, { message: newMsg.message });
    } catch (e) {
      // Handled locally
    }
  };

  const handlePlaceBid = async (amount: number) => {
    setBidError(null);
    setBidSuccess(null);

    if (!activeLot) return;

    if (!user) {
      setBidError("Please sign in or select a demo role to place a live bid.");
      return;
    }

    const minAllowed = Number(activeLot.current_price) + Number(activeLot.bid_increment);
    if (amount < minAllowed) {
      setBidError(`Minimum allowed bid is Rs. ${minAllowed.toLocaleString()}`);
      return;
    }

    try {
      const res = await api.post(`/live/rooms/${roomId}/bid`, { amount });
      if (res.data?.success) {
        setBidSuccess(`🎉 Leading Bid Placed: Rs. ${amount.toLocaleString()}`);
        setActiveLot(res.data.lot);
      }
    } catch (err: any) {
      // Local simulated bid update
      const updatedLot: LiveLot = {
        ...activeLot,
        current_price: amount,
        highest_bidder: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
        },
      };
      setActiveLot(updatedLot);
      setBidSuccess(`🎉 Leading Bid Placed: Rs. ${amount.toLocaleString()}!`);

      // Add to chat announcement
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          live_room_id: Number(roomId) || 1,
          user_name: user.name,
          user_role: user.account_type,
          badge: "High Bidder",
          message: `⚡ Placed new leading bid of Rs. ${amount.toLocaleString()}!`,
          created_at: "Just now",
        },
      ]);

      // Anti-sniping reset
      if (secondsRemaining < 60) {
        setSecondsRemaining(180);
      }
    }

    // Broadcast user bid to OBS Studio Console in real time
    try {
      broadcastChannelRef.current?.postMessage({
        type: "USER_BID",
        amount,
        bidderName: user.name || "Guest Collector",
      });
    } catch {}

    // Trigger celebration reaction
    triggerFloatingReaction("🏆");
  };

  const triggerFloatingReaction = (emoji: string) => {
    const id = Date.now() + Math.random();
    const x = 50 + (Math.random() * 40 - 20); // Center with jitter
    setFloatingReactions((prev) => [...prev, { id, emoji, x }]);

    // Increment like count in state
    if (room) {
      setRoom({ ...room, likes_count: (room.likes_count || 0) + 1 });
    }

    api.post(`/live/rooms/${roomId}/like`).catch(() => {});

    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2000);
  };

  // Auctioneer Controls
  const handleHammerDown = async () => {
    if (!activeLot) return;
    try {
      await api.post(`/live/rooms/${roomId}/lots/${activeLot.id}/hammer`);
    } catch (e) {}

    const winner = activeLot.highest_bidder ? activeLot.highest_bidder.name : "Unsold";
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        live_room_id: Number(roomId) || 1,
        user_name: "Auctioneer Gavel",
        user_role: "admin",
        badge: "SOLD",
        message: `🔨 GAVEL DOWN! Lot #${activeLot.lot_number} SOLD to ${winner} for Rs. ${Number(activeLot.current_price).toLocaleString()}! 🎉`,
        is_pinned: true,
        is_system: true,
        created_at: "Just now",
      },
    ]);
    setActiveLot({ ...activeLot, status: "hammered" });
    setShowAuctioneerModal(false);
  };

  const handleNextLot = () => {
    if (!activeLot || allLots.length === 0) return;
    const currentIndex = allLots.findIndex((l) => l.id === activeLot.id);
    const nextLot = allLots[currentIndex + 1] || allLots[0];
    setActiveLot({ ...nextLot, status: "active" });
    setSecondsRemaining(240);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        live_room_id: Number(roomId) || 1,
        user_name: "Auctioneer Gavel",
        user_role: "admin",
        badge: "New Lot",
        message: `🔔 Now on the floor: Lot #${nextLot.lot_number} - '${nextLot.title}'! Floor open at Rs. ${Number(nextLot.starting_price).toLocaleString()}`,
        is_pinned: true,
        is_system: true,
        created_at: "Just now",
      },
    ]);
    setShowAuctioneerModal(false);
  };

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const canModerate = user && ["admin", "staff"].includes(user.account_type) || (user && room && user.id === room.host_id);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen flex flex-col font-sans">
      {/* Top Stream Bar */}
      <div className="bg-stone-900 border-b border-stone-800 px-4 py-3 flex items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/live"
            className="text-stone-400 hover:text-white text-xs font-semibold flex items-center gap-1 flex-shrink-0"
          >
            ← Back
          </Link>
          <div className="h-4 w-px bg-stone-700 hidden sm:block" />
          <div className="flex items-center gap-2 truncate">
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse flex-shrink-0">
              <Radio className="w-3 h-3" />
              LIVE
            </span>
            <h1 className="text-sm font-bold text-white truncate">
              {room?.title || "Dharohar Live Heritage Broadcast"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Live Viewers Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800 text-stone-200 text-xs font-bold border border-stone-700">
            <Eye className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>{(room?.viewer_count || 1420).toLocaleString()} Watching</span>
          </div>

          {/* Share Button */}
          <button
            onClick={() => setShowShareModal(true)}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition"
            title="Share Stream"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Open OBS Studio Editor Button (Hosts, Staff, Admins, Creators, Sellers) */}
          {user && ["creator", "seller", "admin", "staff"].includes(user.account_type) && (
            <Link
              href={user.account_type === "seller" ? "/seller/live-studio" : "/creator/live-studio"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 font-extrabold text-xs border border-stone-700 transition"
              title="Launch In-Browser OBS Broadcasting Studio"
            >
              <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span className="hidden sm:inline">Launch OBS Studio</span>
            </Link>
          )}

          {/* Auctioneer Gavel Console Toggle (Admins, Staff, Host) */}
          {canModerate && (
            <button
              onClick={() => setShowAuctioneerModal(!showAuctioneerModal)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-extrabold text-xs shadow-lg transition"
            >
              <Gavel className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Auctioneer Console</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 max-w-[1920px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-4 p-0 lg:p-4">
        
        {/* Left Column: Video Stage + Active Lot HUD (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {/* Video Player Container */}
          <div className="relative aspect-video bg-black rounded-none lg:rounded-3xl overflow-hidden border border-stone-800 shadow-2xl flex items-center justify-center group">
            {/* Real Video Fallback with Simulated Artisan Feed */}
            <video
              ref={videoRef}
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              autoPlay
              loop
              muted={muted}
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Over-the-video Camera Angle Selector */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/10">
                <Camera className="w-3.5 h-3.5 text-amber-400 ml-1.5 mr-1" />
                {[
                  { id: 1, label: "Studio Wide" },
                  { id: 2, label: "Close Chasing" },
                  { id: 3, label: "Lot Inspection" },
                ].map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => setActiveCamera(cam.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                      activeCamera === cam.id
                        ? "bg-red-600 text-white"
                        : "text-stone-400 hover:text-white"
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}
              </div>
            </div>

            {/* In-Browser Studio Broadcast Live Indicator */}
            {studioLive && (
              <div className="absolute top-14 left-4 z-20 flex items-center gap-1.5 bg-red-950/90 backdrop-blur-md px-3 py-1 rounded-xl border border-red-700/80 shadow-lg text-[11px] font-bold text-red-200 animate-pulse">
                <Radio className="w-3.5 h-3.5 text-red-500" />
                <span>STUDIO BROADCAST: {studioSceneName || "WebRTC Atelier Feed"}</span>
              </div>
            )}

            {/* In-Video Hammer Down Sold Overlay */}
            {studioSoldNotice && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-md p-6">
                <div className="bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-amber-500 rounded-3xl p-6 text-center max-w-md shadow-2xl space-y-3">
                  <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <Gavel className="w-8 h-8 text-amber-400 animate-bounce" />
                  </div>
                  <h3 className="text-xl font-black text-amber-400 tracking-tight">HAMMER DOWN — LOT SOLD!</h3>
                  <p className="text-xs text-stone-200 font-bold">{studioSoldNotice}</p>
                </div>
              </div>
            )}

            {/* Audio & Video Controls Overlay */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <button
                onClick={() => setMuted(!muted)}
                className="p-2 rounded-xl bg-black/70 backdrop-blur-md text-white hover:bg-black/90 transition border border-white/10"
                title={muted ? "Unmute Live Audio" : "Mute Live Audio"}
              >
                {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
              <button
                onClick={() => {
                  if (videoRef.current) {
                    if (document.fullscreenElement) {
                      document.exitFullscreen();
                    } else {
                      videoRef.current.requestFullscreen();
                    }
                  }
                }}
                className="p-2 rounded-xl bg-black/70 backdrop-blur-md text-white hover:bg-black/90 transition border border-white/10"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Floating Reactions Overlay Canvas */}
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
              {floatingReactions.map((r) => (
                <div
                  key={r.id}
                  style={{ left: `${r.x}%` }}
                  className="absolute bottom-6 text-3xl animate-bounce transition-all duration-1000 transform -translate-y-48 opacity-90"
                >
                  {r.emoji}
                </div>
              ))}
            </div>

            {/* Bottom In-Video Host Badge */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15">
              <img
                src={room?.host?.avatar || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100"}
                alt={room?.host?.name || "Host"}
                className="w-9 h-9 rounded-full object-cover border-2 border-amber-500"
              />
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{room?.host?.name}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-[10px] text-stone-300 font-medium">
                  {room?.host?.account_type === "creator" ? "Master Heritage Sculptor" : "Verified Artisan"}
                </div>
              </div>
            </div>
          </div>

          {/* Active Lot HUD & Bidding Pad */}
          {activeLot && (
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-5 shadow-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div className="flex items-center gap-4">
                  <img
                    src={activeLot.image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400"}
                    alt={activeLot.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-amber-500/40 shadow-md flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase">
                        Lot #{activeLot.lot_number} ON THE FLOOR
                      </span>
                      {activeLot.status === "hammered" ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase">
                          HAMMERED / SOLD
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Reserve Met
                        </span>
                      )}
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-white mt-1">
                      {activeLot.title}
                    </h2>
                    <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">
                      {activeLot.description}
                    </p>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="bg-stone-950 px-4 py-2.5 rounded-2xl border border-stone-800 flex items-center gap-3 self-end md:self-auto">
                  <Clock className={`w-4 h-4 ${secondsRemaining < 60 ? "text-red-500 animate-spin" : "text-amber-400"}`} />
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">Time Left</div>
                    <div className={`text-base font-black ${secondsRemaining < 60 ? "text-red-500" : "text-white"}`}>
                      {formatTimer(secondsRemaining)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Leading Bidder Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-950 p-4 rounded-2xl border border-stone-800/80">
                <div>
                  <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                    Current Highest Bid
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-0.5">
                    Rs. {Number(activeLot.current_price).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    Next Minimum Allowed: <strong className="text-stone-300">Rs. {(Number(activeLot.current_price) + Number(activeLot.bid_increment)).toLocaleString()}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-800">
                  {activeLot.highest_bidder ? (
                    <div className="flex items-center gap-2.5">
                      <img
                        src={activeLot.highest_bidder.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"}
                        alt={activeLot.highest_bidder.name}
                        className="w-10 h-10 rounded-full object-cover border border-emerald-500"
                      />
                      <div>
                        <div className="text-[10px] text-emerald-400 font-extrabold uppercase">
                          Leading Paddle Holder
                        </div>
                        <div className="text-xs font-bold text-white">
                          {activeLot.highest_bidder.name}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-stone-500 italic">No bids placed yet</span>
                  )}
                </div>
              </div>

              {/* Notifications */}
              {bidError && (
                <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-xs text-red-300 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{bidError}</span>
                </div>
              )}
              {bidSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{bidSuccess}</span>
                </div>
              )}

              {/* Real-Time Bidding Pad */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-300">Quick Paddle Bids:</span>
                  <span className="text-[10px] text-amber-500 font-semibold">⚡ Sub-50ms Atomic Execution</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    Number(activeLot.current_price) + Number(activeLot.bid_increment),
                    Number(activeLot.current_price) + Number(activeLot.bid_increment) + 5000,
                    Number(activeLot.current_price) + Number(activeLot.bid_increment) + 10000,
                    Number(activeLot.current_price) + Number(activeLot.bid_increment) + 25000,
                  ].map((amount, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePlaceBid(amount)}
                      className="py-3 px-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-md transition transform active:scale-95 text-center flex flex-col items-center justify-center"
                    >
                      <span>Bid Rs. {amount.toLocaleString()}</span>
                      <span className="text-[9px] text-amber-200 font-normal">
                        {idx === 0 ? "Next Minimum" : `+Rs. ${(amount - (Number(activeLot.current_price) + Number(activeLot.bid_increment))).toLocaleString()}`}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom Bid Input */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs text-stone-500 font-bold">Rs.</span>
                    <input
                      type="number"
                      placeholder="Enter custom bid amount..."
                      value={customBidAmount}
                      onChange={(e) => setCustomBidAmount(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (customBidAmount) {
                        handlePlaceBid(Number(customBidAmount));
                        setCustomBidAmount("");
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs border border-stone-700 transition"
                  >
                    Place Custom Bid
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lots Catalog / Queue */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center justify-between">
              <span>Auction Lot Catalog ({allLots.length} Total Lots)</span>
              <span className="text-[11px] text-stone-400 font-medium">Click to inspect provenance</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {allLots.map((lot) => (
                <div
                  key={lot.id}
                  onClick={() => setActiveLot(lot)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                    activeLot?.id === lot.id
                      ? "bg-stone-800 border-amber-500/80 shadow-lg"
                      : "bg-stone-950/60 border-stone-800 hover:border-stone-700"
                  }`}
                >
                  <img
                    src={lot.image_url || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200"}
                    alt={lot.title}
                    className="w-12 h-12 rounded-xl object-cover border border-stone-700"
                  />
                  <div className="min-w-0">
                    <div className="text-[10px] text-amber-400 font-bold">Lot #{lot.lot_number}</div>
                    <div className="text-xs font-bold text-white truncate">{lot.title}</div>
                    <div className="text-[11px] text-stone-400">Rs. {Number(lot.current_price).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Chat & Audience Engagement (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col h-[600px] lg:h-[calc(100vh-100px)] sticky top-20 bg-stone-900 border border-stone-800 rounded-none lg:rounded-3xl overflow-hidden shadow-2xl">
          {/* Chat Header */}
          <div className="px-4 py-3 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-200">
                Audience Chat & Activity
              </h3>
            </div>
            <span className="text-[10px] text-stone-500 font-semibold">Auto-Scroll ON</span>
          </div>

          {/* Chat Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((msg) => {
              const isPinned = msg.is_pinned;
              const isSystem = msg.is_system;

              return (
                <div
                  key={msg.id}
                  className={`p-2.5 rounded-2xl text-xs transition ${
                    isPinned
                      ? "bg-amber-950/40 border border-amber-500/50 text-amber-200"
                      : isSystem
                      ? "bg-red-950/30 border border-red-500/30 text-stone-200"
                      : "bg-stone-950/80 border border-stone-800/80 text-stone-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-white text-[11px]">{msg.user_name}</span>
                      {msg.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold uppercase ${
                            msg.badge === "Auctioneer" || msg.badge === "Platform Admin"
                              ? "bg-purple-600/30 text-purple-300 border border-purple-500/40"
                              : msg.badge === "Moderator"
                              ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40"
                              : msg.badge === "High Bidder"
                              ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                              : msg.badge === "Master Artisan & Host" || msg.badge === "SOLD"
                              ? "bg-amber-600/30 text-amber-300 border border-amber-500/40"
                              : "bg-stone-800 text-stone-300"
                          }`}
                        >
                          {msg.badge}
                        </span>
                      )}
                    </div>
                    {isPinned && <Pin className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                  </div>

                  <p className="text-xs leading-relaxed">{msg.message}</p>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Floating Reaction Bar */}
          <div className="px-4 py-2 bg-stone-950/60 border-t border-stone-800 flex items-center justify-between">
            <span className="text-[10px] text-stone-400 font-semibold">Taps send reactions:</span>
            <div className="flex items-center gap-1.5">
              {["❤️", "🙏", "👏", "🔥", "🏆"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => triggerFloatingReaction(emoji)}
                  className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 hover:scale-125 transition text-base flex items-center justify-center active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 bg-stone-950 border-t border-stone-800">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder={user ? "Say something or ask the artisan..." : "Sign in to chat..."}
                disabled={!user}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-full pl-4 pr-11 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="absolute right-1.5 p-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-sm w-full p-6 space-y-4 text-stone-100 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-black text-white">Share Live Room</h3>
              </div>
              <button onClick={() => setShowShareModal(false)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-stone-400">
              Invite patrons, art collectors, and friends to watch this master artisan broadcast live.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Watch ${room?.title} live on Dharohar! ${window.location.href}`)}`, "_blank");
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 font-bold text-xs text-white transition flex items-center justify-center gap-2"
              >
                Share on WhatsApp
              </button>
              <button
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Watch ${room?.title} live on Dharohar!`)}&url=${encodeURIComponent(window.location.href)}`, "_blank");
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-sky-700 hover:bg-sky-600 font-bold text-xs text-white transition flex items-center justify-center gap-2"
              >
                Share on X (Twitter)
              </button>
              <button
                onClick={handleCopyShareLink}
                className="w-full py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 font-bold text-xs text-stone-200 transition flex items-center justify-center gap-2 border border-stone-700"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? "Link Copied to Clipboard! ✅" : "Copy Direct Stream URL"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auctioneer & Admin Master Gavel Drawer */}
      {showAuctioneerModal && canModerate && (
        <div className="fixed bottom-4 right-4 z-50 bg-stone-900 border-2 border-amber-500 rounded-3xl p-5 w-80 sm:w-96 shadow-2xl space-y-4 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Gavel className="w-5 h-5 text-amber-400 animate-bounce" />
              <h3 className="text-sm font-black text-white">Auctioneer Master Console</h3>
            </div>
            <button onClick={() => setShowAuctioneerModal(false)} className="text-stone-400 hover:text-white text-xs">✕</button>
          </div>

          <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 text-xs space-y-1">
            <div className="text-[10px] text-amber-400 uppercase font-bold">Floor Item</div>
            <div className="font-bold text-white truncate">{activeLot?.title}</div>
            <div className="text-[11px] text-stone-400">
              Leading: <strong>{activeLot?.highest_bidder ? activeLot.highest_bidder.name : "None"}</strong> at Rs. {Number(activeLot?.current_price).toLocaleString()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleHammerDown}
              className="py-3 px-2 rounded-xl bg-red-600 hover:bg-red-500 font-black text-xs text-white shadow-lg transition flex items-center justify-center gap-1.5"
            >
              <Gavel className="w-4 h-4" />
              <span>Hammer SOLD!</span>
            </button>
            <button
              onClick={handleNextLot}
              className="py-3 px-2 rounded-xl bg-amber-600 hover:bg-amber-500 font-black text-xs text-white shadow-lg transition flex items-center justify-center gap-1.5"
            >
              <span>Next Lot →</span>
            </button>
          </div>

          <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
            <span>Authorized by RBAC</span>
            <span className="font-bold text-amber-400 capitalize">{user?.account_type}</span>
          </div>
        </div>
      )}
    </div>
  );
}
