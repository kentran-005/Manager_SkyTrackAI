"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

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
  
  // State lưu dữ liệu API
  const [stats, setStats]         = useState<any>(null);
  const [weather, setWeather]     = useState<any>(null);
  const [realtimeFlights, setRealtimeFlights] = useState<any[]>([]);
  
  // State cho Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, weatherRes, flightsRes] = await Promise.all([
          api.get('/api/dashboard/stats'),
          api.get('/api/weather/Hanoi'),
          api.get('/api/realtime-flights')
        ]);
        
        setStats(statsRes.data);
        setWeather(weatherRes.data);
        if (flightsRes.data) {
          setRealtimeFlights(flightsRes.data);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu Backend:", error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 60000); 
    return () => clearInterval(intervalId);
  }, []);

  // ── XỬ LÝ DỮ LIỆU OVERVIEW DYNAMIC ──
  const inAirCount = realtimeFlights.filter(f => !f.onGround).length;
  const onGroundCount = realtimeFlights.filter(f => f.onGround).length;
  const totalDetected = realtimeFlights.length;

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
    { icon: "✈", iconColor: "#2563eb", iconBg: "#dbeafe", label: "In Air (Live)", value: totalDetected > 0 ? inAirCount.toString() : "...", sub: `${totalDetected > 0 ? ((inAirCount / totalDetected) * 100).toFixed(0) : 0}% of tracked`, subColor: "#2563eb", dot: true },
    { icon: "🛬", iconColor: "#6b7280", iconBg: "#f3f4f6", label: "On Ground", value: totalDetected > 0 ? onGroundCount.toString() : "...", sub: "At airports", subColor: "#6b7280", dot: true },
    { icon: "📡", iconColor: "#16a34a", iconBg: "#dcfce7", label: "Total Tracked", value: totalDetected > 0 ? totalDetected.toString() : "...", sub: "VN Airspace", subColor: "#16a34a", dot: true },
    { 
      icon: weatherIcon, iconColor: weatherIconColor, iconBg: weatherIconBg, 
      label: `Weather (${weather?.name || 'Hanoi'})`, 
      value: weather ? `${Math.round(weather.main.temp)}°C` : "...°C", 
      sub: weather ? weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1) : "Loading...", 
      subColor: "#6b7280", dot: false 
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${query.trim()}`);
    }
  };

  // ── XỬ LÝ PAGINATION ──
  const totalPages = Math.ceil(realtimeFlights.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const indexOfLastFlight = safeCurrentPage * itemsPerPage;
  const indexOfFirstFlight = indexOfLastFlight - itemsPerPage;
  const currentFlights = realtimeFlights.slice(indexOfFirstFlight, indexOfLastFlight);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  return (
    <>
      <style precedence="default" href="/styles/public-page">{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { font-family: 'DM Sans', sans-serif; background: #eef2f8; scroll-behavior: smooth; }

        .fi { opacity: 0; transform: translateY(22px); transition: opacity .7s ease, transform .7s ease; }
        .fi.show { opacity: 1; transform: none; }
        .d1 { transition-delay: .08s; } .d2 { transition-delay: .22s; } .d3 { transition-delay: .36s; }

        .search-wrap { display: flex; width: 100%; background: #fff; border-radius: 18px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,.35); }
        .search-input { flex: 1; border: none; outline: none; padding: 24px 24px 24px 68px; font-size: 18px; color: #374151; font-family: inherit; background: transparent; }
        .search-btn { background: #3b82f6; color: #fff; border: none; padding: 24px 56px; font-size: 18px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background .18s; white-space: nowrap; }
        .search-btn:hover { background: #2563eb; }

        .ov-card { flex: 1; min-width: 160px; background: #fff; border-radius: 14px; padding: 22px 24px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 6px rgba(0,0,0,.07); }
        
        .rt-card { background: #fff; border-radius: 14px; padding: 18px 22px; box-shadow: 0 1px 6px rgba(0,0,0,.07); transition: transform .2s, box-shadow .2s; border-left: 4px solid #3b82f6; }
        .rt-card:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(59,130,246,.15); }

        /* CSS PAGINATION */
        .pg-btn { border: 1px solid #e5e7eb; background: #fff; height: 42px; min-width: 42px; display: flex; align-items: center; justify-content: center; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px; color: #4b5563; font-family: 'DM Sans', sans-serif; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,.05); padding: 0 4px; }
        .pg-btn:hover:not(:disabled):not(.pg-active) { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; box-shadow: 0 2px 6px rgba(59,130,246,.15); }
        .pg-active { background: #3b82f6; border-color: #3b82f6; color: #fff; box-shadow: 0 4px 10px rgba(59,130,246,.3); }
        .pg-btn:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }
        .pg-nav { padding: 0 16px; font-size: 13px; }

        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
        .scroll-cue { animation: bounce 1.8s ease-in-out infinite; }

        @media (max-width: 860px) {
          .ov-row    { flex-wrap: wrap !important; }
          .feat-row  { flex-wrap: wrap !important; }
          .rt-grid   { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ═══════════════ HERO ═══════════════ */}
      <div style={{ position: "relative", margin: "0", height: "100vh", minHeight: 600, overflow: "hidden" }}>
        <Image src="/images/landingpage-bg.png" alt="Vietnam flight map" fill priority style={{ objectFit: "cover", objectPosition: "right 30%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(5,14,35,.94) 38%, rgba(5,14,35,.40) 62%, rgba(5,14,35,.06) 100%)" }} />

        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 48px 60px", maxWidth: "62%" }}>
            
            {/* TĂNG KÍCH CỠ CHỮ TIÊU ĐỀ */}
            <h1 className={`fi d1${visible ? " show" : ""}`} style={{ color: "#fff", fontSize: "clamp(42px, 6vw, 80px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-1.5px", marginBottom: 24 }}>
              Vietnam Flight<br />Intelligence Platform
            </h1>

            {/* TĂNG KÍCH CỠ CHỮ MÔ TẢ */}
            <p className={`fi d2${visible ? " show" : ""}`} style={{ color: "rgba(255,255,255,.7)", fontSize: "clamp(16px, 1.3vw, 15px)", lineHeight: 1.6, marginBottom: 40, maxWidth: "90%" }}>
              AI-powered flight operations management<br />
              for the entire Vietnam aviation network.
            </p>

            {/* THANH SEARCH */}
            <form onSubmit={handleSearch} className={`fi d3${visible ? " show" : ""}`}>
              <div className="search-wrap">
                <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
                  <span style={{ position: "absolute", left: 24, color: "#9ca3af", fontSize: 22, pointerEvents: "none" }}>🔍</span>
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
            
          </div>

          <div className="scroll-cue" style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,.45)", fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span>scroll down</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 9l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>

      {/* ═══════════════ OVERVIEW ═══════════════ */}
      <div style={{ background: "#fff", padding: "32px 48px 26px", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 20 }}>Real-time Aviation Overview</h2>
        <div className="ov-row" style={{ display: "flex", gap: 16, marginBottom: 22 }}>
          {dynamicOverview.map(o => (
            <div key={o.label} className="ov-card">
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: o.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: o.iconColor, flexShrink: 0 }}>{o.icon}</div>
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

        <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 20 }}>
          <div className="feat-row" style={{ display: "flex", gap: 24 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: "#9ca3af" }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════ LIVE RADAR SECTION ═══════════════ */}
      <div style={{ background: "#f8fafc", padding: "40px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
            ✈️ Live Radar Over Vietnam 
            <span style={{ fontSize: 13, fontWeight: 500, color: "#6b7280", marginLeft: 10 }}>
              ({realtimeFlights.length} aircraft detected)
            </span>
          </h2>
          <span style={{ fontSize: 12, color: "#3b82f6", fontWeight: 600 }}>
            ● LIVE — Auto-updates every 60s
          </span>
        </div>

        <div className="rt-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, minHeight: 300 }}>
          {currentFlights.length > 0 ? (
            currentFlights.map((flight) => (
              <div key={flight.icao24} className="rt-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#1d4ed8", letterSpacing: 1 }}>
                    {flight.callsign || "N/A"}
                  </div>
                  <span style={{ fontSize: 11, background: flight.onGround ? "#fee2e2" : "#dcfce7", color: flight.onGround ? "#991b1b" : "#166534", padding: "2px 8px", borderRadius: "999px", fontWeight: 600 }}>
                    {flight.onGround ? "Grounded" : "In Air"}
                  </span>
                </div>
                
                <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 12 }}>
                  🌍 Origin: {flight.originCountry}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, color: "#374151", background: "#f8fafc", padding: 10, borderRadius: 8 }}>
                  <div>
                    <div style={{ color: "#9ca3af", marginBottom: 2 }}>Altitude</div>
                    <div style={{ fontWeight: 700 }}>{flight.altitude ? `${Math.round(flight.altitude)} m` : "N/A"}</div>
                  </div>
                  <div>
                    <div style={{ color: "#9ca3af", marginBottom: 2 }}>Speed</div>
                    <div style={{ fontWeight: 700 }}>{flight.velocity ? `${Math.round(flight.velocity * 3.6)} km/h` : "N/A"}</div>
                  </div>
                  <div>
                    <div style={{ color: "#9ca3af", marginBottom: 2 }}>Heading</div>
                    <div style={{ fontWeight: 700 }}>{flight.heading ? `${Math.round(flight.heading)}°` : "N/A"}</div>
                  </div>
                  <div>
                    <div style={{ color: "#9ca3af", marginBottom: 2 }}>Coords</div>
                    <div style={{ fontWeight: 700, fontSize: 11 }}>
                      {flight.latitude ? `${flight.latitude.toFixed(2)}, ${flight.longitude.toFixed(2)}` : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
              <p style={{ fontSize: 16, fontWeight: 500 }}>Loading live flight data...</p>
              <p style={{ fontSize: 13 }}>If data doesn't appear, check OpenSky API credentials or DB connection.</p>
            </div>
          )}
        </div>

        {/* THANH NAV PAGINATION */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "36px" }}>
            <button
              className="pg-btn pg-nav"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={safeCurrentPage === 1}
            >
              ← Prev
            </button>

            {pageNumbers.map(number => (
              <button
                key={number}
                className={`pg-btn ${safeCurrentPage === number ? 'pg-active' : ''}`}
                onClick={() => setCurrentPage(number)}
              >
                {number}
              </button>
            ))}

            <button
              className="pg-btn pg-nav"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={safeCurrentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </>
  );
}