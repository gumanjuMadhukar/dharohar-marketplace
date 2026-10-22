"use client";

import React from "react";
import { BookOpen, Sparkles, DollarSign, Camera, Lightbulb } from "lucide-react";

export default function StudentAcademyPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Dharohar Youth Academy</h2>
            <p className="text-xs text-slate-500">
              Masterclasses on product packaging, fair pricing formulas, and zero-cost digital scaling.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="font-black text-sm text-slate-900">1. Fair Craft Pricing Formula</h3>
          <p className="text-slate-500 leading-relaxed">
            Raw Materials + (Labor Hours × Fair Hourly Wage) = Base Price. On Dharohar, you keep 97% of every sale!
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <h3 className="font-black text-sm text-slate-900">2. Natural Sunlight Photography</h3>
          <p className="text-slate-500 leading-relaxed">
            Place your creation next to an open window in the morning. Highlight handmade brush strokes and Lokta fiber textures.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h3 className="font-black text-sm text-slate-900">3. Scale with Digital Mandalas</h3>
          <p className="text-slate-500 leading-relaxed">
            Scan your ink drawings or vectorize them on iPad / Illustrator. Buyers receive instant digital downloads with zero shipping costs.
          </p>
        </div>
      </div>
    </div>
  );
}
