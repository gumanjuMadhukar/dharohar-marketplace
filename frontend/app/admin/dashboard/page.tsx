"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  CircularKpiCard,
  RevenueAnalyticsChart,
  CategoryDonutChart,
  RecentActivityFeed,
} from "@/components/admin/AnalyticsWidgets";
import {
  DollarSign,
  Users,
  Gavel,
  Store,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({
    total_gmv: 0,
    total_orders: 0,
    total_users: 0,
    total_stores: 0,
    verified_stores: 0,
    student_creators: 0,
    active_auctions: 0,
    pending_kyc: 0,
    open_disputes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats")
      .then((res) => {
        if (res.data?.stats) {
          setStats(res.data.stats);
        }
      })
      .catch((err) => {
        console.warn("Admin dashboard stats notice:", err?.response?.data?.message || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <CircularKpiCard
          title="Platform Gross Volume"
          value={`NPR ${Number(stats?.total_gmv || 0).toLocaleString()}`}
          subtitle="Paid Transactions"
          percentage={92}
          icon={DollarSign}
          color="purple"
          trend="+18.4%"
        />
        <CircularKpiCard
          title="Registered Members"
          value={stats?.total_users || 0}
          subtitle={`${stats?.student_creators || 0} Student Creators`}
          percentage={78}
          icon={Users}
          color="blue"
          trend="+12.0%"
        />
        <CircularKpiCard
          title="Live Timed Auctions"
          value={stats?.active_auctions || 0}
          subtitle="Active Bidding Rooms"
          percentage={65}
          icon={Gavel}
          color="crimson"
          trend="+24.5%"
        />
        <CircularKpiCard
          title="Verified Artisan Stores"
          value={`${stats?.verified_stores || 0} / ${stats?.total_stores || 0}`}
          subtitle="Trusted Guilds"
          percentage={84}
          icon={Store}
          color="emerald"
          trend="+6.1%"
        />
      </div>

      {/* Revenue Analytics Chart + Category Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueAnalyticsChart totalGmv={stats?.total_gmv || 0} commission={10} />
        </div>
        <div className="lg:col-span-1">
          <CategoryDonutChart />
        </div>
      </div>

      {/* Activity Feed + Compliance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivityFeed />
        </div>
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 tracking-tight">Compliance Action Queue</h3>
            <Link href="/admin/kyc" className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1">
              <span>Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            <Link
              href="/admin/kyc"
              className="p-3.5 bg-amber-50/70 hover:bg-amber-100/70 rounded-2xl border border-amber-200 flex items-center justify-between text-xs transition"
            >
              <div>
                <div className="font-bold text-amber-900">Pending KYC Documents</div>
                <div className="text-[11px] text-amber-700">Artisan & Student applications</div>
              </div>
              <span className="text-xl font-black text-amber-900">{stats?.pending_kyc || 0}</span>
            </Link>

            <Link
              href="/admin/disputes"
              className="p-3.5 bg-red-50/70 hover:bg-red-100/70 rounded-2xl border border-red-200 flex items-center justify-between text-xs transition"
            >
              <div>
                <div className="font-bold text-red-900">Open Customer Disputes</div>
                <div className="text-[11px] text-red-700">Requires mediator settlement</div>
              </div>
              <span className="text-xl font-black text-red-900">{stats?.open_disputes || 0}</span>
            </Link>

            <Link
              href="/admin/settings"
              className="p-3.5 bg-purple-50/70 hover:bg-purple-100/70 rounded-2xl border border-purple-200 flex items-center justify-between text-xs transition"
            >
              <div>
                <div className="font-bold text-purple-900">Subsidized Student Rate</div>
                <div className="text-[11px] text-purple-700">Youth entrepreneurship guarantee</div>
              </div>
              <span className="text-xl font-black text-purple-900">3%</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

