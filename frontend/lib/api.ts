import axios from "axios";

// Dynamically determine the API base URL so the app works seamlessly whether accessed
// via http://dharohar.local, http://localhost:3005, http://localhost, or http://127.0.0.1
export const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    // In browser: relative '/api/v1' is automatically routed to the current origin
    // and handled by Next.js rewrites (to http://nginx/api/v1) or Nginx on port 80.
    return "/api/v1";
  }
  return process.env.INTERNAL_API_URL || "http://nginx/api/v1";
};

export const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: typeof window !== "undefined" ? "/api/v1" : (process.env.INTERNAL_API_URL || "http://nginx/api/v1"),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Intercept to add Sanctum bearer token from localStorage and guarantee safe baseURL
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // If baseURL was set to dharohar.local but user's browser is on localhost, fallback to /api/v1
    if (config.baseURL && config.baseURL.includes("dharohar.local") && window.location.hostname !== "dharohar.local") {
      config.baseURL = "/api/v1";
    }
    const token = localStorage.getItem("dharohar_token");
    if (token) {
      if (config.headers && typeof config.headers.set === "function") {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else if (config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
  }
  return config;
});

// Intercept response errors and handle 401 Unauthorized gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Clear expired credentials
      localStorage.removeItem("dharohar_token");
      localStorage.removeItem("dharohar_user");

      // Notify any listening components
      window.dispatchEvent(new CustomEvent("dharohar:auth:expired"));

      // For protected portals, redirect to login if not already on /login
      const pathname = window.location.pathname;
      const isProtected =
        pathname.startsWith("/admin") ||
        pathname.startsWith("/seller") ||
        pathname.startsWith("/student");

      if (isProtected && !pathname.startsWith("/login")) {
        // Use history navigation or redirect
        const target = `/login?redirect=${encodeURIComponent(pathname)}&expired=1`;
        if (window.location.pathname !== "/login") {
          window.location.href = target;
        }
      }
    }
    return Promise.reject(error);
  }
);


