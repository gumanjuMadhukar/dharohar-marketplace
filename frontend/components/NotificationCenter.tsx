"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  Radio,
  ShoppingBag,
  Gavel,
  ShieldCheck,
  X,
  Trash2,
} from "lucide-react";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "purchase" | "stream" | "bid" | "kyc" | "system";
  timestamp: string;
  read: boolean;
  link?: string;
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: "notif-1",
      title: "Order Confirmed via eSewa",
      message: "Payment of NPR 75,000 verified. Official VAT invoice generated and sent to email.",
      type: "purchase",
      timestamp: "10 mins ago",
      read: false,
      link: "/account",
    },
    {
      id: "notif-2",
      title: "🔴 Live Stream Broadcast Started",
      message: "Master Umesh Shakya is now LIVE with the Sacred Newar Bronze Auction.",
      type: "stream",
      timestamp: "35 mins ago",
      read: false,
      link: "/live/1",
    },
    {
      id: "notif-3",
      title: "⚡ Outbid Alert on Lot #1",
      message: "New leading bid of NPR 145,000 placed by Paddle #18.",
      type: "bid",
      timestamp: "1 hour ago",
      read: true,
      link: "/live/1",
    },
    {
      id: "notif-4",
      title: "KYC Verified & Student Subsidy Active",
      message: "Your creator credentials are fully approved with the 3% subsidized fee rate.",
      type: "kyc",
      timestamp: "3 hours ago",
      read: true,
      link: "/profile",
    },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("dharohar_notifications");
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {}
    }

    // Listen for custom trigger events from checkout or bidding
    const handleNewNotification = (e: any) => {
      const newNotif = e.detail as AppNotification;
      setNotifications((prev) => {
        const updated = [newNotif, ...prev];
        localStorage.setItem("dharohar_notifications", JSON.stringify(updated));
        return updated;
      });
    };

    window.addEventListener("dharohar:notification" as any, handleNewNotification);
    return () => {
      window.removeEventListener("dharohar:notification" as any, handleNewNotification);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("dharohar_notifications", JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem("dharohar_notifications");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case "stream":
        return <Radio className="w-4 h-4 text-red-500 animate-pulse" />;
      case "bid":
        return <Gavel className="w-4 h-4 text-amber-500" />;
      case "kyc":
        return <ShieldCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 sm:p-2.5 rounded-full hover:bg-nepal-gold/10 transition text-nepal-earth"
        title="Notifications"
        aria-label="View Notifications"
      >
        <Bell className="w-5 h-5 text-nepal-earth" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-nepal-gold/30 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-nepal-crimson to-nepal-crimsonDark text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-nepal-gold" />
              <span className="text-xs font-black uppercase tracking-wider">
                Notifications ({unreadCount} New)
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Controls */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <button
                onClick={markAllAsRead}
                className="hover:text-nepal-crimson transition"
              >
                Mark all as read
              </button>
              <button
                onClick={clearAll}
                className="hover:text-red-600 transition flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
          )}

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (n.link) window.location.href = n.link;
                  }}
                  className={`p-3.5 transition cursor-pointer flex items-start gap-3 ${
                    n.read ? "bg-white hover:bg-slate-50/80" : "bg-nepal-gold/5 hover:bg-nepal-gold/10"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
