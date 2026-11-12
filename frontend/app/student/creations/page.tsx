"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Package, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function StudentCreationsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/seller/products").then((res) => {
      if (res.data?.data) {
        setProducts(res.data.data.data || res.data.data);
      }
    })
    .catch((err) => {
      console.warn("Failed to load student creations:", err?.response?.data?.message || err.message);
    })
    .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-white">My Creations & Artworks</h2>
          <p className="text-xs text-slate-400">All creations published with your subsidized 3% Student Creator badge.</p>
        </div>
        <Link
          href="/student/create"
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Idea</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xs hover:border-emerald-500/50 transition flex flex-col justify-between"
          >
            <div>
              <img
                src={p.primary_image?.image_url || "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600"}
                alt={p.name}
                className="w-full h-44 object-cover"
              />
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
                    {p.type}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono font-bold">Stock: {p.quantity}</span>
                </div>
                <h4 className="font-bold text-xs text-white line-clamp-1">{p.name}</h4>
                <div className="text-sm font-black text-emerald-400">
                  NPR {Number(p.price).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="p-5 pt-0">
              <Link
                href={`/products/${p.slug}`}
                className="block w-full py-2 text-center text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 hover:bg-emerald-900/60 rounded-xl transition"
              >
                View in Marketplace
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
