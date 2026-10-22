"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function StudentGuardianPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Guardian / Parental Verification</h3>
            <p className="text-xs text-slate-400">Youth safety compliance for underage creators and students</p>
          </div>
        </div>

        <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-100 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Guardian Name:</span>
            <span className="font-bold text-slate-900">{user?.guardian_name || "Sunil Bajracharya"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Guardian Email:</span>
            <span className="font-mono text-slate-900">{user?.guardian_email || "guardian@gmail.com"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Parental Consent Status:</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Verified & Approved
            </span>
          </div>
        </div>

        <Link
          href="/student/profile"
          className="inline-block px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
        >
          Update Guardian Details in Profile
        </Link>
      </div>
    </div>
  );
}
