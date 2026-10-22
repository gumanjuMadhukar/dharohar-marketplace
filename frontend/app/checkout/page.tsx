"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    shipping_name: user?.name || "Bikram Karki",
    shipping_email: user?.email || "bikram@example.com",
    shipping_phone: user?.phone || "9841999888",
    shipping_address: "New Baneshwor, Ward 10",
    shipping_city: "Kathmandu",
    shipping_state: "Bagmati",
    shipping_country: "Nepal",
    shipping_zip: "44600",
    payment_method: "esewa",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const shippingCost = items.length > 0 ? 150 : 0;
  const grandTotal = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
      };

      const res = await api.post("/checkout", payload);

      if (res.data?.success) {
        setOrderResult(res.data);
        clearCart();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to process order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (orderResult) {
    const order = orderResult.order;
    const payment = orderResult.payment;

    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-nepal-earth">Order Placed Successfully!</h1>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Thank you for supporting authentic Nepali artisans and student creators. Your order number is:
        </p>
        <div className="p-4 bg-nepal-parchment rounded-2xl border border-nepal-gold/40 inline-block font-mono font-bold text-lg text-nepal-crimson">
          {order?.order_number}
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-200 text-left text-xs space-y-2 max-w-md mx-auto">
          <div className="flex justify-between">
            <span className="text-gray-500">Total Amount Paid/Pending:</span>
            <span className="font-bold text-nepal-earth">NPR {Number(order?.total).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Gateway:</span>
            <span className="font-bold capitalize text-nepal-crimson">{order?.payment_method}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Shipping To:</span>
            <span className="font-semibold">{order?.shipping_address}, {order?.shipping_city}</span>
          </div>
        </div>

        <div className="pt-4 flex justify-center gap-4">
          <Link
            href="/marketplace"
            className="px-6 py-3 rounded-full bg-nepal-crimson text-white font-bold text-xs shadow-md hover:bg-nepal-crimsonDark transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-nepal-earth hover:text-nepal-crimson transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Cart</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Form Details */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-nepal-gold/30 shadow-md space-y-6">
            <h2 className="text-xl font-black text-nepal-earth">1. Delivery Information</h2>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-nepal-earth mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.shipping_name}
                  onChange={(e) => setFormData({ ...formData, shipping_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-nepal-earth mb-1">Phone Number (Nepal)</label>
                <input
                  type="text"
                  required
                  value={formData.shipping_phone}
                  onChange={(e) => setFormData({ ...formData, shipping_phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-nepal-earth mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.shipping_email}
                  onChange={(e) => setFormData({ ...formData, shipping_email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-nepal-earth mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={formData.shipping_address}
                  onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-nepal-earth mb-1">City</label>
                <input
                  type="text"
                  required
                  value={formData.shipping_city}
                  onChange={(e) => setFormData({ ...formData, shipping_city: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-nepal-earth mb-1">Province / State</label>
                <select
                  value={formData.shipping_state}
                  onChange={(e) => setFormData({ ...formData, shipping_state: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
                >
                  <option value="Bagmati">Bagmati Province (Kathmandu Valley)</option>
                  <option value="Gandaki">Gandaki Province (Pokhara)</option>
                  <option value="Koshi">Koshi Province</option>
                  <option value="Madhesh">Madhesh Province</option>
                  <option value="Lumbini">Lumbini Province</option>
                  <option value="Karnali">Karnali Province</option>
                  <option value="Sudurpashchim">Sudurpashchim Province</option>
                </select>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="pt-6 border-t border-gray-200 space-y-4">
              <h2 className="text-xl font-black text-nepal-earth">2. Choose Payment Gateway</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: "esewa",
                    title: "eSewa Nepal",
                    desc: "Digital wallet & mobile banking",
                    color: "border-green-500 bg-green-50/50",
                  },
                  {
                    id: "khalti",
                    title: "Khalti Pay",
                    desc: "Instant QR & digital wallet",
                    color: "border-purple-500 bg-purple-50/50",
                  },
                  {
                    id: "stripe",
                    title: "Credit / Debit Card",
                    desc: "Visa, Mastercard via Stripe",
                    color: "border-blue-500 bg-blue-50/50",
                  },
                  {
                    id: "cod",
                    title: "Cash on Delivery",
                    desc: "Pay in cash upon physical receipt",
                    color: "border-gray-500 bg-gray-50/50",
                  },
                ].map((m) => (
                  <label
                    key={m.id}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
                      formData.payment_method === m.id ? m.color : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_gateway"
                      value={m.id}
                      checked={formData.payment_method === m.id}
                      onChange={() => setFormData({ ...formData, payment_method: m.id })}
                      className="mt-1 text-nepal-crimson focus:ring-nepal-crimson"
                    />
                    <div>
                      <div className="font-bold text-xs text-nepal-earth">{m.title}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full py-4 rounded-full bg-nepal-crimson hover:bg-nepal-crimsonDark text-white font-black text-sm shadow-xl transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-nepal-gold" />
              <span>{loading ? "Processing Order..." : `Confirm Order (NPR ${grandTotal.toLocaleString()})`}</span>
            </button>
          </form>
        </div>

        {/* Order Review Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-nepal-gold/30 shadow-md space-y-4">
            <h3 className="font-bold text-sm text-nepal-earth uppercase tracking-wider">
              Items in this Order ({items.length})
            </h3>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.id} className="flex items-center gap-3 text-xs border-b border-gray-100 pb-2">
                  <img
                    src={
                      i.product.primary_image?.url ||
                      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100"
                    }
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover bg-nepal-parchment"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-nepal-earth line-clamp-1">{i.product.name}</span>
                    <span className="text-gray-500">Qty: {i.quantity}</span>
                  </div>
                  <span className="font-bold text-nepal-crimson">
                    NPR {(Number(i.product.price) * i.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-200 text-xs space-y-1.5">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>NPR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge:</span>
                <span>NPR {shippingCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-black text-nepal-crimson pt-2 border-t border-gray-200">
                <span>Total Amount:</span>
                <span>NPR {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

