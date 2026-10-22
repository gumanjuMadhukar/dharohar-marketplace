"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Auction } from "@/lib/types";
import { Gavel, Clock, ArrowUpRight } from "lucide-react";

export const AuctionCard: React.FC<{ auction: Auction }> = ({ auction }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      const end = new Date(auction.ends_at).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Auction Ended");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [auction.ends_at]);

  const img =
    auction.product?.primary_image?.url ||
    auction.product?.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600";

  return (
    <div className="bg-white rounded-2xl border border-nepal-gold/30 overflow-hidden shadow-md hover:shadow-2xl hover:border-nepal-crimson transition-all duration-300 flex flex-col justify-between">
      {/* Media */}
      <div className="relative aspect-[16/10] bg-nepal-parchment overflow-hidden">
        <img
          src={img}
          alt={auction.title}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />

        {/* Live Indicator Pill */}
        <div className="absolute top-3 left-3 bg-red-600/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm shadow">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          LIVE AUCTION
        </div>

        {/* Countdown Overlay */}
        <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white text-xs font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
          <Clock className="w-3.5 h-3.5 text-nepal-gold" />
          <span>{timeLeft}</span>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs text-nepal-terracotta font-semibold mb-1">
            {auction.store?.name || "Heritage Artisan"}
          </div>
          <h3 className="font-bold text-base text-nepal-earth line-clamp-2 mb-3">
            {auction.title}
          </h3>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-500 font-medium">Current Leading Bid</div>
            <div className="text-lg font-black text-nepal-crimson">
              NPR {Number(auction.current_price).toLocaleString()}
            </div>
          </div>

          <Link
            href={`/auctions/${auction.id}`}
            className="inline-flex items-center gap-1 bg-nepal-earth hover:bg-nepal-crimson text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition"
          >
            <Gavel className="w-3.5 h-3.5 text-nepal-gold" />
            <span>Place Bid</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

