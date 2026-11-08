"use client";

import React, { useState } from "react";
import {
  Settings,
  Palette,
  CheckCircle,
  Save,
  Award,
} from "lucide-react";

export default function CreatorSettingsPage() {
  const [toast, setToast] = useState<string | null>(null);

  const [name, setName] = useState("Umesh Shakya");
  const [lineage, setLineage] = useState("7th Generation Shakya Bronze Sculptor Clan, Patan");
  const [specialty, setSpecialty] = useState("Lost-Wax Casting & Mercury Fire Gilding of Vajrayana Deities");
  const [bio, setBio] = useState("Practicing sacred metal casting for 28 years under master apprenticeship, preserving generational Newari metallurgy traditions.");
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setToast("Artisan lineage & master atelier profile updated successfully.");
      setTimeout(() => setToast(null), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-400" />
          <span>Master Artisan Profile & Generational Lineage</span>
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          Update your public craft story, generational heritage lineage, and sacred iconography master credentials.
        </p>
      </div>

      {toast && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 sm:p-6 shadow-md max-w-2xl space-y-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Master Artisan Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-950 rounded-xl border border-stone-800 text-xs text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Generational Heritage Lineage & Guild Clan
            </label>
            <input
              type="text"
              required
              value={lineage}
              onChange={(e) => setLineage(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-950 rounded-xl border border-stone-800 text-xs text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Master Atelier Specialty
            </label>
            <input
              type="text"
              required
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-950 rounded-xl border border-stone-800 text-xs text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Atelier Bio & Craft Description
            </label>
            <textarea
              rows={4}
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-950 rounded-xl border border-stone-800 text-xs text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Master Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
