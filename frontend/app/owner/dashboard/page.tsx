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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          Executive Gallery & Brand Overview
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Aggregated performance across your artisan workshops, storefronts, staff managers, and financial ledgers.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-1">
          <div className="text-[10px] uppercase font-bold text-stone-400">Aggregated Sales (MTD)</div>
          <div className="text-2xl font-black text-emerald-800">{metrics.aggregateRevenue}</div>
          <div className="text-[11px] text-emerald-600 font-semibold">+18.4% vs last month</div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-1">
          <div className="text-[10px] uppercase font-bold text-stone-400">Managed Workshops</div>
          <div className="text-2xl font-black text-stone-900">{metrics.totalStores} Stores</div>
          <div className="text-[11px] text-stone-500">100% active on Dharohar</div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-1">
          <div className="text-[10px] uppercase font-bold text-stone-400">Authorized Managers</div>
          <div className="text-2xl font-black text-amber-700">{metrics.activeStaff} Artisans</div>
          <div className="text-[11px] text-stone-500">Staff RBAC delegated</div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-1">
          <div className="text-[10px] uppercase font-bold text-stone-400">Net Escrow Payout</div>
          <div className="text-2xl font-black text-stone-900">{metrics.netEscrowPayout}</div>
          <div className="text-[11px] text-emerald-600 font-semibold">Cleared to Bank Account</div>
        </div>
      </div>

      {/* Managed Storefronts Table */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-700" />
            <h2 className="text-sm font-black text-stone-900">Your Branch Storefronts</h2>
          </div>
          <Link href="/owner/stores" className="text-xs font-bold text-emerald-700 hover:underline">
            Manage All Stores →
          </Link>
        </div>

        <div className="divide-y divide-stone-100">
          {stores.map((s) => (
            <div key={s.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-stone-900">{s.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[9px] font-black uppercase border border-emerald-200">
                    {s.status}
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  Location: {s.city} • Manager: <strong className="text-stone-700">{s.manager}</strong>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Monthly Volume</div>
                  <div className="text-xs font-black text-emerald-800">{s.monthlySales}</div>
                </div>

                <Link
                  href="/owner/stores"
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition"
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
