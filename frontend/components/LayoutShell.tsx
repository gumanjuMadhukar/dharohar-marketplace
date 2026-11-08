"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If in admin suite, seller workshop, student studio, creator atelier, owner suite, staff portal, or live theater room
  const isDashboardPortal =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/seller") ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/creator") ||
    pathname.startsWith("/owner") ||
    pathname.startsWith("/staff") ||
    (pathname.startsWith("/live/") && pathname !== "/live");

  if (isDashboardPortal) {
    return (
      <main className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans antialiased overflow-x-hidden">
        {children}
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

