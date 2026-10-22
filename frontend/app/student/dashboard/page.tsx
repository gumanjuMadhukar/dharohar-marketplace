"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  CircularKpiCard,
  RevenueAnalyticsChart,
  RecentActivityFeed,
} from "@/components/admin/AnalyticsWidgets";
import { DollarSign, Package, Sparkles, ShieldCheck, Plus, BookOpen } from "lucide-react";
import Link from "next/link";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get("/seller/stats"),
      api.get("/seller/products"),
    ]).then(([statsRes, prodsRes]) => {
      if (statsRes.status === "fulfilled" && statsRes.value.data?.stats) {
        setStats(statsRes.value.data.stats);
      }
      if (prodsRes.status === "fulfilled" && prodsRes.value.data?.data) {
        const list = prodsRes.value.data.data.data || prodsRes.value.data.data;
        setProductsCount(list.length);
      }
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* 4 Circular KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <CircularKpiCard
          title="Student Sales"
          value={`NPR ${stats ? Number(stats.total_revenue).toLocaleString() : "0"}`}
          subtitle="Direct Earnings"
          percentage={97}
          icon={DollarSign}
          color="emerald"
          trend="97% Net Payout"
        />
        <CircularKpiCard
          title="Published Creations"
          value={productsCount}
          subtitle="With Student Badge"
          percentage={80}
          icon={Package}
          color="amber"
          trend="+3 this month"
        />
        <CircularKpiCard
          title="Subsidized Fee"
          value="3.0%"
          subtitle="vs 10% Standard Rate"
          percentage={100}
          icon={Sparkles}
          color="purple"
          trend="Youth Subsidy"
        />
        <CircularKpiCard
          title="Guardian Trust Status"
          value={user?.guardian_consent ? "Verified" : "Pending"}
          subtitle={user?.guardian_name ? `Guardian: ${user.guardian_name}` : "Consent on file"}
          percentage={user?.guardian_consent ? 100 : 50}
          icon={ShieldCheck}
          color="blue"
          trend="Safety Shield"
        />
      </div>

      {/* Revenue Analytics Chart + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueAnalyticsChart
            totalGmv={stats?.total_revenue || 0}
            commission={3}
          />
        </div>
        <div className="lg:col-span-1">
          <RecentActivityFeed />
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Link
          href="/student/create"
          className="bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-emerald-500 shadow-xs hover:shadow-md transition space-y-2 block"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div className="font-black text-sm text-slate-900">Publish New Idea or Artwork</div>
          <p className="text-xs text-slate-500">
            Showcase your school prototypes, Lokta paper drawings, digital mandalas, or eco innovations.
          </p>
        </Link>

        <Link
          href="/student/academy"
          className="bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-emerald-500 shadow-xs hover:shadow-md transition space-y-2 block"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="font-black text-sm text-slate-900">Youth Academy & Mentorship</div>
          <p className="text-xs text-slate-500">
            Learn master artisan pricing strategies, photography techniques, and zero-cost digital scaling.
          </p>
        </Link>
      </div>
    </div>
  );
}
