"use client";

import React, { useEffect, useState, use } from "react";
import { Auction } from "@/lib/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Gavel, Clock, ShieldCheck, ArrowLeft, History, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const auctionId = resolvedParams.id;

  const { user } = useAuth();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [minNextBid, setMinNextBid] = useState<number>(0);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [isProxy, setIsProxy] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [timeLeft, setTimeLeft] = useState("");

  const fetchAuction = async () => {
    try {
      const res = await api.get(`/auctions/${auctionId}`);
      if (res.data?.auction) {
        setAuction(res.data.auction);
        const min = res.data.min_next_bid || (Number(res.data.auction.current_price) + Number(res.data.auction.bid_increment));
        setMinNextBid(min);
        setBidAmount(min.toString());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuction();
    // Poll updates every 4 seconds for live room sync
    const interval = setInterval(fetchAuction, 4000);
    return () => clearInterval(interval);
  }, [auctionId]);

  useEffect(() => {
    if (!auction?.ends_at) return;
    const calc = () => {
      const diff = new Date(auction.ends_at).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft("Ended");
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [auction?.ends_at]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const payload: any = { amount: Number(bidAmount) };
      if (isProxy && maxAmount) {
        payload.max_amount = Number(maxAmount);
      }

      const res = await api.post(`/auctions/${auctionId}/bid`, payload);

      if (res.data?.success) {
        setMessage({ text: "Your bid has been recorded successfully!", type: "success" });
        fetchAuction();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.amount?.[0] || "Failed to place bid.";
      setMessage({ text: msg, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !auction) {
    return <div className="max-w-7xl mx-auto p-12 text-center text-sm font-semibold">Loading Auction Room...</div>;
  }

  const primaryImage =
    auction.product?.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link
        href="/auctions"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-nepal-earth hover:text-nepal-crimson transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Auction Hall</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ── Left: Image & Provenance ─────────────────────────── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-nepal-parchment border border-nepal-gold/30 shadow-lg">
            <img src={primaryImage} alt={auction.title} className="w-full h-full object-cover" />

            <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              LIVE AUCTION ROOM
            </div>

            <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-white font-mono text-sm font-bold px-4 py-2 rounded-2xl flex items-center gap-2 shadow">
              <Clock className="w-4 h-4 text-nepal-gold" />
              <span>Time Left: {timeLeft}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-nepal-earth">
              Artifact Provenance & Description
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {auction.description}
            </p>
          </div>
        </div>

        {/* ── Right: Live Bid Control & Bids Ledger ─────────────── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-nepal-gold/40 shadow-xl space-y-6">
            <div>
              <span className="text-xs font-bold text-nepal-terracotta uppercase tracking-wider">
                {auction.store?.name || "Artisan Store"}
              </span>
              <h1 className="text-2xl font-black text-nepal-earth mt-1 leading-snug">
                {auction.title}
              </h1>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-nepal-parchment to-amber-50 border border-nepal-gold/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 font-medium">Leading Highest Bid</span>
                <div className="text-2xl sm:text-3xl font-black text-nepal-crimson">
                  NPR {Number(auction.current_price).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 font-medium">Min. Next Bid</span>
                <div className="text-base font-bold text-nepal-earth">
                  NPR {Number(minNextBid).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Message alert */}
            {message && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* Bid Form */}
            <form onSubmit={handlePlaceBid} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-nepal-earth mb-1.5">
                  Your Bid Amount (NPR)
                </label>
                <input
                  type="number"
                  step="50"
                  min={minNextBid}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 font-bold text-base focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
                  required
                />
              </div>

              {/* Proxy Bid Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-nepal-earth cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={isProxy}
                    onChange={(e) => setIsProxy(e.target.checked)}
                    className="rounded text-nepal-crimson focus:ring-nepal-crimson"
                  />
                  <span>Enable Automatic Proxy Bidding</span>
                </label>

                {isProxy && (
                  <div className="space-y-1 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                    <label className="block text-[11px] font-bold text-amber-900">
                      Maximum Limit (NPR)
                    </label>
                    <input
                      type="number"
                      step="100"
                      min={bidAmount}
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      placeholder="e.g. 25000"
                      className="w-full p-2 rounded-lg border border-amber-300 text-xs font-bold"
                    />
                    <p className="text-[10px] text-gray-500">
                      The system will auto-counter competing bids up to this amount.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-nepal-crimson hover:bg-nepal-crimsonDark text-white font-extrabold text-sm shadow-lg transition flex items-center justify-center gap-2"
              >
                <Gavel className="w-4 h-4 text-nepal-gold" />
                <span>{submitting ? "Placing Bid..." : "Submit Confirmed Bid"}</span>
              </button>
            </form>

            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Safe bidding: Auto-extended by 5 mins if bid placed in final moments.</span>
            </div>
          </div>

          {/* ── Bids History Ledger ────────────────────────────── */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-nepal-earth">
                <History className="w-4 h-4 text-nepal-crimson" />
                <span>Live Bids Ledger</span>
              </div>
              <span className="text-xs text-gray-400">{auction.bids?.length || 0} bids total</span>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {auction.bids && auction.bids.length > 0 ? (
                auction.bids.map((b, idx) => (
                  <div
                    key={b.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs ${
                      idx === 0
                        ? "bg-amber-50 border border-amber-200 font-bold"
                        : "bg-gray-50 text-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-nepal-earth text-white flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{b.user?.name || "Bidder"}</span>
                      {b.is_auto && (
                        <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-semibold">
                          Proxy
                        </span>
                      )}
                    </div>
                    <span className="font-extrabold text-nepal-crimson">
                      NPR {Number(b.amount).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400 text-center py-4">No bids placed yet. Be the first!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

