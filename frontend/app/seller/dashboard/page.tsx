"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  CircularKpiCard,
  RevenueAnalyticsChart,
  RecentActivityFeed,
} from "@/components/admin/AnalyticsWidgets";
import { DollarSign, Truck, Package, Wallet, Plus, Gavel } from "lucide-react";
import Link from "next/link";

export default function SellerDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [payoutsData, setPayoutsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get("/seller/stats"),
      api.get("/seller/payouts"),
    ]).then(([statsRes, payRes]) => {
      if (statsRes.status === "fulfilled" && statsRes.value.data?.stats) {
        setStats(statsRes.value.data.stats);
      }
      if (payRes.status === "fulfilled" && payRes.value.data) {
        setPayoutsData(payRes.value.data);
      }
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 w-full">
      {/* 4 Circular KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CircularKpiCard
          title="Gross Store Sales"
          value={`NPR ${stats ? Number(stats.total_revenue).toLocaleString() : "0"}`}
          subtitle="Paid Order Items"
          percentage={88}
          icon={DollarSign}
          color="amber"
          trend="+16.4%"
        />
        <CircularKpiCard
          title="Orders Fulfilled"
          value={stats?.total_sales || 0}
          subtitle="Customer Shipments"
          percentage={92}
          icon={Truck}
          color="emerald"
          trend="+8.2%"
        />
        <CircularKpiCard
          title="Catalog Inventory"
          value={stats?.products_count || 0}
          subtitle="Listed in Marketplace"
          percentage={74}
          icon={Package}
          color="blue"
          trend="+4.0%"
        />
        <CircularKpiCard
          title="Available Payout"
          value={`NPR ${payoutsData ? Number(payoutsData.available_balance).toLocaleString() : "0"}`}
          subtitle="Direct Wallet Settlement"
          percentage={100}
          icon={Wallet}
          color="crimson"
          trend="eSewa / Khalti"
        />
      </div>

      {/* Revenue Analytics Chart + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueAnalyticsChart
            totalGmv={stats?.total_revenue || 0}
            commission={stats?.commission_rate || 10}
          />
        </div>
        <div className="lg:col-span-1">
          <RecentActivityFeed />
        </div>
      </div>

      {/* Quick Action Tiles - Dark Studio Styling */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/seller/products/create"
          className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-amber-500 shadow-md transition space-y-2 block"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/80 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div className="font-black text-sm text-white">Publish Artifact</div>
          <p className="text-xs text-slate-400">
            Add handmade woodcarvings, thangka paintings, pashmina, or bulk wholesale tiers.
          </p>
        </Link>

        <Link
          href="/seller/auctions"
          className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-purple-500 shadow-md transition space-y-2 block"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-800/80 flex items-center justify-center">
            <Gavel className="w-5 h-5" />
          </div>
          <div className="font-black text-sm text-white">Host Live Auction</div>
          <p className="text-xs text-slate-400">
            Put rare cultural masterworks up for timed bidding with anti-sniping protection.
          </p>
        </Link>

        <Link
          href="/seller/payouts"
          className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-emerald-500 shadow-md transition space-y-2 block"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="font-black text-sm text-white">Withdraw Funds</div>
          <p className="text-xs text-slate-400">
            Request instant settlements directly to your eSewa, Khalti, or Nepali bank account.
          </p>
        </Link>
      </div>
    </div>
  );
}
