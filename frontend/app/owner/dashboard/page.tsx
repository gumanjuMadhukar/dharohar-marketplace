"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Store,
  Users,
  DollarSign,
  ArrowRight,
  ExternalLink,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

export default function OwnerDashboardPage() {
  const [metrics] = useState({
    aggregateRevenue: "Rs. 2,840,000",
    totalStores: 3,
    activeStaff: 8,
    activeLiveAuctions: 2,
    netEscrowPayout: "Rs. 2,470,000",
  });

  const stores = [
    {
      id: 1,
      name: "Bhaktapur Traditional Woodcraft Stall",
      city: "Bhaktapur",
      manager: "Bikash Shrestha",
      monthlySales: "Rs. 1,420,000",
      status: "Verified Master",
    },
    {
      id: 2,
      name: "Himalayan Chyangra Cashmere Atelier",
      city: "Kathmandu",
      manager: "Doma Gurung",
      monthlySales: "Rs. 980,000",
      status: "Verified Master",
    },
    {
      id: 3,
      name: "Patan Sacred Bronze Casting Guild",
      city: "Lalitpur",
      manager: "Umesh Shakya",
      monthlySales: "Rs. 440,000",
      status: "Heritage Foundry",
    },
  ];

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Executive Gallery & Brand Overview
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          Aggregated performance across your artisan workshops, storefronts, staff managers, and financial ledgers.
        </p>
      </div>

      {/* KPI Cards - Executive Dark Theme */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 bg-stone-900 rounded-2xl border border-stone-800 shadow-md space-y-1">
          <div className="text-[10px] uppercase font-bold text-stone-400">Aggregated Sales (MTD)</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">{metrics.aggregateRevenue}</div>
          <div className="text-[11px] text-emerald-400 font-semibold">+18.4% vs last month</div>
        </div>

        <div className="p-4 sm:p-5 bg-stone-900 rounded-2xl border border-stone-800 shadow-md space-y-1">
          <div className="text-[10px] uppercase font-bold text-stone-400">Managed Workshops</div>
          <div className="text-xl sm:text-2xl font-black text-white">{metrics.totalStores} Stores</div>
          <div className="text-[11px] text-stone-400">100% active on Dharohar</div>
        </div>

        <div className="p-4 sm:p-5 bg-stone-900 rounded-2xl border border-stone-800 shadow-md space-y-1">
          <div className="text-[10px] uppercase font-bold text-stone-400">Authorized Managers</div>
          <div className="text-xl sm:text-2xl font-black text-amber-400">{metrics.activeStaff} Artisans</div>
          <div className="text-[11px] text-stone-400">Staff RBAC delegated</div>
        </div>

        <div className="p-4 sm:p-5 bg-stone-900 rounded-2xl border border-stone-800 shadow-md space-y-1">
          <div className="text-[10px] uppercase font-bold text-stone-400">Net Escrow Payout</div>
          <div className="text-xl sm:text-2xl font-black text-white">{metrics.netEscrowPayout}</div>
          <div className="text-[11px] text-emerald-400 font-semibold">Cleared to Bank Account</div>
        </div>
      </div>

      {/* Managed Storefronts Table */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-black text-white">Your Branch Storefronts</h2>
          </div>
          <Link href="/owner/stores" className="text-xs font-bold text-emerald-400 hover:underline">
            Manage All Stores →
          </Link>
        </div>

        <div className="space-y-3">
          {stores.map((store) => (
            <div
              key={store.id}
              className="p-4 bg-stone-950 rounded-xl border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-500/40 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs sm:text-sm">{store.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                    {store.status}
                  </span>
                </div>
                <div className="text-[11px] text-stone-400">
                  Location: <span className="text-stone-300 font-semibold">{store.city}</span> • Manager: <span className="text-stone-300 font-semibold">{store.manager}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-stone-500">Monthly Volume</div>
                  <div className="text-sm font-black text-emerald-400">{store.monthlySales}</div>
                </div>
                <Link
                  href={`/owner/stores`}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-700 transition"
                >
                  Configure
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
