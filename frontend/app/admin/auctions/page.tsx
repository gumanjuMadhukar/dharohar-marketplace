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
      alert(err.response?.data?.message || "Failed to create live auction");
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
        ends_at: editingAuction.ends_at,
        status: editingAuction.status,
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
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <input
            type="text"
            placeholder="Search live auctions by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadAuctions()}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Live Auction</span>
        </button>
      </div>

      {/* Auctions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
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
            <tbody className="divide-y divide-slate-100">
              {auctionsList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No auctions found. Click &quot;Launch Live Auction&quot; to initiate a timed bidding event.
                  </td>
                </tr>
              ) : (
                auctionsList.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-5 flex items-center gap-3">
                      <img
                        src={a.product?.primary_image?.url || a.product?.primary_image?.image_url || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100"}
                        alt={a.title}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900 line-clamp-1">{a.title}</div>
                        <div className="text-[10px] text-slate-400">Artifact: {a.product?.name || "Handcrafted Piece"}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{a.store?.name || "Artisan Guild"}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-bold">NPR {Number(a.starting_price).toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-black text-rose-600">
                      NPR {Number(a.current_price || a.starting_price).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleOpenBids(a)}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition"
                      >
                        <Users className="w-3 h-3" />
                        <span>{a.bids_count || 0} bids</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(a.ends_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          a.status === "active"
                            ? "bg-rose-100 text-rose-800"
                            : a.status === "upcoming"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      <Link
                        href={`/auctions/${a.id}`}
                        target="_blank"
                        className="p-1.5 text-slate-400 hover:text-purple-700 inline-block transition"
                        title="View Public Live Room"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setEditingAuction(a)}
                        className="p-1.5 text-slate-400 hover:text-purple-700 inline-block transition"
                        title="Edit Auction Room"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {a.status === "active" && (
                        <button
                          onClick={() => handleUpdateStatus(a.id, "ended")}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition"
                        >
                          End
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAuction(a.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 inline-block transition"
                        title="Delete Auction Room"
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateAuction}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl my-8 border border-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Gavel className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Launch Live Timed Auction Room</h3>
                  <p className="text-[10px] text-slate-400">Initiate a real-time public bidding event on the marketplace</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm font-bold flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Auction Room Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Bikash Shrestha - 100hr Teak Carved Peacock Window"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Artifact</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:outline-none transition"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Retail: NPR {Number(p.price).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Artisan / Store Host</label>
                <select
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:outline-none transition"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Starting Price (NPR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">NPR</span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="5000"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(e.target.value)}
                    className="w-full pl-12 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reserve Price (Optional NPR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">NPR</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="8000"
                    value={reservePrice}
                    onChange={(e) => setReservePrice(e.target.value)}
                    className="w-full pl-12 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Bid Increment (NPR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">NPR</span>
                  <input
                    type="number"
                    required
                    min="10"
                    value={bidIncrement}
                    onChange={(e) => setBidIncrement(e.target.value)}
                    className="w-full pl-12 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Room Duration</label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white font-medium focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:outline-none transition"
                >
                  <option value="12">12 Hours (Flash Auction)</option>
                  <option value="24">24 Hours (1 Day)</option>
                  <option value="48">48 Hours (2 Days standard)</option>
                  <option value="72">72 Hours (3 Days)</option>
                  <option value="168">7 Days (Exhibition Special)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-[11px] text-amber-900 flex items-center justify-between">
              <span>Auto-Extension Rule:</span>
              <span className="font-bold">5 minutes extension on last-second bids (anti-sniping)</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-black rounded-xl shadow-md shadow-rose-600/20 transition"
              >
                Launch Auction
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editingAuction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleUpdateAuction}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-slate-900">Edit Auction Room</h3>
              <button type="button" onClick={() => setEditingAuction(null)} className="text-slate-400 text-lg font-bold">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingAuction.title}
                  onChange={(e) => setEditingAuction({ ...editingAuction, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Starting Price (NPR)</label>
                <input
                  type="number"
                  required
                  value={editingAuction.starting_price}
                  onChange={(e) => setEditingAuction({ ...editingAuction, starting_price: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reserve Price (NPR)</label>
                <input
                  type="number"
                  value={editingAuction.reserve_price || ""}
                  onChange={(e) => setEditingAuction({ ...editingAuction, reserve_price: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bid Increment (NPR)</label>
                <input
                  type="number"
                  required
                  value={editingAuction.bid_increment}
                  onChange={(e) => setEditingAuction({ ...editingAuction, bid_increment: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Room State</label>
                <select
                  value={editingAuction.status}
                  onChange={(e) => setEditingAuction({ ...editingAuction, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="active">Active Live Room</option>
                  <option value="upcoming">Upcoming Countdown</option>
                  <option value="ended">Ended</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Ends At (UTC/ISO)</label>
                <input
                  type="text"
                  required
                  value={editingAuction.ends_at}
                  onChange={(e) => setEditingAuction({ ...editingAuction, ends_at: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingAuction(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Viewing Bids Modal */}
      {viewingBidsAuction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900">Live Bids Stream</h3>
                <p className="text-[11px] text-slate-400">{viewingBidsAuction.title}</p>
              </div>
              <button type="button" onClick={() => setViewingBidsAuction(null)} className="text-slate-400 text-lg font-bold">
                ✕
              </button>
            </div>

            {bidsLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading bid history...</div>
            ) : auctionBids.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No bids placed in this room yet.</div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {auctionBids.map((b, idx) => (
                  <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-400 text-[10px]">#{idx + 1}</span>
                      <img
                        src={b.user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80"}
                        alt={b.user?.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{b.user?.name || "Anonymous Bidder"}</div>
                        <div className="text-[10px] text-slate-400">{new Date(b.created_at).toLocaleTimeString()}</div>
                      </div>
                    </div>
                    <div className="font-black text-rose-600 text-sm">
                      NPR {Number(b.amount).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingBidsAuction(null)}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
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
