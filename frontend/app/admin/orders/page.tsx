"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Truck,
  CheckCircle,
  Clock,
  Search,
  Eye,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Package,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [updatingTracking, setUpdatingTracking] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/orders?q=${encodeURIComponent(search)}`);
      if (res.data?.data) {
        setOrdersList(res.data.data.data || res.data.data);
      }
    } catch (err: any) {
      console.warn("Failed to load orders:", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, shipping_status: string) => {
    try {
      const res = await api.put(`/admin/orders/${id}`, { shipping_status });
      if (res.data?.success) {
        setOrdersList(ordersList.map((o) => (o.id === id ? { ...o, shipping_status } : o)));
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder({ ...selectedOrder, shipping_status });
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update order");
    }
  };

  const handleUpdatePaymentStatus = async (id: number, payment_status: string) => {
    try {
      const res = await api.put(`/admin/orders/${id}`, { payment_status });
      if (res.data?.success) {
        setOrdersList(ordersList.map((o) => (o.id === id ? { ...o, payment_status } : o)));
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder({ ...selectedOrder, payment_status });
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update payment status");
    }
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdatingTracking(true);
    try {
      const res = await api.post(`/admin/orders/${selectedOrder.id}/tracking`, {
        tracking_number: trackingNumber,
      });
      if (res.data?.success) {
        setSelectedOrder({ ...selectedOrder, tracking_number: trackingNumber });
        setOrdersList(
          ordersList.map((o) => (o.id === selectedOrder.id ? { ...o, tracking_number: trackingNumber } : o))
        );
        alert("Courier tracking number updated.");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update tracking");
    } finally {
      setUpdatingTracking(false);
    }
  };

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setTrackingNumber(order.tracking_number || "");
  };

  return (
    <div className="space-y-4 w-full">
      {/* Search Header */}
      <div className="bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search order tracking #, customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadOrders()}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-600/40 focus:border-purple-600 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>
        <div className="text-xs text-slate-400 font-semibold">
          Total: <span className="text-purple-400 font-bold">{ordersList.length}</span> orders
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Order Tracking #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Shipping Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {ordersList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                ordersList.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-5 font-mono font-bold text-purple-400">
                      {o.order_number}
                      {o.tracking_number && (
                        <div className="text-[10px] text-slate-500 font-normal">Courier: {o.tracking_number}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 font-medium">
                      <div className="font-bold text-white">{o.user?.name || o.shipping_name}</div>
                      <div className="text-[10px] text-slate-400">{o.user?.email || o.shipping_phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-amber-400">
                      NPR {Number(o.total).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={o.payment_status}
                        onChange={(e) => handleUpdatePaymentStatus(o.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border cursor-pointer ${
                          o.payment_status === "paid"
                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                            : o.payment_status === "refunded"
                            ? "bg-red-950/80 text-red-300 border-red-800"
                            : "bg-amber-950/80 text-amber-300 border-amber-800"
                        }`}
                      >
                        <option value="pending" className="bg-slate-900 text-white">Pending</option>
                        <option value="paid" className="bg-slate-900 text-white">Paid</option>
                        <option value="failed" className="bg-slate-900 text-white">Failed</option>
                        <option value="refunded" className="bg-slate-900 text-white">Refunded</option>
                      </select>
                      <div className="text-[10px] text-slate-500 capitalize mt-0.5">{o.payment_method}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={o.shipping_status || "pending"}
                        onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-bold text-slate-300 bg-slate-950 focus:outline-none"
                      >
                        <option value="pending" className="bg-slate-900 text-white">Pending</option>
                        <option value="processing" className="bg-slate-900 text-white">Processing</option>
                        <option value="shipped" className="bg-slate-900 text-white">Shipped</option>
                        <option value="delivered" className="bg-slate-900 text-white">Delivered</option>
                        <option value="cancelled" className="bg-slate-900 text-white">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => openOrderDetails(o)}
                        className="px-3 py-1.5 bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800/80 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-purple-400 font-mono">#{selectedOrder.order_number}</span>
                <h3 className="font-black text-lg text-white">Order Fulfillment Details</h3>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white text-xl font-bold">
                ✕
              </button>
            </div>

            {/* Buyer & Shipping Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Recipient & Buyer</span>
                <div className="font-bold text-white text-sm">{selectedOrder.shipping_name || selectedOrder.user?.name}</div>
                <div className="text-slate-400 flex items-center gap-1.5 pt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedOrder.shipping_email || selectedOrder.user?.email || "—"}</span>
                </div>
                <div className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedOrder.shipping_phone || selectedOrder.user?.phone || "—"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Shipping Destination</span>
                <div className="text-slate-300 flex items-start gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>
                    {selectedOrder.shipping_address || "Ward No. 3, Lalitpur"}, {selectedOrder.shipping_city || "Kathmandu Valley"}, Nepal
                  </span>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <span className="font-bold text-slate-400">Method:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-semibold uppercase text-[10px]">
                    {selectedOrder.payment_method}
                  </span>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">Ordered Artifacts</h4>
              <div className="divide-y divide-slate-800 max-h-60 overflow-y-auto pr-1">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product?.primary_image?.url || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=80"}
                          alt={item.product_name}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-800"
                        />
                        <div>
                          <div className="font-bold text-white">{item.product_name || item.product?.name}</div>
                          <div className="text-[10px] text-slate-500">
                            Merchant: {item.store?.name || "Artisan Guild"} • Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-amber-400">
                          NPR {Number(item.price * item.quantity).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          NPR {Number(item.price).toLocaleString()} / unit
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-slate-500 text-xs">No individual line items parsed.</div>
                )}
              </div>
            </div>

            {/* Total Summary */}
            <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400">Gross Settled Amount:</span>
              <span className="text-lg font-black text-purple-400">
                NPR {Number(selectedOrder.total).toLocaleString()}
              </span>
            </div>

            {/* Courier Tracking Updater */}
            <form onSubmit={handleSaveTracking} className="p-4 bg-slate-950 rounded-2xl border border-purple-900/40 space-y-2">
              <label className="block text-xs font-bold text-purple-300">
                Courier / Dispatch Tracking Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. DHR-EXP-847291-NP"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-white text-xs font-mono focus:border-purple-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={updatingTracking}
                  className="px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {updatingTracking ? "Saving..." : "Update Courier"}
                </button>
              </div>
            </form>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
