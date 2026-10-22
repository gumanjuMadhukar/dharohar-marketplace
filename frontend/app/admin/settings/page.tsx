"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Settings, CheckCircle } from "lucide-react";

export default function AdminSettingsPage() {
  const [platformCommission, setPlatformCommission] = useState("10.0");
  const [studentCommission, setStudentCommission] = useState("3.0");
  const [settingsMsg, setSettingsMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/settings")
      .then((res) => {
        if (res.data?.settings) {
          if (res.data.settings.platform_commission) setPlatformCommission(res.data.settings.platform_commission);
          if (res.data.settings.student_commission) setStudentCommission(res.data.settings.student_commission);
        }
      })
      .catch((err) => {
        console.warn("Failed to load settings:", err?.response?.data?.message || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg("");
    try {
      const res = await api.post("/admin/settings", {
        platform_commission: Number(platformCommission),
        student_commission: Number(studentCommission),
      });
      if (res.data?.success) {
        setSettingsMsg("Platform settings saved and applied system-wide!");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update settings");
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSaveSettings}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 max-w-xl"
      >
        <h3 className="text-base font-black text-slate-900">Platform Commission & Gateways</h3>

        {settingsMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{settingsMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Standard Artisan / Merchant Commission (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={platformCommission}
              onChange={(e) => setPlatformCommission(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400">Default rate charged on retail marketplace sales.</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Subsidized Student Creator Commission (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={studentCommission}
              onChange={(e) => setStudentCommission(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400">Subsidized youth fee (recommended: 3.0%).</span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            Enforce Global Settings
          </button>
        </div>
      </form>
    </div>
  );
}
