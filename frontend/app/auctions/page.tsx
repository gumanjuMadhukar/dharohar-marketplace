"use client";

import React, { useEffect, useState } from "react";
import { Auction } from "@/lib/types";
import { api } from "@/lib/api";
import { AuctionCard } from "@/components/AuctionCard";
import { Gavel, Clock, ShieldCheck, Sparkles } from "lucide-react";

export default function AuctionHallPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [status, setStatus] = useState<"active" | "upcoming" | "ended">("active");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/auctions?status=${status}`);
        if (res.data?.data?.data) {
          setAuctions(res.data.data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [status]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* ── Banner ───────────────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-r from-nepal-earth via-[#362525] to-nepal-crimson text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold tracking-wide">
            <Gavel className="w-4 h-4 text-nepal-gold" />
            <span>DHAROHAR LIVE AUCTION HALL</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-nepal-gold tracking-tight">
            Bid on Rare Master Crafts & Exclusive Youth Innovations
          </h1>
          <p className="text-sm text-gray-200 leading-relaxed">
            Experience real-time competitive bidding powered by WebSockets. Every piece features verified
            provenance, anti-sniping countdown protections, and automated winner conversion.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs text-gray-300">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              Transparent Ledger
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-nepal-gold" />
              5-Min Anti-Sniping Extension
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Smart Proxy Bidding
            </span>
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          {(["active", "upcoming", "ended"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatus(tab)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold capitalize transition flex items-center gap-2 ${
                status === tab
                  ? "bg-nepal-crimson text-white shadow-md"
                  : "bg-white text-nepal-earth hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab === "active" && (
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              )}
              <span>{tab} Auctions</span>
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-500 font-medium">
          Showing {auctions.length} listing(s)
        </span>
      </div>

      {/* ── Listings ─────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 border border-gray-200 animate-pulse space-y-4"
            >
              <div className="w-full aspect-[16/10] bg-gray-200 rounded-xl" />
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : auctions.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-300">
          <Gavel className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-nepal-earth">No {status} auctions found</h3>
          <p className="text-xs text-gray-500 mt-1">
            Check back shortly or register your own artisan artifact for timed auction.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
}

