"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/lib/types";
import { api } from "@/lib/api";

export type DemoRole = "admin" | "staff" | "owner" | "artisan" | "creator" | "student" | "buyer";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loginAsDemo: (role: DemoRole) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("dharohar_token");
    const savedUser = localStorage.getItem("dharohar_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
    setIsLoading(false);

    // Listen for auth expired events
    const handleAuthExpired = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener("dharohar:auth:expired", handleAuthExpired);
    return () => {
      window.removeEventListener("dharohar:auth:expired", handleAuthExpired);
    };
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("dharohar_token", newToken);
    localStorage.setItem("dharohar_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("dharohar_token");
    localStorage.removeItem("dharohar_user");
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await api.get("/auth/user");
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem("dharohar_user", JSON.stringify(res.data.user));
      }
    } catch (e) {
      console.warn("Failed to refresh user", e);
    }
  };

  const loginAsDemo = async (role: DemoRole): Promise<boolean> => {
    const credentials: Record<DemoRole, { email: string; password: string; mockUser: User }> = {
      admin: {
        email: "admin@dharohar.com",
        password: "password123",
        mockUser: {
          id: 1,
          name: "Platform Administrator",
          email: "admin@dharohar.com",
          account_type: "admin",
          is_verified: true,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
          bio: "Super Admin with full platform governance and escrow controls.",
        },
      },
      staff: {
        email: "staff.moderator@dharohar.com",
        password: "password123",
        mockUser: {
          id: 2,
          name: "Sunita Sharma",
          email: "staff.moderator@dharohar.com",
          account_type: "staff",
          is_verified: true,
          avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200",
          bio: "Operations Supervisor, Live Stream Monitor & KYC Reviewer.",
        },
      },
      owner: {
        email: "owner.gallery@dharohar.com",
        password: "password123",
        mockUser: {
          id: 3,
          name: "Rajendra Manandhar",
          email: "owner.gallery@dharohar.com",
          account_type: "owner",
          is_verified: true,
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
          bio: "Gallery Network Owner managing multiple master artisan storefronts.",
        },
      },
      artisan: {
        email: "artisan.shrestha@dharohar.com",
        password: "password123",
        mockUser: {
          id: 4,
          name: "Bikash Shrestha",
          email: "artisan.shrestha@dharohar.com",
          account_type: "seller",
          is_verified: true,
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
          bio: "Master Woodcarver from Bhaktapur with 25 years of heritage craftsmanship.",
        },
      },
      creator: {
        email: "creator.shakya@dharohar.com",
        password: "password123",
        mockUser: {
          id: 5,
          name: "Umesh Shakya",
          email: "creator.shakya@dharohar.com",
          account_type: "creator",
          is_verified: true,
          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
          bio: "Master Lost-Wax Bronze Sculptor & Sacred Arts Broadcaster.",
        },
      },
      student: {
        email: "aarav.student@dharohar.com",
        password: "password123",
        mockUser: {
          id: 6,
          name: "Aarav Bajracharya",
          email: "aarav.student@dharohar.com",
          account_type: "student",
          is_verified: true,
          guardian_name: "Sunil Bajracharya",
          guardian_consent: true,
          avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200",
          bio: "17yo Lokta paper artist & student innovator with 3% subsidized commission.",
        },
      },
      buyer: {
        email: "buyer@dharohar.com",
        password: "password123",
        mockUser: {
          id: 7,
          name: "Pradeep Thapa",
          email: "buyer@dharohar.com",
          account_type: "customer",
          is_verified: true,
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
          bio: "Heritage art collector & active live auction bidder.",
        },
      },
    };

    const target = credentials[role];

    try {
      const res = await api.post("/auth/login", { email: target.email, password: target.password });
      if (res.data?.success && res.data.token && res.data.user) {
        login(res.data.token, res.data.user);
        return true;
      }
    } catch (err) {
      console.warn("Backend API unavailable, using simulated credentials for instant preview:", err);
    }

    // Graceful offline fallback so UI and all 7 portals can be previewed seamlessly
    login("mock_demo_token_" + role, target.mockUser);
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser, loginAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}


