"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { DashboardShell, NavSection } from "@/components/admin/DashboardShell";
import {
  TrendingUp,
  Users,
  Store,
  Package,
  Gavel,
  Truck,
  CheckCircle,
  AlertTriangle,
  Settings,
  User as UserIcon,
  Plus,
  Shield,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading, loginAsDemo } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [autoSigningIn, setAutoSigningIn] = useState(false);

  useEffect(() => {
    if (token && user && (user.account_type === "admin" || user.email === "admin@dharohar.com")) {
      api.get("/admin/stats")
        .then((res) => {
          if (res.data?.stats) setStats(res.data.stats);
        })
        .catch((err) => {
          console.warn("Admin stats fetch notice:", err?.response?.data?.message || err.message);
        });
    }
  }, [token, user]);

  const handleDemoSignIn = async () => {
    setAutoSigningIn(true);
    try {
      await loginAsDemo("admin");
    } finally {
      setAutoSigningIn(false);
    }
  };

  const navSections: NavSection[] = [
    {
      title: "Main Menu",
      items: [
        { id: "dashboard", label: "Dashboard", icon: TrendingUp, href: "/admin/dashboard" },
        { id: "users", label: "Users & Roles", icon: Users, href: "/admin/users", badge: stats?.total_users },
        { id: "stores", label: "Stores & Artisans", icon: Store, href: "/admin/stores", badge: stats?.total_stores },
        { id: "products", label: "Catalog Moderation", icon: Package, href: "/admin/products" },
        { id: "auctions", label: "Live Auctions", icon: Gavel, href: "/admin/auctions", badge: stats?.active_auctions, badgeColor: "bg-red-100 text-red-800" },
        { id: "orders", label: "Global Orders", icon: Truck, href: "/admin/orders", badge: stats?.total_orders },
      ],
    },
    {
      title: "Compliance & Governance",
      items: [
        { id: "kyc", label: "KYC Verification", icon: CheckCircle, href: "/admin/kyc", badge: stats?.pending_kyc, badgeColor: "bg-amber-100 text-amber-800" },
        { id: "disputes", label: "Dispute Center", icon: AlertTriangle, href: "/admin/disputes", badge: stats?.open_disputes, badgeColor: "bg-red-100 text-red-800" },
        { id: "settings", label: "Platform Settings", icon: Settings, href: "/admin/settings" },
        { id: "profile", label: "Admin Profile", icon: UserIcon, href: "/admin/profile" },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl animate-pulse">
            ध
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            <span>Verifying administrator credentials...</span>
          </div>
        </div>
      </div>
    );
  }

  const isAuthorized = token && user && (user.account_type === "admin" || user.email === "admin@dharohar.com");

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto shadow-inner">
            <Shield className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-white tracking-tight">SuperAdmin Suite Access</h2>
            <p className="text-xs text-slate-400">
              Sign in with administrative privileges to manage governance, users, catalog, and settlements.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleDemoSignIn}
              disabled={autoSigningIn}
              className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {autoSigningIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Quick Sign-In as SuperAdmin</span>
                </>
              )}
            </button>

            <Link
              href="/login"
              className="inline-block w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold border border-slate-700/60 transition"
            >
              Custom Account Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell
      role="admin"
      title="Platform SuperAdmin Suite"
      subtitle="Complete system governance, analytics, user operations, and merchant compliance"
      navSections={navSections}
    >
      {children}
    </DashboardShell>
  );
}

