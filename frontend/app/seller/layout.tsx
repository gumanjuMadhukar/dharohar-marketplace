"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { DashboardShell, NavSection } from "@/components/admin/DashboardShell";
import {
  TrendingUp,
  Package,
  Plus,
  Gavel,
  Truck,
  Wallet,
  Settings,
  Store,
  User as UserIcon,
  Loader2,
  Sparkles,
  Boxes,
  Users,
  Receipt,
  Tag,
  Star,
} from "lucide-react";
import Link from "next/link";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading, loginAsDemo } = useAuth();
  const [storeData, setStoreData] = useState<any>(null);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [autoSigningIn, setAutoSigningIn] = useState(false);

  useEffect(() => {
    if (token && user) {
      api.get("/seller/store").then((res) => {
        if (res.data?.store) setStoreData(res.data.store);
      }).catch(() => {});

      api.get("/seller/stats").then((res) => {
        if (res.data?.stats) {
          setProductsCount(res.data.stats.products_count || 0);
          setOrdersCount(res.data.stats.total_sales || 0);
        }
      }).catch(() => {});
    }
  }, [token, user]);

  const handleDemoSignIn = async () => {
    setAutoSigningIn(true);
    try {
      await loginAsDemo("artisan");
    } finally {
      setAutoSigningIn(false);
    }
  };

  const navSections: NavSection[] = [
    {
      title: "Catalog & Operations",
      items: [
        { id: "dashboard", label: "Dashboard", icon: TrendingUp, href: "/seller/dashboard" },
        { id: "products", label: "Product Catalog", icon: Package, href: "/seller/products", badge: productsCount },
        { id: "create_product", label: "Publish Artifact", icon: Plus, href: "/seller/products/create" },
        { id: "inventory", label: "Inventory & Stocks", icon: Boxes, href: "/seller/inventory" },
        { id: "orders", label: "Order Fulfillment", icon: Truck, href: "/seller/orders", badge: ordersCount },
        { id: "auctions", label: "Live Auctions", icon: Gavel, href: "/seller/auctions" },
      ],
    },
    {
      title: "Customers & Marketing",
      items: [
        { id: "customers", label: "Customer CRM", icon: Users, href: "/seller/customers" },
        { id: "coupons", label: "Store Coupons", icon: Tag, href: "/seller/coupons" },
        { id: "reviews", label: "Customer Reviews", icon: Star, href: "/seller/reviews" },
      ],
    },
    {
      title: "Finances & Storefront",
      items: [
        { id: "billings", label: "Billings & Invoices", icon: Receipt, href: "/seller/billings" },
        { id: "payouts", label: "Earnings & Wallets", icon: Wallet, href: "/seller/payouts" },
        { id: "settings", label: "Store Settings", icon: Settings, href: "/seller/settings" },
        { id: "profile", label: "Artisan Profile", icon: UserIcon, href: "/seller/profile" },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white font-black text-2xl shadow-xl animate-pulse">
            ध
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Loading artisan studio...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Store className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-white tracking-tight">Artisan Studio Access</h2>
            <p className="text-xs text-slate-400">
              Sign in to manage your workshop catalog, inventory, timed auctions, and wallet payouts.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleDemoSignIn}
              disabled={autoSigningIn}
              className="w-full py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {autoSigningIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Quick Sign-In as Master Artisan</span>
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
      role="seller"
      title={storeData?.name || `${user.name}’s Studio`}
      subtitle="Artisan storefront, inventory management, live auction rooms, and direct wallet payouts"
      navSections={navSections}
    >
      {children}
    </DashboardShell>
  );
}
