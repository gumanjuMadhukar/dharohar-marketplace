"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  DollarSign,
  TrendingUp,
  CheckCircle,
  FileText,
} from "lucide-react";

export default function OwnerReportsPage() {
  const [toast, setToast] = useState<string | null>(null);

  const [ledger] = useState([
    {
      id: "PAY-2026-10",
      period: "October 2026",
      grossSales: "Rs. 2,840,000",
      platformFee: "Rs. 284,000 (10%)",
      netPaid: "Rs. 2,556,000",
      status: "Disbursed via eSewa Enterprise",
      date: "Nov 01, 2026",
    },
    {
      id: "PAY-2026-09",
      period: "September 2026",
      grossSales: "Rs. 2,190,000",
      platformFee: "Rs. 219,000 (10%)",
      netPaid: "Rs. 1,971,000",
      status: "Disbursed via Khalti Pay",
      date: "Oct 01, 2026",
    },
  ]);

  const handleDownloadInvoice = (id: string) => {
    setToast(`Generating official Nepal Tax VAT/PAN receipt for ${id}... Download started.`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
            <span>Financials, Escrow & VAT Ledgers</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Complete reconciliation of multi-store revenue, platform commission deductions, and certified VAT/PAN tax statements.
          </p>
        </div>

        <button
          onClick={() => handleDownloadInvoice("Summary-2026")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Annual Financial Report (CSV)</span>
        </button>
      </div>

      {toast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Monthly Statements Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase text-stone-400">Monthly Payout Statements</h2>
          <span className="text-xs text-emerald-700 font-bold">Audited by Dharohar Financial Core</span>
        </div>

        <div className="divide-y divide-stone-100">
          {ledger.map((item) => (
            <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-stone-900">{item.period}</span>
                  <span className="font-mono text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                    {item.id}
                  </span>
                </div>
                <div className="text-xs text-stone-600">
                  Gross: <strong>{item.grossSales}</strong> • Platform Fee: <span className="text-red-600">{item.platformFee}</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-bold">
                  {item.status} on {item.date}
                </div>
              </div>

              <div className="flex items-center gap-4 self-end md:self-auto">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Net Disbursed</div>
                  <div className="text-base font-black text-emerald-800">{item.netPaid}</div>
                </div>

                <button
                  onClick={() => handleDownloadInvoice(item.id)}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>VAT Receipt</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
