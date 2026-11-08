"use client";

import React from "react";
import {
  Mail,
  Printer,
  CheckCircle2,
  X,
  Package,
  ShieldCheck,
  ExternalLink,
  MapPin,
  Calendar,
  Sparkles,
} from "lucide-react";

interface PurchaseEmailModalProps {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  paymentMethod: string;
  transactionId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    storeName?: string;
  }>;
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  onClose: () => void;
}

export function PurchaseEmailModal({
  orderNumber,
  customerName,
  customerEmail,
  shippingAddress,
  paymentMethod,
  transactionId,
  items,
  subtotal,
  deliveryCharge,
  grandTotal,
  onClose,
}: PurchaseEmailModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-nepal-gold/30 animate-in fade-in zoom-in-95 my-8">
        {/* Email Header Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-nepal-gold" />
            <span className="text-xs font-bold text-slate-200">
              Automated Customer Email Notification Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition flex items-center gap-1 text-xs"
              title="Print Invoice / Email"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Receipt</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Email Body Canvas */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 bg-nepal-parchment/30">
          {/* Header & Logo */}
          <div className="flex items-center justify-between pb-6 border-b border-nepal-gold/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-nepal-crimson to-nepal-gold text-white font-black text-2xl flex items-center justify-center shadow-md">
                ध
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-nepal-earth">Dharohar (धरोहर)</h1>
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  Authentic Nepali Artisan & Student Marketplace
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-block">
                Paid & Verified ✅
              </span>
              <div className="text-[11px] font-mono text-slate-500 mt-1">
                Ref: {orderNumber}
              </div>
            </div>
          </div>

          {/* Salutation */}
          <div className="space-y-1">
            <h2 className="text-base font-black text-nepal-earth">
              Namaste, {customerName}! 🙏
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your order has been confirmed and placed with our master artisan workshops. Thank you for supporting generational craftsmanship and youth innovation in Nepal.
            </p>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Order Number</div>
              <div className="font-mono font-bold text-slate-900 mt-0.5">{orderNumber}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Payment Gateway</div>
              <div className="font-bold text-nepal-crimson capitalize mt-0.5">{paymentMethod}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Gateway Ref</div>
              <div className="font-mono text-[10px] text-slate-700 truncate mt-0.5">{transactionId}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Order Date</div>
              <div className="text-slate-700 mt-0.5">{new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-nepal-crimson" />
              <span>Delivery Address & Recipient</span>
            </div>
            <div className="font-bold text-slate-900">{customerName} ({customerEmail})</div>
            <div className="text-slate-600">{shippingAddress}</div>
          </div>

          {/* Line Items Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Artifact Description</th>
                  <th className="px-4 py-2.5 text-center">Qty</th>
                  <th className="px-4 py-2.5 text-right">Price (NPR)</th>
                  <th className="px-4 py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx} className="font-medium">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      {item.storeName && (
                        <div className="text-[10px] text-slate-500">Workshop: {item.storeName}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      NPR {Number(item.price).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-nepal-crimson">
                      NPR {(Number(item.price) * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Breakdown */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>NPR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Nepal Domestic Shipping:</span>
                <span>NPR {deliveryCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>13% Nepal VAT (Included):</span>
                <span>NPR {Math.round(grandTotal * 0.13 / 1.13).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-black text-nepal-crimson pt-2 border-t border-slate-200">
                <span>Total Amount Paid:</span>
                <span>NPR {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Protection Notice */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/60 text-[11px] text-amber-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>
              <strong>7-Day Escrow Buyer Protection Active:</strong> Your funds are securely held in escrow until you receive and inspect your package.
            </span>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-nepal-crimson hover:bg-nepal-crimsonDark text-white font-bold text-xs shadow-md transition"
            >
              Close & View Order History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
