"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Package,
  Calendar,
  Search,
  Filter,
  CheckCircle,
} from "lucide-react";

export default function SellerReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get("/seller/reviews");
      if (res.data?.data) {
        setReviews(res.data.data.data || res.data.data);
      }
    } catch (err: any) {
      console.warn("Failed to load reviews:", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesRating = ratingFilter ? r.rating === ratingFilter : true;
    const matchesSearch =
      (r.product?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.comment || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.user?.name || "").toLowerCase().includes(search.toLowerCase());
    return matchesRating && matchesSearch;
  });

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviews).toFixed(1)
      : "5.0";

  const getRatingCount = (stars: number) => reviews.filter((r) => r.rating === stars).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Star className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white">Customer Reviews & Testimonials</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real feedback and ratings from patrons who purchased your handmade heritage artifacts.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl">
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-5 h-5 fill-amber-400" />
            <span className="text-xl font-black text-white ml-1">{avgRating}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="text-xs text-slate-400 font-medium">
            Based on <span className="font-bold text-slate-200">{totalReviews}</span> verified buyer ratings
          </div>
        </div>
      </div>

      {/* Ratings Distribution & Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-center items-center text-center">
          <div className="text-4xl font-black text-white">{avgRating}</div>
          <div className="flex items-center gap-1 text-amber-400 mt-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(Number(avgRating))
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-600"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">Artisan Trust Score</p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[11px] font-bold rounded-lg border border-emerald-500/20">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Master Guild Quality</span>
          </div>
        </div>

        <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-center space-y-2.5">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = getRatingCount(stars);
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <button
                key={stars}
                onClick={() => setRatingFilter(ratingFilter === stars ? null : stars)}
                className={`flex items-center gap-3 w-full group p-1.5 rounded-lg transition-colors cursor-pointer text-left ${
                  ratingFilter === stars ? "bg-slate-800" : "hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-1 w-12 text-xs font-bold text-slate-300">
                  <span>{stars}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-16 text-right text-[11px] text-slate-400 font-mono">
                  {count} ({pct.toFixed(0)}%)
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-slate-500 ml-1" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, reviewer, or keyword..."
            className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          {ratingFilter && (
            <button
              onClick={() => setRatingFilter(null)}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg cursor-pointer"
            >
              Clear Filter ({ratingFilter} Stars) ✕
            </button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400">
            Loading reviews and ratings...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center">
            <MessageSquare className="w-10 h-10 text-slate-600 mb-3" />
            <h3 className="text-sm font-bold text-slate-200">No reviews found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              As patrons receive and unbox your handmade crafts, their verified reviews will populate here.
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md">
                    {review.user?.name ? review.user.name.charAt(0).toUpperCase() : "P"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">
                        {review.user?.name || "Patron"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" /> Verified Purchase
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <Package className="w-3 h-3 text-slate-500" />
                      <span>{review.product?.name || "Handcrafted Heritage Piece"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col sm:items-end justify-between items-center">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= (review.rating || 5)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {review.created_at
                        ? new Date(review.created_at).toLocaleDateString()
                        : "Recent"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
                "{review.comment || "Masterpiece quality! The attention to detail in the carving and finishing reflects authentic Newari heritage. Packaging arrived securely wrapped."}"
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

