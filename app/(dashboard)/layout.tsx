"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/authContext";

const ADMIN_LINKS = [
  { icon: "⊞", label: "Dashboard", href: "/admin" },
  { icon: "🏢", label: "Airports", href: "/admin/airports" },
  { icon: "✈", label: "Airlines", href: "/admin/airlines" },
  { icon: "🛫", label: "Flights", href: "/admin/flights" },
  { icon: "👤", label: "Passengers", href: "/admin/passengers" },
  { icon: "👥", label: "Users", href: "/admin/users" },
  { icon: "🤖", label: "AI Summary", href: "/admin/ai" },
  { icon: "⚙", label: "Settings", href: "/admin/settings" },
];

const USER_LINKS = [
  { icon: "🎫", label: "My Flights", href: "/user" },
  { icon: "🔍", label: "Search Flights", href: "/search" },
  { icon: "🔔", label: "Notifications", href: "/user/notifications" },
  { icon: "💬", label: "AI Assistant", href: "/user/ai" },
  { icon: "👤", label: "Profile", href: "/user/profile" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  // Xử lý chuyển hướng nếu chưa đăng nhập (Dùng useEffect cho an toàn với React 19)
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  // Đang tải thông tin user hoặc chưa đăng nhập thì hiện màn hình chờ
  if (isLoading || !user) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: "center", color: "#6b7280" }}>
          <p style={{ fontSize: 18, fontWeight: 600 }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Lấy role từ user thật
  const userRole = user.role === "ADMIN" ? "ADMIN" : "USER";
  const links = userRole === "ADMIN" ? ADMIN_LINKS : USER_LINKS;

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f1f5f9", fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 240, background: "#0d1f40", color: "#fff",
        display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0
      }}>
        <div style={{ padding: "0 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>✈️</span>
          <span style={{ fontWeight: 800, fontSize: 16 }}>SkyTrack AI</span>
        </div>

        <div style={{ padding: "0 20px", marginBottom: 16 }}>
          <span style={{
            background: userRole === "ADMIN" ? "rgba(59,130,246,.2)" : "rgba(16,185,129,.2)",
            color: userRole === "ADMIN" ? "#60a5fa" : "#6ee7b7",
            padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600
          }}>
            {userRole} PANEL
          </span>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {links.map(link => (
            <Link key={link.href} href={link.href} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 20px", color: pathname === link.href ? "#fff" : "#94a3b8",
              background: pathname === link.href ? "rgba(59,130,246,.2)" : "transparent",
              borderRight: pathname === link.href ? "3px solid #3b82f6" : "3px solid transparent",
              textDecoration: "none", fontSize: 13.5, fontWeight: 500, transition: "all .15s"
            }}>
              <span>{link.icon}</span><span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,.07)" }}>
          <button onClick={logout} style={{
            background: "rgba(239,68,68,.15)", color: "#f87171", border: "none",
            padding: "10px", borderRadius: 8, width: "100%", cursor: "pointer",
            fontWeight: 600, fontSize: 13, fontFamily: "inherit"
          }}>👋 Logout</button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {/* <header style={{
          height: 56, background: "#fff", borderBottom: "1px solid #e5e7eb",
          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>{userRole} Dashboard</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>Welcome, <strong>{user.name || user.email}</strong></span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#3b82f6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
              {userRole === "ADMIN" ? "A" : "U"}
            </div>
          </div>
        </header> */}
        <main style={{ flex: 1, padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}