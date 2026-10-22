"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Store, CheckCircle } from "lucide-react";

export default function SellerSettingsPage() {
  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storeCity, setStoreCity] = useState("Kathmandu");
  const [storeLogo, setStoreLogo] = useState("");
  const [storeBanner, setStoreBanner] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/seller/store").then((res) => {
      if (res.data?.store) {
        const s = res.data.store;
        setStoreName(s.name || "");
        setStoreDesc(s.description || "");
        setStorePhone(s.phone || "");
        setStoreEmail(s.email || "");
        setStoreAddress(s.address || "");
        setStoreCity(s.city || "Kathmandu");
        setStoreLogo(s.logo || "");
        setStoreBanner(s.banner || "");
      }
    })
    .catch((err) => {
      console.warn("Failed to load seller store:", err?.response?.data?.message || err.message);
    })
    .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await api.put("/seller/store", {
        name: storeName,
        description: storeDesc,
        phone: storePhone,
        email: storeEmail,
        address: storeAddress,
        city: storeCity,
        logo: storeLogo,
        banner: storeBanner,
      });
      if (res.data?.success) {
        setMsg("Store profile and branding updated successfully!");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update store");
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <form onSubmit={handleUpdate} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-black text-slate-900">Store Profile & Branding Customizer</h2>
          <p className="text-xs text-slate-500">
            Customize your public storefront, craft workshop address, and customer contact information.
          </p>
        </div>

        {msg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{msg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Store / Brand Name</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Store Contact Email</label>
            <input
              type="email"
              required
              value={storeEmail}
              onChange={(e) => setStoreEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Store Contact Phone</label>
            <input
              type="text"
              required
              value={storePhone}
              onChange={(e) => setStorePhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">City / Region</label>
            <input
              type="text"
              required
              value={storeCity}
              onChange={(e) => setStoreCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Physical Workshop Address</label>
            <input
              type="text"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              placeholder="e.g. Bhaktapur Ward 4, Pottery Square"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Store Logo URL</label>
            <input
              type="url"
              value={storeLogo}
              onChange={(e) => setStoreLogo(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Store Banner URL</label>
            <input
              type="url"
              value={storeBanner}
              onChange={(e) => setStoreBanner(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Store Story & Craft Warranties</label>
            <textarea
              rows={3}
              value={storeDesc}
              onChange={(e) => setStoreDesc(e.target.value)}
              placeholder="Tell buyers about your heritage lineage, master artisans, and quality guarantees..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-nepal-crimson text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            Save Storefront Settings
          </button>
        </div>
      </form>
    </div>
  );
}
