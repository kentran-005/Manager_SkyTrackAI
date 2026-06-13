"use client";

import { useState } from "react";

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const css = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;background:#f0f2f8}

/* ── Page shell ── */
.rp{padding:28px 32px;background:#f0f2f8;min-height:100vh;color:#1a1d23}

/* ── Page header ── */
.rp-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:22px;gap:16px;flex-wrap:wrap}
.rp-header-left h1{font-size:22px;font-weight:700;color:#1a1d23;letter-spacing:-.3px}
.rp-breadcrumb{display:flex;align-items:center;gap:6px;font-size:13px;color:#9ca3af;margin-top:3px}
.rp-breadcrumb a{color:#6366f1;font-weight:500;text-decoration:none}
.rp-breadcrumb-sep{color:#d1d5db}
.rp-header-right{display:flex;align-items:center;gap:10px}
.date-picker-btn{
  display:flex;align-items:center;gap:8px;
  padding:8px 14px;border:1px solid #e5e7eb;border-radius:10px;
  font-size:13px;color:#374151;background:#fff;cursor:pointer;
  box-shadow:0 1px 2px rgba(0,0,0,.04)
}
.date-picker-btn svg{color:#6366f1}
.export-btn{
  display:flex;align-items:center;gap:7px;
  padding:9px 18px;border:none;border-radius:10px;
  font-size:13px;font-weight:600;color:#fff;
  background:linear-gradient(135deg,#6366f1 0%,#4f46e5 100%);
  cursor:pointer;box-shadow:0 2px 8px rgba(99,102,241,.35)
}

/* ── Section title ── */
.rp-section-title{
  font-size:14px;font-weight:600;color:#1a1d23;margin-bottom:2px
}
.rp-section-sub{font-size:12px;color:#9ca3af;margin-bottom:16px}

/* ── Stat cards ── */
.stat-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:20px}
.stat-card{
  background:#fff;border-radius:14px;padding:18px 16px;
  display:flex;align-items:flex-start;gap:14px;
  box-shadow:0 1px 3px rgba(0,0,0,.06)
}
.stat-icon-wrap{
  width:46px;height:46px;border-radius:12px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center
}
.stat-label{font-size:11.5px;font-weight:500;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
.stat-val{font-size:24px;font-weight:700;color:#1a1d23;letter-spacing:-.5px;line-height:1.1;margin-bottom:5px}
.stat-change{font-size:12px;font-weight:600;display:flex;align-items:center;gap:3px;flex-wrap:wrap}
.stat-change span{font-weight:400;color:#9ca3af;margin-left:2px}
.pos{color:#22c55e}.neg{color:#ef4444}

/* ── Tabs ── */
.tabs{display:flex;gap:0;border-bottom:2px solid #e5e7eb;margin-bottom:20px}
.tab-btn{
  padding:9px 18px;font-size:13.5px;font-weight:500;color:#9ca3af;
  background:none;border:none;cursor:pointer;position:relative;
  transition:color .15s
}
.tab-btn.active{color:#6366f1;font-weight:600}
.tab-btn.active::after{
  content:'';position:absolute;bottom:-2px;left:0;right:0;height:2px;
  background:#6366f1;border-radius:2px 2px 0 0
}

/* ── 3-col grid ── */
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px}
.grid2-1{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px}

/* ── Chart card ── */
.chart-card{
  background:#fff;border-radius:14px;padding:20px;
  box-shadow:0 1px 3px rgba(0,0,0,.06)
}
.chart-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.chart-card-title{font-size:13.5px;font-weight:600;color:#1a1d23}
.view-all-link{font-size:12.5px;color:#6366f1;font-weight:500;cursor:pointer;text-decoration:none}
.chart-period-btn{
  display:flex;align-items:center;gap:4px;padding:5px 10px;
  border:1px solid #e5e7eb;border-radius:8px;font-size:12.5px;
  color:#374151;background:#f9fafb;cursor:pointer
}

/* ── Donut ── */
.donut-wrap{display:flex;align-items:center;gap:20px}
.donut-legend{display:flex;flex-direction:column;gap:10px;flex:1}
.legend-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
.legend-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}
.legend-label{font-size:13px;color:#374151;flex:1}
.legend-val{font-size:13px;font-weight:600;color:#1a1d23;white-space:nowrap}
.legend-pct{font-size:12px;color:#9ca3af;margin-left:3px}

/* ── Line chart ── */
.line-legend{display:flex;gap:16px;margin-bottom:12px}
.line-legend-item{display:flex;align-items:center;gap:5px;font-size:12px;color:#6b7280}
.line-legend-dot{width:8px;height:8px;border-radius:50%}

/* ── Table ── */
.apt-table{width:100%;border-collapse:collapse}
.apt-table th{font-size:11.5px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.4px;padding:8px 10px;text-align:left;border-bottom:1px solid #f1f3f6}
.apt-table td{font-size:13px;padding:10px;color:#374151;border-bottom:1px solid #f1f3f6;vertical-align:middle}
.apt-table tbody tr:last-child td{border-bottom:none}
.apt-table tbody tr:hover{background:#fafbff}
.apt-code{font-weight:700;color:#6366f1;font-size:12px;background:#ede9fe;padding:2px 7px;border-radius:5px}
.apt-change-pos{color:#22c55e;font-weight:600;font-size:12px}
.apt-change-neg{color:#ef4444;font-weight:600;font-size:12px}

/* ── Horizontal bar ── */
.hbar-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.hbar-label{font-size:13px;color:#374151;width:120px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hbar-track{flex:1;background:#f1f3f6;border-radius:4px;height:8px;overflow:hidden}
.hbar-fill{height:100%;border-radius:4px;background:#22c55e;transition:width .4s}
.hbar-val{font-size:12.5px;font-weight:600;color:#374151;width:40px;text-align:right;flex-shrink:0}
.hbar-axis{display:flex;justify-content:space-between;font-size:11px;color:#9ca3af;margin-top:6px;padding:0 130px 0 0}

/* ── Monthly bar ── */
.mbar-chart{position:relative}
.mbar-y-labels{position:absolute;left:0;top:0;bottom:30px;display:flex;flex-direction:column-reverse;justify-content:space-between;font-size:11px;color:#9ca3af;width:36px}
.mbar-area{margin-left:44px}
.mbar-legend{display:flex;gap:16px;margin-bottom:10px}
.mbar-legend-item{display:flex;align-items:center;gap:5px;font-size:12px;color:#6b7280}
.mbar-legend-dot{width:8px;height:8px;border-radius:2px}

/* ── AI Insights ── */
.ai-card{background:linear-gradient(135deg,#f5f3ff 0%,#ede9fe 100%);border-radius:14px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.ai-card-header{display:flex;align-items:center;gap:8px;margin-bottom:14px}
.ai-icon{width:28px;height:28px;background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:8px;display:flex;align-items:center;justify-content:center}
.ai-title{font-size:13.5px;font-weight:700;color:#1a1d23}
.ai-sub{font-size:11.5px;color:#9ca3af;margin-top:1px}
.ai-insight-row{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;padding:10px;background:rgba(255,255,255,.7);border-radius:10px}
.ai-insight-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px}
.ai-insight-text{font-size:12.5px;color:#374151;font-weight:500;line-height:1.5}
.ai-insight-text strong{color:#6366f1}
.ai-insight-sub{font-size:11.5px;color:#9ca3af;margin-top:2px}
.ai-view-btn{display:block;text-align:center;padding:9px;border-radius:10px;background:#6366f1;color:#fff;font-size:13px;font-weight:600;cursor:pointer;border:none;width:100%;margin-top:4px}

/* ── Responsive ── */
@media(max-width:1100px){
  .grid3,.grid2-1{grid-template-columns:1fr 1fr}
  .stat-grid{grid-template-columns:repeat(3,1fr)}
}
@media(max-width:720px){
  .rp{padding:16px 12px}
  .stat-grid{grid-template-columns:repeat(2,1fr)}
  .grid3,.grid2-1{grid-template-columns:1fr}
}
`;

/* ─────────────────────────────────────────────
   SVG CHARTS
───────────────────────────────────────────── */

// Donut chart
function DonutChart({
  segments, cx = 80, cy = 80, r = 62, strokeW = 18,
}: {
  segments: { color: string; value: number }[];
  cx?: number; cy?: number; r?: number; strokeW?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  let offset = 0;
  const circumference = 2 * Math.PI * r;
  return (
    <svg width={cx * 2} height={cy * 2} viewBox={`0 0 ${cx * 2} ${cy * 2}`}>
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const rot = offset * 360 - 90;
        offset += pct;
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeW}
            strokeDasharray={`${dash} ${gap}`}
            strokeLinecap="butt"
            transform={`rotate(${rot} ${cx} ${cy})`}
          />
        );
      })}
    </svg>
  );
}

// Simple line chart
function LineChart() {
  const W = 320, H = 180, padL = 32, padB = 24, padT = 10, padR = 10;
  const chartW = W - padL - padR;
  const chartH = H - padB - padT;

  const labels = ["07/06","08/06","09/06","10/06","11/06","12/06","13/06"];
  const onTime =    [610,640,590,680,720,750,800];
  const delayed =   [180,210,190,220,240,260,280];
  const cancelled = [30, 25, 40, 20, 35, 28, 22];
  const maxVal = 900;

  const px = (i: number) => padL + (i / (labels.length - 1)) * chartW;
  const py = (v: number) => padT + chartH - (v / maxVal) * chartH;

  const toPath = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"} ${px(i)} ${py(v)}`).join(" ");

  const yTicks = [0, 200, 400, 600, 800];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      {/* Grid */}
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={padL} y1={py(t)} x2={W - padR} y2={py(t)} stroke="#f1f3f6" strokeWidth="1" />
          <text x={padL - 4} y={py(t) + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{t}</text>
        </g>
      ))}
      {/* X labels */}
      {labels.map((l, i) => (
        <text key={l} x={px(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">{l}</text>
      ))}
      {/* Lines */}
      <path d={toPath(onTime)}    fill="none" stroke="#22c55e" strokeWidth="2"   strokeLinejoin="round"/>
      <path d={toPath(delayed)}   fill="none" stroke="#f59e0b" strokeWidth="2"   strokeLinejoin="round"/>
      <path d={toPath(cancelled)} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Dots */}
      {onTime.map((v, i)    => <circle key={i} cx={px(i)} cy={py(v)} r="3" fill="#22c55e"/>)}
      {delayed.map((v, i)   => <circle key={i} cx={px(i)} cy={py(v)} r="3" fill="#f59e0b"/>)}
      {cancelled.map((v, i) => <circle key={i} cx={px(i)} cy={py(v)} r="2.5" fill="#ef4444"/>)}
    </svg>
  );
}

// Monthly bar chart
function MonthlyBarChart() {
  const W = 560, H = 180, padL = 44, padB = 28, padT = 8, padR = 10;
  const chartW = W - padL - padR;
  const chartH = H - padB - padT;
  const months = ["Jan 2025","Feb 2025","Mar 2025","Apr 2025","May 2025","Jun 2025"];
  const onTime =    [1100, 1600, 980, 1380, 1050, 1420];
  const delayed =   [280,  310,  240, 290,  260,  300];
  const cancelled = [80,   70,   60,  90,   50,   85];
  const maxVal = 1800;
  const yTicks = [0, 500, 1000, 1500, 2000];

  const groupW = chartW / months.length;
  const barW = 14;

  const py = (v: number) => padT + chartH - (v / maxVal) * chartH;
  const px = (i: number) => padL + i * groupW + groupW / 2;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={padL} y1={py(t)} x2={W - padR} y2={py(t)} stroke="#f1f3f6" strokeWidth="1"/>
          <text x={padL - 6} y={py(t) + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
            {t >= 1000 ? `${t/1000}K` : t === 0 ? "0" : t}
          </text>
        </g>
      ))}
      {months.map((m, i) => {
        const x = px(i);
        return (
          <g key={m}>
            <rect x={x - barW - 2}  y={py(onTime[i])}    width={barW} height={chartH - (py(onTime[i]) - padT)}    fill="#22c55e" rx="2"/>
            <rect x={x + 2}          y={py(delayed[i])}   width={barW} height={chartH - (py(delayed[i]) - padT)}   fill="#f59e0b" rx="2"/>
            <rect x={x + barW + 4}   y={py(cancelled[i])} width={barW} height={chartH - (py(cancelled[i]) - padT)} fill="#ef4444" rx="2"/>
            <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">{m.split(" ")[0]}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */
interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  change: string;
  positive: boolean;
  suffix?: string;
}
function StatCard({ icon, iconBg, label, value, change, positive, suffix }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-icon-wrap" style={{ background: iconBg }}>{icon}</div>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-val">{value}{suffix && <span style={{fontSize:14,fontWeight:500,color:"#6b7280"}}> {suffix}</span>}</p>
        <p className={`stat-change ${positive ? "pos" : "neg"}`}>
          {positive ? "▲" : "▼"} {change} <span>vs last week</span>
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview","Flights","Airports","Airlines","Performance","AI Insights"];

  // Flight Status donut
  const flightSegs = [
    { color: "#22c55e", value: 1235 },
    { color: "#f59e0b", value: 248 },
    { color: "#ef4444", value: 57 },
  ];

  // Airlines donut
  const airlineSegs = [
    { color: "#3b82f6", value: 542 },
    { color: "#f59e0b", value: 486 },
    { color: "#22c55e", value: 284 },
    { color: "#9ca3af", value: 128 },
    { color: "#ef4444", value: 100 },
  ];

  // Delay causes donut
  const delaySegs = [
    { color: "#3b82f6", value: 98  },
    { color: "#22c55e", value: 62  },
    { color: "#f59e0b", value: 48  },
    { color: "#ef4444", value: 40  },
  ];

  // Airports
  const airports = [
    { code: "HAN", name: "Noi Bai International",  flights: 425, change: "+8.2%",  pos: true },
    { code: "SGN", name: "Tan Son Nhat",            flights: 398, change: "+12.5%", pos: true },
    { code: "DAD", name: "Da Nang International",   flights: 285, change: "+6.1%",  pos: true },
    { code: "CXR", name: "Cam Ranh International",  flights: 198, change: "-2.4%",  pos: false},
    { code: "PQC", name: "Phu Quoc International",  flights: 156, change: "+4.3%",  pos: true },
  ];

  // On-time performance
  const onTimePerf = [
    { airline: "Vietnam Airlines", pct: 87.6, color: "#22c55e" },
    { airline: "Bamboo Airways",   pct: 82.4, color: "#22c55e" },
    { airline: "VietJet Air",      pct: 78.9, color: "#22c55e" },
    { airline: "Vasco",            pct: 75.3, color: "#f59e0b" },
    { airline: "Pacific Airlines", pct: 72.1, color: "#f59e0b" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="rp">

        {/* ── Page header ── */}
        <div className="rp-header">
          <div className="rp-header-left">
            <h1>Reports</h1>
            <div className="rp-breadcrumb">
              <a href="#">Dashboard</a>
              <span className="rp-breadcrumb-sep">›</span>
              <span>Reports</span>
            </div>
          </div>
          <div className="rp-header-right">
            <button className="date-picker-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              06/06/2025 – 13/06/2025
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <button className="export-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export Report
            </button>
          </div>
        </div>

        {/* ── Title ── */}
        <div className="rp-section-title">Reports &amp; Analytics</div>
        <div className="rp-section-sub">Overview of flight operations and airport performance</div>

        {/* ── Stat cards ── */}
        <div className="stat-grid">
          <StatCard
            iconBg="#dbeafe" positive
            label="Total Flights" value="1,540" change="12.5%"
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 22-7z"/></svg>}
          />
          <StatCard
            iconBg="#dcfce7" positive
            label="On Time" value="1,235" suffix="(80.2%)" change="8.3%"
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/><polyline points="9 12 12 15 17 10"/></svg>}
          />
          <StatCard
            iconBg="#fef9c3" positive={false}
            label="Delayed" value="248" suffix="(16.1%)" change="4.1%"
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></svg>}
          />
          <StatCard
            iconBg="#fee2e2" positive={false}
            label="Cancelled" value="57" suffix="(3.7%)" change="1.2%"
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
          />
          <StatCard
            iconBg="#ede9fe" positive
            label="Total Passengers" value="186,432" change="15.8%"
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          />
        </div>

        {/* ── Tabs ── */}
        <div className="tabs">
          {tabs.map((t) => (
            <button key={t} className={`tab-btn${activeTab === t ? " active" : ""}`} onClick={() => setActiveTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {/* ── Row 1: Donut | Line | Airports ── */}
        <div className="grid3">

          {/* Flight Status Donut */}
          <div className="chart-card">
            <div className="chart-card-header">
              <span className="chart-card-title">Flight Status Overview</span>
            </div>
            <div className="donut-wrap">
              <div style={{ position: "relative", flexShrink: 0 }}>
                <DonutChart segments={flightSegs} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: "#1a1d23", lineHeight: 1 }}>1,540</span>
                  <span style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>Total Flights</span>
                </div>
              </div>
              <div className="donut-legend">
                {[
                  { color: "#22c55e", label: "On Time",   val: "1,235", pct: "(80.2%)" },
                  { color: "#f59e0b", label: "Delayed",   val: "248",   pct: "(16.1%)" },
                  { color: "#ef4444", label: "Cancelled", val: "57",    pct: "(3.7%)" },
                ].map((r) => (
                  <div key={r.label} className="legend-row">
                    <span className="legend-dot" style={{ background: r.color }}/>
                    <span className="legend-label">{r.label}</span>
                    <span className="legend-val">{r.val} <span className="legend-pct">{r.pct}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Flights Trend Line */}
          <div className="chart-card">
            <div className="chart-card-header">
              <span className="chart-card-title">Flights Trend</span>
              <button className="chart-period-btn">
                Daily
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
            <div className="line-legend">
              {[{c:"#22c55e",l:"On Time"},{c:"#f59e0b",l:"Delayed"},{c:"#ef4444",l:"Cancelled"}].map(x=>(
                <div key={x.l} className="line-legend-item">
                  <span className="line-legend-dot" style={{background:x.c}}/>
                  {x.l}
                </div>
              ))}
            </div>
            <LineChart />
          </div>

          {/* Top 5 Airports */}
          <div className="chart-card">
            <div className="chart-card-header">
              <span className="chart-card-title">Top 5 Busiest Airports</span>
            </div>
            <table className="apt-table">
              <thead>
                <tr>
                  <th>Airport</th>
                  <th style={{textAlign:"right"}}>Flights</th>
                  <th style={{textAlign:"right"}}>Change</th>
                </tr>
              </thead>
              <tbody>
                {airports.map((a) => (
                  <tr key={a.code}>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span className="apt-code">{a.code}</span>
                        <span style={{fontSize:12.5,color:"#6b7280"}}>{a.name}</span>
                      </div>
                    </td>
                    <td style={{textAlign:"right",fontWeight:600}}>{a.flights}</td>
                    <td style={{textAlign:"right"}}>
                      <span className={a.pos ? "apt-change-pos" : "apt-change-neg"}>
                        {a.pos ? "▲" : "▼"} {a.change}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Row 2: Airlines Donut | On-Time bars | Delay Causes ── */}
        <div className="grid3">

          {/* Top Airlines Donut */}
          <div className="chart-card">
            <div className="chart-card-header">
              <span className="chart-card-title">Top Airlines by Number of Flights</span>
              <a className="view-all-link">View all</a>
            </div>
            <div className="donut-wrap">
              <div style={{ position: "relative", flexShrink: 0 }}>
                <DonutChart segments={airlineSegs} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: "#1a1d23", lineHeight: 1 }}>1,540</span>
                  <span style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>Total Flights</span>
                </div>
              </div>
              <div className="donut-legend">
                {[
                  { color: "#3b82f6", label: "Vietnam Airlines", val: "542", pct: "(35.2%)" },
                  { color: "#f59e0b", label: "VietJet Air",       val: "486", pct: "(31.6%)" },
                  { color: "#22c55e", label: "Bamboo Airways",    val: "284", pct: "(18.4%)" },
                  { color: "#9ca3af", label: "Pacific Airlines",  val: "128", pct: "(8.3%)" },
                  { color: "#ef4444", label: "Vasco",             val: "100", pct: "(6.5%)" },
                ].map((r) => (
                  <div key={r.label} className="legend-row" style={{marginBottom:4}}>
                    <span className="legend-dot" style={{ background: r.color }}/>
                    <span className="legend-label" style={{fontSize:12}}>{r.label}</span>
                    <span className="legend-val" style={{fontSize:12}}>{r.val} <span className="legend-pct">{r.pct}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* On-Time Performance Horizontal Bars */}
          <div className="chart-card">
            <div className="chart-card-header">
              <span className="chart-card-title">On-Time Performance by Airline</span>
              <a className="view-all-link">View all</a>
            </div>
            <div style={{marginTop:4}}>
              {onTimePerf.map((p) => (
                <div key={p.airline} className="hbar-row">
                  <span className="hbar-label">{p.airline}</span>
                  <div className="hbar-track">
                    <div className="hbar-fill" style={{ width: `${p.pct}%`, background: p.color }}/>
                  </div>
                  <span className="hbar-val">{p.pct}%</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#9ca3af",marginTop:6,paddingLeft:128}}>
                {["0%","25%","50%","75%","100%"].map(x=><span key={x}>{x}</span>)}
              </div>
            </div>
          </div>

          {/* Delay Causes */}
          <div className="chart-card">
            <div className="chart-card-header">
              <span className="chart-card-title">Delay Causes</span>
              <a className="view-all-link">View all</a>
            </div>
            <div className="donut-wrap">
              <div style={{ position: "relative", flexShrink: 0 }}>
                <DonutChart segments={delaySegs} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: "#1a1d23", lineHeight: 1 }}>248</span>
                  <span style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>Total Delays</span>
                </div>
              </div>
              <div className="donut-legend">
                {[
                  { color: "#3b82f6", label: "Weather",     val: "98",  pct: "(39.5%)" },
                  { color: "#22c55e", label: "Air Traffic",  val: "62",  pct: "(25.0%)" },
                  { color: "#f59e0b", label: "Technical",   val: "48",  pct: "(19.4%)" },
                  { color: "#ef4444", label: "Operational", val: "40",  pct: "(16.1%)" },
                ].map((r) => (
                  <div key={r.label} className="legend-row">
                    <span className="legend-dot" style={{ background: r.color }}/>
                    <span className="legend-label">{r.label}</span>
                    <span className="legend-val">{r.val} <span className="legend-pct">{r.pct}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 3: Monthly bar (2/3) | AI Insights (1/3) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>

          {/* Monthly Comparison */}
          <div className="chart-card">
            <div className="chart-card-header">
              <span className="chart-card-title">Monthly Comparison</span>
              <button className="chart-period-btn">
                This Year
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
            <div className="mbar-legend">
              {[{c:"#22c55e",l:"On Time"},{c:"#f59e0b",l:"Delayed"},{c:"#ef4444",l:"Cancelled"}].map(x=>(
                <div key={x.l} className="mbar-legend-item">
                  <span className="mbar-legend-dot" style={{background:x.c}}/>
                  {x.l}
                </div>
              ))}
            </div>
            <MonthlyBarChart />
          </div>

          {/* AI Insights */}
          <div className="ai-card">
            <div className="ai-card-header">
              <div className="ai-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div>
                <div className="ai-title">AI Insights Summary</div>
                <div className="ai-sub">Based on AI analysis of current flight data</div>
              </div>
            </div>

            {[
              {
                bg:"#fef9c3", icon:"⚠️",
                text: <>On-time performance is predicted to improve by <strong>8.6%</strong> next week</>,
                sub: "Mostly due to better weather conditions",
              },
              {
                bg:"#ede9fe", icon:"🤖",
                text: <>High delay risk at <strong>SGN</strong> on 15–16 June</>,
                sub: "Due to heavy rain and high traffic congestion",
              },
              {
                bg:"#dcfce7", icon:"⭐",
                text: <>Vietnam Airlines shows the most stable performance</>,
                sub: "87.6% on-time rate with low cancellation",
              },
            ].map((r, i) => (
              <div key={i} className="ai-insight-row">
                <div className="ai-insight-icon" style={{ background: r.bg }}>{r.icon}</div>
                <div>
                  <div className="ai-insight-text">{r.text}</div>
                  <div className="ai-insight-sub">{r.sub}</div>
                </div>
              </div>
            ))}

            <button className="ai-view-btn">View Full AI Report</button>
          </div>
        </div>

      </div>
    </>
  );
}