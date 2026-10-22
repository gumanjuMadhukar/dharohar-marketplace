"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Truck,
  CheckCircle,
  Search,
  Receipt,
  MapPin,
  Phone,
  Mail,
  Package,
  Printer,
  ShieldCheck,
  Send,
  Eye,
} from "lucide-react";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Invoice Modal
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // Dispatch / Tracking Modal
  const [dispatchItem, setDispatchItem] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [dispatching, setDispatching] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/seller/orders");
      if (res.data?.data) {
        setOrders(res.data.data.data || res.data.data);
      }
    } catch (err: any) {
      console.warn("Failed to load seller orders:", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (itemId: number, newStatus: string) => {
    try {
      const res = await api.put(`/seller/orders/${itemId}/status`, { status: newStatus });
      if (res.data?.success) {
        setOrders(orders.map((o) => (o.id === itemId ? { ...o, status: newStatus } : o)));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update item status");
    }
  };

  const handleOpenDispatch = (item: any) => {
    setDispatchItem(item);
    setTrackingNumber(item.tracking_number || "");
  };

  const handleSaveDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchItem) return;
    setDispatching(true);
    try {
      const res = await api.post(`/seller/orders/${dispatchItem.id}/tracking`, {
        tracking_number: trackingNumber,
      });
      if (res.data?.success) {
        setOrders(
          orders.map((o) =>
            o.id === dispatchItem.id ? { ...o, tracking_number: trackingNumber, status: "shipped" } : o
          )
        );
        setDispatchItem(null);
        alert("Courier dispatch tracking attached and status updated to Shipped.");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to attach tracking");
    } finally {
      setDispatching(false);
    }
  };

  const handleViewInvoice = async (itemId: number) => {
    setInvoiceLoading(true);
    try {
      const res = await api.get(`/seller/orders/${itemId}/invoice`);
      if (res.data?.invoice) {
        setInvoiceData(res.data.invoice);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Could not generate invoice");
    } finally {
      setInvoiceLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order?.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      o.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.order?.shipping_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.order?.user?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <input
            type="text"
            placeholder="Search order #, customer, or artifact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {["all", "pending", "processing", "shipped", "delivered"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                statusFilter === st
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Artifact Item</th>
                <th className="py-3.5 px-4">Customer & Delivery Details</th>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Net Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Shipment Status</th>
                <th className="py-3.5 px-5 text-right">Fulfillment Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No orders matching criteria. Incoming purchases will populate here.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-5 flex items-center gap-3">
                      <img
                        src={o.product?.primary_image?.url || o.product?.primary_image?.image_url || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100"}
                        alt={o.name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900 line-clamp-1">{o.name || o.product?.name}</div>
                        <div className="text-[10px] text-slate-400">Qty: {o.quantity} unit(s) • SKU: {o.sku || "DHR-ART"}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800">
                      <div className="font-bold">{o.order?.shipping_name || o.order?.user?.name || "Verified Customer"}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{o.order?.shipping_phone || o.order?.user?.phone || "—"}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{o.order?.shipping_address || "Kathmandu Valley"}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-amber-700">{o.order?.order_number || `DHR-${o.order_id}`}</div>
                      <div className="text-[10px] text-slate-400">{new Date(o.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      NPR {Number(o.total).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          o.order?.payment_status === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {o.order?.payment_status || "PAID"}
                      </span>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">
                        {o.order?.payment_method || "eSewa"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={o.status || "pending"}
                        onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                        className="px-2.5 py-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {o.tracking_number && (
                        <div className="text-[10px] text-purple-700 font-mono mt-0.5 font-bold">
                          Trk: {o.tracking_number}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDispatch(o)}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl font-bold text-xs inline-flex items-center gap-1 transition"
                        title="Attach courier tracking and dispatch package"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch</span>
                      </button>
                      <button
                        onClick={() => handleViewInvoice(o.id)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs inline-flex items-center gap-1 transition"
                        title="Generate Official VAT / Tax Invoice"
                      >
                        <Receipt className="w-3.5 h-3.5 text-slate-500" />
                        <span>Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Courier Dispatch Modal */}
      {dispatchItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveDispatch}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900">Courier Dispatch Attachment</h3>
                <p className="text-[11px] text-slate-400">Order #{dispatchItem.order?.order_number}</p>
              </div>
              <button
                type="button"
                onClick={() => setDispatchItem(null)}
                className="text-slate-400 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Local Nepali Courier / Tracking Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. NP-POST-948214 or DHL-KTM-4821"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Saving will notify the buyer and update the order state to <strong>Shipped</strong>.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDispatchItem(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={dispatching}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50"
              >
                {dispatching ? "Saving..." : "Confirm Shipment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Official VAT/PAN Tax Invoice Modal */}
      {invoiceData && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl my-8 border border-slate-100">
            {/* Header with Print */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white font-black text-xl flex items-center justify-center">
                  ध
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 tracking-tight">Tax Invoice (कर बीजक)</h3>
                  <div className="text-[11px] text-slate-400 font-mono">Invoice #: {invoiceData.invoice_number}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceData(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Merchant and Buyer 2-Column Info */}
            <div className="grid grid-cols-2 gap-6 text-xs p-4 bg-slate-50 rounded-2xl">
              <div className="space-y-1">
                <div className="font-bold text-slate-400 uppercase text-[10px]">Merchant / Artisan Workshop</div>
                <div className="font-black text-slate-900 text-sm">{invoiceData.store.name}</div>
                <div className="text-slate-600">PAN/VAT: <span className="font-mono font-bold text-slate-900">{invoiceData.store.pan_vat}</span></div>
                <div className="text-slate-500">{invoiceData.store.address}, {invoiceData.store.city}</div>
                <div className="text-slate-500">{invoiceData.store.phone} • {invoiceData.store.email}</div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-400 uppercase text-[10px]">Recipient (Buyer)</div>
                <div className="font-black text-slate-900 text-sm">{invoiceData.customer.name}</div>
                <div className="text-slate-500">{invoiceData.customer.address}</div>
                <div className="text-slate-500">{invoiceData.customer.phone}</div>
                <div className="text-slate-500">{invoiceData.customer.email}</div>
              </div>
            </div>

            {/* Invoice Line Item Table */}
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Item Description</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Total (NPR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-bold text-slate-900">{invoiceData.item.name}</td>
                  <td className="p-3 font-mono text-slate-500">{invoiceData.item.sku}</td>
                  <td className="p-3 text-center font-bold">{invoiceData.item.quantity}</td>
                  <td className="p-3 text-right">NPR {Number(invoiceData.item.unit_price).toLocaleString()}</td>
                  <td className="p-3 text-right font-black text-slate-900">NPR {Number(invoiceData.item.subtotal).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            {/* Financial Ledger & Commission Settlement */}
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-2 text-xs">
              <div className="flex justify-between font-medium text-slate-700">
                <span>Taxable Amount (Excl. 13% VAT):</span>
                <span>NPR {Number(invoiceData.financials.taxable_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-700">
                <span>VAT (13% Heritage Rate):</span>
                <span>NPR {Number(invoiceData.financials.vat_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium text-purple-900">
                <span>Platform Commission ({invoiceData.financials.platform_commission_rate}%):</span>
                <span>- NPR {Number(invoiceData.financials.platform_commission).toLocaleString()}</span>
              </div>
              <div className="border-t border-amber-200 pt-2 flex justify-between font-black text-sm text-slate-900">
                <span>Net Credited to Merchant Escrow:</span>
                <span className="text-emerald-700 font-mono text-base">NPR {Number(invoiceData.financials.merchant_net_escrow).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified by Dharohar Automated Escrow & Nepal Inward Remittance</span>
              </div>
              <button
                type="button"
                onClick={() => setInvoiceData(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Close Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
