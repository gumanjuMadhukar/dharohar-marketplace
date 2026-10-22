"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Key,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Camera,
  GraduationCap,
  Store,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState<"general" | "password" | "kyc">("general");

  // General profile state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  // KYC state
  const [docType, setDocType] = useState("citizenship");
  const [docNumber, setDocNumber] = useState("");
  const [docFront, setDocFront] = useState("");
  const [kycMsg, setKycMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [myKyc, setMyKyc] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setBio(user.bio || "");
      setAvatar(user.avatar || "");
      setGuardianName(user.guardian_name || "");
      setGuardianEmail(user.guardian_email || "");
      setGuardianConsent(!!user.guardian_consent);
      fetchKyc();
    }
  }, [user]);

  const fetchKyc = async () => {
    try {
      const res = await api.get("/kyc");
      if (res.data?.documents) {
        setMyKyc(res.data.documents);
      }
    } catch (e) {
      // Ignored
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const payload: any = { name, phone, bio, avatar };
      if (user?.account_type === "student") {
        payload.guardian_name = guardianName;
        payload.guardian_email = guardianEmail;
        payload.guardian_consent = guardianConsent;
      }
      const res = await api.put("/auth/profile", payload);
      if (res.data?.success) {
        setProfileMsg({ type: "success", text: "Profile updated successfully!" });
        const token = localStorage.getItem("dharohar_token") || "";
        login(token, res.data.user);
      }
    } catch (err: any) {
      setProfileMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: "error", text: "New password and confirmation do not match." });
      return;
    }
    setPassLoading(true);
    setPassMsg(null);
    try {
      const res = await api.post("/auth/password", {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      if (res.data?.success) {
        setPassMsg({ type: "success", text: "Password changed successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setPassMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update password.",
      });
    } finally {
      setPassLoading(false);
    }
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKycLoading(true);
    setKycMsg(null);
    try {
      const res = await api.post("/kyc", {
        document_type: docType,
        document_number: docNumber,
        front_image: docFront || "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400",
      });
      if (res.data?.success) {
        setKycMsg({ type: "success", text: "KYC document submitted for verification!" });
        setDocNumber("");
        setDocFront("");
        fetchKyc();
      }
    } catch (err: any) {
      setKycMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to submit KYC document.",
      });
    } finally {
      setKycLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-nepal-crimson mx-auto" />
        <h2 className="text-xl font-black text-nepal-earth">Authentication Required</h2>
        <p className="text-xs text-gray-500">Please sign in to access your profile and dashboard.</p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 bg-nepal-crimson text-white rounded-xl text-xs font-bold"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-nepal-earth via-nepal-crimsonDark to-nepal-crimson rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="relative">
            <img
              src={avatar || user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
              alt={user.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-nepal-gold/50 shadow-lg bg-nepal-earth"
            />
            {user.is_verified && (
              <span
                className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow"
                title="Verified Account"
              >
                <CheckCircle className="w-4 h-4" />
              </span>
            )}
          </div>
          <div className="text-center sm:text-left space-y-1 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-white">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-nepal-gold text-nepal-earth">
                {user.account_type}
              </span>
              {user.account_type === "student" && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-amber-950 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  3% Commission
                </span>
              )}
            </div>
            <p className="text-xs text-nepal-parchment/80">{user.email}</p>
            <p className="text-xs text-nepal-parchment/90 max-w-xl italic">
              {user.bio || "Crafting Nepal's indigenous cultural identity on Dharohar."}
            </p>
          </div>

          {/* Quick Dashboard Action Link */}
          <div className="flex flex-col gap-2">
            {user.account_type === "admin" && (
              <Link
                href="/admin"
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            {(user.account_type === "seller" || user.account_type === "manufacturer") && (
              <Link
                href="/seller/dashboard"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Store className="w-4 h-4" />
                <span>Seller Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            {user.account_type === "student" && (
              <Link
                href="/student/dashboard"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-nepal-earth rounded-xl text-xs font-black flex items-center gap-1.5 shadow"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            {user.account_type === "customer" && (
              <Link
                href="/account"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <span>My Orders & Bids</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab("general")}
          className={`pb-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
            activeTab === "general"
              ? "border-nepal-crimson text-nepal-crimson"
              : "border-transparent text-gray-500 hover:text-nepal-earth"
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>General Profile</span>
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`pb-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
            activeTab === "password"
              ? "border-nepal-crimson text-nepal-crimson"
              : "border-transparent text-gray-500 hover:text-nepal-earth"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Security & Password</span>
        </button>
        <button
          onClick={() => setActiveTab("kyc")}
          className={`pb-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
            activeTab === "kyc"
              ? "border-nepal-crimson text-nepal-crimson"
              : "border-transparent text-gray-500 hover:text-nepal-earth"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Identity KYC Verification</span>
          {user.is_verified ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>
      </div>

      {/* Tab 1: General Profile */}
      {activeTab === "general" && (
        <form onSubmit={handleUpdateProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          {profileMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                profileMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {profileMsg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-nepal-earth mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-nepal-earth mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-xs cursor-not-allowed"
              />
              <span className="text-[10px] text-gray-400">Account login email cannot be changed.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-nepal-earth mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="98XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-nepal-earth mb-1">Avatar Photo URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-nepal-earth mb-1">Artisan / Creator Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell buyers about your craftsmanship, heritage lineage, or student innovation focus..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
            />
          </div>

          {/* Student Creator Guardian Info */}
          {user.account_type === "student" && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <GraduationCap className="w-4 h-4 text-nepal-crimson" />
                <span>Guardian / Parental Consent Verification</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">Guardian Email</label>
                  <input
                    type="email"
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-xs"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-amber-950 font-medium">
                <input
                  type="checkbox"
                  checked={guardianConsent}
                  onChange={(e) => setGuardianConsent(e.target.checked)}
                  className="rounded border-amber-400 text-nepal-crimson focus:ring-nepal-crimson"
                />
                <span>Parent/Guardian has reviewed and consented to platform participation.</span>
              </label>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profileLoading}
              className="px-6 py-2.5 bg-nepal-crimson hover:bg-nepal-crimsonDark text-white text-xs font-bold rounded-xl shadow transition"
            >
              {profileLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === "password" && (
        <form onSubmit={handleChangePassword} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6 max-w-xl">
          {passMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                passMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {passMsg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{passMsg.text}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-nepal-earth mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-nepal-earth mb-1">New Password (min 8 characters)</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-nepal-earth mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={passLoading}
              className="px-6 py-2.5 bg-nepal-crimson hover:bg-nepal-crimsonDark text-white text-xs font-bold rounded-xl shadow transition"
            >
              {passLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: KYC Verification */}
      {activeTab === "kyc" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-nepal-earth">Identity & Trust Verification</h3>
                <p className="text-xs text-gray-500">
                  Required for artisans, store owners, and student creators to receive direct payouts and trust badges.
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                  user.is_verified
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {user.is_verified ? "Verified Member" : "Verification Pending"}
              </span>
            </div>

            {/* Past Submissions */}
            {myKyc.length > 0 && (
              <div className="mt-4 border border-gray-100 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-600">Submitted Documents</div>
                <div className="divide-y divide-gray-100">
                  {myKyc.map((k) => (
                    <div key={k.id} className="p-4 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-nepal-earth uppercase">{k.document_type}</span>
                        <div className="text-gray-500 text-[11px]">Doc #: {k.document_number}</div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          k.status === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : k.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {k.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit New KYC */}
            {!user.is_verified && (
              <form onSubmit={handleKycSubmit} className="pt-4 border-t border-gray-100 space-y-4">
                <h4 className="text-xs font-bold text-nepal-earth uppercase tracking-wider">
                  Submit Verification Document
                </h4>

                {kycMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      kycMsg.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {kycMsg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{kycMsg.text}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-nepal-earth mb-1">Document Type</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
                    >
                      <option value="citizenship">Nepali Citizenship (नागरिकता)</option>
                      <option value="student_id">Student ID Card (College / High School)</option>
                      <option value="passport">Passport</option>
                      <option value="business_pan">Business PAN / Registration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-nepal-earth mb-1">Document Number / ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 27-01-78-01234 or NCIT-2023-CS"
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-nepal-earth mb-1">Document Front Image URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={docFront}
                    onChange={(e) => setDocFront(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Clear photo of student ID or citizen card for platform moderation review.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={kycLoading}
                    className="px-6 py-2.5 bg-nepal-earth hover:bg-nepal-earth/90 text-white text-xs font-bold rounded-xl shadow transition"
                  >
                    {kycLoading ? "Submitting..." : "Submit for Verification"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

