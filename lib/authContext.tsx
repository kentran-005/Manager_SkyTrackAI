"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: any;
  login: (token: string, userData: any) => void;
  updateSession: (userData: any, token?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Kiểm tra xem user đã đăng nhập chưa từ LocalStorage
    const token = localStorage.getItem("skytrack_token");
    const userData = localStorage.getItem("skytrack_user");
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: any) => {
    localStorage.setItem("skytrack_token", token);
    localStorage.setItem("skytrack_user", JSON.stringify(userData));
    setUser(userData);
  };

  const updateSession = (userData: any, token?: string) => {
    if (token) localStorage.setItem("skytrack_token", token);
    localStorage.setItem("skytrack_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("skytrack_token");
    localStorage.removeItem("skytrack_user");
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
