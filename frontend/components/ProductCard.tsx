"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { Badge } from "./Badge";
import { useCart } from "@/context/CartContext";
import { Star, ShoppingBag, Eye, Gavel, Flame } from "lucide-react";

export const ProductCard: React.FC<{ product: Product & { active_auction?: any; is_in_active_auction?: boolean } }> = ({ product }) => {
  const { addToCart } = useCart();

  const primaryImage =
    product.primary_image?.url ||
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600";

  // Check if artifact is currently in an active auction
  const activeAuction =
    product.active_auction ||
    (product.auctions && product.auctions.find((a: any) => a.status === "active"));

  const isInAuction = Boolean(product.is_in_active_auction || activeAuction);

  return (
    <div className={`group bg-white rounded-2xl border ${
      isInAuction ? "border-amber-400/80 shadow-md ring-1 ring-amber-400/30" : "border-nepal-gold/20"
    } overflow-hidden hover:shadow-xl hover:border-nepal-gold transition-all duration-300 flex flex-col justify-between`}>
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-nepal-parchment">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {isInAuction && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-lg animate-pulse">
              <Flame className="w-3 h-3 fill-amber-300 text-amber-300" />
              <span>Live Auction</span>
            </span>
          )}
          {product.is_student_made && <Badge type="student" />}
          {product.is_handmade && <Badge type="handmade" />}
          {product.is_eco_friendly && <Badge type="eco" />}
          {product.type === "idea" && <Badge type="idea" />}
        </div>

        {/* Quick View Button */}
        <Link
          href={isInAuction ? `/auctions/${activeAuction?.id}` : `/products/${product.slug}`}
          className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-semibold text-xs"
        >
          <span className="bg-white/90 text-nepal-earth px-3 py-1.5 rounded-full shadow flex items-center gap-1.5 hover:bg-white transition">
            {isInAuction ? (
              <>
                <Gavel className="w-3.5 h-3.5 text-amber-600" /> Enter Live Bidding
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" /> View Details
              </>
            )}
          </span>
        </Link>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Store name & rating */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span className="font-medium truncate max-w-[140px] text-nepal-terracotta">
              {product.store?.name || "Local Artisan"}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{Number(product.avg_rating || 5.0).toFixed(1)}</span>
            </div>
          </div>

          {/* Product Title */}
          <Link href={isInAuction ? `/auctions/${activeAuction?.id}` : `/products/${product.slug}`}>
            <h3 className="font-bold text-sm text-nepal-earth line-clamp-2 hover:text-nepal-crimson transition leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Pricing & Add to Cart / Bid */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 font-medium">
              {isInAuction ? "Current Live Bid" : "Price"}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-base font-extrabold ${isInAuction ? "text-amber-700 font-black" : "text-nepal-crimson"}`}>
                NPR{" "}
                {Number(
                  isInAuction
                    ? activeAuction?.current_price || activeAuction?.starting_price || product.price
                    : product.price
                ).toLocaleString()}
              </span>
              {!isInAuction && product.compare_price && Number(product.compare_price) > Number(product.price) && (
                <span className="text-xs text-gray-400 line-through">
                  NPR {Number(product.compare_price).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {isInAuction ? (
            <Link
              href={`/auctions/${activeAuction?.id}`}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-md hover:shadow-lg transition transform active:scale-95 flex items-center gap-1.5 text-xs font-bold"
              title="Join Live Auction"
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>Bid</span>
            </Link>
          ) : (
            <button
              onClick={() => addToCart(product, 1)}
              className="p-2.5 rounded-xl bg-nepal-crimson hover:bg-nepal-crimsonDark text-white shadow-md hover:shadow-lg transition transform active:scale-95"
              title="Add to Cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
