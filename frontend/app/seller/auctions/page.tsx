"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Gavel,
  Clock,
  Plus,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Flame,
  Users,
  Eye,
  XCircle,
  Calendar,
  Layers,
} from "lucide-react";
import Link from "next/link";

export default function SellerAuctionsPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [storeId, setStoreId] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [auctionTitle, setAuctionTitle] = useState("");
  const [auctionStartPrice, setAuctionStartPrice] = useState("");
  const [auctionIncrement, setAuctionIncrement] = useState("500");
  const [auctionHours, setAuctionHours] = useState("48");
  const [auctionProdId, setAuctionProdId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Inspect Bids Modal
  const [inspectAuction, setInspectAuction] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, storeRes, aucRes] = await Promise.allSettled([
        api.get("/seller/products"),
        api.get("/seller/store"),
        api.get("/seller/auctions"),
      ]);

      if (prodRes.status === "fulfilled" && prodRes.value.data?.data) {
        const list = prodRes.value.data.data.data || prodRes.value.data.data;
        setProducts(list);
        if (list[0]) setAuctionProdId(list[0].id.toString());
      }

      if (storeRes.status === "fulfilled" && storeRes.value.data?.store) {
        setStoreId(storeRes.value.data.store.id);
      }

      if (aucRes.status === "fulfilled" && aucRes.value.data?.data) {
        setAuctions(aucRes.value.data.data);
      }
    } catch (err) {
      console.warn("Failed to load seller auctions data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const now = new Date();
      const ends = new Date(now.getTime() + Number(auctionHours) * 60 * 60 * 1000);

      const payload = {
        store_id: storeId,
        product_id: Number(auctionProdId),
        title: auctionTitle.trim(),
        description: "Timed live auction organized on Dharohar.",
        starting_price: Number(auctionStartPrice),
        bid_increment: Number(auctionIncrement),
        starts_at: now.toISOString(),
        ends_at: ends.toISOString(),
        auto_extend: true,
      };

      const res = await api.post("/auctions", payload);
      if (res.data?.success) {
        setSuccessMsg("Live Timed Auction launched successfully!");
        setAuctionTitle("");
        setAuctionStartPrice("");
        setIsModalOpen(false);
        // Refresh auctions list
        loadData();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to launch auction.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAuction = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this auction? It can only be cancelled if zero bids have been submitted.")) {
      return;
    }
    try {
      const res = await api.post(`/seller/auctions/${id}/cancel`);
      if (res.data?.success) {
        alert("Auction cancelled.");
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to cancel auction.");
    }
  };

  const activeAuctions = auctions.filter((a) => a.status === "active");
  const totalBidsReceived = auctions.reduce((sum, a) => sum + (a.bids_count || 0), 0);
  const highestCurrentBid = Math.max(
    0,
    ...auctions.map((a) => Number(a.current_price || a.starting_price || 0))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Gavel className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Live Timed Auctions Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Host live timed bidding events for your rarest heritage artifacts with real-time bidding and anti-sniping protection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/auctions"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-nepal-crimson text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>Public Auction Hall</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-nepal-crimson text-white font-bold text-xs hover:brightness-110 shadow-md shadow-amber-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Timed Auction</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Active Bidding Rooms
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <span>{activeAuctions.length}</span>
            {activeAuctions.length > 0 && (
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Flame className="w-3 h-3 text-emerald-500" /> Live Now
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Accepting collector bids</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Bids Received
          </span>
          <div className="text-2xl font-black text-amber-700 mt-1">{totalBidsReceived}</div>
          <p className="text-[11px] text-slate-500 mt-1">Across all your timed events</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Peak Bidding Valuation
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            NPR {highestCurrentBid.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Highest live price achieved</p>
        </div>
      </div>

      {/* Important Business Rule Notice */}
      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
        <Flame className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold">Artifact Allocation Rule:</div>
          <p className="mt-0.5 text-amber-900">
            When you assign a catalog artifact to an active timed auction, standard fixed-price "Add to Cart" is automatically locked on the public storefront. Collectors are seamlessly directed to place competitive bids inside the Auction Hall.
          </p>
        </div>
      </div>

      {/* Auctions Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-sm text-slate-900">Your Store Auction Listings</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {auctions.length} total events
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading your auctions...</div>
        ) : auctions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Gavel className="w-10 h-10 text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No auctions listed yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Select one of your rare masterpiece artifacts and launch a live timed auction event.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-nepal-crimson text-white font-bold text-xs cursor-pointer hover:bg-nepal-crimsonDark"
            >
              Launch First Auction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Artifact / Title</th>
                  <th className="py-3 px-4">Starting Price</th>
                  <th className="py-3 px-4">Current Highest Bid</th>
                  <th className="py-3 px-4">Total Bids</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Closes At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {auctions.map((auc) => {
                  const isLive = auc.status === "active";
                  return (
                    <tr key={auc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              auc.product?.primary_image?.url ||
                              "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200"
                            }
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{auc.title}</div>
                            <div className="text-[11px] text-slate-400">
                              Catalog: {auc.product?.name || "Artifact"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        NPR {Number(auc.starting_price).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-nepal-crimson">
                        NPR {Number(auc.current_price || auc.starting_price).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setInspectAuction(auc)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 transition cursor-pointer font-bold"
                          title="Inspect live bids"
                        >
                          <Users className="w-3 h-3" />
                          <span>{auc.bids_count || 0} bids</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Active
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full capitalize">
                            {auc.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(auc.ends_at).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/auctions/${auc.id}`}
                            className="p-1.5 text-slate-600 hover:text-nepal-crimson hover:bg-slate-100 rounded-lg transition"
                            title="Open Live Bidding Room"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {isLive && (auc.bids_count === 0 || !auc.bids_count) && (
                            <button
                              onClick={() => handleCancelAuction(auc.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Cancel Auction"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Host New Timed Auction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Launch New Timed Auction</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateAuction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Auction Event Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 18th-Century Gilded Bhairava Mask"
                  value={auctionTitle}
                  onChange={(e) => setAuctionTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catalog Artifact to Auction
                </label>
                <select
                  value={auctionProdId}
                  onChange={(e) => setAuctionProdId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Direct Price: NPR {Number(p.price).toLocaleString()})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Note: Direct instant buy-now for this artifact will be paused while live bidding is active.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Starting Bid Price (NPR)
                  </label>
                  <input
                    type="number"
                    required
                    min="500"
                    placeholder="e.g. 25000"
                    value={auctionStartPrice}
                    onChange={(e) => setAuctionStartPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Minimum Bid Increment (NPR)
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={auctionIncrement}
                    onChange={(e) => setAuctionIncrement(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Auction Duration
                </label>
                <select
                  value={auctionHours}
                  onChange={(e) => setAuctionHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
                >
                  <option value="24">24 Hours (1 Day Flash)</option>
                  <option value="48">48 Hours (2 Days Standard)</option>
                  <option value="72">72 Hours (3 Days Grand)</option>
                  <option value="168">7 Days (Full Week)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-nepal-crimson text-white text-xs font-bold rounded-xl shadow-md hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Launching Live Event..." : "Start Live Timed Auction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Bids Modal */}
      {inspectAuction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Live Bids Stream: {inspectAuction.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectAuction(null)}
                className="text-slate-400 hover:text-slate-800 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {inspectAuction.bids && inspectAuction.bids.length > 0 ? (
                inspectAuction.bids.map((b: any, idx: number) => (
                  <div
                    key={b.id || idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-800 font-bold flex items-center justify-center text-[11px]">
                        {b.user?.name ? b.user.name.charAt(0) : "B"}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{b.user?.name || "Collector"}</div>
                        <div className="text-[10px] text-slate-400">
                          {b.created_at ? new Date(b.created_at).toLocaleTimeString() : "Recent"}
                        </div>
                      </div>
                    </div>
                    <div className="font-mono font-black text-nepal-crimson text-sm">
                      NPR {Number(b.amount).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No bids have been submitted yet. The room is open for bids.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectAuction(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
