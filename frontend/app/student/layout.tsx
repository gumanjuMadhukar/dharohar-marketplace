"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { DashboardShell, NavSection } from "@/components/admin/DashboardShell";
import {
  TrendingUp,
  Package,
  Plus,
  ShieldCheck,
  BookOpen,
  User as UserIcon,
  GraduationCap,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading, loginAsDemo } = useAuth();
  const [productsCount, setProductsCount] = useState<number>(0);
  const [autoSigningIn, setAutoSigningIn] = useState(false);

  useEffect(() => {
    if (token && user) {
      api.get("/seller/products").then((res) => {
        if (res.data?.data) {
          const list = res.data.data.data || res.data.data;
          setProductsCount(list.length);
        }
      }).catch(() => {});
    }
  }, [token, user]);

  const handleDemoSignIn = async () => {
    setAutoSigningIn(true);
    try {
      await loginAsDemo("student");
    } finally {
      setAutoSigningIn(false);
    }
  };

  const navSections: NavSection[] = [
    {
      title: "Creator Studio",
      items: [
        { id: "dashboard", label: "Studio Dashboard", icon: TrendingUp, href: "/student/dashboard" },
        { id: "creations", label: "My Creations & Art", icon: Package, href: "/student/creations", badge: productsCount },
        { id: "create", label: "Publish Creative Idea", icon: Plus, href: "/student/create" },
      ],
    },
    {
      title: "Guidance & Safety",
      items: [
        { id: "guardian", label: "Parental Consent", icon: ShieldCheck, href: "/student/guardian" },
        { id: "academy", label: "Youth Academy Guide", icon: BookOpen, href: "/student/academy" },
        { id: "profile", label: "Student Profile", icon: UserIcon, href: "/student/profile" },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-2xl shadow-xl animate-pulse">
            ध
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Loading student creator studio...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-white tracking-tight">Student Creator Studio Access</h2>
            <p className="text-xs text-slate-400">
              Sign in with your student creator account. Enjoy 3% subsidized commission, mentor guidance, and parental protection.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleDemoSignIn}
              disabled={autoSigningIn}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {autoSigningIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Quick Sign-In as Student Creator</span>
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
      role="student"
      title={`${user.name}’s Student Studio`}
      subtitle="Empowering young creators: 3% subsidized commission, parental consent safety, and innovation showcase"
      navSections={navSections}
    >
      {children}
    </DashboardShell>
  );
}
