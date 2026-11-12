"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function StudentGuardianPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Guardian / Parental Verification</h3>
            <p className="text-xs text-slate-400">Youth safety compliance for underage creators and students</p>
          </div>
        </div>

        <div className="p-5 bg-emerald-950/40 rounded-2xl border border-emerald-800/60 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Guardian Name:</span>
            <span className="font-bold text-white">{user?.guardian_name || "Sunil Bajracharya"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Guardian Email:</span>
            <span className="font-mono text-emerald-300">{user?.guardian_email || "guardian@gmail.com"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Parental Consent Status:</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/80 text-emerald-300 border border-emerald-700">
              Verified & Approved
            </span>
          </div>
        </div>

        <Link
          href="/student/profile"
          className="inline-block px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition"
        >
          Update Guardian Details in Profile
        </Link>
      </div>
    </div>
  );
}
