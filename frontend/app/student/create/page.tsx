"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function StudentCreatePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("idea");
  const [quantity, setQuantity] = useState("1");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isEco, setIsEco] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/categories").then((res) => {
      if (res.data?.data) {
        setCategories(res.data.data);
        if (res.data.data[0]) setCategoryId(res.data.data[0].id);
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: title,
        description,
        price: Number(price),
        type,
        quantity: Number(quantity),
        category_id: categoryId || 4, // Student Innovations
        is_student_made: true,
        is_handmade: true,
        is_eco_friendly: isEco,
        images: imageUrl
          ? [imageUrl]
          : ["https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800"],
      };

      const res = await api.post("/products", payload);
      if (res.data?.success) {
        router.push("/student/creations");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to publish creation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/student/creations"
          className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-base font-black text-slate-900">Publish Youth Creation</h2>
          <p className="text-xs text-slate-500">
            Tagged with the verified Student Creator badge and eligible for the subsidized 3% fee tier.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Creation / Idea Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Handcrafted Lokta Paper Mandala Sketchbook"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Creation Format</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:outline-none"
            >
              <option value="physical">Physical Handmade Craft / Product</option>
              <option value="digital">Digital Art / Vector Mandala / Design</option>
              <option value="idea">Youth Invention / Prototype Proposal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (NPR)</label>
            <input
              type="number"
              required
              min="50"
              placeholder="e.g. 1200"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Available Quantity / Stock</label>
            <input
              type="number"
              required
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Photo URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Story & Creative Process</label>
            <textarea
              rows={4}
              required
              placeholder="Describe your school/college project backstory, inspiration, or sustainable materials used..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
          <input
            type="checkbox"
            checked={isEco}
            onChange={(e) => setIsEco(e.target.checked)}
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>Eco-friendly & Sustainably Sourced (Lokta, hemp, natural plant dyes, upcycled)</span>
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/student/creations"
            className="px-5 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            {submitting ? "Publishing..." : "Publish Student Artifact"}
          </button>
        </div>
      </form>
    </div>
  );
}
