"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/lib/types";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loginAsDemo: (role: "admin" | "artisan" | "student" | "buyer") => Promise<boolean>;
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

  const loginAsDemo = async (role: "admin" | "artisan" | "student" | "buyer"): Promise<boolean> => {
    const credentials = {
      admin: { email: "admin@dharohar.com", password: "password123" },
      artisan: { email: "artisan.shrestha@dharohar.com", password: "password123" },
      student: { email: "aarav.student@dharohar.com", password: "password123" },
      buyer: { email: "buyer@dharohar.com", password: "password123" },
    }[role];

    try {
      const res = await api.post("/auth/login", credentials);
      if (res.data?.success && res.data.token && res.data.user) {
        login(res.data.token, res.data.user);
        return true;
      }
    } catch (err) {
      console.error("Demo login error:", err);
    }
    return false;
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


