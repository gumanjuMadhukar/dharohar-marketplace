"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Shield,
  UserCheck,
} from "lucide-react";

export default function AdminUsersPage() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [userRole, setUserRole] = useState("all");

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("password123");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserRole, setNewUserRole] = useState("seller");

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    loadUsers();
  }, [userRole]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?q=${encodeURIComponent(userSearch)}&role=${userRole}`);
      if (res.data?.data) {
        setUsersList(res.data.data.data || res.data.data);
      }
    } catch (err: any) {
      console.warn("Failed to load users:", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/admin/users", {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        phone: newUserPhone,
        account_type: newUserRole,
      });
      if (res.data?.success) {
        setShowCreateModal(false);
        setNewUserName("");
        setNewUserEmail("");
        setNewUserPhone("");
        loadUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create user");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await api.put(`/admin/users/${editingUser.id}`, {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        account_type: editingUser.account_type,
        is_active: editingUser.is_active,
        is_verified: editingUser.is_verified,
      });
      if (res.data?.success) {
        setEditingUser(null);
        loadUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update user");
    }
  };

  const handleToggleBan = async (id: number) => {
    try {
      const res = await api.post(`/admin/users/${id}/ban`);
      if (res.data?.success) {
        setUsersList(usersList.map((u) => (u.id === id ? { ...u, is_active: res.data.is_active } : u)));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsersList(usersList.filter((u) => u.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Add Button */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadUsers()}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="seller">Artisans / Sellers</option>
            <option value="manufacturer">Manufacturers</option>
            <option value="student">Student Creators</option>
            <option value="customer">Buyers</option>
          </select>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Member</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Contact Phone</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">KYC Trust</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-5 flex items-center gap-3">
                    <img
                      src={u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                      alt={u.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[10px] font-bold uppercase border border-purple-200/60">
                      {u.account_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{u.phone || "—"}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {u.is_active ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {u.is_verified ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Unverified</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right space-x-1">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="p-1.5 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg inline-block transition"
                      title="Edit Member"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleBan(u.id)}
                      className={`p-1.5 rounded-lg inline-block transition ${
                        u.is_active ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50" : "text-amber-600 bg-amber-50"
                      }`}
                      title={u.is_active ? "Suspend Account" : "Activate Account"}
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg inline-block transition"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateUser} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-slate-900">Add Platform Member</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 text-lg font-bold">
                ✕
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              >
                <option value="seller">Seller / Artisan</option>
                <option value="student">Student Creator</option>
                <option value="manufacturer">Manufacturer</option>
                <option value="customer">Buyer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={newUserPhone}
                onChange={(e) => setNewUserPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Temporary Password</label>
              <input
                type="password"
                required
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs">
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleUpdateUser} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-slate-900">Edit Member: {editingUser.name}</h3>
              <button type="button" onClick={() => setEditingUser(null)} className="text-slate-400 text-lg font-bold">
                ✕
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Role</label>
              <select
                value={editingUser.account_type}
                onChange={(e) => setEditingUser({ ...editingUser, account_type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              >
                <option value="seller">Seller / Artisan</option>
                <option value="student">Student Creator</option>
                <option value="manufacturer">Manufacturer</option>
                <option value="customer">Buyer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingUser.is_active}
                  onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })}
                />
                <span>Active Account</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingUser.is_verified}
                  onChange={(e) => setEditingUser({ ...editingUser, is_verified: e.target.checked })}
                />
                <span>Verified Trust Badge</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
