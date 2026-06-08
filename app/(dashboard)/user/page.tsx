"use client";

import {
  Plane,
  Clock,
  XCircle,
  Bell,
  Search,
  MapPin,
  Bot,
  ArrowRight,
  CloudSun,
  Droplets,
  Wind,
  Eye,
  MoreHorizontal,
  ChevronDown,
  Settings,
  TrendingUp,
  Shield,
  Calendar,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Mock Data ──
const stats = [
  {
    label: "Flights Tracking",
    value: 12,
    change: "+2 from yesterday",
    changeType: "up" as const,
    icon: Plane,
    color: "blue",
  },
  {
    label: "Delayed Flights",
    value: 2,
    change: "+1 from yesterday",
    changeType: "warn" as const,
    icon: Clock,
    color: "orange",
  },
  {
    label: "Cancelled Flights",
    value: 1,
    change: "No change",
    changeType: "neutral" as const,
    icon: XCircle,
    color: "red",
  },
  {
    label: "Alerts",
    value: 5,
    change: "+3 new today",
    changeType: "up" as const,
    icon: Bell,
    color: "green",
  },
];

const todayFlights = [
  {
    code: "VN220",
    airline: "Vietnam Airlines",
    airlineCode: "VN",
    from: "SGN",
    to: "HAN",
    fromCity: "Ho Chi Minh City",
    toCity: "Hanoi",
    departure: "10:30",
    arrival: "12:45",
    departureDate: "08 Jun 2026",
    arrivalDate: "08 Jun 2026",
    duration: "2h 15m",
    status: "On Time",
    statusType: "ontime" as const,
    aircraft: "A321",
    gate: "A3",
  },
  {
    code: "VJ123",
    airline: "VietJet Air",
    airlineCode: "VJ",
    from: "SGN",
    to: "DAD",
    fromCity: "Ho Chi Minh City",
    toCity: "Da Nang",
    departure: "11:45",
    arrival: "13:35",
    departureDate: "08 Jun 2026",
    arrivalDate: "08 Jun 2026",
    duration: "1h 20m",
    status: "Delayed 30m",
    statusType: "delayed" as const,
    aircraft: "A320",
    gate: "B12",
  },
  {
    code: "QH301",
    airline: "Bamboo Airways",
    airlineCode: "QH",
    from: "HAN",
    to: "CXR",
    fromCity: "Hanoi",
    toCity: "Nha Trang",
    departure: "14:00",
    arrival: "16:10",
    departureDate: "08 Jun 2026",
    arrivalDate: "08 Jun 2026",
    duration: "2h 10m",
    status: "On Time",
    statusType: "ontime" as const,
    aircraft: "A319",
    gate: "C7",
  },
];

const chartData = [
  { hour: "06:00", onTime: 8, delayed: 1, cancelled: 0 },
  { hour: "08:00", onTime: 12, delayed: 2, cancelled: 0 },
  { hour: "10:00", onTime: 15, delayed: 3, cancelled: 1 },
  { hour: "12:00", onTime: 18, delayed: 4, cancelled: 1 },
  { hour: "14:00", onTime: 14, delayed: 2, cancelled: 0 },
  { hour: "16:00", onTime: 16, delayed: 3, cancelled: 1 },
  { hour: "18:00", onTime: 20, delayed: 5, cancelled: 2 },
  { hour: "20:00", onTime: 17, delayed: 4, cancelled: 1 },
  { hour: "22:00", onTime: 10, delayed: 2, cancelled: 0 },
];

const notifications = [
  {
    id: 1,
    title: "VN220 Boarding",
    desc: "Boarding starts in 30 minutes at Gate A3",
    time: "10 mins ago",
    type: "info" as const,
    icon: Plane,
  },
  {
    id: 2,
    title: "Weather Warning",
    desc: "Thunderstorms expected at HAN Airport",
    time: "1 hour ago",
    type: "warning" as const,
    icon: CloudSun,
  },
  {
    id: 3,
    title: "Gate Changed",
    desc: "VJ123 gate changed from A5 to B12",
    time: "2 hours ago",
    type: "update" as const,
    icon: MapPin,
  },
];

const quickActions = [
  {
    label: "Search Flight",
    desc: "Find flight status",
    icon: Search,
    color: "blue",
    href: "/search",
  },
  {
    label: "Open Live Map",
    desc: "View all flights",
    icon: MapPin,
    color: "emerald",
    href: "/",
  },
  {
    label: "Ask AI Assistant",
    desc: "Get help instantly",
    icon: Bot,
    color: "purple",
    href: "/user/ai",
  },
  {
    label: "View Notifications",
    desc: "See all alerts",
    icon: Bell,
    color: "amber",
    href: "/user/notifications",
    badge: 5,
  },
];

export default function UserDashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ").pop() || "there";

  return (
    <div className="udash-page">
      {/* ── MAIN CONTENT AREA ── */}
      <div className="udash-main">
        {/* Top Header Bar */}
        <div className="udash-topbar">
          <div className="udash-topbar-left">
            <h1 className="udash-welcome-title">
              Welcome back, {firstName}! <span className="udash-welcome-emoji">👋</span>
            </h1>
            <p className="udash-welcome-sub">
              Track your flights in real time and get the latest updates.
            </p>
          </div>
          <div className="udash-topbar-right">
            <button className="udash-customize-btn">
              <Settings className="w-4 h-4" />
              Customize
            </button>
            <div className="udash-topbar-search">
              <Search className="udash-topbar-search-icon" />
              <input
                type="text"
                placeholder="Search flights, airports..."
                className="udash-topbar-search-input"
              />
              <kbd className="udash-topbar-search-kbd">⌘K</kbd>
            </div>
            <div className="udash-topbar-profile">
              <div className="udash-topbar-avatar">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="udash-topbar-profile-info">
                <span className="udash-topbar-profile-name">{firstName}</span>
                <span className="udash-topbar-profile-role">Premium User</span>
              </div>
              <ChevronDown className="w-4 h-4" style={{ color: "#94a3b8" }} />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="udash-stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`udash-stat-card udash-stat-card--${stat.color}`}>
                <div className="udash-stat-card-header">
                  <div className={`udash-stat-card-icon udash-stat-card-icon--${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`udash-stat-card-change udash-stat-card-change--${stat.changeType}`}>
                    {stat.change}
                  </span>
                </div>
                <div className="udash-stat-card-value">{stat.value}</div>
                <div className="udash-stat-card-label">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Today's Flights */}
        <div className="udash-section">
          <div className="udash-section-header">
            <div className="udash-section-title-group">
              <Plane className="udash-section-title-icon" />
              <h2 className="udash-section-title">Today&apos;s Flights</h2>
            </div>
            <Link href="/search" className="udash-section-link">
              View All Flights <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="udash-flights-list">
            {todayFlights.map((flight) => (
              <div key={flight.code} className="udash-flight-card">
                <div className="udash-flight-card-top">
                  <div className="udash-flight-card-left">
                    <div className={`udash-flight-card-airline-logo udash-flight-card-airline-logo--${flight.airlineCode}`}>
                      <Plane className="w-4 h-4" />
                    </div>
                    <div className="udash-flight-card-info">
                      <div className="udash-flight-card-code-row">
                        <span className="udash-flight-card-code">{flight.code}</span>
                        <span className={`udash-flight-card-status udash-flight-card-status--${flight.statusType}`}>
                          {flight.status}
                        </span>
                      </div>
                      <span className="udash-flight-card-airline">{flight.airline} · {flight.aircraft}</span>
                    </div>
                  </div>
                  <div className="udash-flight-card-gate">
                    <span className="udash-flight-card-gate-label">Gate</span>
                    <span className="udash-flight-card-gate-value">{flight.gate}</span>
                  </div>
                </div>

                <div className="udash-flight-card-route">
                  <div className="udash-flight-card-airport">
                    <span className="udash-flight-card-airport-code">{flight.from}</span>
                    <span className="udash-flight-card-airport-city">{flight.fromCity}</span>
                    <span className="udash-flight-card-time">{flight.departure}</span>
                    <span className="udash-flight-card-date">{flight.departureDate}</span>
                  </div>
                  <div className="udash-flight-card-route-line">
                    <div className="udash-flight-card-route-duration">{flight.duration}</div>
                    <div className="udash-flight-card-route-dash" />
                    <Plane className="udash-flight-card-route-plane" />
                  </div>
                  <div className="udash-flight-card-airport">
                    <span className="udash-flight-card-airport-code">{flight.to}</span>
                    <span className="udash-flight-card-airport-city">{flight.toCity}</span>
                    <span className="udash-flight-card-time">{flight.arrival}</span>
                    <span className="udash-flight-card-date">{flight.arrivalDate}</span>
                  </div>
                </div>

                <div className="udash-flight-card-actions">
                  <button className="udash-flight-card-view-btn">View Details</button>
                  <Link href="/" className="udash-flight-card-track-btn">
                    <MapPin className="w-3.5 h-3.5" />
                    Track on Map
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="udash-section">
          <div className="udash-section-header">
            <h2 className="udash-section-title">Quick Actions</h2>
          </div>
          <div className="udash-quick-actions-grid">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.href} className={`udash-quick-action udash-quick-action--${action.color}`}>
                  <div className={`udash-quick-action-icon udash-quick-action-icon--${action.color}`}>
                    <Icon className="w-5 h-5" />
                    {action.badge && (
                      <span className="udash-quick-action-badge">{action.badge}</span>
                    )}
                  </div>
                  <span className="udash-quick-action-label">{action.label}</span>
                  <span className="udash-quick-action-desc">{action.desc}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Flight Status Overview Chart */}
        <div className="udash-section">
          <div className="udash-section-header">
            <h2 className="udash-section-title">Flight Status Overview</h2>
            <div className="udash-chart-controls">
              <div className="udash-chart-legend">
                <span className="udash-chart-legend-dot" style={{ background: "#10b981" }} /> On Time
                <span className="udash-chart-legend-dot" style={{ background: "#f59e0b" }} /> Delayed
                <span className="udash-chart-legend-dot" style={{ background: "#ef4444" }} /> Cancelled
              </div>
              <select className="udash-chart-select" defaultValue="today">
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
          <div className="udash-chart-wrapper">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: "12px",
                  }}
                />
                <Line type="monotone" dataKey="onTime" name="On Time" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="delayed" name="Delayed" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="cancelled" name="Cancelled" stroke="#ef4444" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <div className="udash-right-sidebar">
        {/* Weather Card */}
        <div className="udash-weather-card">
          <div className="udash-weather-header">
            <div>
              <h3 className="udash-weather-title">Weather at HAN</h3>
              <span className="udash-weather-sub">Noi Bai Intl Airport</span>
            </div>
            <button className="udash-weather-more">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="udash-weather-temp">
            <CloudSun className="udash-weather-temp-icon" />
            <div>
              <span className="udash-weather-temp-value">32°C</span>
              <span className="udash-weather-temp-desc">Partly Cloudy</span>
            </div>
          </div>
          <div className="udash-weather-details">
            <div className="udash-weather-detail">
              <Droplets className="w-4 h-4" />
              <div>
                <span className="udash-weather-detail-value">62%</span>
                <span className="udash-weather-detail-label">Humidity</span>
              </div>
            </div>
            <div className="udash-weather-detail">
              <Wind className="w-4 h-4" />
              <div>
                <span className="udash-weather-detail-value">12 km/h</span>
                <span className="udash-weather-detail-label">Wind</span>
              </div>
            </div>
            <div className="udash-weather-detail">
              <Eye className="w-4 h-4" />
              <div>
                <span className="udash-weather-detail-value">10 km</span>
                <span className="udash-weather-detail-label">Visibility</span>
              </div>
            </div>
          </div>
          <span className="udash-weather-updated">
            <Clock className="w-3 h-3" /> Updated 5 mins ago
          </span>
        </div>

        {/* Recent Notifications */}
        <div className="udash-notifs-card">
          <div className="udash-notifs-header">
            <h3 className="udash-notifs-title">Recent Notifications</h3>
            <Link href="/user/notifications" className="udash-notifs-view-all">
              View All
            </Link>
          </div>
          <div className="udash-notifs-list">
            {notifications.map((notif) => {
              const Icon = notif.icon;
              return (
                <div key={notif.id} className={`udash-notif-item udash-notif-item--${notif.type}`}>
                  <div className={`udash-notif-icon-wrap udash-notif-icon-wrap--${notif.type}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="udash-notif-content">
                    <span className="udash-notif-item-title">{notif.title}</span>
                    <span className="udash-notif-item-desc">{notif.desc}</span>
                  </div>
                  <span className="udash-notif-time">{notif.time}</span>
                </div>
              );
            })}
          </div>
          <Link href="/user/notifications" className="udash-notifs-all-link">
            View All Notifications <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* AI Assistant Promo */}
        <div className="udash-ai-card">
          <div className="udash-ai-card-glow" />
          <div className="udash-ai-card-content">
            <div className="udash-ai-card-icon-wrap">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="udash-ai-card-title">SkyTrack AI Assistant</h3>
            <p className="udash-ai-card-desc">
              Your intelligent travel companion. Ask anything about flights, airports, weather and more.
            </p>
            <Link href="/user/ai" className="udash-ai-card-btn">
              Start Chat
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}