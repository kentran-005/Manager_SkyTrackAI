"use client";

import { ReactNode, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/axios"; // Import axios đã cấu hình

// ── Types ──
interface Flight {
  id: string;
  flightNo: string;
  airline: string;
  airlineLogo: ReactNode;
  status: "On Time" | "Delayed" | "Cancelled" | "Scheduled" | "Boarding";
  from: { code: string; city: string; airport: string; time: string; date: string };
  to:   { code: string; city: string; airport: string; time: string; date: string };
  duration: string;
  stops: string;
  gate: string;
  terminal: string;
}

interface BackendFlight {
  id?: number | string;
  flightCode?: string;
  airline?: { name?: string; logo?: string };
  departureAirport?: { code?: string; city?: string; name?: string };
  arrivalAirport?: { code?: string; city?: string; name?: string };
  departureTime?: string;
  arrivalTime?: string;
  status?: string;
  price?: number;
  type?: string;
  gate?: string;
  terminal?: string;
}

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  "On Time":  { color: "#16a34a", bg: "#dcfce7" },
  "Delayed":  { color: "#d97706", bg: "#fef3c7" },
  "Cancelled":{ color: "#dc2626", bg: "#fee2e2" },
  "Scheduled":{ color: "#2563eb", bg: "#dbeafe" },
  "Boarding": { color: "#7c3aed", bg: "#ede9fe" },
};

// Hàm chuyển đổi dữ liệu Backend sang Frontend
function mapBackendFlight(f: BackendFlight): Flight {
  const formatTime = (dateStr: string) => {
    if (!dateStr) return { time: "N/A", date: "N/A" };
    // Xử lý chuẩn_datetime của DB (2026-07-01T08:00:00) và của API (2026-07-01 08:00:00)
    const normalizedDateStr = dateStr.replace(" ", "T"); 
    const d = new Date(normalizedDateStr);
    if (isNaN(d.getTime())) return { time: "N/A", date: "N/A" }; // Lỗi parse
    
    const time = d.getHours().toString().padStart(2, '0') + ":" + d.getMinutes().toString().padStart(2, '0');
    const date = d.getDate().toString().padStart(2, '0') + "/" + (d.getMonth() + 1).toString().padStart(2, '0') + "/" + d.getFullYear();
    return { time, date };
  };

  const departure = formatTime(f.departureTime);
  const arrival = formatTime(f.arrivalTime);

  let duration = "N/A";
  if (f.departureTime && f.arrivalTime) {
    const normalizedDep = f.departureTime.replace(" ", "T");
    const normalizedArr = f.arrivalTime.replace(" ", "T");
    const diffMs = new Date(normalizedArr).getTime() - new Date(normalizedDep).getTime();
    if (diffMs > 0) {
      const diffMins = Math.round(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      duration = `${hours}h ${mins}m`;
    }
  }

  const statusMap: Record<string, Flight["status"]> = {
    "ON_TIME": "On Time",
    "DELAYED": "Delayed",
    "CANCELLED": "Cancelled",
    "SCHEDULED": "Scheduled",
    "BOARDING": "Boarding"
  };

  return {
    id: f.id?.toString() || Math.random().toString(),
    flightNo: f.flightCode || "N/A",
    airline: f.airline?.name || "Unknown Airline",
    airlineLogo: f.airline?.logo ? <img src={f.airline.logo} alt="logo" style={{width: 40, height: 40, objectFit: 'contain', background: '#fff', padding: 4, borderRadius: 8}}/> : "✈️",
    status: statusMap[f.status] || "Scheduled",
    // Kiểm tra nếu có object airport thì lấy, nếu không (từ AviationStack) thì để N/A
    from: { 
      code: f.departureAirport?.code || "N/A", 
      city: f.departureAirport?.city || "N/A", 
      airport: f.departureAirport?.name || "N/A", 
      time: departure.time, 
      date: departure.date 
    },
    to: { 
      code: f.arrivalAirport?.code || "N/A", 
      city: f.arrivalAirport?.city || "N/A", 
      airport: f.arrivalAirport?.name || "N/A", 
      time: arrival.time, 
      date: arrival.date 
    },
    duration: duration,
    stops: f.type || "Direct",
    gate: f.gate || "N/A",
    terminal: f.terminal || "N/A",
  };
}

// Tách component riêng để bọc Suspense
function FlightSearchContent() {
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";

  const [query, setQuery] = useState(queryFromUrl);
  const [results, setResults] = useState<Flight[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Hàm search gọi API Backend
  async function performSearch(searchQuery: string) {
    const q = searchQuery.trim();
    if (!q) return;
    
    setLoading(true);
    setSearched(true);
    setError("");
    
    try {
      // Gọi API search chuyên dụng của Backend, truyền từ khóa qua param q
      const res = await api.get(`/api/flights/search?q=${encodeURIComponent(q)}`);
      const backendFlights = Array.isArray(res.data) ? res.data : [];

      // Map dữ liệu Backend sang Structure của Frontend
      const mappedResults = backendFlights.map(mapBackendFlight);
      
      setResults(mappedResults);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Cannot search flights");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  // Tự động search khi có từ khóa từ URL (khi bấm search từ trang chủ)
  useEffect(() => {
    if (queryFromUrl) {
      window.queueMicrotask(() => {
        void performSearch(queryFromUrl);
      });
    }
  }, [queryFromUrl]);

  return (
    <>
      <style precedence="default" href="/styles/public-search">{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .main-search {
          display: flex; gap: 10px; align-items: stretch;
          background: #fff; border-radius: 14px;
          padding: 14px 14px;
          box-shadow: 0 1px 6px rgba(0,0,0,.07);
          margin-bottom: 20px;
        }
        .main-search-field {
          flex: 1; display: flex; align-items: center; gap: 10px;
          border: 1.5px solid #e5e7eb; border-radius: 10px;
          padding: 10px 14px; background: #fff;
          font-size: 14px; color: #111827;
          font-family: inherit;
        }
        .main-search-field input {
          border: none; outline: none; font-size: 14px;
          font-family: inherit; color: #111827; flex: 1;
          background: transparent;
        }
        .search-btn-main {
          background: #3b82f6; color: #fff; border: none;
          border-radius: 10px; padding: 0 32px;
          font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          transition: background .18s;
        }
        .search-btn-main:hover { background: #2563eb; }

        .flight-card {
          background: #fff; border-radius: 16px;
          box-shadow: 0 1px 8px rgba(0,0,0,.07);
          margin-bottom: 16px; overflow: hidden;
          border: 1.5px solid #f3f4f6;
          transition: border-color .2s;
        }
        .flight-card:hover { border-color: #bfdbfe; }
        .flight-card-body { padding: 24px 28px; }

        .route-row {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
        }

        .detail-row {
          display: flex; gap: 0;
          border-top: 1px solid #f3f4f6;
          padding-top: 16px; margin-top: 4px;
        }
        .detail-cell {
          flex: 1;
          border-right: 1px solid #f3f4f6;
          padding: 0 16px;
        }
        .detail-cell:first-child { padding-left: 0; }
        .detail-cell:last-child  { border-right: none; }

        .view-btn {
          width: 100%; background: #3b82f6; color: #fff;
          border: none; border-radius: 0 0 14px 14px;
          padding: 14px; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          transition: background .18s;
        }
        .view-btn:hover { background: #2563eb; }
      `}</style>

      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 4 }}>
          Search Results
        </h1>
        {searched && (
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
            {loading ? "Searching..." : `${results.length} result${results.length !== 1 ? "s" : ""} found for "${query}"`}
          </p>
        )}

        <div className="main-search">
          <div className="main-search-field">
            <span style={{ color: "#9ca3af", fontSize: 16 }}>✈</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Flight code, airline, or airport code..."
              onKeyDown={e => e.key === "Enter" && performSearch(query)}
            />
            <span style={{ color: "#d1d5db", fontSize: 18, cursor: "pointer" }}>⇄</span>
          </div>
          <button className="search-btn-main" onClick={() => performSearch(query)} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {error && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            borderRadius: 12,
            padding: "12px 14px",
            marginBottom: 16,
            fontSize: 14,
            fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        {searched && !loading && results.length === 0 && (
          <div style={{
            background: "#fff", borderRadius: 16, padding: "48px 24px",
            textAlign: "center", color: "#6b7280",
            boxShadow: "0 1px 6px rgba(0,0,0,.06)",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✈️</div>
            <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 6, color: "#374151" }}>No flights found</p>
            <p style={{ fontSize: 14 }}>Try a different flight code, airline name, or airport code (e.g., SGN, HAN).</p>
          </div>
        )}

        {results.map(flight => {
          const st = STATUS_STYLE[flight.status] || STATUS_STYLE["Scheduled"];
          return (
            <div key={flight.id} className="flight-card">
              <div className="flight-card-body">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: "#1a3a6b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
                      {flight.airlineLogo}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 18, color: "#111827" }}>{flight.flightNo}</div>
                      <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{flight.airline}</div>
                    </div>
                  </div>
                  <span style={{ background: st.bg, color: st.color, borderRadius: 20, padding: "5px 14px", fontSize: 13, fontWeight: 600 }}>
                    {flight.status}
                  </span>
                </div>

                <div className="route-row">
                  <div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: "#111827", letterSpacing: "-1px" }}>{flight.from.code}</div>
                    <div style={{ fontSize: 13, color: "#374151", fontWeight: 500, marginTop: 2 }}>{flight.from.city}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{flight.from.airport}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginTop: 10 }}>{flight.from.time}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{flight.from.date}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 110 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>{flight.duration}</div>
                    <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 6 }}>
                      <div style={{ flex: 1, height: 1, background: "#d1d5db" }} />
                      <span style={{ color: "#3b82f6", fontSize: 22 }}>✈</span>
                      <div style={{ flex: 1, height: 1, background: "#d1d5db" }} />
                    </div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{flight.stops}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 36, fontWeight: 800, color: "#111827", letterSpacing: "-1px" }}>{flight.to.code}</div>
                    <div style={{ fontSize: 13, color: "#374151", fontWeight: 500, marginTop: 2 }}>{flight.to.city}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{flight.to.airport}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginTop: 10 }}>{flight.to.time}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{flight.to.date}</div>
                  </div>
                </div>

                <div className="detail-row">
                  {[
                    { label: "Gate", value: flight.gate },
                    { label: "Terminal", value: flight.terminal },
                    { label: "Type", value: flight.stops },
                    { label: "Status", value: flight.status, color: st.color },
                  ].map(d => (
                    <div key={d.label} className="detail-cell">
                      <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500, marginBottom: 4 }}>{d.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: d.color ?? "#111827" }}>{d.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="view-btn">View Flight Details</button>
            </div>
          );
        })}
      </div>
    </>
  );
}

// Bọc trong Suspense để tránh lỗi Next.js khi dùng useSearchParams
export default function FlightSearch() {
  return (
    <Suspense fallback={<div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>Loading search...</div>}>
      <FlightSearchContent />
    </Suspense>
  );
}
