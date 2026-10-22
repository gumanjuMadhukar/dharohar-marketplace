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
      bg: "bg-purple-100 text-purple-900 border-purple-200",
      accent: "text-purple-600",
      activeBg: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20",
    },
    seller: {
      label: "Master Artisan / Seller",
      bg: "bg-amber-100 text-amber-900 border-amber-200",
      accent: "text-amber-600",
      activeBg: "bg-gradient-to-r from-amber-600 to-nepal-crimson text-white shadow-md shadow-amber-500/20",
    },
    student: {
      label: "Youth Student Creator",
      bg: "bg-emerald-100 text-emerald-900 border-emerald-200",
      accent: "text-emerald-600",
      activeBg: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20",
    },
    customer: {
      label: "Valued Collector",
      bg: "bg-blue-100 text-blue-900 border-blue-200",
      accent: "text-blue-600",
      activeBg: "bg-gradient-to-r from-nepal-crimson to-nepal-crimsonDark text-white shadow-md shadow-red-500/20",
    },
  }[role] || {
    label: "User",
    bg: "bg-gray-100 text-gray-800 border-gray-200",
    accent: "text-gray-600",
    activeBg: "bg-nepal-earth text-white",
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
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            aria-label="Toggle Navigation"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-nepal-crimson to-nepal-gold flex items-center justify-center text-white font-extrabold text-lg shadow-sm group-hover:scale-105 transition-transform">
              ध
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-slate-900 text-base tracking-tight">Dharohar</span>
              <span className="text-[10px] font-bold text-nepal-crimson uppercase ml-1 px-1.5 py-0.5 bg-red-50 rounded">
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
              placeholder="Search users, orders, artifacts, auctions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white pl-9 pr-14 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 focus:outline-none transition-all placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <kbd className="absolute right-2.5 top-2 bg-slate-200/70 text-slate-500 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
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
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-nepal-crimson ring-2 ring-white"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-900">Platform Notifications</span>
                  <span className="text-[10px] text-purple-600 font-semibold cursor-pointer">Mark all read</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-purple-50/60 rounded-xl border border-purple-100 text-slate-700">
                    <div className="font-bold text-purple-900">Live Auction Bid Placed</div>
                    <div className="text-[11px] text-slate-500">Mayur Jhyal received NPR 18,500 bid</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl text-slate-700">
                    <div className="font-bold text-slate-800">New Student Registration</div>
                    <div className="text-[11px] text-slate-500">Guardian consent submitted by Sunil B.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          {/* User Profile Pill */}
          <Link
            href={role === "admin" ? "/admin/profile" : role === "seller" ? "/seller/profile" : "/student/profile"}
            className="flex items-center gap-2.5 p-1 sm:pr-3 rounded-full hover:bg-slate-100 transition"
          >
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
              alt={user?.name || "User"}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight line-clamp-1">
                {user?.name || "Dharohar Member"}
              </div>
              <div className="text-[10px] text-slate-400 capitalize font-medium">{role}</div>
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed lg:sticky top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-white border-r border-slate-200/80 p-4 overflow-y-auto transition-transform duration-200 ease-in-out ${
            sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* User Card in Sidebar */}
          <div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100/70 rounded-2xl border border-slate-200/80 mb-5 flex items-center gap-3">
            <div className="relative">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"}
                alt={user?.name || "Admin"}
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">{user?.name || "Authorized Member"}</div>
              <span
                className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${roleBadge.bg}`}
              >
                {roleBadge.label}
              </span>
            </div>
          </div>

          {/* Grouped Nav Menus */}
          <div className="space-y-6">
            {navSections.map((sec, idx) => (
              <div key={idx} className="space-y-1">
                <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
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
                                : item.badgeColor || "bg-purple-100 text-purple-700"
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
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
          <div className="mt-8 pt-4 border-t border-slate-100 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 hover:text-nepal-crimson transition"
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-20 lg:hidden"
          ></div>
        )}

        {/* Main Content Stage */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header Title & Subtitle Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">Environment:</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
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
