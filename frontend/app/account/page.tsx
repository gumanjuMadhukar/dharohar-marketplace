"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import {
  Package,
  Gavel,
  Heart,
  ExternalLink,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";

export default function CustomerAccountPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<"orders" | "bids" | "wishlist">("orders");

  const [orders, setOrders] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordRes, bidRes, wishRes] = await Promise.allSettled([
        api.get("/orders"),
        api.get("/auth/bids"),
        api.get("/wishlist"),
      ]);

      if (ordRes.status === "fulfilled" && ordRes.value.data?.orders) {
        setOrders(ordRes.value.data.orders.data || ordRes.value.data.orders);
      }
      if (bidRes.status === "fulfilled" && bidRes.value.data?.data) {
        setBids(bidRes.value.data.data.data || bidRes.value.data.data);
      }
      if (wishRes.status === "fulfilled" && wishRes.value.data?.data) {
        setWishlist(wishRes.value.data.data.data || wishRes.value.data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-nepal-crimson mx-auto" />
        <h2 className="text-xl font-black text-nepal-earth">Authentication Required</h2>
        <p className="text-xs text-gray-500">Sign in to view your orders, live auction bids, and saved items.</p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 bg-nepal-crimson text-white rounded-xl text-xs font-bold"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Account Banner */}
      <div className="bg-gradient-to-r from-nepal-earth to-nepal-crimson text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-nepal-gold/50 shadow"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-nepal-gold text-nepal-earth">
                {user.account_type}
              </span>
            </div>
            <p className="text-xs text-nepal-parchment/80">{user.email}</p>
          </div>
        </div>

        <Link
          href="/profile"
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
        >
          <UserIcon className="w-4 h-4" />
          <span>Edit Profile & Security</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
            activeTab === "orders"
              ? "border-nepal-crimson text-nepal-crimson"
              : "border-transparent text-gray-500 hover:text-nepal-earth"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("bids")}
          className={`pb-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
            activeTab === "bids"
              ? "border-nepal-crimson text-nepal-crimson"
              : "border-transparent text-gray-500 hover:text-nepal-earth"
          }`}
        >
          <Gavel className="w-4 h-4" />
          <span>My Live Bids ({bids.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("wishlist")}
          className={`pb-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
            activeTab === "wishlist"
              ? "border-nepal-crimson text-nepal-crimson"
              : "border-transparent text-gray-500 hover:text-nepal-earth"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist ({wishlist.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="py-20 text-center text-xs text-gray-400">Loading your account history...</div>
      ) : (
        <>
          {/* Orders */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
                  <Package className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-sm font-bold text-nepal-earth">No orders placed yet</p>
                  <p className="text-xs text-gray-500">Explore authentic handicrafts, pashmina, and youth inventions.</p>
                  <Link
                    href="/marketplace"
                    className="inline-block px-5 py-2 bg-nepal-crimson text-white text-xs font-bold rounded-xl"
                  >
                    Browse Marketplace
                  </Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4 hover:border-nepal-gold/50 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 text-xs">
                      <div>
                        <span className="text-gray-400">Order ID: </span>
                        <span className="font-mono font-bold text-nepal-crimson">{order.order_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            order.payment_status === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {order.payment_status} ({order.payment_method})
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            order.shipping_status === "delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.shipping_status}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-gray-50">
                      {(order.items || []).map((item: any) => (
                        <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                item.product?.primary_image?.image_url ||
                                "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200"
                              }
                              alt={item.product?.name || "Product"}
                              className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                            />
                            <div>
                              <div className="font-bold text-nepal-earth">{item.product?.name || "Handcrafted Artifact"}</div>
                              <div className="text-[11px] text-gray-500">
                                Qty: {item.quantity} × NPR {Number(item.price).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="font-black text-nepal-earth">
                            NPR {Number(item.total).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs font-bold text-nepal-earth">
                      <div className="text-gray-500 font-normal">
                        Ship to: {order.shipping_address}, {order.shipping_city}
                      </div>
                      <div className="text-sm text-nepal-crimson font-black">
                        Total: NPR {Number(order.total).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Bids */}
          {activeTab === "bids" && (
            <div className="space-y-4">
              {bids.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
                  <Gavel className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-sm font-bold text-nepal-earth">No live bids placed yet</p>
                  <p className="text-xs text-gray-500">Compete in timed live auctions for rare museum-grade heritage art.</p>
                  <Link
                    href="/auctions"
                    className="inline-block px-5 py-2 bg-nepal-crimson text-white text-xs font-bold rounded-xl"
                  >
                    Go to Auction Hall
                  </Link>
                </div>
              ) : (
                bids.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          b.auction?.product?.primary_image?.image_url ||
                          "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300"
                        }
                        alt={b.auction?.title}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="space-y-1">
                        <Link
                          href={`/auctions/${b.auction?.id}`}
                          className="font-bold text-xs text-nepal-earth hover:text-nepal-crimson transition flex items-center gap-1"
                        >
                          <span>{b.auction?.title || "Live Auction Artifact"}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                        </Link>
                        <div className="text-[11px] text-gray-500">
                          Your Bid: <span className="font-bold text-nepal-crimson">NPR {Number(b.amount).toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Placed on: {new Date(b.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          b.auction?.status === "active"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {b.auction?.status === "active" ? "Live Bidding" : "Auction Ended"}
                      </span>
                      <Link
                        href={`/auctions/${b.auction?.id}`}
                        className="px-4 py-2 bg-nepal-crimson text-white rounded-xl text-xs font-bold shadow hover:bg-nepal-crimsonDark transition"
                      >
                        Enter Room
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Wishlist */}
          {activeTab === "wishlist" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.length === 0 ? (
                <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-sm font-bold text-nepal-earth">Your wishlist is empty</p>
                  <p className="text-xs text-gray-500">Save your favorite handcrafted masterpieces to revisit anytime.</p>
                  <Link
                    href="/marketplace"
                    className="inline-block px-5 py-2 bg-nepal-crimson text-white text-xs font-bold rounded-xl"
                  >
                    Discover Treasures
                  </Link>
                </div>
              ) : (
                wishlist.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <img
                        src={
                          item.product?.primary_image?.image_url ||
                          "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500"
                        }
                        alt={item.product?.name}
                        className="w-full h-44 object-cover"
                      />
                      <div className="p-4 space-y-1.5">
                        <h4 className="font-bold text-xs text-nepal-earth line-clamp-1">{item.product?.name}</h4>
                        <div className="text-sm font-black text-nepal-crimson">
                          NPR {Number(item.product?.price).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 pt-0">
                      <button
                        onClick={() => addToCart(item.product)}
                        className="w-full py-2 bg-nepal-earth hover:bg-nepal-earth/90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

