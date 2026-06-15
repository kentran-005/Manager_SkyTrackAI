"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import api from "@/lib/axios";
import type { BackendFlight, BackendStats } from "@/lib/skytrack-data";

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#64748b"];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1e293b", borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 20px rgba(0,0,0,.3)" }}>
      <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<{ q: string; a: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // STATE LƯU DỮ LIỆU THẬT TỪ BACKEND
  const [stats, setStats] = useState<BackendStats | null>(null);
  const [flights, setFlights] = useState<BackendFlight[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get<BackendStats>("/api/dashboard/stats"),
      api.get<BackendFlight[]>("/api/flights"),
    ])
      .then(([statsResponse, flightsResponse]) => {
        setStats(statsResponse.data);
        setFlights(Array.isArray(flightsResponse.data) ? flightsResponse.data : []);
        setError("");
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load dashboard statistics."));
  }, []);

  const KPI = [
    { label: "Total Flights", value: stats?.totalFlights?.toLocaleString() ?? "...", sub: "Current database", subColor: "#64748b", icon: "✈", iconBg: "#eff6ff", iconColor: "#3b82f6" },
    { label: "On Time", value: stats?.onTimeFlights?.toLocaleString() ?? "...", sub: "Scheduled and operational", subColor: "#16a34a", icon: "✓", iconBg: "#dcfce7", iconColor: "#16a34a" },
    { label: "Delayed", value: stats?.delayedFlights?.toLocaleString() ?? "...", sub: "Current delayed flights", subColor: "#d97706", icon: "⏱", iconBg: "#fef3c7", iconColor: "#d97706" },
    { label: "Cancelled", value: stats?.cancelledFlights?.toLocaleString() ?? "...", sub: "Current cancelled flights", subColor: "#ef4444", icon: "✕", iconBg: "#fee2e2", iconColor: "#ef4444" },
    { label: "Total Users", value: stats?.totalUsers?.toLocaleString() ?? "...", sub: "Registered accounts", subColor: "#7c3aed", icon: "👥", iconBg: "#f5f3ff", iconColor: "#7c3aed" },
  ];

  const trendData = useMemo(() => {
    const grouped = new Map<string, { date: string; total: number; onTime: number; delayed: number; cancelled: number }>();
    flights.forEach((flight) => {
      if (!flight.departureTime) return;
      const date = new Date(flight.departureTime);
      if (Number.isNaN(date.getTime())) return;
      const key = date.toISOString().slice(0, 10);
      const item = grouped.get(key) ?? {
        date: date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }),
        total: 0,
        onTime: 0,
        delayed: 0,
        cancelled: 0,
      };
      item.total += 1;
      if (["ON_TIME", "SCHEDULED", "BOARDING"].includes(flight.status ?? "")) item.onTime += 1;
      if (flight.status === "DELAYED") item.delayed += 1;
      if (flight.status === "CANCELLED") item.cancelled += 1;
      grouped.set(key, item);
    });
    return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-7).map(([, value]) => value);
  }, [flights]);

  const airlineData = useMemo(() => {
    const counts = new Map<string, number>();
    flights.forEach((flight) => {
      const name = flight.airline?.name || flight.airline?.code || "Unknown";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value], index) => ({ name, value, color: CHART_COLORS[index] }));
  }, [flights]);

  const delayAirports = useMemo(() => {
    const counts = new Map<string, { total: number; delayed: number }>();
    flights.forEach((flight) => {
      const code = flight.departureAirport?.code || "Unknown";
      const item = counts.get(code) ?? { total: 0, delayed: 0 };
      item.total += 1;
      if (flight.status === "DELAYED") item.delayed += 1;
      counts.set(code, item);
    });
    return [...counts.entries()]
      .map(([code, value]) => ({ code, rate: value.total ? (value.delayed / value.total) * 100 : 0 }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);
  }, [flights]);

  const onTimeRate = flights.length
    ? Math.round((flights.filter((flight) => ["ON_TIME", "SCHEDULED", "BOARDING"].includes(flight.status ?? "")).length / flights.length) * 1000) / 10
    : 0;

  // Đổi sang gọi API Backend Spring Boot (Gemini) của chúng ta
  async function sendAI() {
    if (!aiInput.trim()) return;
    const question = aiInput;
    setAiInput("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/ai/chat", { question });
      const answer = data.answer || "Sorry, I couldn't get a response.";
      setAiMessages(prev => [...prev, { q: question, a: answer }]);
    } catch {
      setAiMessages(prev => [...prev, { q: question, a: "Connection error. Please check if Backend is running." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style precedence="default" href="/styles/dashboard-page">{`
        /* ── KPI CARDS ── */
        .kpi-grid {
          display: grid; grid-template-columns: repeat(5, 1fr);
          gap: 14px; margin-bottom: 22px;
        }
        .kpi-card {
          background: #fff; border-radius: 14px; padding: 18px 18px 14px;
          box-shadow: 0 1px 4px rgba(0,0,0,.06); border: 1px solid #f3f4f6;
        }

        /* ── CHART GRID ── */
        .chart-grid {
          display: grid; grid-template-columns: 1fr 280px 220px;
          gap: 14px; margin-bottom: 22px;
        }
        .chart-card {
          background: #fff; border-radius: 14px; padding: 20px 20px 14px;
          box-shadow: 0 1px 4px rgba(0,0,0,.06); border: 1px solid #f3f4f6;
        }
        .chart-title { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 16px; }

        /* ── BOTTOM GRID ── */
        .bottom-grid {
          display: grid; grid-template-columns: 1fr 1fr 340px; gap: 14px;
        }
        .bottom-card {
          background: #fff; border-radius: 14px; padding: 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,.06); border: 1px solid #f3f4f6;
        }
        .delay-bar-bg { height: 6px; background: #f3f4f6; border-radius: 999px; overflow: hidden; flex: 1; }
        
        /* AI chat */
        .ai-messages { max-height: 160px; overflow-y: auto; margin-bottom: 10px; }
        .ai-input-row {
          display: flex; gap: 8px; align-items: center;
          border: 1.5px solid #e5e7eb; border-radius: 10px; padding: 8px 12px; background: #f9fafb;
        }
        .ai-input {
          flex: 1; border: none; outline: none; background: transparent;
          font-size: 13px; color: #374151; font-family: inherit;
        }
        .ai-send {
          background: #3b82f6; color: #fff; border: none; width: 30px; height: 30px;
          border-radius: 8px; cursor: pointer; display: flex; align-items: center;
          justify-content: center; font-size: 14px; flex-shrink: 0; transition: background .18s;
        }
        .ai-send:hover { background: #2563eb; }
        .ai-send:disabled { background: #93c5fd; cursor: not-allowed; }

        .generate-btn {
          background: #f0f9ff; color: #3b82f6; border: 1.5px solid #bfdbfe;
          border-radius: 8px; padding: 6px 14px; font-size: 12px; font-weight: 700;
          cursor: pointer; font-family: inherit; transition: all .18s;
        }
        .generate-btn:hover { background: #3b82f6; color: #fff; border-color: #3b82f6; }

        @media (max-width: 1200px) {
          .kpi-grid { grid-template-columns: repeat(3, 1fr); }
          .chart-grid { grid-template-columns: 1fr; }
          .bottom-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── KPI CARDS ── */}
      {error && <div style={{ marginBottom: 16, border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", borderRadius: 12, padding: "10px 14px", fontSize: 13 }}>{error}</div>}
      <div className="kpi-grid">
        {KPI.map(k => (
          <div key={k.label} className="kpi-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{k.label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: k.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: k.iconColor }}>{k.icon}</div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#111827", lineHeight: 1, marginBottom: 8 }}>{k.value}</div>
            <div style={{ fontSize: 11.5, color: k.subColor, display: "flex", alignItems: "center", gap: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-title">Flights Trend (7 Days)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
              <Line type="monotone" dataKey="total" name="Total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="onTime" name="On Time" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="delayed" name="Delayed" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="cancelled" name="Cancelled" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">Flights by Airline</div>
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <PieChart width={160} height={160}>
              <Pie data={airlineData} cx={75} cy={75} innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0}>
                {airlineData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
            </PieChart>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>{flights.length}</div>
              <div style={{ fontSize: 10, color: "#9ca3af" }}>Total</div>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            {airlineData.map(a => (
              <div key={a.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: a.color, display: "inline-block" }} />
                  <span style={{ fontSize: 11.5, color: "#374151" }}>{a.name}</span>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#111827" }}>{a.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Delay Rate by Airport</div>
          {delayAirports.map((a, index) => (
            <div key={a.code} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{a.code}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{a.rate.toFixed(1)}%</span>
              </div>
              <div className="delay-bar-bg">
                <div style={{ height: "100%", borderRadius: 999, width: `${Math.min(a.rate, 100)}%`, background: CHART_COLORS[index], transition: "width .6s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="bottom-grid">
        <div className="bottom-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>AI Operations Summary</span>
            <button className="generate-btn">Generate Summary</button>
          </div>
          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>
            The system currently contains <strong>{stats?.totalFlights ?? flights.length} flights</strong> across <strong>{stats?.totalAirports ?? 0} airports</strong>.<br />
            <strong>{stats?.delayedFlights ?? 0} flights</strong> are delayed and <strong>{stats?.cancelledFlights ?? 0}</strong> are cancelled.<br />
            Current on-time performance is <strong>{onTimeRate.toFixed(1)}%</strong>.
          </p>
        </div>

        <div className="bottom-card">
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 14 }}>Recommendations</div>
          {[
            (stats?.delayedFlights ?? 0) > 0 ? "Review delayed flights and notify subscribed users." : "No delayed flights currently require escalation.",
            delayAirports[0]?.rate ? `Monitor ${delayAirports[0].code}, which has the highest current departure delay rate.` : "There is not enough flight data to calculate airport delay rates.",
            "Use the reports page for a detailed status and airline breakdown.",
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", marginTop: 6, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{r}</span>
            </div>
          ))}
        </div>

        <div className="bottom-card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>AI Assistant</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>Ask me anything about flights...</div>
            </div>
          </div>

          <div className="ai-messages" style={{ flex: 1 }}>
            {aiMessages.length === 0 && <p style={{ fontSize: 12, color: "#d1d5db", textAlign: "center", padding: "16px 0" }}>Ask a question about today&apos;s flights</p>}
            {aiMessages.map((m, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ background: "#eff6ff", borderRadius: "10px 10px 2px 10px", padding: "7px 11px", fontSize: 12, color: "#1d4ed8", marginBottom: 5, display: "inline-block", maxWidth: "90%", marginLeft: "auto", float: "right", clear: "both" }}>{m.q}</div>
                <div style={{ clear: "both" }} />
                <div style={{ background: "#f9fafb", borderRadius: "2px 10px 10px 10px", padding: "7px 11px", fontSize: 12, color: "#374151", lineHeight: 1.5, maxWidth: "95%" }}>{m.a}</div>
              </div>
            ))}
            {loading && <div style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>AI is thinking…</div>}
          </div>

          <div className="ai-input-row">
            <input className="ai-input" placeholder="Type your question..." value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendAI()} />
            <button className="ai-send" onClick={sendAI} disabled={loading || !aiInput.trim()}>➤</button>
          </div>
        </div>
      </div>
    </>
  );
}
