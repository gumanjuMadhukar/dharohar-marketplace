"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Package,
  Plus,
  Trash2,
  ExternalLink,
  Flame,
  Gavel,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "direct" | "auction">("all");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/seller/products");
      if (res.data?.data) {
        setProducts(res.data.data.data || res.data.data);
      }
    } catch (err: any) {
      console.warn("Failed to load seller products:", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this product from your inventory?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete product");
    }
  };

  const filteredProducts = products.filter((p) => {
    const isAuction = Boolean(p.is_in_active_auction || p.active_auction);
    if (filterMode === "direct" && isAuction) return false;
    if (filterMode === "auction" && !isAuction) return false;

    if (search.trim()) {
      return (
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category?.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  const totalAuctionItems = products.filter((p) => p.is_in_active_auction || p.active_auction).length;
  const totalLowStock = products.filter((p) => (p.quantity || 0) <= (p.low_stock_threshold || 3)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Package className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Artisan Product Catalog</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your mastercraft creations, pricing, inventory channels, and live auction allocations.
          </p>
        </div>

        <Link
          href="/seller/products/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-nepal-crimson text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/20 hover:brightness-110 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Artifact</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Catalog Listings
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">{products.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Master artisan pieces</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Allocated to Live Auctions
          </span>
          <div className="text-2xl font-black text-amber-700 mt-1 flex items-center gap-2">
            <span>{totalAuctionItems}</span>
            {totalAuctionItems > 0 && (
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-600" /> Bidding Active
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Direct buy-now is locked</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Inventory Health Alert
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {totalLowStock > 0 ? (
              <span className="text-rose-600 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                {totalLowStock} Low Stock
              </span>
            ) : (
              <span className="text-emerald-600 flex items-center gap-1.5 text-base">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Healthy Stocks
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Based on reorder thresholds</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search artifacts by name, category, or SKU..."
            className="bg-transparent border-none text-xs text-slate-700 placeholder-slate-400 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filterMode === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setFilterMode("direct")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filterMode === "direct" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Direct Sale ({products.length - totalAuctionItems})
          </button>
          <button
            onClick={() => setFilterMode("auction")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              filterMode === "auction" ? "bg-white text-amber-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Flame className="w-3 h-3 text-amber-500" />
            <span>In Auction ({totalAuctionItems})</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading catalog artifacts...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Package className="w-10 h-10 text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No artifacts matching filter</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Adjust your search keywords or publishing filters to view listings.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Artifact</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Sales Channel</th>
                  <th className="py-3.5 px-4">Price / Valuation</th>
                  <th className="py-3.5 px-4">Stock Units</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProducts.map((p) => {
                  const isAuction = Boolean(p.is_in_active_auction || p.active_auction);
                  const auctionData = p.active_auction;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-5 flex items-center gap-3">
                        <img
                          src={
                            p.primary_image?.image_url ||
                            p.primary_image?.url ||
                            "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100"
                          }
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                          <div className="text-[10px] text-slate-400">SKU: {p.sku || "DHR-ART-01"}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{p.category?.name || "Handicraft"}</td>
                      <td className="py-3.5 px-4">
                        {isAuction ? (
                          <Link
                            href={`/auctions/${auctionData?.id || ""}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-400 text-amber-800 text-[10px] font-bold"
                          >
                            <Flame className="w-3 h-3 text-amber-600 animate-pulse" />
                            <span>Live Auction</span>
                          </Link>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold">
                            Direct Marketplace
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isAuction ? (
                          <div>
                            <div className="font-black text-nepal-crimson font-mono">
                              NPR {Number(auctionData?.current_price || auctionData?.starting_price || p.price).toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-400">Current Highest Bid</div>
                          </div>
                        ) : (
                          <div className="font-black text-slate-900 font-mono">
                            NPR {Number(p.price).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.quantity <= (p.low_stock_threshold || 3)
                              ? "bg-rose-100 text-rose-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {p.quantity} units
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-2">
                        <Link
                          href={isAuction ? `/auctions/${auctionData?.id}` : `/products/${p.slug}`}
                          className="p-1.5 text-slate-400 hover:text-amber-600 inline-block transition"
                          title={isAuction ? "Open Live Bidding Hall" : "View on Storefront"}
                        >
                          {isAuction ? <Gavel className="w-4 h-4 text-amber-600" /> : <ExternalLink className="w-4 h-4" />}
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 inline-block transition cursor-pointer"
                          title="Delete Artifact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
