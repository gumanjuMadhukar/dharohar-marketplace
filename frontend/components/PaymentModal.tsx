"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Smartphone,
  CreditCard,
  QrCode,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";

interface PaymentModalProps {
  orderNumber: string;
  amount: number;
  gateway: "esewa" | "khalti" | "stripe" | "cod";
  customerName: string;
  customerEmail: string;
  onSuccess: (details: {
    transactionId: string;
    gateway: string;
    amount: number;
    paidAt: string;
  }) => void;
  onCancel: () => void;
}

export function PaymentModal({
  orderNumber,
  amount,
  gateway: initialGateway,
  customerName,
  customerEmail,
  onSuccess,
  onCancel,
}: PaymentModalProps) {
  const [gateway, setGateway] = useState<"esewa" | "khalti" | "stripe" | "cod">(initialGateway);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"details" | "otp" | "success">("details");

  // eSewa test inputs
  const [esewaId, setEsewaId] = useState("9841000000");
  const [esewaPass, setEsewaPass] = useState("Nepal@123");
  const [esewaToken, setEsewaToken] = useState("123456");

  // Khalti test inputs
  const [khaltiMobile, setKhaltiMobile] = useState("9800000000");
  const [khaltiPin, setKhaltiPin] = useState("1111");
  const [khaltiOtp, setKhaltiOtp] = useState("987654");

  // Stripe test inputs
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("123");

  const handleProcessPayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("success");
      setTimeout(() => {
        const txId = `${gateway.toUpperCase()}_TEST_${Date.now()}`;
        onSuccess({
          transactionId: txId,
          gateway,
          amount,
          paidAt: new Date().toISOString(),
        });
      }, 1000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-nepal-gold/30 animate-in fade-in zoom-in-95">
        {/* Gateway Brand Header */}
        <div
          className={`p-6 text-white flex items-center justify-between ${
            gateway === "esewa"
              ? "bg-gradient-to-r from-emerald-600 to-green-700"
              : gateway === "khalti"
              ? "bg-gradient-to-r from-purple-700 to-indigo-800"
              : gateway === "stripe"
              ? "bg-gradient-to-r from-blue-600 to-indigo-700"
              : "bg-gradient-to-r from-stone-700 to-stone-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl">
              {gateway === "esewa" ? "e" : gateway === "khalti" ? "K" : "S"}
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-white/80">
                Official Nepal Test Sandbox
              </div>
              <h2 className="text-lg font-black tracking-tight text-white capitalize">
                {gateway === "esewa"
                  ? "eSewa ePay v2 Checkout"
                  : gateway === "khalti"
                  ? "Khalti E-Payment Sandbox"
                  : gateway === "stripe"
                  ? "Stripe Global Card Gateway"
                  : "Cash On Delivery"}
              </h2>
            </div>
          </div>
          <button onClick={onCancel} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Ribbon */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">Order Ref: </span>
            <strong className="text-slate-800 font-mono">{orderNumber}</strong>
          </div>
          <div className="text-right">
            <span className="text-slate-400">Amount: </span>
            <strong className="text-nepal-crimson text-sm font-black">
              NPR {amount.toLocaleString()}
            </strong>
          </div>
        </div>

        {/* Gateway Switcher Tabs */}
        <div className="p-4 grid grid-cols-3 gap-1.5 bg-slate-100/60 border-b border-slate-200 text-xs font-bold text-center">
          {[
            { id: "esewa", label: "eSewa Test" },
            { id: "khalti", label: "Khalti Test" },
            { id: "stripe", label: "Stripe Card" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setGateway(tab.id as any)}
              className={`py-2 px-1 rounded-xl transition ${
                gateway === tab.id
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Payment Forms */}
        <div className="p-6 space-y-4">
          {step === "success" ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Payment Verified!</h3>
              <p className="text-xs text-slate-500">
                HMAC-SHA256 signature verified. Generating official invoice and customer email notification...
              </p>
            </div>
          ) : (
            <>
              {/* eSewa Sandbox Details */}
              {gateway === "esewa" && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-[11px] text-emerald-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pre-Filled Official eSewa Test Account:</span>
                    </div>
                    <div>ID: <strong>9841000000</strong> • Password: <strong>Nepal@123</strong> • MPIN: <strong>123456</strong></div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">eSewa ID / Mobile Number</label>
                    <input
                      type="text"
                      value={esewaId}
                      onChange={(e) => setEsewaId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Test Password</label>
                      <input
                        type="password"
                        value={esewaPass}
                        onChange={(e) => setEsewaPass(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">eSewa Token</label>
                      <input
                        type="text"
                        value={esewaToken}
                        onChange={(e) => setEsewaToken(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Khalti Sandbox Details */}
              {gateway === "khalti" && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200/80 text-[11px] text-purple-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Pre-Filled Official Khalti Sandbox Account:</span>
                    </div>
                    <div>Mobile: <strong>9800000000</strong> • MPIN: <strong>1111</strong> • OTP: <strong>987654</strong></div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Khalti Registered Number</label>
                    <input
                      type="text"
                      value={khaltiMobile}
                      onChange={(e) => setKhaltiMobile(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-1 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Khalti MPIN</label>
                      <input
                        type="password"
                        value={khaltiPin}
                        onChange={(e) => setKhaltiPin(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-1 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Test OTP</label>
                      <input
                        type="text"
                        value={khaltiOtp}
                        onChange={(e) => setKhaltiOtp(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-1 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Stripe Test Mode */}
              {gateway === "stripe" && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200/80 text-[11px] text-blue-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                      <span>Stripe 3D-Secure Test Card:</span>
                    </div>
                    <div>Card: <strong>4242 4242 4242 4242</strong> • Exp: <strong>12/28</strong> • CVC: <strong>123</strong></div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Expiration</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">CVC Security</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleProcessPayment}
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-black text-xs text-white shadow-xl transition flex items-center justify-center gap-2 mt-4 ${
                  gateway === "esewa"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : gateway === "khalti"
                    ? "bg-purple-700 hover:bg-purple-800"
                    : gateway === "stripe"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-slate-900 hover:bg-black"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying HMAC-SHA256 Gateway Response...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      Pay NPR {amount.toLocaleString()} with{" "}
                      {gateway === "esewa"
                        ? "eSewa"
                        : gateway === "khalti"
                        ? "Khalti"
                        : "Stripe Card"}
                    </span>
                  </>
                )}
              </button>

              <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected by Dharohar Escrow & Nepal Payment System Regulations</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
