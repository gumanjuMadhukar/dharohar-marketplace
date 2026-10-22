"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Package, ArrowLeft, Flame, Gavel, Sparkles, Tag, Shield } from "lucide-react";
import Link from "next/link";

export default function CreateProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [storeId, setStoreId] = useState<number>(1);

  // Form State
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState("physical");
  const [quantity, setQuantity] = useState("10");
  const [lowStockThreshold, setLowStockThreshold] = useState("3");
  const [isHandmade, setIsHandmade] = useState(true);
  const [isEco, setIsEco] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Auction Target Option
  const [launchAsAuction, setLaunchAsAuction] = useState(false);
  const [auctionStartPrice, setAuctionStartPrice] = useState("");
  const [auctionIncrement, setAuctionIncrement] = useState("500");
  const [auctionHours, setAuctionHours] = useState("48");

  useEffect(() => {
    api.get("/categories").then((res) => {
      if (res.data?.data) {
        setCategories(res.data.data);
        if (res.data.data[0]) setCategoryId(res.data.data[0].id);
      }
    }).catch(() => {});
    api.get("/seller/store").then((res) => {
      if (res.data?.store) setStoreId(res.data.store.id);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const generatedSku = sku.trim() || `DHR-${name.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const payload: any = {
        store_id: storeId,
        category_id: categoryId || 1,
        name: name.trim(),
        sku: generatedSku,
        description,
        price: Number(price),
        compare_price: comparePrice ? Number(comparePrice) : null,
        type,
        quantity: Number(quantity),
        low_stock_threshold: Number(lowStockThreshold),
        is_handmade: isHandmade,
        is_eco_friendly: isEco,
        is_student_made: user?.account_type === "student",
        images: imageUrl
          ? [imageUrl]
          : ["https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800"],
      };

      const res = await api.post("/products", payload);
      if (res.data?.success && res.data?.product) {
        const createdProduct = res.data.product;

        // If user chose to launch as an auction immediately
        if (launchAsAuction) {
          const now = new Date();
          const ends = new Date(now.getTime() + Number(auctionHours) * 60 * 60 * 1000);
          await api.post("/auctions", {
            store_id: storeId,
            product_id: createdProduct.id,
            title: `Exclusive Auction: ${createdProduct.name}`,
            description: createdProduct.description,
            starting_price: Number(auctionStartPrice || price),
            bid_increment: Number(auctionIncrement || 500),
            starts_at: now.toISOString(),
            ends_at: ends.toISOString(),
            auto_extend: true,
          });
        }

        router.push("/seller/products");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to publish artifact");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/seller/products"
          className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-base font-black text-slate-900">Publish New Artifact</h2>
          <p className="text-xs text-slate-500">
            Provide authentic cultural provenance, technical specifications, and distribution channels.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Product Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Masterwork Gold Leaf Vajrasattva Thangka"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">SKU / Catalog Code (Optional)</label>
            <input
              type="text"
              placeholder="e.g. DHR-THK-001 (auto-generated if empty)"
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Retail Price (NPR)</label>
            <input
              type="number"
              required
              min="50"
              placeholder="e.g. 18500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-amber-700 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Original / Compare Price (Optional)</label>
            <input
              type="number"
              min="50"
              placeholder="e.g. 22000"
              value={comparePrice}
              onChange={(e) => setComparePrice(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Initial Stock Units</label>
            <input
              type="number"
              required
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Low Stock Warning Threshold</label>
            <input
              type="number"
              min="1"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Format Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
            >
              <option value="physical">Physical Artifact / Craft</option>
              <option value="digital">Digital Art / Vector Mandala</option>
              <option value="idea">Innovation Prototype / Proposal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">High-Res Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description & Materials</label>
            <textarea
              rows={4}
              required
              placeholder="Describe heritage lineage, materials (teak wood, natural dyes, pure wool), dimensions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Checkbox Attributes */}
        <div className="flex flex-wrap gap-6 pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={isHandmade}
              onChange={(e) => setIsHandmade(e.target.checked)}
              className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <span>100% Authentic Handmade in Nepal</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={isEco}
              onChange={(e) => setIsEco(e.target.checked)}
              className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <span>Eco-friendly & Sustainably Sourced</span>
          </label>
        </div>

        {/* Sales Channel Strategy: Live Timed Auction Option */}
        <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={launchAsAuction}
              onChange={(e) => setLaunchAsAuction(e.target.checked)}
              className="rounded border-amber-400 text-amber-700 focus:ring-amber-500 w-4 h-4"
            />
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
              <Flame className="w-4 h-4 text-amber-600" />
              <span>Immediately Schedule & Launch in Live Timed Auction</span>
            </div>
          </label>

          {launchAsAuction && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-amber-200/60 animate-in fade-in duration-150">
              <div>
                <label className="block text-[11px] font-bold text-amber-900 mb-1">
                  Starting Bid (NPR)
                </label>
                <input
                  type="number"
                  placeholder={price || "15000"}
                  value={auctionStartPrice}
                  onChange={(e) => setAuctionStartPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-900 mb-1">
                  Min Bid Increment (NPR)
                </label>
                <input
                  type="number"
                  value={auctionIncrement}
                  onChange={(e) => setAuctionIncrement(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-900 mb-1">
                  Auction Duration
                </label>
                <select
                  value={auctionHours}
                  onChange={(e) => setAuctionHours(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="24">24 Hours (1 Day Flash)</option>
                  <option value="48">48 Hours (2 Days Standard)</option>
                  <option value="72">72 Hours (3 Days Grand)</option>
                  <option value="168">7 Days (Full Week)</option>
                </select>
              </div>

              <div className="sm:col-span-3 text-[11px] text-amber-800">
                ⚡ <em>Direct fixed-price purchase will be automatically locked while this item is in the live bidding hall.</em>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/seller/products"
            className="px-5 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-nepal-crimson text-white text-xs font-bold rounded-xl shadow-md hover:brightness-110 transition cursor-pointer"
          >
            {submitting ? "Publishing Artifact..." : launchAsAuction ? "Publish & Launch Live Auction" : "Publish Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
