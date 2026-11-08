"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Palette,
  Sparkles,
  Radio,
  FileCheck2,
  Settings,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Loader2,
  Award,
} from "lucide-react";

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading, loginAsDemo, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [autoSigningIn, setAutoSigningIn] = useState(false);

  const navItems = [
    { label: "Atelier Dashboard", href: "/creator/dashboard", icon: TrendingUp },
    { label: "Heritage Showcase", href: "/creator/showcase", icon: Palette },
    { label: "Live Broadcast Studio", href: "/creator/live-studio", icon: Radio, badge: "ON AIR" },
    { label: "Bespoke Commissions", href: "/creator/commissions", icon: FileCheck2 },
    { label: "Artisan Profile & Lineage", href: "/creator/settings", icon: Settings },
  ];

  const handleDemoSignIn = async () => {
    setAutoSigningIn(true);
    try {
      await loginAsDemo("creator");
    } finally {
      setAutoSigningIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white font-black text-2xl shadow-xl animate-pulse">
            ध
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-stone-300">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Opening Heritage Creator Atelier...</span>
          </div>
        </div>
      </div>
    );
  }

  const isAuthorized = user && ["creator", "seller", "admin"].includes(user.account_type);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-white tracking-tight">Cultural Master Creator Atelier</h2>
            <p className="text-xs text-stone-400 leading-relaxed">
              Dedicated studio workspace for master generational sculptors, Thangka painters, and cultural artists.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleDemoSignIn}
              disabled={autoSigningIn}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-xl transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>{autoSigningIn ? "Signing in..." : "Instant Demo Sign-In as Master Creator"}</span>
            </button>
          </div>

          <div className="text-center">
            <Link href="/" className="text-xs text-stone-500 hover:text-white transition">
              ← Return to Dharohar Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/40 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-stone-900 text-white border-b border-stone-800 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-stone-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/creator/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center font-black text-white text-base shadow">
              ध
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Dharohar Creator Studio</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-extrabold uppercase">
                  Master Atelier
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100"}
              alt={user?.name || "Creator"}
              className="w-7 h-7 rounded-full object-cover border border-amber-500"
            />
            <div className="text-left text-xs">
              <div className="font-bold text-white">{user?.name}</div>
              <div className="text-[10px] text-amber-400 uppercase font-bold">Master Sculptor</div>
            </div>
          </div>

          <Link
            href="/live/1"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-300 hover:text-white transition"
          >
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>Preview My Live Stream</span>
          </Link>

          <button
            onClick={logout}
            className="p-2 text-stone-400 hover:text-red-400 transition"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Shell */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white rounded-3xl border border-stone-200 p-4 shadow-sm h-fit sticky top-20 space-y-1">
          <div className="px-3 py-2 text-[10px] uppercase font-extrabold text-stone-400 tracking-wider">
            Artisan Studio
          </div>

          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-stone-700 hover:bg-amber-50 hover:text-amber-900 transition"
            >
              <div className="flex items-center gap-2.5">
                <item.icon className="w-4 h-4 text-amber-700" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[9px] font-black uppercase">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </aside>

        {/* Content Body */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
