"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/Badge";
import {
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Store,
  Layers,
  Heart,
  Check,
  Gavel,
  Flame,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/products/${slug}`)
      .then((res) => {
        if (res.data?.product) {
          const p = res.data.product;
          setProduct(p);
          const initialImg =
            p.primary_image?.url ||
            p.primary_image?.image_url ||
            p.images?.[0]?.url ||
            p.images?.[0]?.image_url ||
            "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800";
          setSelectedImage(initialImg);
        }
      })
      .catch((err) => {
        console.warn("Product detail fetch notice:", err?.response?.data?.message || err.message);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-nepal-crimson border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-500 tracking-wide uppercase">Curating Artifact Details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">Artifact Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested artifact could not be located in our verified heritage or youth creator registry.
        </p>
        <Link
          href="/marketplace"
          className="inline-block px-6 py-2.5 bg-nepal-crimson text-white rounded-full text-xs font-bold shadow hover:bg-nepal-crimsonDark transition"
        >
          Explore Marketplace
        </Link>
      </div>
    );
  }

  // Calculate dynamic wholesale price based on quantity
  let currentUnitPrice = Number(product.price);
  if (product.wholesale_prices && product.wholesale_prices.length > 0) {
    const applicableTier = product.wholesale_prices
      .filter((tier) => quantity >= tier.min_quantity && (!tier.max_quantity || quantity <= tier.max_quantity))
      .sort((a, b) => b.min_quantity - a.min_quantity)[0];
    if (applicableTier) {
      currentUnitPrice = Number(applicableTier.price);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back Link */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-nepal-earth hover:text-nepal-crimson transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* ── Left: Image Gallery ──────────────────────────────── */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-nepal-parchment border border-nepal-gold/20 shadow-md">
            <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" />

            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.is_student_made && <Badge type="student" />}
              {product.is_handmade && <Badge type="handmade" />}
              {product.is_eco_friendly && <Badge type="eco" />}
              {product.type === "idea" && <Badge type="idea" />}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img: any) => {
                const imgUri = img.url || img.image_url;
                return (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(imgUri)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                      selectedImage === imgUri
                        ? "border-nepal-crimson scale-105"
                        : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUri} alt="" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right: Buy Box & Product Info ────────────────────── */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-nepal-terracotta font-semibold mb-2">
              <Link href={`/marketplace?category=${product.category?.slug}`} className="hover:underline">
                {product.category?.name || "Nepali Heritage"}
              </Link>
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{Number(product.avg_rating || 5.0).toFixed(1)}</span>
                <span className="text-gray-400 font-normal">({product.sales_count} sold)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-nepal-earth leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Auction Exclusive or Standard Buy Box */}
          {(() => {
            const activeAuction =
              (product as any)?.active_auction ||
              ((product as any)?.auctions && (product as any)?.auctions.find((a: any) => a.status === "active"));

            if (activeAuction) {
              return (
                <div className="bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-amber-50 border-2 border-amber-500/40 rounded-3xl p-6 shadow-lg space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-200">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-md animate-pulse">
                      <Flame className="w-4 h-4 fill-amber-200 text-amber-200" />
                      <span>Live Timed Auction Active</span>
                    </span>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                      Anti-Sniping Protected
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Current Highest Bid
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl sm:text-4xl font-black text-nepal-crimson font-mono">
                        NPR {Number(activeAuction.current_price || activeAuction.starting_price).toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500">
                        (Starting: NPR {Number(activeAuction.starting_price).toLocaleString()})
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
                      <span className="text-slate-500 font-medium block">Total Bids Placed</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {activeAuction.bids_count ?? (activeAuction.bids?.length || 0)} bids
                      </span>
                    </div>
                    <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
                      <span className="text-slate-500 font-medium block">Min Next Increment</span>
                      <span className="font-bold text-slate-900 text-sm">
                        +NPR {Number(activeAuction.bid_increment || 500).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-100/60 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <p>
                      <strong>Direct Buy-Now is Locked:</strong> This rare artifact is featured in an active live auction. Instant checkout is paused to guarantee fair transparent bidding for all collectors.
                    </p>
                  </div>

                  <Link
                    href={`/auctions/${activeAuction.id}`}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 hover:brightness-110 text-white font-black text-sm shadow-xl shadow-amber-600/30 transition flex items-center justify-center gap-2"
                  >
                    <Gavel className="w-5 h-5" />
                    <span>Enter Live Auction Hall & Place Bid</span>
                  </Link>
                </div>
              );
            }

            return (
              <>
                {/* Price */}
                <div className="p-4 rounded-2xl bg-white border border-nepal-gold/30 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400 font-medium">Unit Price</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-nepal-crimson">
                        NPR {currentUnitPrice.toLocaleString()}
                      </span>
                      {product.compare_price && (
                        <span className="text-sm text-gray-400 line-through">
                          NPR {Number(product.compare_price).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {quantity >= 10 && (
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300">
                      Bulk Wholesale Tier Applied
                    </span>
                  )}
                </div>

                {/* B2B Wholesale Pricing Tiers */}
                {product.wholesale_prices && product.wholesale_prices.length > 0 && (
                  <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <Layers className="w-4 h-4 text-amber-700" />
                      <span>B2B / Manufacturer Wholesale Volume Discounts</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {product.wholesale_prices.map((w) => (
                        <div key={w.id} className="p-2 bg-white rounded-lg border border-amber-100">
                          <span className="text-gray-500 font-medium">
                            {w.min_quantity} {w.max_quantity ? `- ${w.max_quantity}` : "+"} units:
                          </span>
                          <span className="font-extrabold text-nepal-crimson ml-1">
                            NPR {Number(w.price).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity & Add to Cart */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-4">
                    <label className="text-xs font-bold text-nepal-earth">Quantity:</label>
                    <div className="flex items-center border border-gray-300 rounded-xl bg-white">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-l-xl"
                      >
                        -
                      </button>
                      <span className="px-4 py-1.5 text-sm font-bold text-nepal-earth">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-r-xl"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 py-3.5 rounded-full bg-nepal-crimson hover:bg-nepal-crimsonDark text-white font-extrabold text-sm shadow-lg transition flex items-center justify-center gap-2"
                    >
                      {added ? (
                        <>
                          <Check className="w-4 h-4 text-green-300" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>

                    <Link
                      href="/cart"
                      onClick={handleAddToCart}
                      className="px-6 py-3.5 rounded-full bg-nepal-earth hover:bg-black text-white font-bold text-sm shadow transition flex items-center justify-center"
                    >
                      Checkout Now
                    </Link>
                  </div>
                </div>
              </>
            );
          })()}

          {/* Artisan Store Info Card */}
          {product.store && (
            <div className="p-4 rounded-2xl bg-white border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center font-black text-amber-800 text-lg">
                  {product.store.name.substring(0, 1)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-nepal-earth">{product.store.name}</h4>
                  <p className="text-xs text-gray-500">
                    {product.store.city}, {product.store.state}
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-nepal-crimson px-3 py-1 rounded-full bg-nepal-crimson/10">
                Verified Store
              </span>
            </div>
          )}

          {/* Description */}
          <div className="pt-4 border-t border-gray-200 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              About this Creation
            </h4>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

