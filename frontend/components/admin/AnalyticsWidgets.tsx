"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Sparkles,
  DollarSign,
  Package,
  Gavel,
  Store,
  Users,
  GraduationCap,
  Clock,
  CheckCircle,
} from "lucide-react";

// ── 1. Circular Progress Metric Card ──────────────────────────
export const CircularKpiCard: React.FC<{
  title: string;
  value: string | number;
  subtitle: string;
  percentage: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "purple" | "blue" | "emerald" | "amber" | "crimson";
  trend?: string;
}> = ({ title, value, subtitle, percentage, icon: Icon, color, trend }) => {
  const colorMap = {
    purple: {
      stroke: "#A78BFA",
      bgRing: "#33275E",
      badge: "bg-purple-950/80 text-purple-300 border border-purple-800",
      iconBg: "bg-purple-950/80 text-purple-400 border border-purple-800/80",
    },
    blue: {
      stroke: "#60A5FA",
      bgRing: "#1E293B",
      badge: "bg-blue-950/80 text-blue-300 border border-blue-800",
      iconBg: "bg-blue-950/80 text-blue-400 border border-blue-800/80",
    },
    emerald: {
      stroke: "#34D399",
      bgRing: "#064E3B",
      badge: "bg-emerald-950/80 text-emerald-300 border border-emerald-800",
      iconBg: "bg-emerald-950/80 text-emerald-400 border border-emerald-800/80",
    },
    amber: {
      stroke: "#FBBF24",
      bgRing: "#451A03",
      badge: "bg-amber-950/80 text-amber-300 border border-amber-800",
      iconBg: "bg-amber-950/80 text-amber-400 border border-amber-800/80",
    },
    crimson: {
      stroke: "#F87171",
      bgRing: "#450A0A",
      badge: "bg-red-950/80 text-red-300 border border-red-800",
      iconBg: "bg-red-950/80 text-red-400 border border-red-800/80",
    },
  }[color];

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md hover:border-slate-700 transition-all flex items-center justify-between">
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${colorMap.iconBg} shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-400 truncate">{title}</span>
        </div>
        <div className="text-xl sm:text-2xl font-black text-white tracking-tight">{value}</div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="truncate">{subtitle}</span>
          {trend && (
            <span className={`px-1.5 py-0.2 rounded font-bold ${colorMap.badge} flex items-center gap-0.5 shrink-0`}>
              <ArrowUpRight className="w-3 h-3" />
              {trend}
            </span>
          )}
        </div>
      </div>

      {/* Circular Progress Gauge */}
      <div className="relative flex items-center justify-center shrink-0 ml-3">
        <svg className="w-16 h-16 sm:w-18 sm:h-18 transform -rotate-90" viewBox="0 0 70 70">
          <circle
            cx="35"
            cy="35"
            r={radius}
            stroke={colorMap.bgRing}
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx="35"
            cy="35"
            r={radius}
            stroke={colorMap.stroke}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute text-[11px] font-black text-slate-200">{percentage}%</span>
      </div>
    </div>
  );
};

// ── 2. Revenue Analytics Spline + Bar Chart ────────────────────
export const RevenueAnalyticsChart: React.FC<{
  totalGmv: number;
  commission: number;
}> = ({ totalGmv, commission }) => {
  const [activeRange, setActiveRange] = useState<"monthly" | "weekly">("monthly");

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const barHeights = [40, 65, 50, 75, 45, 90, 60, 85, 70, 95, 80, 100]; // % height
  const splinePoints = [
    [10, 60],
    [35, 45],
    [65, 55],
    [95, 30],
    [125, 60],
    [155, 20],
    [185, 40],
    [215, 25],
    [245, 35],
    [275, 10],
    [305, 30],
    [335, 15],
  ];

  const svgPath = splinePoints.reduce((acc, pt, idx, arr) => {
    if (idx === 0) return `M ${pt[0]} ${pt[1]}`;
    const prev = arr[idx - 1];
    const cp1x = prev[0] + (pt[0] - prev[0]) / 2;
    const cp1y = prev[1];
    const cp2x = prev[0] + (pt[0] - prev[0]) / 2;
    const cp2y = pt[1];
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt[0]} ${pt[1]}`;
  }, "");

  return (
    <div className="bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-white tracking-tight">Revenue Analytics</h3>
          <p className="text-xs text-slate-400">Platform GMV transaction volume & platform commission curve</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl text-xs font-bold text-slate-400 border border-slate-800">
            <button
              onClick={() => setActiveRange("monthly")}
              className={`px-3 py-1 rounded-lg transition ${
                activeRange === "monthly" ? "bg-slate-800 text-purple-300 shadow-xs border border-purple-500/30" : "text-slate-400"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setActiveRange("weekly")}
              className={`px-3 py-1 rounded-lg transition ${
                activeRange === "weekly" ? "bg-slate-800 text-purple-300 shadow-xs border border-purple-500/30" : "text-slate-400"
              }`}
            >
              Weekly
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative h-60 w-full pt-4">
        {/* Horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
          <div className="border-b border-dashed border-slate-800 text-[10px] text-slate-500">100k</div>
          <div className="border-b border-dashed border-slate-800 text-[10px] text-slate-500">75k</div>
          <div className="border-b border-dashed border-slate-800 text-[10px] text-slate-500">50k</div>
          <div className="border-b border-dashed border-slate-800 text-[10px] text-slate-500">25k</div>
          <div className="border-b border-slate-800 text-[10px] text-slate-500">0</div>
        </div>

        {/* Bars Container */}
        <div className="absolute inset-0 flex items-end justify-between px-3 pb-6">
          {barHeights.map((h, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              <div
                style={{ height: `${h * 0.7}%` }}
                className="w-4 sm:w-6 bg-gradient-to-t from-purple-700 to-indigo-500 rounded-t-md opacity-85 group-hover:opacity-100 transition-all duration-300 shadow-sm"
              ></div>
              <span className="text-[10px] text-slate-500 font-bold mt-2">{months[idx]}</span>
            </div>
          ))}
        </div>

        {/* Spline Overlay SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none pb-6"
          viewBox="0 0 350 100"
          preserveAspectRatio="none"
        >
          <path d={svgPath} fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
          {splinePoints.map((pt, i) => (
            <circle key={i} cx={pt[0]} cy={pt[1]} r="3" fill="#0f172a" stroke="#34D399" strokeWidth="2" />
          ))}
        </svg>
      </div>

      {/* Mini Metric Footer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Settled Today</span>
          <div className="text-lg font-black text-white mt-0.5">NPR 18,500</div>
          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +14.2% vs yesterday
          </span>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-purple-900/50">
          <span className="text-[11px] font-bold text-purple-400 uppercase">This Week Volume</span>
          <div className="text-lg font-black text-purple-300 mt-0.5">NPR 128,450</div>
          <span className="text-[10px] font-bold text-purple-400 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +8.5% weekly pace
          </span>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Net Commission Rate</span>
          <div className="text-lg font-black text-white mt-0.5">10% / 3%</div>
          <span className="text-[10px] font-bold text-slate-400">Standard / Student tier</span>
        </div>
      </div>
    </div>
  );
};

// ── 3. Sales Category Donut Breakdown ─────────────────────────
export const CategoryDonutChart: React.FC = () => {
  const slices = [
    { label: "Handicrafts & Sculpture", pct: 38, color: "#8B5CF6", bg: "bg-purple-500" },
    { label: "Thangka & Art", pct: 24, color: "#3B82F6", bg: "bg-blue-500" },
    { label: "Student Innovations", pct: 18, color: "#F59E0B", bg: "bg-amber-500" },
    { label: "Pashmina & Wool", pct: 14, color: "#10B981", bg: "bg-emerald-500" },
    { label: "Organic Herbs & Tea", pct: 6, color: "#EF4444", bg: "bg-red-500" },
  ];

  return (
    <div className="bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-white tracking-tight">Sales Breakdown</h3>
        <span className="text-xs font-bold text-slate-400">By Category</span>
      </div>

      {/* Donut representation */}
      <div className="flex items-center justify-center py-2">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="38" stroke="#8B5CF6" strokeWidth="12" strokeDasharray="90 150" fill="none" />
            <circle cx="50" cy="50" r="38" stroke="#3B82F6" strokeWidth="12" strokeDasharray="57 183" strokeDashoffset="-90" fill="none" />
            <circle cx="50" cy="50" r="38" stroke="#F59E0B" strokeWidth="12" strokeDasharray="43 197" strokeDashoffset="-147" fill="none" />
            <circle cx="50" cy="50" r="38" stroke="#10B981" strokeWidth="12" strokeDasharray="33 207" strokeDashoffset="-190" fill="none" />
            <circle cx="50" cy="50" r="38" stroke="#EF4444" strokeWidth="12" strokeDasharray="14 226" strokeDashoffset="-223" fill="none" />
          </svg>
          <div className="absolute text-center">
            <span className="text-xs font-bold text-slate-500">Total</span>
            <div className="text-base font-black text-white">100%</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        {slices.map((s, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${s.bg}`}></span>
              <span className="text-slate-300 font-medium">{s.label}</span>
            </div>
            <span className="font-bold text-white">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── 4. Live Real-Time Activity Feed Timeline ──────────────────
export const RecentActivityFeed: React.FC = () => {
  const events = [
    {
      time: "08:42",
      title: "Mayur Jhyal Peacock Window",
      desc: "Artisan Bikash Shrestha placed teak window on 48h live auction.",
      tag: "Live Auction",
      tagColor: "bg-red-950 text-red-300 border-red-800",
    },
    {
      time: "10:15",
      title: "Student Prototype Published",
      desc: "Aarav Bajracharya submitted Lokta Paper Art with 3% youth rate.",
      tag: "Student Creator",
      tagColor: "bg-amber-950 text-amber-300 border-amber-800",
    },
    {
      time: "14:37",
      title: "eSewa Payment Settled",
      desc: "Order #DHAR-20261022 verified NPR 15,050 into merchant escrow.",
      tag: "Order Paid",
      tagColor: "bg-emerald-950 text-emerald-300 border-emerald-800",
    },
    {
      time: "16:50",
      title: "Artisan KYC Verified",
      desc: "Bhaktapur Woodcraft Guild credentials verified by SuperAdmin.",
      tag: "Verified",
      tagColor: "bg-purple-950 text-purple-300 border-purple-800",
    },
  ];

  return (
    <div className="bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-white tracking-tight">Recent Activity</h3>
        <span className="text-[11px] font-bold text-slate-400">Live Stream</span>
      </div>

      <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
        {events.map((e, idx) => (
          <div key={idx} className="relative flex items-start gap-4 text-xs">
            <div className="w-7 h-7 rounded-full bg-slate-950 border-2 border-slate-800 shadow-xs text-[10px] font-mono font-bold text-slate-300 flex items-center justify-center shrink-0 z-10">
              {e.time.slice(0, 2)}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{e.title}</span>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${e.tagColor}`}>
                  {e.tag}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{e.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
