"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  User as UserIcon,
  Store,
  GraduationCap,
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export default function RegisterPage() {
  const { login } = useAuth();

  const [role, setRole] = useState<"customer" | "seller" | "student" | "manufacturer">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [bio, setBio] = useState("");

  // Student specific
  const [guardianName, setGuardianName] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianConsent, setGuardianConsent] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        name,
        email,
        phone,
        password,
        password_confirmation: passwordConfirmation,
        account_type: role,
        bio,
      };

      if (role === "student") {
        payload.guardian_name = guardianName;
        payload.guardian_email = guardianEmail;
        payload.guardian_consent = guardianConsent;
      }

      const res = await api.post("/auth/register", payload);

      if (res.data?.success) {
        login(res.data.token, res.data.user);
        window.location.href = role === "customer" ? "/marketplace" : "/seller/dashboard";
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})?.[0]?.[0] ||
        "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-nepal-gold/30 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-nepal-crimson text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md">
            ध
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-nepal-earth">Join the Dharohar Community</h1>
          <p className="text-xs text-gray-500">
            Select your account type to begin buying, selling, or showcasing your work.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            {
              id: "student",
              title: "Student Creator",
              desc: "Under 18 / Students (3% fee)",
              icon: GraduationCap,
              color: "border-amber-500 bg-amber-50 text-amber-900",
            },
            {
              id: "seller",
              title: "Artisan / Store",
              desc: "Handicrafts & arts",
              icon: Store,
              color: "border-nepal-crimson bg-red-50 text-nepal-crimson",
            },
            {
              id: "manufacturer",
              title: "Wholesaler",
              desc: "Bulk & B2B production",
              icon: Building2,
              color: "border-blue-500 bg-blue-50 text-blue-900",
            },
            {
              id: "customer",
              title: "Buyer",
              desc: "Shop & bid on auctions",
              icon: UserIcon,
              color: "border-gray-500 bg-gray-50 text-gray-900",
            },
          ].map((r) => {
            const Icon = r.icon;
            const isSelected = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id as any)}
                className={`p-3 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                  isSelected ? r.color : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Icon className="w-5 h-5 mb-2" />
                <div>
                  <div className="font-bold text-xs">{r.title}</div>
                  <div className="text-[10px] opacity-75">{r.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleRegister} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-nepal-earth mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Suman Shakya"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-nepal-earth mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-nepal-earth mb-1">Phone Number (Nepal)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98XXXXXXXX"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-nepal-earth mb-1">Short Bio</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Artisan or Student special interest..."
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-nepal-earth mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-nepal-earth mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-nepal-crimson focus:outline-none"
              />
            </div>
          </div>

          {/* Student Parental Consent Section */}
          {role === "student" && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Parental & Guardian Consent Protection</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-tight">
                For creators under 18 or high-school students, we require guardian approval to verify
                legitimate student status and safeguard your payouts.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Guardian / Parent Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="Parent's Name"
                    className="w-full p-2 rounded-lg border border-amber-300 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Guardian Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    placeholder="parent@example.com"
                    className="w-full p-2 rounded-lg border border-amber-300 text-xs bg-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-amber-900 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={guardianConsent}
                  onChange={(e) => setGuardianConsent(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>I confirm parental/guardian permission has been granted.</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-nepal-crimson hover:bg-nepal-crimsonDark text-white font-black text-xs shadow-lg transition"
          >
            {loading ? "Registering Account..." : "Create Account & Start Journey"}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500">
          Already registered on Dharohar?{" "}
          <Link href="/login" className="text-nepal-crimson font-bold hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}

