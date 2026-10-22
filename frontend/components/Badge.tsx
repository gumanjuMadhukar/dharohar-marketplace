import React from "react";
import { Sparkles, Hammer, Leaf, GraduationCap, ShieldCheck } from "lucide-react";

interface BadgeProps {
  type: "student" | "handmade" | "eco" | "verified" | "idea";
  text?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, text }) => {
  switch (type) {
    case "student":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
          <GraduationCap className="w-3.5 h-3.5 text-amber-700" />
          {text || "Student Creator"}
        </span>
      );
    case "handmade":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-nepal-crimson border border-red-200">
          <Hammer className="w-3.5 h-3.5 text-nepal-crimson" />
          {text || "Authentic Handmade"}
        </span>
      );
    case "eco":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
          <Leaf className="w-3.5 h-3.5 text-emerald-700" />
          {text || "Eco-Friendly"}
        </span>
      );
    case "verified":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-900 border border-blue-200">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          {text || "Verified"}
        </span>
      );
    case "idea":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-900 border border-purple-300">
          <Sparkles className="w-3.5 h-3.5 text-purple-700" />
          {text || "Youth Idea / IP"}
        </span>
      );
    default:
      return null;
  }
};

