"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  Store,
  GraduationCap,
  Package,
  Gavel,
  Users,
  Truck,
  CheckCircle,
  AlertTriangle,
  Settings,
  DollarSign,
  TrendingUp,
  Search,
  Bell,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Plus,
  ExternalLink,
  Sparkles,
  Wallet,
  FileText,
  User,
  Activity,
  Layers,
  HelpCircle,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  badge?: string | number;
  badgeColor?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

interface DashboardShellProps {
  role: "admin" | "seller" | "student" | "customer";
  title: string;
  subtitle: string;
  navSections: NavSection[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  topActions?: React.ReactNode;
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  role,
  title,
  subtitle,
  navSections,
  activeTab,
  onTabChange,
  topActions,
  children,
}) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const roleBadge = {
    admin: {
      label: "Platform SuperAdmin",
      bg: "bg-purple-950/80 text-purple-300 border-purple-800/80",
      accent: "text-purple-400",
      activeBg: "bg-purple-600/25 text-purple-200 border border-purple-500/40 shadow-sm",
    },
    seller: {
      label: "Master Artisan / Seller",
      bg: "bg-amber-950/80 text-amber-300 border-amber-800/80",
      accent: "text-amber-400",
      activeBg: "bg-amber-600/25 text-amber-200 border border-amber-500/40 shadow-sm",
    },
    student: {
      label: "Youth Student Creator",
      bg: "bg-emerald-950/80 text-emerald-300 border-emerald-800/80",
      accent: "text-emerald-400",
      activeBg: "bg-emerald-600/25 text-emerald-200 border border-emerald-500/40 shadow-sm",
    },
    customer: {
      label: "Valued Collector",
      bg: "bg-blue-950/80 text-blue-300 border-blue-800/80",
      accent: "text-blue-400",
      activeBg: "bg-red-600/25 text-red-200 border border-red-500/40 shadow-sm",
    },
  }[role] || {
    label: "User",
    bg: "bg-stone-900 text-stone-300 border-stone-800",
    accent: "text-stone-400",
    activeBg: "bg-stone-800 text-white",
  };

  const isItemActive = (item: NavItem) => {
    if (item.href) {
      if (pathname === item.href) return true;
      if (item.href !== "/admin" && item.href !== "/seller" && item.href !== "/student") {
        return pathname.startsWith(item.href);
      }
    }
    if (activeTab && item.id === activeTab) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans w-full antialiased overflow-x-hidden">
      {/* Top Navbar - Edge to Edge Dark */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 w-full shrink-0 shadow-md">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            aria-label="Toggle Navigation"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-nepal-crimson to-nepal-gold flex items-center justify-center text-white font-extrabold text-base sm:text-lg shadow-sm group-hover:scale-105 transition-transform">
              ध
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-white text-base tracking-tight">Dharohar</span>
              <span className="text-[10px] font-bold text-nepal-crimson uppercase ml-1.5 px-1.5 py-0.5 bg-red-950/80 text-red-300 border border-red-800/80 rounded">
                Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search with Keyboard Shortcut */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search users, orders, artifacts, live rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 hover:bg-slate-900/80 focus:bg-slate-950 pl-9 pr-14 py-2 rounded-xl border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-600/40 focus:border-purple-500 focus:outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <kbd className="absolute right-2.5 top-2 bg-slate-800 text-slate-400 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-slate-700">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {topActions}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-nepal-crimson ring-2 ring-slate-900"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-4 z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-white">Platform Notifications</span>
                  <span className="text-[10px] text-purple-400 font-semibold cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-purple-900/40 text-slate-300">
                    <div className="font-bold text-purple-400">Live Auction Bid Placed</div>
                    <div className="text-[11px] text-slate-400">Mayur Jhyal received NPR 18,500 bid</div>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
                    <div className="font-bold text-white">New Student Registration</div>
                    <div className="text-[11px] text-slate-400">Guardian consent submitted by Sunil B.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block"></div>

          {/* User Profile Pill */}
          <Link
            href={role === "admin" ? "/admin/profile" : role === "seller" ? "/seller/profile" : "/student/profile"}
            className="flex items-center gap-2.5 p-1 sm:pr-3 rounded-xl hover:bg-slate-800 transition"
          >
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
              alt={user?.name || "User"}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-700"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-white leading-tight line-clamp-1">
                {user?.name || "Dharohar Member"}
              </div>
              <div className="text-[10px] text-slate-400 capitalize font-medium">{role}</div>
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/80 rounded-xl transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace Body - Edge to Edge, Zero Whitespace */}
      <div className="flex-1 flex w-full overflow-hidden">
        {/* Sidebar Navigation - Flush Left Dark Theme */}
        <aside
          className={`fixed lg:sticky top-14 sm:top-16 left-0 z-30 w-64 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] bg-slate-900 border-r border-slate-800 p-3 sm:p-4 overflow-y-auto shrink-0 transition-transform duration-200 ease-in-out ${
            sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* User Card in Sidebar */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 mb-5 flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"}
                alt={user?.name || "Admin"}
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{user?.name || "Authorized Member"}</div>
              <span
                className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${roleBadge.bg}`}
              >
                {roleBadge.label}
              </span>
            </div>
          </div>

          {/* Grouped Nav Menus */}
          <div className="space-y-5">
            {navSections.map((sec, idx) => (
              <div key={idx} className="space-y-1">
                <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  {sec.title}
                </div>
                <div className="space-y-1 pt-1">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item);

                    const content = (
                      <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400"}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                              active
                                ? "bg-white/20 text-white"
                                : item.badgeColor || "bg-slate-800 text-slate-300 border border-slate-700"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    );

                    const baseClass = `w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? roleBadge.activeBg
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    }`;

                    if (item.href) {
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={baseClass}
                        >
                          {content}
                        </Link>
                      );
                    }

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (onTabChange) onTabChange(item.id);
                          setSidebarOpen(false);
                        }}
                        className={baseClass}
                      >
                        {content}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Help Footer */}
          <div className="mt-8 pt-4 border-t border-slate-800 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Back to Marketplace</span>
            </Link>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs z-20 lg:hidden"
          ></div>
        )}

        {/* Main Content Stage - Edge to Edge Dark, Zero Gutter Padding */}
        <main className="flex-1 min-w-0 bg-slate-950 overflow-y-auto p-3 sm:p-5 w-full space-y-5">
          {/* Header Title & Subtitle Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{title}</h1>
              <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">Environment:</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                Production-Ready
              </span>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
};
