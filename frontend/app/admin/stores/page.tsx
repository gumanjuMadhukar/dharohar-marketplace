"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Store,
  ShieldCheck,
  Search,
  CheckCircle,
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  Percent,
} from "lucide-react";
import Link from "next/link";

export default function AdminStoresPage() {
  const [storesList, setStoresList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Edit Store Modal
  const [editingStore, setEditingStore] = useState<any>(null);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/stores?q=${encodeURIComponent(search)}`);
      if (res.data?.data) {
        setStoresList(res.data.data.data || res.data.data);
      }
    } catch (err: any) {
      console.warn("Failed to load stores:", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerify = async (id: number) => {
    try {
      const res = await api.post(`/admin/stores/${id}/verify`);
      if (res.data?.success) {
        setStoresList(
          storesList.map((s) => (s.id === id ? { ...s, is_verified: res.data.store.is_verified } : s))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;
    try {
      const res = await api.put(`/admin/stores/${editingStore.id}`, {
        name: editingStore.name,
        city: editingStore.city,
        phone: editingStore.phone,
        email: editingStore.email,
        commission_rate: Number(editingStore.commission_rate),
        description: editingStore.description,
        is_verified: editingStore.is_verified,
        is_active: editingStore.is_active,
      });

      if (res.data?.success) {
        setEditingStore(null);
        loadStores();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update store");
    }
  };

  const handleDeleteStore = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this store and all associated catalog items?")) return;
    try {
      await api.delete(`/admin/stores/${id}`);
      setStoresList(storesList.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Search Header */}
      <div className="bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search store name, city, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadStores()}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-600/40 focus:border-purple-600 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>
        <div className="text-xs text-slate-400 font-semibold">
          Registered Stores: <span className="text-purple-400 font-bold">{storesList.length}</span>
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Store Brand</th>
                <th className="py-3.5 px-4">Owner Artisan</th>
                <th className="py-3.5 px-4">Region / City</th>
                <th className="py-3.5 px-4">Catalog Items</th>
                <th className="py-3.5 px-4">Commission</th>
                <th className="py-3.5 px-4">Trust Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {storesList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No artisan stores registered.
                  </td>
                </tr>
              ) : (
                storesList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-5 flex items-center gap-3">
                      <img
                        src={s.logo || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100"}
                        alt={s.name}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-800"
                      />
                      <div>
                        <div className="font-bold text-white">{s.name}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{s.description || "Authentic Nepali Workshop"}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="font-bold text-white">{s.user?.name || "Merchant"}</div>
                      <div className="text-[10px] text-slate-400">{s.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span>{s.city || "Kathmandu Valley"}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-purple-400">{s.products_count || 0} items</td>
                    <td className="py-3.5 px-4 font-black text-amber-400">{s.commission_rate || 10}%</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleVerify(s.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition ${
                          s.is_verified
                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-800 hover:bg-emerald-900"
                            : "bg-amber-950/80 text-amber-300 border-amber-800 hover:bg-amber-900"
                        }`}
                        title="Click to toggle verified guild status"
                      >
                        {s.is_verified ? "Verified Artisan" : "Pending Verification"}
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1 whitespace-nowrap">
                      <Link
                        href={`/stores/${s.slug}`}
                        target="_blank"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg inline-block transition"
                        title="View Public Storefront"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setEditingStore(s)}
                        className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded-lg inline-block transition"
                        title="Edit Store Profile & Commission"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStore(s.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg inline-block transition"
                        title="Delete Store"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Store Modal */}
      {editingStore && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleUpdateStore}
            className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-sm text-white">Manage Store: {editingStore.name}</h3>
              <button type="button" onClick={() => setEditingStore(null)} className="text-slate-400 hover:text-white text-lg font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Store Brand Name</label>
                <input
                  type="text"
                  required
                  value={editingStore.name}
                  onChange={(e) => setEditingStore({ ...editingStore, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={editingStore.city || ""}
                    onChange={(e) => setEditingStore({ ...editingStore, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={editingStore.commission_rate || 10}
                    onChange={(e) => setEditingStore({ ...editingStore, commission_rate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={editingStore.phone || ""}
                    onChange={(e) => setEditingStore({ ...editingStore, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={editingStore.email || ""}
                    onChange={(e) => setEditingStore({ ...editingStore, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">About / Bio</label>
                <textarea
                  rows={3}
                  value={editingStore.description || ""}
                  onChange={(e) => setEditingStore({ ...editingStore, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingStore.is_verified}
                    onChange={(e) => setEditingStore({ ...editingStore, is_verified: e.target.checked })}
                  />
                  <span>Verified Guild Badge</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingStore.is_active}
                    onChange={(e) => setEditingStore({ ...editingStore, is_active: e.target.checked })}
                  />
                  <span>Store Active</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingStore(null)}
                className="px-4 py-2 border border-slate-800 bg-slate-950 text-slate-400 hover:text-white text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                Save Store Profile
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
