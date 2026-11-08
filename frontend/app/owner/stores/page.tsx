"use client";

import React, { useState } from "react";
import {
  Store,
  Plus,
  CheckCircle,
  ExternalLink,
  MapPin,
  Settings,
} from "lucide-react";

export default function OwnerStoresPage() {
  const [toast, setToast] = useState<string | null>(null);

  const [stores, setStores] = useState([
    {
      id: 1,
      name: "Bhaktapur Traditional Woodcraft Stall",
      city: "Bhaktapur",
      manager: "Bikash Shrestha",
      activeProducts: 24,
      liveBroadcasts: 8,
      rating: 4.9,
    },
    {
      id: 2,
      name: "Himalayan Chyangra Cashmere Atelier",
      city: "Kathmandu",
      manager: "Doma Gurung",
      activeProducts: 16,
      liveBroadcasts: 5,
      rating: 5.0,
    },
    {
      id: 3,
      name: "Patan Sacred Bronze Casting Guild",
      city: "Lalitpur",
      manager: "Umesh Shakya",
      activeProducts: 31,
      liveBroadcasts: 12,
      rating: 4.95,
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-emerald-700" />
            <span>Branch Storefronts & Workshops</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your network of artisan stalls, delegate managers, and track individual branch performance.
          </p>
        </div>

        <button
          onClick={() => {
            setToast("New artisan store wizard launched. Store configuration template ready.");
            setTimeout(() => setToast(null), 3000);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Workshop Branch</span>
        </button>
      </div>

      {toast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stores.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase border border-emerald-200">
                  Active Branch
                </span>
                <span className="text-xs font-black text-amber-600">★ {s.rating}</span>
              </div>

              <h2 className="text-sm font-black text-stone-900">{s.name}</h2>
              <div className="text-xs text-stone-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>{s.city}, Nepal</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-2xl border border-stone-100 text-xs text-center">
              <div>
                <div className="text-[10px] uppercase font-bold text-stone-400">Products</div>
                <div className="font-black text-stone-900">{s.activeProducts} Items</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-stone-400">Live Shows</div>
                <div className="font-black text-emerald-800">{s.liveBroadcasts} Streams</div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500">Manager: <strong className="text-stone-700">{s.manager}</strong></span>
              <button className="text-emerald-700 hover:underline font-bold">Edit Settings →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
