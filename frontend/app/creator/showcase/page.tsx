"use client";

import React, { useState } from "react";
import {
  Palette,
  Award,
  Sparkles,
  CheckCircle,
  Plus,
  BookOpen,
} from "lucide-react";

export default function CreatorShowcasePage() {
  const [toast, setToast] = useState<string | null>(null);

  const [artworks] = useState([
    {
      id: 1,
      title: "18th-Century Style Shakyamuni Buddha Bronze (24K Gold Gilded)",
      provenance: "7th Generation Newar Lost-Wax Casting Tradition, Patan",
      material: "Solid Bronze, Mercury Fire Gilding, Ground Lapis Lazuli",
      certificate: "DOA-ARCH-2026-901",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
    },
    {
      id: 2,
      title: "Mineral Pigment Chenrezig Mandalas on Cotton Canvas",
      provenance: "Generational Thangka school, gold leaf illumination",
      material: "Hand-spun Cotton Canvas, Tibetan Pigments, 24K Gold",
      certificate: "DOA-ARCH-2026-902",
      image: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=600",
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Palette className="w-6 h-6 text-amber-700" />
            <span>Heritage Portfolio & Craft Storytelling</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Showcase generational artistic provenance, publish sacred technique stories, and attach digital authenticity certificates.
          </p>
        </div>

        <button
          onClick={() => {
            setToast("Artisan storytelling editor opened. New heritage provenance certificate drafted.");
            setTimeout(() => setToast(null), 3000);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Heritage Masterpiece</span>
        </button>
      </div>

      {toast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {artworks.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div className="relative aspect-video bg-stone-900">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                <Award className="w-3 h-3" />
                <span>Govt Certified</span>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <h2 className="text-sm font-black text-stone-900">{item.title}</h2>
              <div className="text-xs text-stone-600">
                Provenance: <strong className="text-stone-800">{item.provenance}</strong>
              </div>
              <div className="text-[11px] text-stone-500">
                Materials: {item.material}
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-stone-400 font-bold">{item.certificate}</span>
                <span className="text-amber-800 font-bold hover:underline cursor-pointer">
                  Inspect Certificate & Story →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
