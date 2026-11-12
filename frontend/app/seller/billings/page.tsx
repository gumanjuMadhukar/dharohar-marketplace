"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Receipt,
  DollarSign,
  TrendingUp,
  Percent,
  Clock,
  CheckCircle,
  ShieldCheck,
  CreditCard,
  Download,
} from "lucide-react";
import Link from "next/link";

export default function SellerBillingsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillings();
  }, []);

  const loadBillings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/seller/billings");
      if (res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      console.warn("Failed to load billings:", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const summary = data?.summary || {
    gross_gmv: 0,
    commission_rate: 10,
    commission_paid: 0,
    net_settled: 0,
    escrow_in_transit: 0,
  };

  const ledger = data?.ledger || [];

  return (
    <div className="space-y-4 w-full">
      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-slate-500 font-bold uppercase text-[10px]">Gross Sales Volume</div>
            <div className="text-2xl font-black text-white mt-1">
              NPR {Number(summary.gross_gmv).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">Retail Order Total</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-950/80 border border-purple-800 text-purple-400 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-slate-500 font-bold uppercase text-[10px]">Platform Commission</div>
            <div className="text-2xl font-black text-rose-400 mt-1">
              NPR {Number(summary.commission_paid).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">Tier Rate: {summary.commission_rate}%</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center font-bold">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-slate-500 font-bold uppercase text-[10px]">Net Escrow Credited</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              NPR {Number(summary.net_settled).toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium">Merchant Earnings Ledger</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-slate-500 font-bold uppercase text-[10px]">Escrow in Transit</div>
            <div className="text-2xl font-black text-amber-400 mt-1">
              NPR {Number(summary.escrow_in_transit).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">Pending Customer Delivery</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Escrow Rule Banner */}
      <div className="p-5 bg-gradient-to-r from-amber-950/90 via-slate-900 to-rose-950/90 border border-amber-900/60 text-white rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-black text-sm">Nepal Escrow Inward Settlement Protocol</h3>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Customer funds are held securely in Nepal digital wallet escrow (eSewa / Khalti / Cards). Once tracking indicates delivery, net funds are immediately unlocked for withdrawal to your bank account.
          </p>
        </div>
        <Link
          href="/seller/payouts"
          className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition whitespace-nowrap"
        >
          Request Withdrawal
        </Link>
      </div>

      {/* Transaction Settlement Ledger */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-white">Financial Settlement Ledger</h3>
            <p className="text-xs text-slate-400">Item-by-item commission deductions and net wallet deposits</p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Statement</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Date / Time</th>
                <th className="py-3.5 px-4">Order Ref #</th>
                <th className="py-3.5 px-4">Sold Item</th>
                <th className="py-3.5 px-4">Payment Rail</th>
                <th className="py-3.5 px-4 text-right">Gross Total</th>
                <th className="py-3.5 px-4 text-right">Fee ({summary.commission_rate}%)</th>
                <th className="py-3.5 px-5 text-right">Net Credited</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No settled transactions in ledger yet.
                  </td>
                </tr>
              ) : (
                ledger.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-5 font-mono text-slate-400 text-[11px]">{tx.date}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{tx.order_number}</td>
                    <td className="py-3.5 px-4 font-bold text-white line-clamp-1">{tx.item_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-bold uppercase text-[10px]">
                        {tx.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-300">
                      NPR {Number(tx.gross).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-rose-400 font-semibold">
                      - NPR {Number(tx.commission).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-right font-black text-emerald-400 font-mono">
                      + NPR {Number(tx.net_credit).toLocaleString()}
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
