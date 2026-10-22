"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Wallet, DollarSign, CheckCircle } from "lucide-react";

export default function SellerPayoutsPage() {
  const [payoutsData, setPayoutsData] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("esewa");
  const [details, setDetails] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    try {
      const res = await api.get("/seller/payouts");
      if (res.data) setPayoutsData(res.data);
    } catch (e) {}
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");
    try {
      const res = await api.post("/seller/payouts", {
        amount: Number(amount),
        payment_method: method,
        account_details: details,
      });
      if (res.data?.success) {
        setMsg(res.data.message);
        setAmount("");
        setDetails("");
        loadPayouts();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit payout request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase">Net Sales (After Commission)</span>
          <div className="text-2xl font-black text-slate-900">
            NPR {payoutsData ? Number(payoutsData.net_earned).toLocaleString() : "0"}
          </div>
          <span className="text-[11px] text-slate-500">
            Gross: NPR {payoutsData ? Number(payoutsData.gross_revenue).toLocaleString() : "0"}
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs text-emerald-600 font-bold uppercase">Available Payout Balance</span>
          <div className="text-2xl font-black text-emerald-600">
            NPR {payoutsData ? Number(payoutsData.available_balance).toLocaleString() : "0"}
          </div>
          <span className="text-[11px] text-emerald-700 font-bold">Ready for instant withdrawal</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase">Lifetime Paid Out</span>
          <div className="text-2xl font-black text-slate-700">
            NPR {payoutsData ? Number(payoutsData.paid_out).toLocaleString() : "0"}
          </div>
          <span className="text-[11px] text-slate-500">Settled to Wallets / Banks</span>
        </div>
      </div>

      {/* Payout Request Form */}
      <form onSubmit={handleRequest} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Request Direct Wallet or Bank Withdrawal
        </h4>

        {msg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{msg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Amount to Withdraw (NPR)</label>
            <input
              type="number"
              required
              min="500"
              placeholder="Min NPR 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
            >
              <option value="esewa">eSewa Mobile Wallet</option>
              <option value="khalti">Khalti Digital Wallet</option>
              <option value="bank_transfer">Nepali Commercial Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Wallet ID / Bank Account Details</label>
            <input
              type="text"
              required
              placeholder="e.g. 98XXXXXXXX or Nabil Bank AC: 0123..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            {submitting ? "Submitting..." : "Submit Payout Request"}
          </button>
        </div>
      </form>

      {/* Transaction History */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider text-[10px]">
          Payout Transaction Audit History
        </div>
        {payoutsData?.payouts?.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No payout requests submitted yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {(payoutsData?.payouts || []).map((p: any) => (
              <div key={p.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">NPR {Number(p.amount).toLocaleString()}</div>
                  <div className="text-[11px] text-slate-400 uppercase">
                    {p.payment_method} • Ref: {p.transaction_reference}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    p.status === "completed" || p.status === "paid"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
