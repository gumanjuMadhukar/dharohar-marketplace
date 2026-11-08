"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  Gavel,
  Search,
  User as UserIcon,
  Sparkles,
  LogOut,
  Store,
  Shield,
  Menu,
  X,
  Radio,
  Briefcase,
  Palette,
  Layers,
  ChevronDown,
} from "lucide-react";

export const Navbar = () => {
  const { user, logout, loginAsDemo } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-nepal-gold/20 shadow-sm w-full">
      {/* Top Notice Bar */}
      <div className="bg-gradient-to-r from-nepal-crimson via-nepal-crimsonDark to-nepal-earth text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 text-center font-medium tracking-wide flex justify-center items-center gap-1.5 sm:gap-2 overflow-hidden">
        <Sparkles className="w-3.5 h-3.5 text-nepal-gold flex-shrink-0" />
        <span className="hidden sm:inline">
          Dharohar: Celebrating Nepal’s Heritage & Empowering Young Student Creators
        </span>
        <span className="sm:hidden truncate">
          Celebrating Nepal’s Heritage & Student Creators
        </span>
        <span className="hidden md:inline bg-nepal-gold text-nepal-earth px-2 py-0.5 rounded-full font-bold ml-2 flex-shrink-0">
          3% Student Commission
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-nepal-crimson to-nepal-gold flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl shadow-md transform group-hover:scale-105 transition-all flex-shrink-0">
              ध
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black tracking-tight text-nepal-earth flex items-center gap-1.5">
                <span>Dharohar</span>
                <span className="text-[10px] sm:text-xs bg-nepal-gold/20 text-nepal-crimson px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  धरोहर
                </span>
              </div>
              <p className="hidden xs:block text-[9px] sm:text-[10px] text-gray-500 font-medium tracking-wider uppercase truncate">
                Artisans & Youth Marketplace
              </p>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md relative items-center"
          >
            <input
              type="text"
              placeholder="Search woodcraft, pashmina, student ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-nepal-parchment pl-10 pr-4 py-2.5 rounded-full border border-nepal-gold/30 text-sm focus:outline-none focus:ring-2 focus:ring-nepal-crimson transition"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
          </form>

          {/* Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold text-nepal-earth">
            <Link
              href="/marketplace"
              className="hover:text-nepal-crimson transition flex items-center gap-1"
            >
              Marketplace
            </Link>
            <Link
              href="/auctions"
              className="hover:text-nepal-crimson transition flex items-center gap-1 text-gray-700"
            >
              <Gavel className="w-4 h-4 text-nepal-gold" />
              <span>Auction Hall</span>
            </Link>
            <Link
              href="/live"
              className="hover:text-nepal-crimson transition flex items-center gap-1.5 text-red-600 font-bold bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-full border border-red-200/60"
            >
              <Radio className="w-4 h-4 text-red-600 animate-pulse" />
              <span>Live Bidding</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
            </Link>
            <Link
              href="/marketplace?student_made=true"
              className="hover:text-nepal-crimson transition text-amber-700 font-bold"
            >
              Student Creators
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 sm:p-2.5 rounded-full hover:bg-nepal-gold/10 transition text-nepal-earth"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-nepal-crimson" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-nepal-crimson text-white text-[10px] sm:text-[11px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth Button or User Menu */}
            {user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-nepal-gold/10 transition"
                  title="My Profile & Security"
                >
                  <img
                    src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                    alt={user.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-nepal-gold/50 flex-shrink-0"
                  />
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-bold text-nepal-earth leading-tight">{user.name}</div>
                    <div className="text-[10px] text-nepal-crimson font-medium capitalize">
                      {user.account_type}
                    </div>
                  </div>
                </Link>

                {/* Role-Specific Portal Button (Desktop) */}
                {user.account_type === "admin" && (
                  <Link
                    href="/admin"
                    className="hidden sm:inline-flex px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-xs font-bold items-center gap-1 transition"
                    title="Platform Admin Panel"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Admin Panel</span>
                  </Link>
                )}

                {user.account_type === "staff" && (
                  <Link
                    href="/staff"
                    className="hidden sm:inline-flex px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 rounded-xl text-xs font-bold items-center gap-1 transition"
                    title="Staff Desk & Moderation"
                  >
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden md:inline">Staff Desk</span>
                  </Link>
                )}

                {user.account_type === "owner" && (
                  <Link
                    href="/owner"
                    className="hidden sm:inline-flex px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold items-center gap-1 transition"
                    title="Enterprise Gallery Owner Suite"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="hidden md:inline">Owner Suite</span>
                  </Link>
                )}

                {user.account_type === "creator" && (
                  <Link
                    href="/creator"
                    className="hidden sm:inline-flex px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold items-center gap-1 transition"
                    title="Creator Atelier & Studio"
                  >
                    <Palette className="w-3.5 h-3.5 text-amber-700" />
                    <span className="hidden md:inline">Creator Atelier</span>
                  </Link>
                )}

                {user.account_type === "student" && (
                  <Link
                    href="/student/dashboard"
                    className="hidden sm:inline-flex px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-black items-center gap-1 transition"
                    title="Student Creator Studio"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-nepal-crimson" />
                    <span className="hidden md:inline">Student Studio</span>
                  </Link>
                )}

                {(user.account_type === "seller" || user.account_type === "manufacturer") && (
                  <Link
                    href="/seller/dashboard"
                    className="hidden sm:inline-flex px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded-xl text-xs font-bold items-center gap-1 transition"
                    title="Store & Product Manager"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Seller Dashboard</span>
                  </Link>
                )}

                {user.account_type === "customer" && (
                  <Link
                    href="/account"
                    className="hidden sm:inline-flex px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold items-center gap-1 transition"
                    title="My Orders & Bids"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">My Orders</span>
                  </Link>
                )}

                {/* Quick Role Switcher Pill */}
                <div className="relative">
                  <button
                    onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                    className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition"
                    title="Quick Role Switcher"
                  >
                    <Layers className="w-3 h-3 text-nepal-crimson" />
                    <span>Role: <strong className="capitalize">{user.account_type}</strong></span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>

                  {roleSwitcherOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-extrabold text-gray-400">
                        Switch Active Role (RBAC)
                      </div>
                      {[
                        { role: "admin", label: "Super Admin", portal: "/admin", color: "text-purple-700" },
                        { role: "staff", label: "Staff Operations", portal: "/staff", color: "text-indigo-700" },
                        { role: "owner", label: "Gallery Owner", portal: "/owner", color: "text-emerald-700" },
                        { role: "artisan", label: "Master Artisan / Seller", portal: "/seller/dashboard", color: "text-orange-700" },
                        { role: "creator", label: "Heritage Creator", portal: "/creator", color: "text-amber-700" },
                        { role: "student", label: "Student Innovator (3%)", portal: "/student/dashboard", color: "text-pink-700" },
                        { role: "buyer", label: "Customer / Collector", portal: "/account", color: "text-blue-700" },
                      ].map((item) => (
                        <button
                          key={item.role}
                          onClick={async () => {
                            setRoleSwitcherOpen(false);
                            await loginAsDemo(item.role as any);
                            window.location.href = item.portal;
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center justify-between transition"
                        >
                          <span className={`font-semibold ${item.color}`}>{item.label}</span>
                          <span className="text-[10px] text-gray-400">Go →</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={logout}
                  className="hidden md:inline-flex p-2 text-gray-500 hover:text-red-600 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/login"
                  className="text-xs font-bold text-nepal-earth hover:text-nepal-crimson px-2 sm:px-3 py-1.5 sm:py-2 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex text-xs font-bold bg-nepal-crimson hover:bg-nepal-crimsonDark text-white px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-md transition whitespace-nowrap"
                >
                  Join as Creator
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative pb-2">
            <input
              type="text"
              placeholder="Search woodcraft, pashmina, student ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-nepal-parchment pl-9 pr-4 py-2 rounded-xl border border-nepal-gold/30 text-xs focus:outline-none focus:ring-2 focus:ring-nepal-crimson"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </form>

          <Link
            href="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-nepal-earth hover:text-nepal-crimson"
          >
            Marketplace
          </Link>
          <Link
            href="/auctions"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-2 text-sm font-semibold text-nepal-crimson"
          >
            <span className="flex items-center gap-1.5">
              <Gavel className="w-4 h-4" />
              <span>Auction Hall (Live Bidding)</span>
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
          </Link>
          <Link
            href="/live"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-2 text-sm font-bold text-red-600 bg-red-50 px-2.5 rounded-lg border border-red-200/50"
          >
            <span className="flex items-center gap-1.5">
              <Radio className="w-4 h-4 animate-pulse text-red-600" />
              <span>Live Bidding Rooms</span>
            </span>
            <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-extrabold uppercase">
              Live
            </span>
          </Link>
          <Link
            href="/marketplace?student_made=true"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-amber-700"
          >
            Student & Youth Creators
          </Link>

          {!user ? (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 text-xs font-bold bg-nepal-crimson text-white rounded-xl shadow transition"
              >
                Join as Creator
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 text-xs font-bold text-nepal-earth border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                Sign In to Account
              </Link>
            </div>
          ) : (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                Account & Portals
              </div>
              {user.account_type === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-sm font-bold bg-purple-50 text-purple-700"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Control Panel</span>
                </Link>
              )}
              {user.account_type === "student" && (
                <Link
                  href="/student/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-sm font-bold bg-amber-50 text-amber-800"
                >
                  <Sparkles className="w-4 h-4 text-nepal-crimson" />
                  <span>Student Creator Studio</span>
                </Link>
              )}
              {(user.account_type === "seller" || user.account_type === "manufacturer") && (
                <Link
                  href="/seller/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-sm font-bold bg-amber-50 text-amber-800"
                >
                  <Store className="w-4 h-4" />
                  <span>Seller Dashboard</span>
                </Link>
              )}
              {user.account_type === "customer" && (
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-sm font-bold bg-gray-50 text-nepal-earth"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>My Orders & Bids</span>
                </Link>
              )}
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <UserIcon className="w-4 h-4" />
                <span>Profile & Security</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
