"use client";

import React from "react";
import { BookOpen, Sparkles, DollarSign, Camera, Lightbulb } from "lucide-react";

export default function StudentAcademyPage() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Dharohar Youth Academy</h2>
            <p className="text-xs text-slate-400">
              Masterclasses on product packaging, fair pricing formulas, and zero-cost digital scaling.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="font-black text-sm text-white">1. Fair Craft Pricing Formula</h3>
          <p className="text-slate-400 leading-relaxed">
            Raw Materials + (Labor Hours × Fair Hourly Wage) = Base Price. On Dharohar, you keep 97% of every sale!
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <h3 className="font-black text-sm text-white">2. Natural Sunlight Photography</h3>
          <p className="text-slate-400 leading-relaxed">
            Place your creation next to an open window in the morning. Highlight handmade brush strokes and Lokta fiber textures.
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h3 className="font-black text-sm text-white">3. Scale with Digital Mandalas</h3>
          <p className="text-slate-400 leading-relaxed">
            Scan your ink drawings or vectorize them on iPad / Illustrator. Buyers receive instant digital downloads with zero shipping costs.
          </p>
        </div>
      </div>
    </div>
  );
}
