"use client";

import React, { useState } from "react";
import {
  Settings,
  Building2,
  CheckCircle,
  Save,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

export default function OwnerSettingsPage() {
  const [toast, setToast] = useState<string | null>(null);

  const [orgName, setOrgName] = useState("Bhaktapur Traditional Arts Collective Ltd");
  const [panNumber, setPanNumber] = useState("PAN-302918471");
  const [bankAccount, setBankAccount] = useState("Global IME Bank — A/C 019200491823901");
  const [contactEmail, setContactEmail] = useState("owner.gallery@dharohar.com");
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setToast("Organization legal and payout banking credentials updated successfully.");
      setTimeout(() => setToast(null), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-700" />
          <span>Organization & Legal Tax Settings</span>
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Manage your registered enterprise legal profile, Inland Revenue Department PAN/VAT registration, and banking payout routing.
        </p>
      </div>

      {toast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm max-w-2xl space-y-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Registered Legal Enterprise Name
            </label>
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Nepal Government PAN / VAT Certificate Number
            </label>
            <input
              type="text"
              required
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Corporate Payout Bank Account (Nepal Clearance)
            </label>
            <input
              type="text"
              required
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Executive Notice Email
            </label>
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Enterprise Settings"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
