"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login, loginAsDemo } = useAuth();
  const [email, setEmail] = useState("admin@dharohar.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("expired")) {
        setNotice("Your session has expired. Please sign in again to continue.");
      }
      const red = params.get("redirect");
      if (red) {
        setRedirectPath(red);
      }
    }
  }, []);

  const routeAfterLogin = (user: any) => {
    if (redirectPath) {
      window.location.href = redirectPath;
      return;
    }
    if (user?.account_type === "admin" || user?.email === "admin@dharohar.com") {
      window.location.href = "/admin/dashboard";
    } else if (user?.account_type === "staff") {
      window.location.href = "/staff/dashboard";
    } else if (user?.account_type === "owner") {
      window.location.href = "/owner/dashboard";
    } else if (user?.account_type === "creator") {
      window.location.href = "/creator/dashboard";
    } else if (user?.account_type === "student") {
      window.location.href = "/student/dashboard";
    } else if (user?.account_type === "seller" || user?.account_type === "manufacturer") {
      window.location.href = "/seller/dashboard";
    } else {
      window.location.href = "/account";
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data?.success && res.data.token && res.data.user) {
        login(res.data.token, res.data.user);
        routeAfterLogin(res.data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: "admin" | "staff" | "owner" | "artisan" | "creator" | "student" | "buyer") => {
    setLoading(true);
    setError(null);
    try {
      const ok = await loginAsDemo(role);
      if (ok) {
        if (role === "admin") {
          window.location.href = redirectPath || "/admin/dashboard";
        } else if (role === "staff") {
          window.location.href = redirectPath || "/staff/dashboard";
        } else if (role === "owner") {
          window.location.href = redirectPath || "/owner/dashboard";
        } else if (role === "creator") {
          window.location.href = redirectPath || "/creator/dashboard";
        } else if (role === "student") {
          window.location.href = redirectPath || "/student/dashboard";
        } else if (role === "artisan") {
          window.location.href = redirectPath || "/seller/dashboard";
        } else {
          window.location.href = redirectPath || "/account";
        }
      } else {
        setError("Unable to authenticate demo account. Please check backend connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl p-8 border border-nepal-gold/30 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-nepal-crimson text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md">
            ध
          </div>
          <h1 className="text-2xl font-black text-nepal-earth">Welcome Back</h1>
          <p className="text-xs text-gray-500">
            Sign in to access your creator dashboard, bids, or orders.
          </p>
        </div>

        {notice && (
          <div className="p-3 bg-amber-50 text-amber-800 text-xs font-semibold rounded-xl flex items-center gap-2 border border-amber-200">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Accounts Grid */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
          <div className="font-bold text-slate-800 text-[11px] flex items-center justify-between">
            <span>Instant 1-Click Demo Sign-In:</span>
            <span className="text-[10px] text-purple-700 uppercase font-black tracking-wide">Live Demo</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo("admin")}
              className="px-2.5 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl font-bold text-[11px] text-left transition border border-purple-200/60"
            >
              👑 SuperAdmin
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo("staff")}
              className="px-2.5 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 rounded-xl font-bold text-[11px] text-left transition border border-indigo-200/60"
            >
              🛡️ Staff & Ops
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo("owner")}
              className="px-2.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-bold text-[11px] text-left transition border border-emerald-200/60"
            >
              🏛️ Gallery Owner
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo("artisan")}
              className="px-2.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold text-[11px] text-left transition border border-amber-200/60"
            >
              🪵 Master Artisan
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo("creator")}
              className="px-2.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-xl font-bold text-[11px] text-left transition border border-rose-200/60"
            >
              🎨 Heritage Creator
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo("student")}
              className="px-2.5 py-2 bg-teal-100 hover:bg-teal-200 text-teal-900 rounded-xl font-bold text-[11px] text-left transition border border-teal-200/60"
            >
              🎓 Student (3%)
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo("buyer")}
              className="col-span-2 px-2.5 py-2 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl font-bold text-[11px] text-center transition border border-blue-200/60"
            >
              🛍️ Collector / Buyer (Live Bidding)
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-nepal-earth mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-nepal-earth mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-nepal-crimson hover:bg-nepal-crimsonDark text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dharohar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500">
          Don’t have an account yet?{" "}
          <Link href="/register" className="text-nepal-crimson font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
