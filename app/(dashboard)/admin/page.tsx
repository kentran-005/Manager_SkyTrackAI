"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";

// ── Data ──
const TREND_DATA = [
  { date: "26/05", total: 1480, onTime: 1240, delayed: 195, cancelled: 45 },
  { date: "27/05", total: 1510, onTime: 1260, delayed: 205, cancelled: 45 },
  { date: "28/05", total: 1495, onTime: 1255, delayed: 195, cancelled: 45 },
  { date: "29/05", total: 1525, onTime: 1275, delayed: 205, cancelled: 45 },
  { date: "30/05", total: 1530, onTime: 1280, delayed: 205, cancelled: 45 },
  { date: "31/05", total: 1518, onTime: 1268, delayed: 205, cancelled: 45 },
  { date: "01/06", total: 1540, onTime: 1441, delayed: 87,  cancelled: 12 },
];

const AIRLINE_DATA = [
  { name: "Vietnam Airlines", value: 42, color: "#3b82f6" },
  { name: "VietJet Air",      value: 28, color: "#8b5cf6" },
  { name: "Bamboo Airways",   value: 18, color: "#10b981" },
  { name: "Pacific Airlines", value: 7,  color: "#f59e0b" },
  { name: "Others",           value: 5,  color: "#e5e7eb" },
];

const DELAY_AIRPORTS = [
  { code: "SGN - Tan Son Nhat", rate: 13.2, color: "#ef4444" },
  { code: "HAN - Noi Bai",      rate: 8.7,  color: "#f97316" },
  { code: "DAD - Da Nang",      rate: 6.1,  color: "#f59e0b" },
  { code: "CXR - Cam Ranh",     rate: 4.3,  color: "#84cc16" },
  { code: "PQC - Phu Quoc",     rate: 3.2,  color: "#22c55e" },
];

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
  const [stats, setStats] = useState<any>(null);

  // GỌI API LẤY SỐ LIỆU THỐNG KÊ TỪ SPRING BOOT
  useEffect(() => {
    fetch("http://localhost:8080/api/dashboard/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Lỗi tải thống kê:", err));
  }, []);

  // CẬP NHẬT LẠI MẢNG KPI DỰA TRÊN DATA THẬT (Phải nằm trong component để dùng được state 'stats')
  const KPI = [
    { label: "Total Flights", value: stats?.totalFlights?.toLocaleString() || "...", sub: "+12.5% vs yesterday", subColor: "#22c55e", icon: "✈", iconBg: "#eff6ff", iconColor: "#3b82f6" },
    { label: "On Time", value: stats ? (stats.totalFlights - stats.delayedFlights).toLocaleString() : "...", sub: "+8.9%", subColor: "#22c55e", icon: "✓", iconBg: "#dcfce7", iconColor: "#16a34a", extra: "+83.6%" },
    { label: "Delayed", value: stats?.delayedFlights?.toString() || "...", sub: "-2.1%", subColor: "#22c55e", icon: "⏱", iconBg: "#fef3c7", iconColor: "#d97706", extra: "+5.6%" },
    { label: "Cancelled", value: "0", sub: "-1.2%", subColor: "#22c55e", icon: "✕", iconBg: "#fee2e2", iconColor: "#ef4444", extra: "+0.8%" },
    { label: "Total Passengers", value: stats?.totalPassengers ? `${stats.totalPassengers.toLocaleString()}+` : "...", sub: "+15.3%", subColor: "#22c55e", icon: "👥", iconBg: "#f5f3ff", iconColor: "#7c3aed" },
  ];

  // Đổi sang gọi API Backend Spring Boot (Gemini) của chúng ta
  async function sendAI() {
    if (!aiInput.trim()) return;
    const question = aiInput;
    setAiInput("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question }),
      });
      const data = await res.json();
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
      <div className="kpi-grid">
        {KPI.map(k => (
          <div key={k.label} className="kpi-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{k.label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: k.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: k.iconColor }}>{k.icon}</div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#111827", lineHeight: 1, marginBottom: 8 }}>{k.value}</div>
            {k.extra && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}><span style={{ color: "#3b82f6", fontWeight: 600 }}>{k.extra}</span></div>}
            <div style={{ fontSize: 11.5, color: k.subColor, display: "flex", alignItems: "center", gap: 4 }}>↑ {k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-title">Flights Trend (7 Days)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={TREND_DATA} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
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
              <Pie data={AIRLINE_DATA} cx={75} cy={75} innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0}>
                {AIRLINE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>1,540</div>
              <div style={{ fontSize: 10, color: "#9ca3af" }}>Total</div>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            {AIRLINE_DATA.map(a => (
              <div key={a.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: a.color, display: "inline-block" }} />
                  <span style={{ fontSize: 11.5, color: "#374151" }}>{a.name}</span>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#111827" }}>{a.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Delay Rate by Airport</div>
          {DELAY_AIRPORTS.map(a => (
            <div key={a.code} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{a.code}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{a.rate}%</span>
              </div>
              <div className="delay-bar-bg">
                <div style={{ height: "100%", borderRadius: 999, width: `${(a.rate / 15) * 100}%`, background: a.color, transition: "width .6s ease" }} />
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
            Today, <strong>1,540 flights</strong> were operated across <strong>22 airports</strong>.<br />
            <strong>87 flights</strong> were delayed, mainly due to weather conditions at SGN and HAN.<br />
            Overall performance is <strong>93.6%</strong>, higher than yesterday by 2.3%.
          </p>
        </div>

        <div className="bottom-card">
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 14 }}>Recommendations</div>
          {["Increase check-in counters at SGN during peak hours.", "Monitor weather conditions at HAN for next 24 hours.", "Consider additional flights on SGN – DAD route."].map((r, i) => (
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
            {aiMessages.length === 0 && <p style={{ fontSize: 12, color: "#d1d5db", textAlign: "center", padding: "16px 0" }}>Ask a question about today's flights</p>}
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