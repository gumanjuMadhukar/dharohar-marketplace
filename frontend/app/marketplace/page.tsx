"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Product, Category } from "@/lib/types";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { Filter, SlidersHorizontal, Search, RefreshCw } from "lucide-react";

function MarketplaceContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [studentMade, setStudentMade] = useState(searchParams.get("student_made") === "true");
  const [handmade, setHandmade] = useState(searchParams.get("handmade") === "true");
  const [ecoFriendly, setEcoFriendly] = useState(searchParams.get("eco_friendly") === "true");
  const [sort, setSort] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCategory) params.append("category", selectedCategory);
      if (type) params.append("type", type);
      if (studentMade) params.append("student_made", "true");
      if (handmade) params.append("handmade", "true");
      if (ecoFriendly) params.append("eco_friendly", "true");
      if (minPrice) params.append("min_price", minPrice);
      if (maxPrice) params.append("max_price", maxPrice);
      params.append("sort", sort);

      const res = await api.get(`/products?${params.toString()}`);
      if (res.data?.data) {
        setProducts(res.data.data.data || res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get("/categories").then((res) => {
      if (res.data?.data) setCategories(res.data.data);
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, type, studentMade, handmade, ecoFriendly, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setType("");
    setStudentMade(false);
    setHandmade(false);
    setEcoFriendly(false);
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-nepal-gold/20">
        <div>
          <h1 className="text-3xl font-black text-nepal-earth">Marketplace</h1>
          <p className="text-sm text-gray-600 mt-1">
            Browse authentic artisanal handicrafts, Thangka mandalas, and student innovations from Nepal.
          </p>
        </div>

        {/* Sort & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Filter items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white pl-9 pr-4 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-nepal-crimson"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
          </form>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-nepal-earth focus:outline-none focus:ring-2 focus:ring-nepal-crimson"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ── Filter Sidebar ───────────────────────────────────── */}
        <aside className="lg:col-span-1 space-y-6 bg-white p-6 rounded-2xl border border-nepal-gold/20 shadow-sm h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2 font-bold text-sm text-nepal-earth">
              <SlidersHorizontal className="w-4 h-4 text-nepal-crimson" />
              <span>Filters</span>
            </div>
            <button
              onClick={clearFilters}
              className="text-xs text-nepal-crimson hover:underline font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Badges / Special Creators */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Creator Badges
            </h4>
            <label className="flex items-center gap-2.5 text-xs font-semibold text-nepal-earth cursor-pointer">
              <input
                type="checkbox"
                checked={studentMade}
                onChange={(e) => setStudentMade(e.target.checked)}
                className="rounded text-nepal-crimson focus:ring-nepal-crimson"
              />
              <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                🎓 Student & Child Creator
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-semibold text-nepal-earth cursor-pointer">
              <input
                type="checkbox"
                checked={handmade}
                onChange={(e) => setHandmade(e.target.checked)}
                className="rounded text-nepal-crimson focus:ring-nepal-crimson"
              />
              <span className="text-red-800 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                🔨 Authentic Handmade
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-semibold text-nepal-earth cursor-pointer">
              <input
                type="checkbox"
                checked={ecoFriendly}
                onChange={(e) => setEcoFriendly(e.target.checked)}
                className="rounded text-nepal-crimson focus:ring-nepal-crimson"
              />
              <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                🌿 Eco-Friendly
              </span>
            </label>
          </div>

          {/* Categories */}
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Categories
            </h4>
            <div
              onClick={() => setSelectedCategory("")}
              className={`text-xs py-1.5 px-2.5 rounded-lg cursor-pointer transition ${
                selectedCategory === ""
                  ? "bg-nepal-crimson text-white font-bold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              All Categories
            </div>
            {categories.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCategory(c.slug)}
                className={`text-xs py-1.5 px-2.5 rounded-lg cursor-pointer transition flex items-center justify-between ${
                  selectedCategory === c.slug
                    ? "bg-nepal-crimson text-white font-bold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{c.name}</span>
                <span className="text-[10px] opacity-75">{c.products_count}</span>
              </div>
            ))}
          </div>

          {/* Product Type */}
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Listing Format
            </h4>
            {[
              { id: "", label: "All Formats" },
              { id: "physical", label: "Physical Goods" },
              { id: "digital", label: "Digital Art & Files" },
              { id: "idea", label: "Proposals & Prototypes" },
            ].map((fmt) => (
              <label
                key={fmt.id}
                className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer"
              >
                <input
                  type="radio"
                  name="product_type"
                  checked={type === fmt.id}
                  onChange={() => setType(fmt.id)}
                  className="text-nepal-crimson focus:ring-nepal-crimson"
                />
                <span>{fmt.label}</span>
              </label>
            ))}
          </div>

          {/* Price Range */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Price Range (NPR)
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 p-2 border border-gray-200 rounded-lg text-xs"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 p-2 border border-gray-200 rounded-lg text-xs"
              />
            </div>
            <button
              onClick={fetchProducts}
              className="w-full py-2 bg-nepal-earth hover:bg-black text-white text-xs font-bold rounded-lg transition"
            >
              Apply Price
            </button>
          </div>
        </aside>

        {/* ── Product Grid ─────────────────────────────────────── */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse space-y-4"
                >
                  <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <div className="text-4xl mb-3">🏔️</div>
              <h3 className="text-base font-bold text-nepal-earth">No artifacts found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                No products match your selected filters. Try resetting the criteria or searching for something else.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-nepal-crimson text-white rounded-full text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Loading Marketplace...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}

