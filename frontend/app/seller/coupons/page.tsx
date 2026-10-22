"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Tag,
  Plus,
  Trash2,
  Calendar,
  Percent,
  DollarSign,
  Copy,
  Check,
  AlertCircle,
  Gift,
  Search,
} from "lucide-react";

export default function SellerCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    code: "",
    type: "percentage",
    value: "10",
    min_order_amount: "500",
    usage_limit: "50",
    expires_at: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get("/seller/coupons");
      if (res.data?.data) {
        setCoupons(res.data.data);
      }
    } catch (err: any) {
      console.warn("Failed to load coupons:", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setErrorMsg("");
    try {
      const res = await api.post("/seller/coupons", {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        min_order_amount: Number(form.min_order_amount),
        usage_limit: Number(form.usage_limit),
        expires_at: form.expires_at,
      });

      if (res.data?.success) {
        setIsModalOpen(false);
        setForm({
          code: "",
          type: "percentage",
          value: "10",
          min_order_amount: "500",
          usage_limit: "50",
          expires_at: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        });
        loadCoupons();
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to create coupon.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm("Are you sure you want to deactivate and remove this promo code?")) return;
    try {
      const res = await api.delete(`/seller/coupons/${id}`);
      if (res.data?.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err: any) {
      alert("Failed to delete coupon: " + (err?.response?.data?.message || err.message));
    }
  };

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Tag className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white">Store Discount Coupons</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Reward loyal patrons, offer festive Dashain/Tihar discounts, or launch introductory offers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Promo Code</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Total Promotional Campaigns
          </span>
          <div className="text-2xl font-black text-white mt-1">{coupons.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Managed discount rules</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Active Store Codes
          </span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {coupons.filter((c) => c.is_active).length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Ready at buyer checkout</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Total Usages Claimed
          </span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {coupons.reduce((sum, c) => sum + (c.times_used || 0), 0)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Redemptions by Nepali buyers</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
        <Search className="w-4 h-4 text-slate-500 ml-1" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search promo code by name (e.g. DASHAIN20)..."
          className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
        />
      </div>

      {/* Coupons Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading discount vouchers...</div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Gift className="w-10 h-10 text-slate-600 mb-3" />
            <h3 className="text-sm font-bold text-slate-200">No promo coupons active</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Create your first promotional discount voucher to boost artisan sales during festivals.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer hover:bg-amber-400"
            >
              Create First Coupon
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount Type</th>
                  <th className="py-3 px-4">Benefit</th>
                  <th className="py-3 px-4">Min Order</th>
                  <th className="py-3 px-4">Usage / Cap</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => handleCopy(coupon.code)}
                          title="Copy Code"
                          className="p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 capitalize">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        {coupon.type === "percentage" ? (
                          <Percent className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        {coupon.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {coupon.type === "percentage"
                        ? `${coupon.value}% OFF`
                        : `NPR ${Number(coupon.value).toLocaleString()} OFF`}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      NPR {Number(coupon.min_order_amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-200">
                          {coupon.times_used || 0} / {coupon.usage_limit || "∞"}
                        </span>
                        <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                ((coupon.times_used || 0) / (coupon.usage_limit || 1)) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {coupon.expires_at
                            ? new Date(coupon.expires_at).toLocaleDateString()
                            : "No expiry"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Create New Promo Voucher</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="E.g. DASHAIN25, NEWARI10"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed NPR Discount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {form.type === "percentage" ? "Percentage Off (%)" : "Flat Discount (NPR)"}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={form.type === "percentage" ? "90" : "50000"}
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Min Order (NPR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.min_order_amount}
                    onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Usage Limit (Redemptions)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.usage_limit}
                    onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs rounded-xl hover:brightness-110 disabled:opacity-50 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  {creating ? "Activating..." : "Publish Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

