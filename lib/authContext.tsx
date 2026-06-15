"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: any;
  login: (token: string, userData: any, remember?: boolean) => void;
  updateSession: (userData: any, token?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isExpiredJwt(token: string) {
  if (token.startsWith("mock-token-")) {
    return process.env.NEXT_PUBLIC_NO_BACKEND !== "true";
  }

  try {
    const payload = token.split(".")[1];
    if (!payload) return true;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(window.atob(normalized)) as { exp?: number };
    return typeof claims.exp !== "number" || claims.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("skytrack_token") ?? sessionStorage.getItem("skytrack_token");
    const userData = localStorage.getItem("skytrack_user") ?? sessionStorage.getItem("skytrack_user");

    if (!token || !userData) {
      localStorage.removeItem("skytrack_token");
      localStorage.removeItem("skytrack_user");
      sessionStorage.removeItem("skytrack_token");
      sessionStorage.removeItem("skytrack_user");
      setIsLoading(false);
      return;
    }

    if (isExpiredJwt(token)) {
      localStorage.removeItem("skytrack_token");
      localStorage.removeItem("skytrack_user");
      sessionStorage.removeItem("skytrack_token");
      sessionStorage.removeItem("skytrack_user");
      sessionStorage.setItem("skytrack_auth_message", "session-expired");
      setIsLoading(false);
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch {
      localStorage.removeItem("skytrack_token");
      localStorage.removeItem("skytrack_user");
      sessionStorage.removeItem("skytrack_token");
      sessionStorage.removeItem("skytrack_user");
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: any, remember = true) => {
    const storage = remember ? localStorage : sessionStorage;
    const otherStorage = remember ? sessionStorage : localStorage;
    otherStorage.removeItem("skytrack_token");
    otherStorage.removeItem("skytrack_user");
    storage.setItem("skytrack_token", token);
    storage.setItem("skytrack_user", JSON.stringify(userData));
    setUser(userData);
  };

  const updateSession = (userData: any, token?: string) => {
    const storage = localStorage.getItem("skytrack_token") ? localStorage : sessionStorage;
    if (token) storage.setItem("skytrack_token", token);
    storage.setItem("skytrack_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("skytrack_token");
    localStorage.removeItem("skytrack_user");
    sessionStorage.removeItem("skytrack_token");
    sessionStorage.removeItem("skytrack_user");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, updateSession, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
