"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Package,
  Search,
  Star,
  Trash2,
  ExternalLink,
  Plus,
  Edit,
  CheckCircle,
  AlertCircle,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";

export default function AdminProductsPage() {
  const [productsList, setProductsList] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [storeId, setStoreId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [type, setType] = useState("physical");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isHandmade, setIsHandmade] = useState(true);
  const [isStudentMade, setIsStudentMade] = useState(false);
  const [isEcoFriendly, setIsEcoFriendly] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Edit Modal
  const [editingProduct, setEditingProduct] = useState<any>(null);

  useEffect(() => {
    loadMetadata();
    loadProducts();
  }, [selectedCategory]);

  const loadMetadata = async () => {
    try {
      const [catRes, storeRes] = await Promise.all([
        api.get("/categories"),
        api.get("/admin/stores?per_page=100"),
      ]);
      if (catRes.data?.data) {
        setCategories(catRes.data.data);
        if (catRes.data.data[0]) setCategoryId(catRes.data.data[0].id);
      }
      if (storeRes.data?.data) {
        const storeArr = storeRes.data.data.data || storeRes.data.data;
        setStores(storeArr);
        if (storeArr[0]) setStoreId(storeArr[0].id);
      }
    } catch (e) {
      console.warn("Could not load categories or stores", e);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const catParam = selectedCategory !== "all" ? `&category_id=${selectedCategory}` : "";
      const res = await api.get(`/admin/products?q=${encodeURIComponent(search)}${catParam}`);
      if (res.data?.data) {
        setProductsList(res.data.data.data || res.data.data);
      }
    } catch (err: any) {
      console.warn("Failed to load products:", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/admin/products", {
        name,
        store_id: storeId,
        category_id: categoryId,
        price,
        compare_price: comparePrice || null,
        quantity,
        type,
        description,
        is_handmade: isHandmade,
        is_student_made: isStudentMade,
        is_featured: isFeatured,
        is_eco_friendly: isEcoFriendly,
        image_url: imageUrl || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500",
      });

      if (res.data?.success) {
        setShowCreateModal(false);
        resetForm();
        loadProducts();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create product");
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const res = await api.put(`/admin/products/${editingProduct.id}`, {
        name: editingProduct.name,
        store_id: editingProduct.store_id,
        category_id: editingProduct.category_id,
        price: editingProduct.price,
        compare_price: editingProduct.compare_price || null,
        quantity: editingProduct.quantity,
        type: editingProduct.type,
        description: editingProduct.description,
        is_handmade: editingProduct.is_handmade,
        is_student_made: editingProduct.is_student_made,
        is_featured: editingProduct.is_featured,
        is_eco_friendly: editingProduct.is_eco_friendly,
        is_active: editingProduct.is_active,
        image_url: editingProduct.image_url || editingProduct.primary_image?.url || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500",
      });

      if (res.data?.success) {
        setEditingProduct(null);
        loadProducts();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update product");
    }
  };

  const handleToggleFeature = async (id: number) => {
    try {
      const res = await api.post(`/admin/products/${id}/feature`);
      if (res.data?.success) {
        setProductsList(
          productsList.map((p) => (p.id === id ? { ...p, is_featured: res.data.is_featured } : p))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this product from the platform?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProductsList(productsList.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setComparePrice("");
    setQuantity("10");
    setDescription("");
    setImageUrl("");
    setIsFeatured(false);
  };

  return (
    <div className="space-y-4 w-full">
      {/* Top Controls: Search, Category Filter, and Add Product */}
      <div className="bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <input
              type="text"
              placeholder="Search product title, store..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadProducts()}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-600/40 focus:border-purple-600 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-800 text-xs font-bold text-slate-300 bg-slate-950 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Artifact</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Artifact Listing</th>
                <th className="py-3.5 px-4">Artisan Store</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Retail Price</th>
                <th className="py-3.5 px-4">Stock Units</th>
                <th className="py-3.5 px-4">Attributes</th>
                <th className="py-3.5 px-4">Featured</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {productsList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    No products found matching query. Click &quot;Publish Artifact&quot; to add one.
                  </td>
                </tr>
              ) : (
                productsList.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-5 flex items-center gap-3">
                      <img
                        src={p.primary_image?.url || p.primary_image?.image_url || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100"}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-800"
                      />
                      <div>
                        <div className="font-bold text-white line-clamp-1">{p.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{p.type || "physical artifact"}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">{p.store?.name || "Independent"}</td>
                    <td className="py-3.5 px-4 text-slate-400">{p.category?.name || "General"}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-black text-amber-400">NPR {Number(p.price).toLocaleString()}</div>
                      {p.compare_price && (
                        <div className="text-[10px] text-slate-500 line-through">
                          NPR {Number(p.compare_price).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          p.quantity > 5
                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                            : p.quantity > 0
                            ? "bg-amber-950/80 text-amber-300 border-amber-800"
                            : "bg-red-950/80 text-red-300 border-red-800"
                        }`}
                      >
                        {p.quantity > 0 ? `${p.quantity} units` : "Out of stock"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 space-x-1">
                      {p.is_student_made && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 text-[9px] font-bold uppercase">
                          Student
                        </span>
                      )}
                      {p.is_handmade && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[9px] font-bold uppercase">
                          Handmade
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleFeature(p.id)}
                        className={`p-1.5 rounded-lg transition ${
                          p.is_featured ? "text-amber-400 bg-amber-950/80 border border-amber-800" : "text-slate-600 hover:text-amber-400"
                        }`}
                        title="Toggle Homepage Showcase"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1 whitespace-nowrap">
                      <Link
                        href={`/products/${p.slug || p.id}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 inline-block transition"
                        title="View Live Listing"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => setEditingProduct(p)}
                        className="p-1.5 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-950/80 inline-block transition"
                        title="Edit Artifact"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/80 inline-block transition"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateProduct}
            className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-sm text-white">Publish New Heritage Artifact</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Artifact Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Traditional Hand-Carved Teak Mayur Jhyal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Artisan Store</label>
                <select
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Price (NPR)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="2500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Compare at Price (NPR)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="3000 (Optional)"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Inventory Quantity</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Item Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                >
                  <option value="physical" className="bg-slate-900 text-white">Physical Artifact</option>
                  <option value="digital" className="bg-slate-900 text-white">Digital Craft</option>
                  <option value="idea" className="bg-slate-900 text-white">Student Innovation Idea</option>
                  <option value="proposal" className="bg-slate-900 text-white">B2B Wholesale Proposal</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe authentic craftsmanship, raw materials, origin city..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHandmade}
                    onChange={(e) => setIsHandmade(e.target.checked)}
                  />
                  <span>Handmade Heritage</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isStudentMade}
                    onChange={(e) => setIsStudentMade(e.target.checked)}
                  />
                  <span>Student Created (3% fee)</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                  />
                  <span>Feature on Homepage</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-slate-800 bg-slate-950 text-slate-400 hover:text-white text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                Publish Artifact
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleUpdateProduct}
            className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-sm text-white">Edit Artifact: {editingProduct.name}</h3>
              <button type="button" onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-white text-lg font-bold">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Artisan Store</label>
                <select
                  value={editingProduct.store_id}
                  onChange={(e) => setEditingProduct({ ...editingProduct, store_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                <select
                  value={editingProduct.category_id}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Price (NPR)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Compare Price (NPR)</label>
                <input
                  type="number"
                  min="0"
                  value={editingProduct.compare_price || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, compare_price: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={editingProduct.quantity}
                  onChange={(e) => setEditingProduct({ ...editingProduct, quantity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Type</label>
                <select
                  value={editingProduct.type}
                  onChange={(e) => setEditingProduct({ ...editingProduct, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                >
                  <option value="physical" className="bg-slate-900 text-white">Physical Artifact</option>
                  <option value="digital" className="bg-slate-900 text-white">Digital Craft</option>
                  <option value="idea" className="bg-slate-900 text-white">Student Innovation Idea</option>
                  <option value="proposal" className="bg-slate-900 text-white">B2B Wholesale Proposal</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Image URL</label>
                <input
                  type="url"
                  value={editingProduct.image_url || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_handmade}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_handmade: e.target.checked })}
                  />
                  <span>Handmade Heritage</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_student_made}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_student_made: e.target.checked })}
                  />
                  <span>Student Created</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                  />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_active}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })}
                  />
                  <span>Active Listing</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 border border-slate-800 bg-slate-950 text-slate-400 hover:text-white text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
