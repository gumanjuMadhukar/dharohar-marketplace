"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Award,
  Sparkles,
  DollarSign,
} from "lucide-react";

export default function SellerCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/seller/customers");
      if (res.data?.data) {
        setCustomers(res.data.data);
      }
    } catch (err: any) {
      console.warn("Failed to load customers:", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  const totalBuyers = customers.length;
  const repeatBuyers = customers.filter((c) => c.total_orders > 1).length;
  const totalLtv = customers.reduce((acc, c) => acc + c.total_spent, 0);

  return (
    <div className="space-y-6">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-slate-400 font-bold uppercase text-[10px]">Registered Store Buyers</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalBuyers}</div>
            <div className="text-[11px] text-slate-500">Unique Heritage Patrons</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-slate-400 font-bold uppercase text-[10px]">Repeat Collectors</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{repeatBuyers}</div>
            <div className="text-[11px] text-emerald-600 font-medium">Multiple Orders Placed</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-slate-400 font-bold uppercase text-[10px]">Cumulative Customer LTV</div>
            <div className="text-2xl font-black text-purple-700 mt-1">NPR {totalLtv.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500">Gross Patronage Value</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search patron by name, email, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Patron / Collector</th>
                <th className="py-3.5 px-4">Contact Phone</th>
                <th className="py-3.5 px-4">Delivery Region</th>
                <th className="py-3.5 px-4">Orders Placed</th>
                <th className="py-3.5 px-4">Total Lifetime Spend</th>
                <th className="py-3.5 px-4">Collector Tier</th>
                <th className="py-3.5 px-5 text-right">Last Purchase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No customer profiles found. Once buyers complete checkout, their profiles appear here.
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-nepal-crimson text-white font-black text-xs flex items-center justify-center">
                        {c.name.substring(0, 1)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{c.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px] flex items-center gap-1 pt-4">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{c.phone}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{c.city}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-purple-700">
                      {c.total_orders} order{c.total_orders > 1 ? "s" : ""}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      NPR {Number(c.total_spent).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.total_orders > 2
                            ? "bg-purple-100 text-purple-900 border border-purple-200"
                            : c.total_orders > 1
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {c.total_orders > 2 ? "VIP Patron" : c.total_orders > 1 ? "Repeat Collector" : "First-Time Buyer"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-slate-400 text-[11px]">
                      {c.last_order_date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

