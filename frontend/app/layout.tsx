import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { LayoutShell } from "@/components/LayoutShell";

export const metadata: Metadata = {
  title: "Dharohar (धरोहर) | Nepal’s Heritage & Youth Creators Marketplace",
  description:
    "Hybrid B2B & B2C marketplace connecting authentic Nepali artisans, woodcarvers, cashmere weavers, and student innovators with global buyers and live auctions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#F8F9FA] text-slate-800 antialiased">
        <AuthProvider>
          <CartProvider>
            <LayoutShell>{children}</LayoutShell>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
