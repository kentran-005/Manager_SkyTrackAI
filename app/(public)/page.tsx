"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/lib/axios"; // Import axios đã cấu hình sẵn
import { useRouter } from "next/navigation";

// ── Place your background image at: /public/images/landingpage-bg.png ──


const FEATURES = [
  { icon: "💬", title: "AI Assistant",      desc: "Smart flight support" },
  { icon: "✈️", title: "Live Tracking",     desc: "Real-time flight tracking" },
  { icon: "📊", title: "Data Analytics",    desc: "Powerful insights" },
  { icon: "🔒", title: "Secure & Reliable", desc: "Enterprise grade security" },
];

export default function SkyTrackLanding() {
  const router = useRouter();

  const [query, setQuery]         = useState("");
  const [visible, setVisible]     = useState(false);
  
  // State lưu dữ liệu API thực tế
  const [stats, setStats]         = useState<any>(null);
  const [weather, setWeather]     = useState<any>(null);

  // Effect chạy animation
  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(id);
  }, []);

  // Effect gọi API Backend
  useEffect(() => {
    // Gọi đồng thời 2 API
    const fetchData = async () => {
      try {
        const [statsRes, weatherRes] = await Promise.all([
          api.get('/api/dashboard/stats'),
          api.get('/api/weather/Hanoi')
        ]);
        setStats(statsRes.data);
        setWeather(weatherRes.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu Backend:", error);
      }
    };
    fetchData();
  }, []);

  // ── XỬ LÝ DỮ LIỆU STATS DYNAMIC ──
  const dynamicStats = [
    { emoji: "✈️", value: stats?.totalFlights?.toLocaleString() || "...", label: "Total Flights Today" },
    { emoji: "🏢", value: stats?.totalAirports?.toString() || "...", label: "Airports Managed" },
    { emoji: "🔷", value: stats?.totalAirlines?.toString() || "...", label: "Airlines Connected" },
    { emoji: "👥", value: stats?.totalPassengers ? `${stats.totalPassengers.toLocaleString()}+` : "...", label: "Passengers Today" },
  ];

  // ── XỬ LÝ DỮ LIỆU OVERVIEW DYNAMIC ──
  const onTimeFlights = stats ? stats.totalFlights - stats.delayedFlights : 0;
  const onTimePct = stats ? ((onTimeFlights / stats.totalFlights) * 100).toFixed(1) : "0.0";
  const delayPct = stats ? ((stats.delayedFlights / stats.totalFlights) * 100).toFixed(1) : "0.0";

  // Xử lý logic Icon Thời tiết thực tế
  let weatherIcon = "☀";
  let weatherIconColor = "#d97706";
  let weatherIconBg = "#fef3c7";
  
  if (weather) {
    const main = weather.weather[0].main;
    if (main === 'Clouds') { weatherIcon = "☁️"; weatherIconColor = "#6b7280"; weatherIconBg = "#f3f4f6"; }
    else if (main === 'Rain') { weatherIcon = "🌧️"; weatherIconColor = "#3b82f6"; weatherIconBg = "#dbeafe"; }
    else if (main === 'Thunderstorm') { weatherIcon = "⛈️"; weatherIconColor = "#6366f1"; weatherIconBg = "#e0e7ff"; }
    else if (main === 'Clear') { weatherIcon = "☀️"; weatherIconColor = "#d97706"; weatherIconBg = "#fef3c7"; }
  }

  const dynamicOverview = [
    { icon: "✈", iconColor: "#16a34a", iconBg: "#dcfce7", label: "On Time", value: stats ? onTimeFlights.toLocaleString() : "...", sub: `${onTimePct}%`, subColor: "#16a34a", dot: true },
    { icon: "⏱", iconColor: "#d97706", iconBg: "#fef3c7", label: "Delayed", value: stats?.delayedFlights?.toString() || "...", sub: `${delayPct}%`, subColor: "#d97706", dot: true },
    { icon: "✕", iconColor: "#dc2626", iconBg: "#fee2e2", label: "Cancelled", value: "0", sub: "0.0%", subColor: "#dc2626", dot: true }, // Tạm thời hardcode 0 vì DB chưa có trường cancelled riêng
    { 
      icon: weatherIcon, 
      iconColor: weatherIconColor, 
      iconBg: weatherIconBg, 
      label: `Weather (${weather?.name || 'Hanoi'})`, 
      value: weather ? `${Math.round(weather.main.temp)}°C` : "...°C", 
      sub: weather ? weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1) : "Loading...", 
      subColor: "#6b7280", 
      dot: false 
    },
  ];

  // ── XỬ LÝ TÌM KIẾM ──
  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault(); // Ngăn trang tải lại
      if (query.trim()) {
        // Chuyển hướng sang trang /search kèm theo từ khóa tìm kiếm (q=...)
        router.push(`/search?q=${query.trim()}`);
      }
    };
  
  return (
    <>
      <style precedence="default" href="/styles/public-page">{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { font-family: 'DM Sans', sans-serif; background: #eef2f8; scroll-behavior: smooth; }

        /* fade-in */
        .fi { opacity: 0; transform: translateY(22px); transition: opacity .7s ease, transform .7s ease; }
        .fi.show { opacity: 1; transform: none; }
        .d1 { transition-delay: .08s; }
        .d2 { transition-delay: .22s; }
        .d3 { transition-delay: .36s; }
        .d4 { transition-delay: .50s; }

        /* nav links */
        .nav-link {
          color: rgba(255,255,255,.75); font-size: 15px; font-weight: 500;
          cursor: pointer; text-decoration: none; transition: color .18s;
        }
        .nav-link:hover { color: #fff; }
        .nav-link.active { color: #fff; border-bottom: 2px solid #3b82f6; padding-bottom: 2px; }

        /* stat card */
        .stat-card {
          display: flex; align-items: center; gap: 14px;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.15);
          backdrop-filter: blur(12px);
          border-radius: 14px;
          padding: 18px 22px;
          flex: 1;
          transition: background .2s;
        }
        .stat-card:hover { background: rgba(255,255,255,.18); }

        /* search */
        .search-wrap {
          display: flex; width: 100%;
          background: #fff; border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,.28);
        }
        .search-input {
          flex: 1; border: none; outline: none;
          padding: 18px 18px 18px 52px;
          font-size: 16px; color: #374151;
          font-family: inherit; background: transparent;
        }
        .search-btn {
          background: #3b82f6; color: #fff; border: none;
          padding: 18px 40px; font-size: 16px;
          font-weight: 700; cursor: pointer; font-family: inherit;
          transition: background .18s; white-space: nowrap;
        }
        .search-btn:hover { background: #2563eb; }

        /* overview card */
        .ov-card {
          flex: 1; min-width: 160px;
          background: #fff; border-radius: 14px;
          padding: 22px 24px;
          display: flex; align-items: center; gap: 16px;
          box-shadow: 0 1px 6px rgba(0,0,0,.07);
        }

        /* scroll cue bounce */
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(6px); }
        }
        .scroll-cue { animation: bounce 1.8s ease-in-out infinite; }

        @media (max-width: 860px) {
          .stats-row { flex-wrap: wrap !important; }
          .ov-row    { flex-wrap: wrap !important; }
          .feat-row  { flex-wrap: wrap !important; }
        }
      `}</style>

      {/* ═══════════════ HERO — full viewport height ═══════════════ */}
      <div style={{
        position: "relative",
        margin: "0",
        height: "100vh",
        minHeight: 600,
        overflow: "hidden",
      }}>
        {/* Background image */}
        <Image
          src="/images/landingpage-bg.png"
          alt="Vietnam flight map"
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "right 30%" }}
        />

        {/* Gradient: opaque dark left → transparent right */}
        <div style={{
          position: "absolute", inset: 0,
          background:
            "linear-gradient(105deg, rgba(5,14,35,.94) 38%, rgba(5,14,35,.40) 62%, rgba(5,14,35,.06) 100%)",
        }} />

        <div style={{
          position: "relative", zIndex: 2,
          height: "100%", display: "flex", flexDirection: "column",
        }}>

          {/* HERO BODY — vertically centered in remaining space */}
          <div style={{
            flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
            padding: "0 48px 60px",
            maxWidth: "58%",
          }}>

            <h1 className={`fi d1${visible ? " show" : ""}`} style={{
              color: "#fff",
              fontSize: "clamp(36px, 5vw, 64px)",
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-1px",
              marginBottom: 18,
            }}>
              Vietnam Flight<br />Intelligence Platform
            </h1>

            <p className={`fi d2${visible ? " show" : ""}`} style={{
              color: "rgba(255,255,255,.65)",
              fontSize: "clamp(14px,1.2vw,17px)",
              lineHeight: 1.65,
              marginBottom: 32,
            }}>
              AI-powered flight operations management<br />
              for the entire Vietnam aviation network.
            </p>

            {/* SEARCH */}
            <form onSubmit={handleSearch} className={`fi d3${visible ? " show" : ""}`} style={{ marginBottom: 20 }}>
              <div className="search-wrap">
                <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
                  <span style={{
                    position: "absolute", left: 18,
                    color: "#9ca3af", fontSize: 18, pointerEvents: "none",
                  }}>🔍</span>
                  <input
                    className="search-input"
                    placeholder="Search flight by code, route or airport..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                </div>
                <button type="submit" className="search-btn">Search</button>
              </div>
            </form>

            {/* STATS ROW - Gọi API Thực Tế */}
            <div className={`fi d4${visible ? " show" : ""}`}>
              <div className="stats-row" style={{ display: "flex", gap: 12 }}>
                {dynamicStats.map(s => (
                  <div key={s.label} className="stat-card">
                    <span style={{ fontSize: 24 }}>{s.emoji}</span>
                    <div>
                      <div style={{ color: "#fff", fontWeight: 800, fontSize: "clamp(18px,1.6vw,24px)", lineHeight: 1 }}>
                        {s.value}
                      </div>
                      <div style={{ color: "rgba(255,255,255,.52)", fontSize: 12, marginTop: 4 }}>
                        {s.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll cue */}
          <div className="scroll-cue" style={{
            position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
            color: "rgba(255,255,255,.45)", fontSize: 13, display: "flex",
            flexDirection: "column", alignItems: "center", gap: 6,
          }}>
            <span>scroll down</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 9l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ═══════════════ OVERVIEW - Gọi API Thực Tế ═══════════════ */}
      <div style={{
        background: "#fff",
        padding: "32px 48px 26px",
        boxShadow: "0 2px 8px rgba(0,0,0,.06)",
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 20 }}>
          Real-time Aviation Overview
        </h2>

        <div className="ov-row" style={{ display: "flex", gap: 16, marginBottom: 22 }}>
          {dynamicOverview.map(o => (
            <div key={o.label} className="ov-card">
              <div style={{
                width: 50, height: 50, borderRadius: "50%",
                background: o.iconBg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, color: o.iconColor, flexShrink: 0,
              }}>
                {o.icon}
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{o.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#111827", lineHeight: 1.15 }}>{o.value}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                  {o.dot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: o.subColor, display: "inline-block" }} />}
                  <span style={{ fontSize: 12, color: o.subColor, textTransform: "capitalize" }}>{o.sub}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FEATURES */}
        <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 20 }}>
          <div className="feat-row" style={{ display: "flex", gap: 24 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: "#eff6ff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: "#9ca3af" }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}