"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Gavel,
  Clock,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Users,
  Search,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function AdminAuctionsPage() {
  const [auctionsList, setAuctionsList] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [productId, setProductId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [reservePrice, setReservePrice] = useState("");
  const [bidIncrement, setBidIncrement] = useState("250");
  const [durationHours, setDurationHours] = useState("48");
  const [status, setStatus] = useState("active");

  // Edit Modal
  const [editingAuction, setEditingAuction] = useState<any>(null);

  // Bids Modal
  const [viewingBidsAuction, setViewingBidsAuction] = useState<any>(null);
  const [auctionBids, setAuctionBids] = useState<any[]>([]);
  const [bidsLoading, setBidsLoading] = useState(false);

  useEffect(() => {
    loadMetadata();
    loadAuctions();
  }, []);

  const loadMetadata = async () => {
    try {
      const [prodsRes, storesRes] = await Promise.all([
        api.get("/admin/products?per_page=100"),
        api.get("/admin/stores?per_page=100"),
      ]);
      if (prodsRes.data?.data) {
        const prodArr = prodsRes.data.data.data || prodsRes.data.data;
        setProducts(prodArr);
        if (prodArr[0]) setProductId(prodArr[0].id);
      }
      if (storesRes.data?.data) {
        const storeArr = storesRes.data.data.data || storesRes.data.data;
        setStores(storeArr);
        if (storeArr[0]) setStoreId(storeArr[0].id);
      }
    } catch (e) {
      console.warn("Could not load products or stores metadata", e);
    }
  };

  const loadAuctions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/auctions?q=${encodeURIComponent(search)}`);
      if (res.data?.data) {
        setAuctionsList(res.data.data.data || res.data.data);
      }
    } catch (err: any) {
      console.warn("Failed to load auctions:", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startsAt = new Date();
      const endsAt = new Date(startsAt.getTime() + Number(durationHours) * 60 * 60 * 1000);

      const res = await api.post("/admin/auctions", {
        title,
        product_id: Number(productId),
        store_id: Number(storeId),
        starting_price: Number(startingPrice),
        reserve_price: reservePrice ? Number(reservePrice) : null,
        bid_increment: Number(bidIncrement),
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status,
      });

      if (res.data?.success) {
        setShowCreateModal(false);
        resetForm();
        loadAuctions();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to launch auction");
    }
  };

  const handleUpdateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuction) return;
    try {
      const res = await api.put(`/admin/auctions/${editingAuction.id}`, {
        title: editingAuction.title,
        starting_price: Number(editingAuction.starting_price),
        reserve_price: editingAuction.reserve_price ? Number(editingAuction.reserve_price) : null,
        bid_increment: Number(editingAuction.bid_increment),
        status: editingAuction.status,
        ends_at: editingAuction.ends_at,
      });

      if (res.data?.success) {
        setEditingAuction(null);
        loadAuctions();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update auction");
    }
  };

  const handleOpenBids = async (auction: any) => {
    setViewingBidsAuction(auction);
    setBidsLoading(true);
    try {
      const res = await api.get(`/admin/auctions/${auction.id}/bids`);
      if (res.data?.bids) {
        setAuctionBids(res.data.bids);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Could not retrieve live bids stream");
    } finally {
      setBidsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await api.post(`/admin/auctions/${id}/status`, { status });
      if (res.data?.success) {
        setAuctionsList(auctionsList.map((a) => (a.id === id ? { ...a, status } : a)));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const handleDeleteAuction = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this auction room?")) return;
    try {
      await api.delete(`/admin/auctions/${id}`);
      setAuctionsList(auctionsList.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const resetForm = () => {
    setTitle("");
    setStartingPrice("");
    setReservePrice("");
    setBidIncrement("250");
    setDurationHours("48");
  };

  return (
    <div className="space-y-4 w-full">
      {/* Top Controls */}
      <div className="bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <input
            type="text"
            placeholder="Search live auctions by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadAuctions()}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-red-600/40 focus:border-red-600 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Live Auction</span>
        </button>
      </div>

      {/* Auctions Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Auction Event</th>
                <th className="py-3.5 px-4">Artisan Host</th>
                <th className="py-3.5 px-4">Starting Bid</th>
                <th className="py-3.5 px-4">Current High Bid</th>
                <th className="py-3.5 px-4">Total Bids</th>
                <th className="py-3.5 px-4">Ends At</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {auctionsList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    No active auctions right now. Click &quot;Launch Live Auction&quot; to begin.
                  </td>
                </tr>
              ) : (
                auctionsList.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-5 flex items-center gap-3">
                      <img
                        src={a.product?.primary_image?.url || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100"}
                        alt={a.title}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-800"
                      />
                      <div>
                        <div className="font-bold text-white line-clamp-1">{a.title}</div>
                        <div className="text-[10px] text-slate-400">Increment: NPR {Number(a.bid_increment).toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">{a.store?.name || "Official Guild"}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      NPR {Number(a.starting_price).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-black text-amber-400 font-mono text-sm">
                        NPR {Number(a.current_price || a.starting_price).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleOpenBids(a)}
                        className="px-2.5 py-1 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-300 font-bold text-[11px] inline-flex items-center gap-1 transition"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{a.bids_count || 0} bids</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(a.ends_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={a.status}
                        onChange={(e) => handleUpdateStatus(a.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border cursor-pointer ${
                          a.status === "active"
                            ? "bg-red-950/80 text-red-300 border-red-800"
                            : a.status === "ended"
                            ? "bg-slate-950 text-slate-400 border-slate-800"
                            : "bg-amber-950/80 text-amber-300 border-amber-800"
                        }`}
                      >
                        <option value="active" className="bg-slate-900 text-white">Active</option>
                        <option value="upcoming" className="bg-slate-900 text-white">Upcoming</option>
                        <option value="ended" className="bg-slate-900 text-white">Ended</option>
                        <option value="cancelled" className="bg-slate-900 text-white">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1 whitespace-nowrap">
                      <Link
                        href={`/auctions/${a.id}`}
                        target="_blank"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg inline-block transition"
                        title="Open Live Public Bidding Floor"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => setEditingAuction(a)}
                        className="p-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-950/80 rounded-lg inline-block transition"
                        title="Edit Auction"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAuction(a.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/80 rounded-lg inline-block transition"
                        title="Delete Auction Room"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateAuction}
            className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-red-500" />
                <h3 className="font-black text-sm text-white">Schedule New Live Heritage Auction</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Auction Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Sculptor Lost-Wax Shakyamuni Buddha Live Auction"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-medium focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Select Artifact</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-red-500 focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.name} (Retail: NPR {Number(p.price).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Artisan / Store Host</label>
                <select
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-red-500 focus:outline-none"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Starting Price (NPR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">NPR</span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="5000"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(e.target.value)}
                    className="w-full pl-12 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-semibold focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Reserve Price (Optional NPR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">NPR</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="8000"
                    value={reservePrice}
                    onChange={(e) => setReservePrice(e.target.value)}
                    className="w-full pl-12 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-semibold focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Minimum Bid Increment (NPR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">NPR</span>
                  <input
                    type="number"
                    required
                    min="10"
                    value={bidIncrement}
                    onChange={(e) => setBidIncrement(e.target.value)}
                    className="w-full pl-12 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-semibold focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Room Duration</label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-red-500 focus:outline-none"
                >
                  <option value="12" className="bg-slate-900 text-white">12 Hours (Flash Auction)</option>
                  <option value="24" className="bg-slate-900 text-white">24 Hours (1 Day)</option>
                  <option value="48" className="bg-slate-900 text-white">48 Hours (2 Days standard)</option>
                  <option value="72" className="bg-slate-900 text-white">72 Hours (3 Days)</option>
                  <option value="168" className="bg-slate-900 text-white">7 Days (Exhibition Special)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-amber-900/40 text-[11px] text-amber-300 flex items-center justify-between">
              <span>Auto-Extension Rule:</span>
              <span className="font-bold">5 minutes extension on last-second bids (anti-sniping)</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 border border-slate-800 bg-slate-950 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black rounded-xl shadow-lg transition"
              >
                Launch Auction
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editingAuction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleUpdateAuction}
            className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-sm text-white">Edit Auction Room</h3>
              <button type="button" onClick={() => setEditingAuction(null)} className="text-slate-400 hover:text-white text-lg font-bold">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingAuction.title}
                  onChange={(e) => setEditingAuction({ ...editingAuction, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Starting Price (NPR)</label>
                <input
                  type="number"
                  required
                  value={editingAuction.starting_price}
                  onChange={(e) => setEditingAuction({ ...editingAuction, starting_price: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Reserve Price (NPR)</label>
                <input
                  type="number"
                  value={editingAuction.reserve_price || ""}
                  onChange={(e) => setEditingAuction({ ...editingAuction, reserve_price: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Bid Increment (NPR)</label>
                <input
                  type="number"
                  required
                  value={editingAuction.bid_increment}
                  onChange={(e) => setEditingAuction({ ...editingAuction, bid_increment: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Room State</label>
                <select
                  value={editingAuction.status}
                  onChange={(e) => setEditingAuction({ ...editingAuction, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-red-500 focus:outline-none"
                >
                  <option value="active" className="bg-slate-900 text-white">Active Live Room</option>
                  <option value="upcoming" className="bg-slate-900 text-white">Upcoming Countdown</option>
                  <option value="ended" className="bg-slate-900 text-white">Ended</option>
                  <option value="cancelled" className="bg-slate-900 text-white">Cancelled</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Ends At (UTC/ISO)</label>
                <input
                  type="text"
                  required
                  value={editingAuction.ends_at}
                  onChange={(e) => setEditingAuction({ ...editingAuction, ends_at: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingAuction(null)}
                className="px-4 py-2 border border-slate-800 bg-slate-950 text-slate-400 hover:text-white text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Viewing Bids Modal */}
      {viewingBidsAuction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-sm text-white">Live Bids Stream</h3>
                <p className="text-[11px] text-slate-400">{viewingBidsAuction.title}</p>
              </div>
              <button type="button" onClick={() => setViewingBidsAuction(null)} className="text-slate-400 hover:text-white text-lg font-bold">
                ✕
              </button>
            </div>

            {bidsLoading ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading bid history...</div>
            ) : auctionBids.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No bids placed in this room yet.</div>
            ) : (
              <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto">
                {auctionBids.map((b, idx) => (
                  <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-500 text-[10px]">#{idx + 1}</span>
                      <img
                        src={b.user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80"}
                        alt={b.user?.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-800"
                      />
                      <div>
                        <div className="font-bold text-white">{b.user?.name || "Anonymous Bidder"}</div>
                        <div className="text-[10px] text-slate-500">{new Date(b.created_at).toLocaleTimeString()}</div>
                      </div>
                    </div>
                    <div className="font-black text-amber-400 text-sm">
                      NPR {Number(b.amount).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setViewingBidsAuction(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
              >
                Close Stream
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
