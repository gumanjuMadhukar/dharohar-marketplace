"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { PaymentModal } from "@/components/PaymentModal";
import { PurchaseEmailModal } from "@/components/PurchaseEmailModal";
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
  Sparkles,
  CreditCard,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

export default function CheckoutPage() {
  const { items, subtotal, clearCart, addItem } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    shipping_name: user?.name || "Bikram Karki",
    shipping_email: user?.email || "buyer@dharohar.com",
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

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        shipping_name: user.name || prev.shipping_name,
        shipping_email: user.email || prev.shipping_email,
        shipping_phone: user.phone || prev.shipping_phone,
      }));
    }
  }, [user]);

  // If cart is empty, allow populating with realistic heritage demo artifacts
  const effectiveItems = items.length > 0 ? items : [
    {
      id: "demo-art-1",
      product: {
        id: 1,
        name: "Hand-Carved Sal Wood Mayur Jhyal (Peacock Window)",
        price: 35000,
        primary_image: {
          id: 1,
          url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400",
          is_primary: true,
        },
        store: { name: "Bhaktapur Woodcraft & Heritage" },
      } as any,
      quantity: 1,
    },
    {
      id: "demo-art-2",
      product: {
        id: 4,
        name: "Himalayan Chyangra Cashmere Pashmina Stole",
        price: 7000,
        primary_image: {
          id: 2,
          url: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400",
          is_primary: true,
        },
        store: { name: "Himalayan Chyangra Cashmere" },
      } as any,
      quantity: 1,
    },
  ];

  const currentSubtotal = items.length > 0
    ? subtotal
    : effectiveItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);

  const shippingCost = 150;
  const grandTotal = currentSubtotal + shippingCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (details: {
    transactionId: string;
    gateway: string;
    amount: number;
    paidAt: string;
  }) => {
    setShowPaymentModal(false);
    setLoading(true);

    const generatedOrderNumber = `DH-${Math.floor(10000 + Math.random() * 90000)}`;

    const confirmedOrder = {
      order_number: generatedOrderNumber,
      total: grandTotal,
      subtotal: currentSubtotal,
      delivery_charge: shippingCost,
      payment_method: details.gateway,
      payment_status: "paid",
      shipping_name: formData.shipping_name,
      shipping_email: formData.shipping_email,
      shipping_address: `${formData.shipping_address}, ${formData.shipping_city}, ${formData.shipping_state}`,
      shipping_phone: formData.shipping_phone,
      transaction_id: details.transactionId,
      paid_at: details.paidAt,
      items: effectiveItems.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
        storeName: i.product.store?.name || "Artisan Workshop",
      })),
    };

    setOrderResult({ order: confirmedOrder });
    clearCart();

    // Trigger in-app notification event
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("dharohar:notification", {
          detail: {
            id: `notif-${Date.now()}`,
            title: `Order #${generatedOrderNumber} Paid via ${details.gateway.toUpperCase()}`,
            message: `NPR ${grandTotal.toLocaleString()} successfully verified. Official VAT invoice generated.`,
            type: "purchase",
            timestamp: "Just now",
            read: false,
            link: "/account",
          },
        })
      );
    }

    setLoading(false);
  };

  if (orderResult) {
    const order = orderResult.order;

    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10 animate-bounce" />
        </div>
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black uppercase border border-emerald-200">
            Payment Verified & Order Confirmed ✅
          </span>
          <h1 className="text-3xl font-black text-nepal-earth mt-2">
            Order Placed Successfully!
          </h1>
          <p className="text-xs text-gray-600 max-w-md mx-auto">
            Thank you for supporting authentic Nepali artisans and student creators. Your official invoice has been issued.
          </p>
        </div>

        <div className="p-4 bg-nepal-parchment rounded-2xl border border-nepal-gold/40 inline-block font-mono font-bold text-lg text-nepal-crimson">
          {order?.order_number}
        </div>

        <div className="p-6 bg-white rounded-3xl border border-gray-200 text-left text-xs space-y-2.5 max-w-md mx-auto shadow-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Amount Paid:</span>
            <span className="font-bold text-nepal-earth">NPR {Number(order?.total).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Gateway:</span>
            <span className="font-bold uppercase text-nepal-crimson">{order?.payment_method}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Transaction Ref:</span>
            <span className="font-mono text-[11px] text-gray-700">{order?.transaction_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Delivery Address:</span>
            <span className="font-semibold text-right max-w-[200px] truncate">{order?.shipping_address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Buyer Protection:</span>
            <span className="text-emerald-700 font-bold">7-Day Escrow Guarantee Active</span>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setShowEmailModal(true)}
            className="px-5 py-3 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-nepal-gold" />
            <span>Inspect Automated Email Receipt</span>
          </button>

          <Link
            href="/account"
            className="px-5 py-3 rounded-full bg-nepal-crimson text-white font-bold text-xs shadow-md hover:bg-nepal-crimsonDark transition"
          >
            View My Orders & Escrow
          </Link>
        </div>

        {/* Purchase Email Modal */}
        {showEmailModal && (
          <PurchaseEmailModal
            orderNumber={order.order_number}
            customerName={order.shipping_name}
            customerEmail={order.shipping_email}
            shippingAddress={order.shipping_address}
            paymentMethod={order.payment_method}
            transactionId={order.transaction_id}
            items={order.items}
            subtotal={order.subtotal}
            deliveryCharge={order.delivery_charge}
            grandTotal={order.total}
            onClose={() => setShowEmailModal(false)}
          />
        )}
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
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-xl font-black text-nepal-earth">1. Delivery Information</h2>
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Nepal Postal & Courier Clearance
              </span>
            </div>

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
                <label className="block text-xs font-bold text-nepal-earth mb-1">Email Address (For Order Receipt)</label>
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
                <label className="block text-xs font-bold text-nepal-earth mb-1">City / Municipality</label>
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
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-nepal-earth">2. Choose Payment Gateway</h2>
                <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-bold uppercase border border-purple-200">
                  Demo Test Sandbox Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: "esewa",
                    title: "eSewa Nepal",
                    desc: "Digital wallet & mobile banking (Demo Account ready)",
                    color: "border-emerald-500 bg-emerald-50/50",
                  },
                  {
                    id: "khalti",
                    title: "Khalti Pay",
                    desc: "Instant QR & digital wallet (Demo Sandbox ready)",
                    color: "border-purple-500 bg-purple-50/50",
                  },
                  {
                    id: "stripe",
                    title: "Credit / Debit Card",
                    desc: "Visa, Mastercard via Stripe 3D Secure",
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
              disabled={loading}
              className="w-full py-4 rounded-full bg-nepal-crimson hover:bg-nepal-crimsonDark text-white font-black text-sm shadow-xl transition flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-nepal-gold" />
              <span>
                {loading
                  ? "Processing..."
                  : `Proceed to Pay (NPR ${grandTotal.toLocaleString()}) via ${formData.payment_method.toUpperCase()}`}
              </span>
            </button>
          </form>
        </div>

        {/* Order Review Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-nepal-gold/30 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-sm text-nepal-earth uppercase tracking-wider">
                Order Items ({effectiveItems.length})
              </h3>
              {items.length === 0 && (
                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                  Sample Cart Active
                </span>
              )}
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {effectiveItems.map((i, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs border-b border-gray-100 pb-2">
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
                <span>NPR {currentSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge:</span>
                <span>NPR {shippingCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>13% Nepal VAT (Included):</span>
                <span>NPR {Math.round(grandTotal * 0.13 / 1.13).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-black text-nepal-crimson pt-2 border-t border-gray-200">
                <span>Total Amount:</span>
                <span>NPR {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Payment Gateway Test Modal */}
      {showPaymentModal && (
        <PaymentModal
          orderNumber={`DH-${Math.floor(10000 + Math.random() * 90000)}`}
          amount={grandTotal}
          gateway={formData.payment_method as any}
          customerName={formData.shipping_name}
          customerEmail={formData.shipping_email}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}
