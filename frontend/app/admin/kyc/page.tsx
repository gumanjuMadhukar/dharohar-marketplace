"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { CheckCircle, XCircle, FileText, User, ZoomIn, Eye, ShieldCheck, Filter } from "lucide-react";

export default function AdminKycPage() {
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [rejectKycId, setRejectKycId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    loadKyc();
  }, [statusFilter]);

  const loadKyc = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/kyc?status=${statusFilter}`);
      if (res.data?.data) {
        setKycRequests(res.data.data.data || res.data.data);
      }
    } catch (err: any) {
      console.warn("Failed to load KYC requests:", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const res = await api.post(`/admin/kyc/${id}/approve`);
      if (res.data?.success) {
        setKycRequests(
          kycRequests.map((k) => (k.id === id ? { ...k, status: "approved" } : k))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectKycId) return;
    try {
      const res = await api.post(`/admin/kyc/${rejectKycId}/reject`, { reason: rejectReason });
      if (res.data?.success) {
        setKycRequests(
          kycRequests.map((k) => (k.id === rejectKycId ? { ...k, status: "rejected", rejection_reason: rejectReason } : k))
        );
        setRejectKycId(null);
        setRejectReason("");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-xl max-w-md">
        {["pending", "approved", "rejected", "all"].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold capitalize transition ${
              statusFilter === tab
                ? "bg-purple-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* KYC Cards Grid */}
      {kycRequests.length === 0 ? (
        <div className="bg-slate-900 rounded-2xl p-12 text-center border border-slate-800 text-xs text-slate-500 shadow-xl">
          No KYC verifications in &quot;{statusFilter}&quot; status.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kycRequests.map((k) => (
            <div
              key={k.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800 text-[10px] font-bold uppercase">
                    {k.user?.account_type || "Artisan"}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      k.status === "approved"
                        ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                        : k.status === "rejected"
                        ? "bg-red-950/80 text-red-300 border-red-800"
                        : "bg-amber-950/80 text-amber-300 border-amber-800"
                    }`}
                  >
                    {k.status}
                  </span>
                </div>

                <div>
                  <div className="font-black text-base text-white">{k.user?.name}</div>
                  <div className="text-[11px] text-slate-400">{k.user?.email}</div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Document Type:</span>
                    <span className="font-bold text-white uppercase">{k.document_type || "Citizenship"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Document #:</span>
                    <span className="font-mono font-bold text-purple-400">{k.document_number}</span>
                  </div>
                  {k.user?.phone && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-mono text-slate-300">{k.user.phone}</span>
                    </div>
                  )}
                </div>

                {k.user?.guardian_name && (
                  <div className="p-3 bg-slate-950 rounded-2xl border border-amber-900/40 text-[11px] text-amber-300 space-y-1">
                    <div className="font-black flex items-center gap-1 text-amber-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Parental Consent Verification</span>
                    </div>
                    <div>Parent: <strong className="text-white">{k.user.guardian_name}</strong></div>
                  </div>
                )}

                {k.front_image && (
                  <button
                    type="button"
                    onClick={() => setPreviewImage(k.front_image)}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Document Scan</span>
                  </button>
                )}
              </div>

              {k.status === "pending" && (
                <div className="flex gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => handleApprove(k.id)}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-md"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => setRejectKycId(k.id)}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-md"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectKycId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleReject} className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-black text-sm text-white">Provide Rejection Reason</h3>
            <textarea
              rows={3}
              required
              placeholder="e.g. Blurry photo or unverified school registration number..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:border-red-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectKycId(null)}
                className="px-4 py-2 border border-slate-800 bg-slate-950 text-slate-400 hover:text-white text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-md transition">
                Reject KYC
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-3 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="Document Scan" className="max-h-[80vh] w-auto rounded-2xl object-contain mx-auto" />
            <div className="p-3 text-center">
              <button
                onClick={() => setPreviewImage(null)}
                className="px-5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
