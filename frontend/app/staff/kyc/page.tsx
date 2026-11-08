"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Shield,
  FileText,
  User,
  Search,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function StaffKycPage() {
  const [toast, setToast] = useState<string | null>(null);

  const [submissions, setSubmissions] = useState([
    {
      id: 1,
      name: "Aarav Bajracharya",
      role: "student",
      subType: "Student Creator (Age 17)",
      documentType: "National Student ID & Guardian Co-Sign",
      documentNumber: "STU-2026-9921",
      guardianName: "Sunil Bajracharya",
      status: "pending",
      submittedAt: "25 minutes ago",
    },
    {
      id: 2,
      name: "Bikash Shrestha",
      role: "seller",
      subType: "Master Woodcarver",
      documentType: "Nepali Citizenship Certificate",
      documentNumber: "CIT-27-01-72-04192",
      guardianName: "N/A",
      status: "pending",
      submittedAt: "1 hour ago",
    },
    {
      id: 3,
      name: "Sneha Tamang",
      role: "student",
      subType: "Student Innovator (Age 16)",
      documentType: "High School Identity Card",
      documentNumber: "HS-KTM-4410",
      guardianName: "Maya Tamang",
      status: "pending",
      submittedAt: "3 hours ago",
    },
  ]);

  const handleApprove = (id: number, name: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    setToast(`Verified KYC document for ${name}. Badge minted & audit event logged.`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleReject = (id: number, name: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    setToast(`Rejected submission for ${name}. Resubmission notice emailed.`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-emerald-600" />
          <span>KYC Compliance & Verification Desk</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review government citizenship certificates for artisans and student IDs with guardian co-signing.
        </p>
      </div>

      {toast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-black text-slate-900">
            Pending Submissions ({submissions.length})
          </h2>
          <span className="text-xs text-slate-400">Identity Guard v2.4</span>
        </div>

        {submissions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            🎉 All KYC documents have been reviewed and approved!
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{sub.name}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                        sub.role === "student"
                          ? "bg-pink-100 text-pink-700 border border-pink-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {sub.subType}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Document: <strong>{sub.documentType}</strong> ({sub.documentNumber})
                  </div>
                  {sub.guardianName !== "N/A" && (
                    <div className="text-[11px] text-slate-500">
                      Co-Signed by Guardian: <strong className="text-slate-700">{sub.guardianName}</strong> ✅
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400">Submitted {sub.submittedAt}</div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleReject(sub.id, sub.name)}
                    className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleApprove(sub.id, sub.name)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve & Verify</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
