"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  Radio,
  CheckCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading, loginAsDemo, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [autoSigningIn, setAutoSigningIn] = useState(false);

  const navItems = [
    { label: "Operations Dashboard", href: "/staff/dashboard", icon: TrendingUp },
    { label: "Live Stream Supervisor", href: "/staff/live-streams", icon: Radio, badge: "LIVE" },
    { label: "KYC Verification Desk", href: "/staff/kyc", icon: CheckCircle },
    { label: "Dispute Mediation", href: "/staff/disputes", icon: AlertTriangle },
    { label: "Staff Operational Logs", href: "/staff/logs", icon: FileText },
  ];

  const handleDemoSignIn = async () => {
    setAutoSigningIn(true);
    try {
      await loginAsDemo("staff");
    } finally {
      setAutoSigningIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl animate-pulse">
            ध
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Loading Staff Operations Desk...</span>
          </div>
        </div>
      </div>
    );
  }

  const isAuthorized = user && ["staff", "admin"].includes(user.account_type);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <Shield className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-white tracking-tight">Staff & Operations Desk</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Restricted area for platform supervisors, content moderators, and KYC compliance officers.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleDemoSignIn}
              disabled={autoSigningIn}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-xl transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>{autoSigningIn ? "Signing in..." : "Instant Demo Sign-In as Staff Moderator"}</span>
            </button>
          </div>

          <div className="text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-white transition">
              ← Return to Dharohar Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/staff/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-base">
              ध
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Dharohar Staff Desk</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-extrabold uppercase">
                  Moderation
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100"}
              alt={user?.name || "Staff"}
              className="w-7 h-7 rounded-full object-cover border border-indigo-500"
            />
            <div className="text-left text-xs">
              <div className="font-bold text-white">{user?.name}</div>
              <div className="text-[10px] text-indigo-400 uppercase font-bold">{user?.account_type}</div>
            </div>
          </div>

          <Link
            href="/live"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white transition"
          >
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>Public Live Arena</span>
          </Link>

          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-400 transition"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-base">
                    ध
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Dharohar Staff Desk</div>
                    <div className="text-[10px] text-indigo-700 font-bold uppercase">Moderation & Supervision</div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Card */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                <img
                  src={user?.avatar || "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100"}
                  alt={user?.name || "Staff"}
                  className="w-9 h-9 rounded-full object-cover border border-indigo-500"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">{user?.name}</div>
                  <div className="text-[10px] text-indigo-600 font-bold uppercase">Staff Operations</div>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-4 h-4 text-indigo-600" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[9px] font-black uppercase">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-2">
              <Link
                href="/live"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <span>Live Public Arena</span>
              </Link>
              <button
                onClick={logout}
                className="w-full py-2.5 px-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Shell */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white rounded-3xl border border-slate-200 p-4 shadow-sm h-fit sticky top-20 space-y-1">
          <div className="px-3 py-2 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
            Operational Workflows
          </div>

          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
            >
              <div className="flex items-center gap-2.5">
                <item.icon className="w-4 h-4 text-indigo-600" />
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
