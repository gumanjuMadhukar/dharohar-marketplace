"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  Shield,
  CheckCircle,
  Mail,
  UserCheck,
} from "lucide-react";

export default function OwnerStaffPage() {
  const [toast, setToast] = useState<string | null>(null);

  const [staffList] = useState([
    {
      id: 1,
      name: "Bikash Shrestha",
      email: "artisan.shrestha@dharohar.com",
      role: "Branch General Manager",
      assignedStore: "Bhaktapur Traditional Woodcraft",
      permissions: ["Live Stream Broadcasting", "Inventory Management", "Order Dispatch"],
    },
    {
      id: 2,
      name: "Doma Gurung",
      email: "pashmina.gurung@dharohar.com",
      role: "Atelier Lead & Weaver",
      assignedStore: "Himalayan Chyangra Cashmere",
      permissions: ["Product Listing", "Auction Creation", "Customer Support"],
    },
    {
      id: 3,
      name: "Umesh Shakya",
      email: "creator.shakya@dharohar.com",
      role: "Master Foundry Director",
      assignedStore: "Patan Sacred Bronze Casting",
      permissions: ["Live Auction Host", "Lot Hammer Control", "Provenance Minting"],
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-700" />
            <span>Store Managers & Artisan Delegation</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Delegate operational access, assign branch management roles, and customize permissions.
          </p>
        </div>

        <button
          onClick={() => {
            setToast("Manager invitation link generated and copied to clipboard.");
            setTimeout(() => setToast(null), 3000);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Store Manager</span>
        </button>
      </div>

      {toast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase text-stone-400">Authorized Branch Managers</h2>
          <span className="text-xs text-stone-500 font-bold">3 Active Accounts</span>
        </div>

        <div className="divide-y divide-stone-100">
          {staffList.map((member) => (
            <div key={member.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-stone-900">{member.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {member.role}
                  </span>
                </div>
                <div className="text-xs text-stone-500 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{member.email}</span>
                  <span>•</span>
                  <strong className="text-stone-700">{member.assignedStore}</strong>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                  {member.permissions.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 text-[10px] font-semibold border border-stone-200"
                    >
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>

              <button className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition self-end md:self-center">
                Configure Permissions
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
