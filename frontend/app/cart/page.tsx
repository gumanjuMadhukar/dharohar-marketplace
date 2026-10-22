"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Tag } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === "DHAROHAR10") {
      const disc = subtotal * 0.1;
      setDiscount(disc);
      setCouponMessage("10% Heritage discount applied!");
    } else if (code === "STUDENTLOVE") {
      setDiscount(200);
      setCouponMessage("NPR 200 Student Love coupon applied!");
    } else {
      setDiscount(0);
      setCouponMessage("Invalid or expired coupon code.");
    }
  };

  const shippingCost = items.length > 0 ? 150 : 0;
  const grandTotal = Math.max(0, subtotal + shippingCost - discount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-nepal-earth">Multi-Vendor Cart</h1>
          <p className="text-xs text-gray-500 mt-1">
            Review your selected handcrafted goods and youth inventions before secure checkout.
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-red-600 hover:underline font-semibold"
          >
            Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-300 space-y-4">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto" />
          <h2 className="text-lg font-bold text-nepal-earth">Your cart is empty</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Explore authentic Nepali woodcraft, hand-woven pashmina, or empower student creators with
            your purchase.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-nepal-crimson text-white font-bold text-xs shadow-md transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Discover Products</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-nepal-gold/20 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-nepal-parchment border border-gray-100 flex-shrink-0">
                    <img
                      src={
                        item.product.primary_image?.url ||
                        item.product.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200"
                      }
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-nepal-terracotta">
                      {item.product.store?.name || "Local Artisan"}
                    </span>
                    <h3 className="font-bold text-sm text-nepal-earth line-clamp-1">
                      {item.product.name}
                    </h3>
                    <div className="text-xs text-nepal-crimson font-extrabold mt-1">
                      NPR {Number(item.product.price).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                  <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-l-xl"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-nepal-earth">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-r-xl"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-nepal-earth">
                      NPR {(Number(item.product.price) * item.quantity).toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-gray-400 hover:text-red-600 transition p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary & Checkout Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border-2 border-nepal-gold/40 shadow-lg space-y-6">
              <h2 className="font-black text-lg text-nepal-earth">Order Summary</h2>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. DHAROHAR10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl border border-gray-300 text-xs uppercase font-bold focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-nepal-earth hover:bg-black text-white text-xs font-bold rounded-xl transition"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p
                    className={`text-[11px] font-semibold ${
                      discount > 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {couponMessage}
                  </p>
                )}
              </form>

              {/* Pricing breakdown */}
              <div className="space-y-3 pt-3 border-t border-gray-100 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-nepal-earth">
                    NPR {subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Shipping (All Nepal Delivery)</span>
                  <span className="font-bold text-nepal-earth">
                    NPR {shippingCost.toLocaleString()}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Discount</span>
                    <span>- NPR {discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-nepal-earth">Total Amount</span>
                  <span className="text-2xl font-black text-nepal-crimson">
                    NPR {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full py-4 rounded-full bg-nepal-crimson hover:bg-nepal-crimsonDark text-white font-black text-sm shadow-xl transition flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

