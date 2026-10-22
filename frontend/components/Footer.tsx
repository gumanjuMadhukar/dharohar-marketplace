import React from "react";
import Link from "next/link";
import { Heart, Sparkles, ShieldCheck } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-nepal-earth text-white border-t-4 border-nepal-gold mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-nepal-crimson flex items-center justify-center text-white font-black text-xl">
                ध
              </div>
              <span className="text-2xl font-black text-nepal-gold tracking-tight">Dharohar</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Nepal’s hybrid B2B + B2C marketplace celebrating generational indigenous crafts while
              empowering children, students, and young creators to innovate, showcase, and earn.
            </p>
            <div className="flex items-center gap-2 text-xs text-nepal-gold font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Parental Consent Protected for Minors</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-nepal-gold mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link href="/marketplace" className="hover:text-nepal-gold transition">
                  Browse All Products
                </Link>
              </li>
              <li>
                <Link href="/auctions" className="hover:text-nepal-gold transition">
                  Live Auction Hall
                </Link>
              </li>
              <li>
                <Link href="/marketplace?student_made=true" className="hover:text-nepal-gold transition">
                  Student & Youth Innovations
                </Link>
              </li>
              <li>
                <Link href="/marketplace?handmade=true" className="hover:text-nepal-gold transition">
                  Master Artisans (Bhaktapur & Patan)
                </Link>
              </li>
            </ul>
          </div>

          {/* Creator Programs */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-nepal-gold mb-4">
              Creator Pathways
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link href="/register" className="hover:text-nepal-gold transition">
                  Student Creator Registration
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-nepal-gold transition">
                  Open Artisan Storefront
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-nepal-gold transition">
                  B2B Manufacturer Wholesale Tier
                </Link>
              </li>
              <li>
                <Link href="/seller/dashboard" className="hover:text-nepal-gold transition">
                  Store Manager Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment Gateways & Local Verification */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-nepal-gold mb-4">
              Secured Payments
            </h4>
            <p className="text-xs text-gray-300 mb-3">
              Direct checkout in Nepali Rupees (NPR) via local digital wallets & international cards:
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-green-700/40 border border-green-500/50 text-xs font-bold text-green-300">
                eSewa Nepal
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-purple-700/40 border border-purple-500/50 text-xs font-bold text-purple-300">
                Khalti Pay
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-blue-700/40 border border-blue-500/50 text-xs font-bold text-blue-300">
                Stripe (Cards)
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-gray-700/40 border border-gray-500/50 text-xs font-bold text-gray-300">
                Cash on Delivery
              </span>
            </div>
            <div className="mt-6 text-xs text-gray-400">
              AWS Student Cloud Integration (NCIT, Balkumari, Lalitpur)
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <div className="flex items-center gap-1.5">
            <span>© 2026 Dharohar (धरोहर) Marketplace. Handcrafted with</span>
            <Heart className="w-3.5 h-3.5 text-nepal-crimson fill-nepal-crimson" />
            <span>in Nepal.</span>
          </div>
          <div className="flex gap-4">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Child Safety & Consent</span>
            <span>•</span>
            <span>Seller Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

