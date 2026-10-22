"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Boxes,
  Search,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  ArrowUpDown,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export default function SellerInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [restockQty, setRestockQty] = useState("");
  const [threshold, setThreshold] = useState("5");
  const [skuCode, setSkuCode] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/seller/inventory?q=${encodeURIComponent(search)}`);
      if (res.data?.data) {
        setProducts(res.data.data.data || res.data.data);
      }
    } catch (err: any) {
      console.warn("Failed to load inventory:", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRestock = (item: any) => {
    setEditingItem(item);
    setRestockQty(item.quantity.toString());
    setThreshold((item.low_stock_threshold || 5).toString());
    setSkuCode(item.sku || "");
  };

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    try {
      const res = await api.put(`/seller/inventory/${editingItem.id}`, {
        quantity: Number(restockQty),
        low_stock_threshold: Number(threshold),
        sku: skuCode,
      });

      if (res.data?.success) {
        setProducts(
          products.map((p) =>
            p.id === editingItem.id
              ? {
                  ...p,
                  quantity: Number(restockQty),
                  low_stock_threshold: Number(threshold),
                  sku: skuCode,
                  stock_status:
                    Number(restockQty) <= 0
                      ? "out_of_stock"
                      : Number(restockQty) <= Number(threshold)
                      ? "low_stock"
                      : "in_stock",
                }
              : p
          )
        );
        setEditingItem(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update inventory");
    } finally {
      setSaving(false);
    }
  };

  // Metrics
  const totalItems = products.length;
  const lowStock = products.filter((p) => p.stock_status === "low_stock").length;
  const outOfStock = products.filter((p) => p.stock_status === "out_of_stock").length;
  const totalValuation = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);

  return (
    <div className="space-y-6">
      {/* 4 KPI Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-slate-400 font-bold uppercase text-[10px]">Total Active SKUs</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalItems}</div>
            <div className="text-[11px] text-slate-500">Tracked in Workshop</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-slate-400 font-bold uppercase text-[10px]">Inventory Valuation</div>
            <div className="text-2xl font-black text-amber-700 mt-1">NPR {totalValuation.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500">Total Stock Asset Value</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-slate-400 font-bold uppercase text-[10px]">Low Stock Warning</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{lowStock}</div>
            <div className="text-[11px] text-amber-700">Near Depletion Threshold</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-slate-400 font-bold uppercase text-[10px]">Depleted / Out of Stock</div>
            <div className="text-2xl font-black text-red-600 mt-1">{outOfStock}</div>
            <div className="text-[11px] text-red-700">Needs Immediate Restock</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Top Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by artifact title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadInventory()}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Artifact Listing</th>
                <th className="py-3.5 px-4">SKU Identifier</th>
                <th className="py-3.5 px-4">Unit Price</th>
                <th className="py-3.5 px-4">Stock In-Hand</th>
                <th className="py-3.5 px-4">Threshold Alert</th>
                <th className="py-3.5 px-4">Health Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-5 flex items-center gap-3">
                      <img
                        src={p.primary_image?.url || p.primary_image?.image_url || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100"}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.category?.name || "Artifact"}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 text-[11px]">
                      {p.sku || "DHR-UNASSIGNED"}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      NPR {Number(p.price).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-base font-black text-slate-900">{p.quantity}</span>
                      <span className="text-[10px] text-slate-400 ml-1">units</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      At &le; {p.low_stock_threshold || 5} units
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.stock_status === "in_stock"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.stock_status === "low_stock"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {p.stock_status === "in_stock"
                          ? "Healthy Stock"
                          : p.stock_status === "low_stock"
                          ? "Low Stock Warning"
                          : "Depleted"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleOpenRestock(p)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Restock / Edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveStock}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900">Restock & Inventory Control</h3>
                <p className="text-[11px] text-slate-400">{editingItem.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SKU Barcode / Code</label>
              <input
                type="text"
                value={skuCode}
                onChange={(e) => setSkuCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">In-Stock Quantity</label>
              <input
                type="number"
                required
                min="0"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-base font-bold text-slate-900"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockQty((Number(restockQty) + 5).toString())}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => setRestockQty((Number(restockQty) + 10).toString())}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                >
                  +10
                </button>
                <button
                  type="button"
                  onClick={() => setRestockQty((Number(restockQty) + 25).toString())}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                >
                  +25
                </button>
                <button
                  type="button"
                  onClick={() => setRestockQty((Number(restockQty) + 50).toString())}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                >
                  +50
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                required
                min="0"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Triggers visual warning when inventory drops to or below this level.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50"
              >
                {saving ? "Saving..." : "Update Stock"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

