"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Product, Auction, Category } from "@/lib/types";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { AuctionCard } from "@/components/AuctionCard";
import {
  Gavel,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Package,
  Layers,
  Heart,
} from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, auctRes, catRes] = await Promise.all([
          api.get("/products?per_page=8"),
          api.get("/auctions"),
          api.get("/categories"),
        ]);

        if (prodRes.data?.data?.data) {
          setProducts(prodRes.data.data.data);
        }
        if (auctRes.data?.data?.data) {
          setAuctions(auctRes.data.data.data);
        }
        if (catRes.data?.data) {
          setCategories(catRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch homepage data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* ── 1. Hero Section ───────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/60 via-nepal-parchment to-white border-b border-nepal-gold/20 pt-12 pb-20">
        {/* Subtle Mandala Background Decorative Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-nepal-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-nepal-crimson/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & Value Prop */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-nepal-crimson text-xs font-bold border border-nepal-gold/30 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-nepal-gold" />
                <span>Nepal’s Premier Heritage & Youth Creator Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-nepal-earth tracking-tight leading-[1.15]">
                Preserve the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-nepal-crimson via-nepal-terracotta to-nepal-gold">
                  Past
                </span>
                .<br />
                Empower the{" "}
                <span className="text-nepal-crimson underline decoration-nepal-gold decoration-4 underline-offset-4">
                  Future
                </span>
                .
              </h1>

              <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Discover authentic master woodcarvings, 24k gold Thangka scrolls, and hand-loomed
                cashmere — while giving <strong>students, children, and young innovators</strong> a
                trusted stage to showcase ideas and earn their first income.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/marketplace"
                  className="px-6 py-3.5 rounded-full bg-nepal-crimson hover:bg-nepal-crimsonDark text-white font-bold text-sm shadow-lg hover:shadow-xl transition transform active:scale-95 flex items-center gap-2"
                >
                  <span>Explore Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/auctions"
                  className="px-6 py-3.5 rounded-full bg-nepal-earth hover:bg-black text-white font-bold text-sm shadow-md transition flex items-center gap-2 border border-nepal-gold/40"
                >
                  <Gavel className="w-4 h-4 text-nepal-gold" />
                  <span>Enter Auction Hall</span>
                </Link>

                <Link
                  href="/marketplace?student_made=true"
                  className="px-5 py-3.5 rounded-full bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 font-bold text-sm shadow-sm transition flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4 text-amber-700" />
                  <span>Student Creations</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-gray-200/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-nepal-crimson">100%</div>
                  <div className="text-xs text-gray-500 font-medium">Authentic Nepali</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-nepal-earth">3%</div>
                  <div className="text-xs text-gray-500 font-medium">Student Fee Tier</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-nepal-gold">Live</div>
                  <div className="text-xs text-gray-500 font-medium">Real-time Bidding</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Collage / Visual Highlight */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl p-3 bg-gradient-to-tr from-nepal-crimson via-nepal-gold to-nepal-terracotta shadow-2xl">
                <div className="bg-white rounded-2xl p-4 overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800"
                    alt="Authentic Newari Woodcraft"
                    className="w-full aspect-[4/3] object-cover rounded-xl shadow-md"
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-nepal-crimson uppercase tracking-wider">
                        Featured Heritage Artifact
                      </span>
                      <h4 className="font-extrabold text-sm text-nepal-earth">
                        Mayur Jhyal (Peacock Window)
                      </h4>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Starting at</div>
                      <div className="font-black text-nepal-crimson text-sm">NPR 12,500</div>
                    </div>
                  </div>

                  {/* Student Tag Overhang */}
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                      17y
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-nepal-earth">Student Creator: Aarav B.</span>
                      <p className="text-[11px] text-gray-500">Lokta Paper & Mandala Botanical Art</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Live Auction Hall Banner Preview ─────────────────── */}
      {auctions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-nepal-earth via-[#3b2a2a] to-nepal-crimson text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/80 text-white text-xs font-bold mb-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  LIVE BIDDING HALL ACTIVE
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-nepal-gold">
                  Timed Auctions & Rare Artifact Bidding
                </h2>
                <p className="text-sm text-gray-200 max-w-xl mt-1">
                  Participate in live competitive auctions with automatic proxy bidding, reserve price
                  protections, and auto-extensions.
                </p>
              </div>

              <Link
                href="/auctions"
                className="px-6 py-3 rounded-full bg-nepal-gold hover:bg-yellow-400 text-nepal-earth font-extrabold text-sm shadow-md transition flex items-center gap-2 whitespace-nowrap"
              >
                <Gavel className="w-4 h-4" />
                <span>View All Auctions</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {auctions.slice(0, 2).map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        </section>
      )}

      {/* ── 3. Category Showcase ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-nepal-crimson">
              Explore Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-nepal-earth">
              Shop by Heritage Category
            </h2>
          </div>
          <Link
            href="/marketplace"
            className="text-xs font-bold text-nepal-crimson hover:underline flex items-center gap-1"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/marketplace?category=${cat.slug}`}
              className="group bg-white rounded-2xl p-4 border border-nepal-gold/20 hover:border-nepal-crimson shadow-sm hover:shadow-lg transition-all text-center flex flex-col items-center justify-between"
            >
              <div className="w-16 h-16 rounded-2xl bg-nepal-parchment overflow-hidden mb-3 border border-gray-100 group-hover:scale-110 transition duration-300">
                <img
                  src={
                    cat.image ||
                    "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300"
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-xs text-nepal-earth group-hover:text-nepal-crimson transition line-clamp-2">
                {cat.name}
              </h3>
              <span className="text-[11px] text-gray-400 mt-1 font-medium">
                {cat.products_count ?? 12}+ items
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4. Student & Young Creators Spotlight ─────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50 border-2 border-nepal-gold/40 p-8 sm:p-10 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white font-bold text-xs">
                <GraduationCap className="w-4 h-4" />
                <span>Next Generation Nepal</span>
              </div>
              <h2 className="text-3xl font-black text-nepal-earth tracking-tight">
                Empowering Children & Student Creators
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                Dharohar gives high-schoolers, vocational trainees, and young inventors a safe,
                parent-consented platform to turn their passion into income. From handmade botanical
                journals to solar agriculture blueprints — support youth-driven entrepreneurship today.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/marketplace?student_made=true"
                  className="px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                >
                  <span>Browse Student Works</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-full bg-white text-nepal-earth border border-gray-300 hover:border-amber-500 font-bold text-xs transition"
                >
                  Register as Student Creator
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow border border-amber-200">
                <div className="text-2xl font-black text-amber-700">3%</div>
                <div className="text-xs font-bold text-nepal-earth mt-1">Platform Commission</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  Subsidized rates so student creators keep 97% of earnings.
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow border border-amber-200">
                <div className="text-2xl font-black text-nepal-crimson">100%</div>
                <div className="text-xs font-bold text-nepal-earth mt-1">Guardian Consent</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  Full parental verification & oversight for creators under 18.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Featured Marketplace Products ──────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-nepal-crimson">
              Handpicked
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-nepal-earth">
              Featured Marketplace Artifacts
            </h2>
          </div>
          <Link
            href="/marketplace"
            className="text-xs font-bold text-nepal-crimson hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse space-y-4"
              >
                <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

