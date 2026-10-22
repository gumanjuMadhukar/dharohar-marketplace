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
} from "lucide-react";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-nepal-gold/20 shadow-sm">
      {/* Top Notice Bar */}
      <div className="bg-gradient-to-r from-nepal-crimson via-nepal-crimsonDark to-nepal-earth text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex justify-center items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-nepal-gold" />
        <span>Dharohar: Celebrating Nepal’s Heritage & Empowering Young Student Creators</span>
        <span className="hidden md:inline bg-nepal-gold text-nepal-earth px-2 py-0.5 rounded-full font-bold ml-2">
          3% Student Commission
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-nepal-crimson to-nepal-gold flex items-center justify-center text-white font-extrabold text-2xl shadow-md transform group-hover:scale-105 transition-all">
              ध
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-nepal-earth flex items-center gap-1.5">
                Dharohar
                <span className="text-xs bg-nepal-gold/20 text-nepal-crimson px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  धरोहर
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">
                Artisans & Youth Marketplace
              </p>
            </div>
          </Link>

          {/* Search Bar */}
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

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-nepal-earth">
            <Link
              href="/marketplace"
              className="hover:text-nepal-crimson transition flex items-center gap-1"
            >
              Marketplace
            </Link>
            <Link
              href="/auctions"
              className="hover:text-nepal-crimson transition flex items-center gap-1.5 text-nepal-crimson"
            >
              <Gavel className="w-4 h-4" />
              <span>Auction Hall</span>
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
          <div className="flex items-center gap-3">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-full hover:bg-nepal-gold/10 transition text-nepal-earth"
            >
              <ShoppingBag className="w-5 h-5 text-nepal-crimson" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-nepal-crimson text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth Button or User Menu */}
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/profile"
                  className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl hover:bg-nepal-gold/10 transition"
                  title="My Profile & Security"
                >
                  <img
                    src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-nepal-gold/50"
                  />
                  <div className="text-left">
                    <div className="text-xs font-bold text-nepal-earth leading-tight">{user.name}</div>
                    <div className="text-[10px] text-nepal-crimson font-medium capitalize">
                      {user.account_type}
                    </div>
                  </div>
                </Link>

                {/* Role-Specific Portal Button */}
                {user.account_type === "admin" && (
                  <Link
                    href="/admin"
                    className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                    title="Platform Admin Panel"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Admin Panel</span>
                  </Link>
                )}

                {user.account_type === "student" && (
                  <Link
                    href="/student/dashboard"
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-black flex items-center gap-1 transition"
                    title="Student Creator Studio"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-nepal-crimson" />
                    <span className="hidden md:inline">Student Studio</span>
                  </Link>
                )}

                {(user.account_type === "seller" || user.account_type === "manufacturer") && (
                  <Link
                    href="/seller/dashboard"
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                    title="Store & Product Manager"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Seller Dashboard</span>
                  </Link>
                )}

                {user.account_type === "customer" && (
                  <Link
                    href="/account"
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                    title="My Orders & Bids"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">My Orders</span>
                  </Link>
                )}

                <Link
                  href="/profile"
                  className="p-2 text-gray-500 hover:text-nepal-crimson transition"
                  title="Profile Settings"
                >
                  <UserIcon className="w-4 h-4" />
                </Link>

                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-red-600 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-bold text-nepal-earth hover:text-nepal-crimson px-3 py-2 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-bold bg-nepal-crimson hover:bg-nepal-crimsonDark text-white px-4 py-2.5 rounded-full shadow-md transition"
                >
                  Join as Creator
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3">
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
            className="block py-2 text-sm font-semibold text-nepal-crimson"
          >
            Auction Hall (Live Bidding)
          </Link>
          <Link
            href="/marketplace?student_made=true"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-amber-700"
          >
            Student & Youth Creators
          </Link>
          {user && (
            <div className="pt-2 border-t border-gray-100 space-y-2">
              {user.account_type === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-purple-700"
                >
                  Admin Control Panel
                </Link>
              )}
              {user.account_type === "student" && (
                <Link
                  href="/student/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-amber-700"
                >
                  Student Creator Studio
                </Link>
              )}
              {(user.account_type === "seller" || user.account_type === "manufacturer") && (
                <Link
                  href="/seller/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-amber-700"
                >
                  Seller Dashboard
                </Link>
              )}
              {user.account_type === "customer" && (
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-nepal-earth"
                >
                  My Orders & Bids
                </Link>
              )}
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold text-gray-600"
              >
                Profile & Security Settings
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

