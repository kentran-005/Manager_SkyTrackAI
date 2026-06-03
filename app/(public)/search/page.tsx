"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// ── Types ──
interface Flight {
  id: string;
  flightNo: string;
  airline: string;
  airlineLogo: string;
  status: "On Time" | "Delayed" | "Cancelled";
  from: { code: string; city: string; airport: string; time: string; date: string };
  to:   { code: string; city: string; airport: string; time: string; date: string };
  duration: string;
  stops: string;
  gate: string;
  terminal: string;
  aircraft: string;
  seats: string;
}

const MOCK_FLIGHTS: Flight[] = [
  {
    id: "1",
    flightNo: "VN220",
    airline: "Vietnam Airlines",
    airlineLogo: "🌸",
    status: "On Time",
    from: { code: "SGN", city: "Ho Chi Minh City", airport: "Tan Son Nhat Intl", time: "10:30", date: "01/06/2026" },
    to:   { code: "HAN", city: "Hanoi", airport: "Noi Bai Intl", time: "12:45", date: "01/06/2026" },
    duration: "2h 15m", stops: "Direct",
    gate: "A12", terminal: "T1", aircraft: "Airbus A321", seats: "42%",
  },
  {
    id: "2",
    flightNo: "VN222",
    airline: "Vietnam Airlines",
    airlineLogo: "🌸",
    status: "Delayed",
    from: { code: "SGN", city: "Ho Chi Minh City", airport: "Tan Son Nhat Intl", time: "14:00", date: "01/06/2026" },
    to:   { code: "HAN", city: "Hanoi", airport: "Noi Bai Intl", time: "16:30", date: "01/06/2026" },
    duration: "2h 30m", stops: "Direct",
    gate: "B5", terminal: "T2", aircraft: "Boeing 787", seats: "18%",
  },
];

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  "On Time":  { color: "#16a34a", bg: "#dcfce7" },
  "Delayed":  { color: "#d97706", bg: "#fef3c7" },
  "Cancelled":{ color: "#dc2626", bg: "#fee2e2" },
};

// Tách component riêng để bọc Suspense
function FlightSearchContent() {
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";

  const [query, setQuery] = useState(queryFromUrl);
  const [date, setDate] = useState("2026-06-01");
  const [results, setResults] = useState<Flight[]>([]);
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Hàm search nhận tham số truyền vào để tránh lỗi dependency của useEffect
  function performSearch(searchQuery: string) {
    const q = searchQuery.trim().toUpperCase();
    if (!q) return; // Nếu rỗng thì không search
    
    const found = MOCK_FLIGHTS.filter(f =>
      f.flightNo.includes(q) || f.airline.toUpperCase().includes(q)
    );
    setResults(found);
    setSearched(true);
    setExpanded(found[0]?.id ?? null);
  }

  // Tự động search khi có từ khóa từ URL
  useEffect(() => {
    if (queryFromUrl) {
      performSearch(queryFromUrl);
    }
  }, [queryFromUrl]); // Chỉ phụ thuộc vào queryFromUrl

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
        .main-search-field input, .main-search-field input[type=date] {
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
            {results.length} result{results.length !== 1 ? "s" : ""} found for &quot;{query}&quot;
          </p>
        )}

        <div className="main-search">
          <div className="main-search-field">
            <span style={{ color: "#9ca3af", fontSize: 16 }}>✈</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Flight code or airline"
              onKeyDown={e => e.key === "Enter" && performSearch(query)} // Gọi thẳng performSearch(query)
            />
            <span style={{ color: "#d1d5db", fontSize: 18, cursor: "pointer" }}>⇄</span>
          </div>
          <div className="main-search-field" style={{ maxWidth: 200 }}>
            <span style={{ color: "#9ca3af", fontSize: 16 }}>📅</span>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <button className="search-btn-main" onClick={() => performSearch(query)}>Search</button>
        </div>

        {searched && results.length === 0 && (
          <div style={{
            background: "#fff", borderRadius: 16, padding: "48px 24px",
            textAlign: "center", color: "#6b7280",
            boxShadow: "0 1px 6px rgba(0,0,0,.06)",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✈️</div>
            <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 6, color: "#374151" }}>No flights found</p>
            <p style={{ fontSize: 14 }}>Try a different flight code or date.</p>
          </div>
        )}

        {results.map(flight => {
          const st = STATUS_STYLE[flight.status];
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
                    { label: "Aircraft", value: flight.aircraft },
                    { label: "Status", value: flight.status, color: st.color },
                    { label: "Seat Availability", value: flight.seats },
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