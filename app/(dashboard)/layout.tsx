"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/authContext";
import {
  LayoutDashboard,
  Building2,
  Plane,
  PlaneTakeoff,
  Users,
  UsersRound,
  Bot,
  Settings,
  Ticket,
  Search,
  Bell,
  MessageSquare,
  UserCircle,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavLink {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: number;
}

const ADMIN_LINKS: NavLink[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Building2, label: "Airports", href: "/admin/airports" },
  { icon: Plane, label: "Airlines", href: "/admin/airlines" },
  { icon: PlaneTakeoff, label: "Flights", href: "/admin/flights" },
  { icon: Users, label: "Passengers", href: "/admin/passengers" },
  { icon: UsersRound, label: "Users", href: "/admin/users" },
  { icon: Bot, label: "AI Summary", href: "/admin/ai" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

const USER_LINKS: NavLink[] = [
  { icon: Ticket, label: "My Flights", href: "/user" },
  { icon: Search, label: "Search Flights", href: "/search" },
  { icon: Bell, label: "Notifications", href: "/user/notifications", badge: 5 },
  { icon: MessageSquare, label: "AI Assistant", href: "/user/ai" },
  { icon: UserCircle, label: "Profile", href: "/user/profile" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 1. Kiểm tra trạng thái đăng nhập và phân quyền Route điều hướng
  useEffect(() => {
    if (!isLoading) {
      // Nếu chưa đăng nhập -> Bắt buộc đá về trang login
      if (!user) {
        router.push("/login");
        return;
      }

      // Nếu đã đăng nhập nhưng User thường cố tình vào đường dẫn /admin
      if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
        router.push("/user"); // Đá ngược về trang của user
      }
    }
  }, [isLoading, user, pathname, router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Trong lúc đang load hoặc chưa có user (hoặc user thường cố vào admin), giữ trạng thái Loading chặn render giao diện trái phép
  if (isLoading || !user || (pathname.startsWith("/admin") && user.role !== "ADMIN")) {
    return (
      <div className="dash-loading">
        <div className="dash-loading-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // 2. Logic hiển thị Sidebar: Dựa vào URL hiện tại thay vì chỉ dựa vào Role của Account
  const isAdminRoute = pathname.startsWith("/admin");
  const links = isAdminRoute && user.role === "ADMIN" ? ADMIN_LINKS : USER_LINKS;
  const currentDisplayRole = isAdminRoute && user.role === "ADMIN" ? "ADMIN" : "USER";

  return (
    <div className="dash-root">
      {/* ── MOBILE OVERLAY ── */}
      <div
        className={`dash-overlay ${sidebarOpen ? "dash-overlay--visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── SIDEBAR ── */}
      <aside className={`dash-sidebar ${sidebarOpen ? "dash-sidebar--open" : ""}`}>
        {/* Logo */}
        <div className="dash-sidebar-logo">
          <div className="dash-sidebar-logo-icon">
            <Plane className="w-5 h-5" />
          </div>
          <div className="dash-sidebar-logo-text">
            <span className="dash-sidebar-logo-title">
              SkyTrack <span className="dash-sidebar-logo-ai">AI</span>
            </span>
            <span className="dash-sidebar-logo-sub">Real-time Flight Tracking</span>
          </div>
        </div>

        {/* Role Badge */}
        <div className="dash-sidebar-role">
          <span className={`dash-sidebar-role-badge ${currentDisplayRole === "ADMIN" ? "dash-sidebar-role-badge--admin" : "dash-sidebar-role-badge--user"}`}>
            {currentDisplayRole === "ADMIN" ? "ADMIN PANEL" : "USER PANEL"}
          </span>
        </div>

        {/* Navigation */}
        <nav className="dash-sidebar-nav">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== "/user" && link.href !== "/admin" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`dash-sidebar-link ${isActive ? "dash-sidebar-link--active" : ""}`}
              >
                <Icon className="dash-sidebar-link-icon" />
                <span className="dash-sidebar-link-label">{link.label}</span>
                {link.badge && link.badge > 0 && (
                  <span className="dash-sidebar-link-badge">{link.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* AI Promo */}
        <div className="dash-sidebar-ai-card">
          <div className="dash-sidebar-ai-card-icon">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="dash-sidebar-ai-card-content">
            <p className="dash-sidebar-ai-card-title">Ask SkyTrack AI</p>
            <p className="dash-sidebar-ai-card-desc">Get flight insights instantly</p>
          </div>
          <Link href={currentDisplayRole === "ADMIN" ? "/admin/ai" : "/user/ai"} className="dash-sidebar-ai-card-btn">
            Try Now
          </Link>
        </div>

        {/* User + Logout */}
        <div className="dash-sidebar-footer">
          <div className="dash-sidebar-user">
            <div className="dash-sidebar-user-avatar">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="dash-sidebar-user-info">
              <span className="dash-sidebar-user-name">{user.name || user.email}</span>
              <span className="dash-sidebar-user-role">
                {user.role === "ADMIN" ? "Administrator" : "Premium User"}
              </span>
            </div>
          </div>
          <button onClick={logout} className="dash-sidebar-logout">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="dash-main">
        {/* Mobile Top Bar */}
        <div className="dash-mobile-topbar">
          <button
            className="dash-mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="dash-mobile-logo">
            <Plane className="w-4 h-4 text-blue-500" />
            <span className="dash-mobile-logo-text">
              SkyTrack <span style={{ color: "#60a5fa" }}>AI</span>
            </span>
          </div>
          <div className="dash-sidebar-user-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>

        <main className="dash-content">
          {children}
        </main>
      </div>
    </div>
  );
}