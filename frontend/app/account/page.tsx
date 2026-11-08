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
  Printer,
  FileText,
  MapPin,
  ShieldCheck,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { PurchaseEmailModal } from "@/components/PurchaseEmailModal";

export default function CustomerAccountPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<"orders" | "bids" | "wishlist">("orders");

  const [orders, setOrders] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);

  const fallbackOrders = [
    {
      id: 83809,
      order_number: "DH-83809",
      created_at: new Date(Date.now() - 15 * 60000).toISOString(),
      payment_status: "paid",
      payment_method: "eSewa (ID: 9841000000)",
      status: "Processing",
      total_amount: 8650,
      subtotal: 7500,
      delivery_charge: 150,
      tax_amount: 1000,
      shipping_address: "Thamel Ward 29, Kathmandu, Bagmati Province",
      tracking_number: "NP-88231-KTM",
      courier: "Nepal Post EMS Speed Logistics",
      items: [
        {
          id: 1,
          quantity: 1,
          price: 7500,
          total: 7500,
          product: {
            id: 101,
            name: "Hand-Carved Newar Peacock Window Panel (Aromatic Sal Wood)",
            store: { name: "Bhaktapur Traditional Woodcraft Stall" },
            primary_image: {
              url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=300",
            },
          },
        },
      ],
    },
    {
      id: 75000,
      order_number: "DH-75000",
      created_at: new Date(Date.now() - 120 * 60000).toISOString(),
      payment_status: "paid",
      payment_method: "eSewa",
      status: "Shipped",
      total_amount: 75000,
      subtotal: 66371,
      delivery_charge: 0,
      tax_amount: 8629,
      shipping_address: "Patan Durbar Square Ward 12, Lalitpur",
      tracking_number: "EMS-99412-NP",
      courier: "Dharohar White-Glove Heritage Courier",
      items: [
        {
          id: 2,
          quantity: 1,
          price: 75000,
          total: 75000,
          product: {
            id: 102,
            name: "18th-Century Style Shakyamuni Buddha Bronze (24K Gold Gilded)",
            store: { name: "Patan Sacred Bronze Casting Guild" },
            primary_image: {
              url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300",
            },
          },
        },
      ],
    },
    {
      id: 64210,
      order_number: "DH-64210",
      created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
      payment_status: "paid",
      payment_method: "Khalti",
      status: "Delivered",
      total_amount: 28000,
      subtotal: 24778,
      delivery_charge: 0,
      tax_amount: 3222,
      shipping_address: "Dattatreya Square, Bhaktapur",
      tracking_number: "POST-77310-BKT",
      courier: "Nepal Post Registered Parcel",
      items: [
        {
          id: 3,
          quantity: 1,
          price: 28000,
          total: 28000,
          product: {
            id: 103,
            name: "Hand-Forged 7-Metal Full Moon Singing Bowl with Striker",
            store: { name: "Himalayan Chyangra Atelier" },
            primary_image: {
              url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300",
            },
          },
        },
      ],
    },
  ];

  const fallbackBids = [
    {
      id: 501,
      auction_id: 1,
      room_id: 1,
      lot_title: "18th-Century Style Shakyamuni Buddha Bronze (24K Gold Gilded)",
      amount: 145000,
      status: "leading",
      created_at: "35 mins ago",
      image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300",
      host: "Umesh Shakya (Master Sculptor)",
    },
    {
      id: 502,
      auction_id: 2,
      room_id: 1,
      lot_title: "Mineral Pigment Chenrezig Mandalas on Organic Cotton Canvas",
      amount: 45000,
      status: "outbid",
      created_at: "1 hour ago",
      image_url: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=300",
      host: "Umesh Shakya",
    },
    {
      id: 503,
      auction_id: 3,
      room_id: 2,
      lot_title: "Bhaktapur Master Woodcarver's Peacock Window",
      amount: 42000,
      status: "won",
      created_at: "Yesterday",
      image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=300",
      host: "Bikash Shrestha",
    },
  ];

  const fallbackWishlist = [
    {
      id: 1,
      name: "Pure Himalayan Chyangra Cashmere Shawl (Grade-A Diamond Weave)",
      price: 18500,
      image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300",
      origin: "Mustang / Kathmandu",
      in_stock: true,
      store: { name: "Himalayan Chyangra Atelier" },
    },
    {
      id: 2,
      name: "Newar Filigree Silver Butter Lamp Set (Fine 925 Hallmarked)",
      price: 32000,
      image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300",
      origin: "Patan Golden Temple Guild",
      in_stock: true,
      store: { name: "Patan Sacred Bronze Casting Guild" },
    },
  ];

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

      let apiOrders: any[] = [];
      let apiBids: any[] = [];
      let apiWishlist: any[] = [];

      if (ordRes.status === "fulfilled") {
        const resData = ordRes.value.data;
        apiOrders =
          resData?.orders?.data ||
          resData?.data?.data ||
          (Array.isArray(resData?.orders) ? resData.orders : null) ||
          (Array.isArray(resData?.data) ? resData.data : []) || [];
      }
      if (bidRes.status === "fulfilled") {
        const resData = bidRes.value.data;
        apiBids =
          resData?.bids?.data ||
          resData?.data?.data ||
          (Array.isArray(resData?.bids) ? resData.bids : null) ||
          (Array.isArray(resData?.data) ? resData.data : []) || [];
      }
      if (wishRes.status === "fulfilled") {
        const resData = wishRes.value.data;
        apiWishlist =
          resData?.wishlist?.data ||
          resData?.data?.data ||
          (Array.isArray(resData?.wishlist) ? resData.wishlist : null) ||
          (Array.isArray(resData?.data) ? resData.data : []) || [];
      }

      // Check localStorage for checkout-completed demo orders
      let mergedOrders = [...apiOrders];
      try {
        const localDemo = JSON.parse(localStorage.getItem("dharohar_demo_orders") || "[]");
        if (Array.isArray(localDemo) && localDemo.length > 0) {
          mergedOrders = [...localDemo, ...mergedOrders];
        }
      } catch {}

      if (mergedOrders.length === 0) {
        mergedOrders = fallbackOrders;
      }
      setOrders(mergedOrders);

      if (apiBids.length === 0) {
        setBids(fallbackBids);
      } else {
        setBids(apiBids);
      }

      if (apiWishlist.length === 0) {
        setWishlist(fallbackWishlist);
      } else {
        setWishlist(apiWishlist);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
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
                orders.map((order) => {
                  const itemsList = order.items || [];
                  const totalFormatted = Number(order.total_amount || order.total || 0).toLocaleString();

                  return (
                    <div
                      key={order.id || order.order_number}
                      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4 hover:border-nepal-gold/50 transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 text-xs">
                        <div>
                          <span className="text-gray-400">Order ID: </span>
                          <span className="font-mono font-black text-nepal-crimson">{order.order_number}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              (order.payment_status || "paid").toLowerCase() === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {order.payment_status || "PAID"} ({order.payment_method || "Online Gateway"})
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              (order.status || "").toLowerCase() === "delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : (order.status || "").toLowerCase() === "shipped"
                                ? "bg-indigo-100 text-indigo-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {order.status || "Processing"}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-gray-50">
                        {itemsList.map((item: any, idx: number) => {
                          const prod = item.product || item;
                          const imgUrl =
                            prod?.primary_image?.url ||
                            prod?.primary_image?.image_url ||
                            prod?.image_url ||
                            "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200";

                          return (
                            <div key={item.id || idx} className="py-2.5 flex items-center justify-between text-xs gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={imgUrl}
                                  alt={prod?.name || "Product"}
                                  className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-nepal-earth truncate">{prod?.name || item.name || "Handcrafted Artifact"}</div>
                                  <div className="text-[11px] text-gray-500 flex items-center gap-2">
                                    <span>Qty: {item.quantity || 1} × NPR {Number(item.price || prod?.price || 0).toLocaleString()}</span>
                                    {prod?.store?.name && (
                                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
                                        {prod.store.name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="font-black text-nepal-earth flex-shrink-0">
                                NPR {Number(item.total || (item.quantity || 1) * (item.price || prod?.price || 0)).toLocaleString()}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer Details & VAT Receipt Action */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
                        <div className="space-y-1 text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span>Ship to: {order.shipping_address || "Kathmandu, Nepal"}</span>
                          </div>
                          {order.tracking_number && (
                            <div className="flex items-center gap-1.5 text-indigo-700 font-mono font-bold text-[11px]">
                              <Truck className="w-3.5 h-3.5" />
                              <span>{order.courier || "Express Dispatch"} — Tracking #{order.tracking_number}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <div className="text-right">
                            <div className="text-[10px] text-gray-400 uppercase font-bold">Total Paid (VAT Incl.)</div>
                            <div className="text-sm text-nepal-crimson font-black">
                              NPR {totalFormatted}
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="px-3 py-1.5 rounded-xl bg-nepal-earth/5 hover:bg-nepal-earth/10 text-nepal-earth text-xs font-bold flex items-center gap-1.5 border border-nepal-gold/30 transition"
                            title="View Official VAT Invoice & Printable Receipt"
                          >
                            <FileText className="w-3.5 h-3.5 text-nepal-crimson" />
                            <span>View VAT Receipt</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
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
                    href="/live"
                    className="inline-block px-5 py-2 bg-nepal-crimson text-white text-xs font-bold rounded-xl"
                  >
                    Enter Live Auction Arena
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
                          b.image_url ||
                          b.auction?.product?.primary_image?.image_url ||
                          "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300"
                        }
                        alt={b.lot_title || b.auction?.title}
                        className="w-16 h-16 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                      />
                      <div className="space-y-1">
                        <Link
                          href={`/live/${b.room_id || b.auction?.id || 1}`}
                          className="font-bold text-xs text-nepal-earth hover:text-nepal-crimson transition flex items-center gap-1"
                        >
                          <span>{b.lot_title || b.auction?.title || "Live Auction Artifact"}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                        </Link>
                        <div className="text-[11px] text-gray-500">
                          Your Active Bid: <span className="font-black text-nepal-crimson">NPR {Number(b.amount).toLocaleString()}</span>
                        </div>
                        {b.host && (
                          <div className="text-[10px] text-gray-400">
                            Host: {b.host} • Placed {b.created_at}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          b.status === "leading" || b.status === "won"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {b.status === "leading" ? "Leading Bidder 🏆" : b.status === "won" ? "Won (Hammered Down)" : "Outbid ⚡"}
                      </span>
                      <Link
                        href={`/live/${b.room_id || b.auction?.id || 1}`}
                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
                      >
                        <Radio className="w-3 h-3 animate-pulse" />
                        <span>Watch Room</span>
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
                          item.image_url ||
                          item.product?.primary_image?.image_url ||
                          "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500"
                        }
                        alt={item.name || item.product?.name}
                        className="w-full h-44 object-cover"
                      />
                      <div className="p-4 space-y-1.5">
                        <h4 className="font-bold text-xs text-nepal-earth line-clamp-1">{item.name || item.product?.name}</h4>
                        <div className="text-sm font-black text-nepal-crimson">
                          NPR {Number(item.price || item.product?.price || 0).toLocaleString()}
                        </div>
                        {item.origin && (
                          <div className="text-[10px] text-gray-400">Origin: {item.origin}</div>
                        )}
                      </div>
                    </div>
                    <div className="p-4 pt-0">
                      <button
                        onClick={() => addToCart(item.product || item)}
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

      {/* VAT Invoice & Receipt Modal */}
      {selectedInvoiceOrder && (
        <PurchaseEmailModal
          orderNumber={selectedInvoiceOrder.order_number}
          customerName={user.name || "Valued Collector"}
          customerEmail={user.email || "customer@dharohar.com"}
          shippingAddress={selectedInvoiceOrder.shipping_address || "Kathmandu, Nepal"}
          paymentMethod={selectedInvoiceOrder.payment_method || "eSewa"}
          transactionId={`TXN-${selectedInvoiceOrder.order_number}-${Date.now().toString().slice(-4)}`}
          items={(selectedInvoiceOrder.items || []).map((i: any) => ({
            name: i.product?.name || i.name || "Handcrafted Heritage Item",
            quantity: i.quantity || 1,
            price: Number(i.price || i.product?.price || 0),
            storeName: i.product?.store?.name || "Official Heritage Guild",
          }))}
          subtotal={Number(selectedInvoiceOrder.subtotal || selectedInvoiceOrder.total_amount * 0.885)}
          deliveryCharge={Number(selectedInvoiceOrder.delivery_charge || 0)}
          grandTotal={Number(selectedInvoiceOrder.total_amount || selectedInvoiceOrder.total || 0)}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
}
