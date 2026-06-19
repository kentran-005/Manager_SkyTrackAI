"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleX,
  Download,
  Plane,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "@/lib/axios";
import type { BackendAirline, BackendAirport, BackendFlight, BackendStats } from "@/lib/skytrack-data";

const COLORS = ["#2563eb", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

export default function AdminReportsPage() {
  const [flights, setFlights] = useState<BackendFlight[]>([]);
  const [airports, setAirports] = useState<BackendAirport[]>([]);
  const [airlines, setAirlines] = useState<BackendAirline[]>([]);
  const [stats, setStats] = useState<BackendStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get<BackendFlight[]>("/api/flights"),
      api.get<BackendAirport[]>("/api/airports"),
      api.get<BackendAirline[]>("/api/airlines"),
      api.get<BackendStats>("/api/dashboard/stats"),
    ])
      .then(([flightResponse, airportResponse, airlineResponse, statsResponse]) => {
        setFlights(Array.isArray(flightResponse.data) ? flightResponse.data : []);
        setAirports(Array.isArray(airportResponse.data) ? airportResponse.data : []);
        setAirlines(Array.isArray(airlineResponse.data) ? airlineResponse.data : []);
        setStats(statsResponse.data);
        setError("");
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load reports."))
      .finally(() => setLoading(false));
  }, []);

  const total = stats?.totalFlights ?? flights.length;
  const onTime = stats?.onTimeFlights ?? flights.filter((flight) => ["ON_TIME", "SCHEDULED", "BOARDING"].includes(flight.status || "")).length;
  const delayed = stats?.delayedFlights ?? flights.filter((flight) => flight.status === "DELAYED").length;
  const cancelled = stats?.cancelledFlights ?? flights.filter((flight) => flight.status === "CANCELLED").length;
  const percentage = (value: number) => total ? `${((value / total) * 100).toFixed(1)}%` : "0%";

  const statusData = [
    { name: "On track", value: onTime, color: "#10b981" },
    { name: "Delayed", value: delayed, color: "#f59e0b" },
    { name: "Cancelled", value: cancelled, color: "#ef4444" },
  ];

  const airlineData = useMemo(() => airlines.map((airline, index) => ({
    name: airline.name || airline.code || "Airline",
    value: flights.filter((flight) => flight.airline?.id === airline.id || flight.airline?.code === airline.code).length,
    color: COLORS[index % COLORS.length],
  })).sort((left, right) => right.value - left.value), [airlines, flights]);

  const airportData = useMemo(() => airports.map((airport) => ({
    code: airport.code || "N/A",
    name: airport.name || airport.city || "Airport",
    flights: flights.filter((flight) => flight.departureAirport?.code === airport.code || flight.arrivalAirport?.code === airport.code).length,
  })).sort((left, right) => right.flights - left.flights).slice(0, 6), [airports, flights]);

  const routeData = useMemo(() => {
    const routes = new Map<string, number>();
    flights.forEach((flight) => {
      const from = flight.departureAirport?.code;
      const to = flight.arrivalAirport?.code;
      if (!from || !to) return;
      const key = `${from} → ${to}`;
      routes.set(key, (routes.get(key) || 0) + 1);
    });
    return Array.from(routes, ([route, count]) => ({ route, count })).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [flights]);

  function exportReport() {
    const rows = [
      ["Flight", "Airline", "Departure", "Arrival", "Status"],
      ...flights.map((flight) => [
        flight.flightCode || flight.flightNumber || "",
        flight.airline?.name || "",
        flight.departureAirport?.code || "",
        flight.arrivalAirport?.code || "",
        flight.status || "",
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `skytrack-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const statCards = [
    { label: "Total flights", value: total, detail: "Flight records", icon: Plane, tone: "bg-blue-50 text-blue-600" },
    { label: "On track", value: onTime, detail: percentage(onTime), icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Delayed", value: delayed, detail: percentage(delayed), icon: TriangleAlert, tone: "bg-amber-50 text-amber-600" },
    { label: "Cancelled", value: cancelled, detail: percentage(cancelled), icon: CircleX, tone: "bg-rose-50 text-rose-600" },
    { label: "Airports", value: stats?.totalAirports ?? airports.length, detail: `${stats?.totalAirlines ?? airlines.length} airlines`, icon: Building2, tone: "bg-violet-50 text-violet-600" },
  ];

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,.08),transparent_30%),#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Operations intelligence</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950">Reports & Analytics</h1>
            <p className="mt-2 text-sm text-slate-500">Live operational insights generated from SkyTrack flight data.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600"><CalendarDays className="h-4 w-4 text-blue-500" /> Updated {new Date().toLocaleDateString("en-GB")}</span>
            <button type="button" onClick={exportReport} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"><Download className="h-4 w-4" /> Export CSV</button>
          </div>
        </header>

        {error && <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {statCards.map(({ label, value, detail, icon: Icon, tone }) => (
            <article key={label} className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,.05)]">
              <div className="flex items-start justify-between gap-3">
                <div><div className="text-xs text-slate-500">{label}</div><div className="mt-2 text-2xl font-black text-slate-950">{loading ? "-" : value}</div><div className="mt-1 text-[11px] font-semibold text-slate-400">{detail}</div></div>
                <span className={`grid h-10 w-10 place-items-center rounded-2xl ${tone}`}><Icon className="h-5 w-5" /></span>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
          <article className="min-w-0 rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_14px_44px_rgba(15,23,42,.06)] sm:p-6">
            <div><h2 className="font-bold text-slate-950">Airport traffic</h2><p className="mt-1 text-xs text-slate-400">Arrivals and departures by managed airport</p></div>
            <div className="mt-5 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={airportData} margin={{ left: -20, right: 8 }}>
                  <CartesianGrid vertical={false} stroke="#eef2f7" />
                  <XAxis dataKey="code" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip cursor={{ fill: "#eff6ff" }} contentStyle={{ borderRadius: 14, border: "1px solid #e2e8f0", boxShadow: "0 12px 30px rgba(15,23,42,.1)" }} />
                  <Bar dataKey="flights" fill="#2563eb" radius={[8, 8, 0, 0]} maxBarSize={52} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_14px_44px_rgba(15,23,42,.06)] sm:p-6">
            <div><h2 className="font-bold text-slate-950">Flight status</h2><p className="mt-1 text-xs text-slate-400">Current scheduled-flight distribution</p></div>
            <div className="mt-4 grid items-center gap-4 sm:grid-cols-[190px_1fr]">
              <div className="relative h-48">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3} strokeWidth={0}>{statusData.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><div className="text-2xl font-black text-slate-950">{total}</div><div className="text-[10px] uppercase tracking-wider text-slate-400">Flights</div></div></div>
              </div>
              <div className="space-y-3">
                {statusData.map((item) => <div key={item.name} className="flex items-center gap-2 text-xs"><span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} /><span className="flex-1 text-slate-500">{item.name}</span><span className="font-bold text-slate-950">{item.value}</span><span className="w-12 text-right text-slate-400">{percentage(item.value)}</span></div>)}
              </div>
            </div>
          </article>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-3">
          <article className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_14px_44px_rgba(15,23,42,.06)]">
            <h2 className="font-bold text-slate-950">Airline share</h2><p className="mt-1 text-xs text-slate-400">Flights operated by airline</p>
            <div className="mt-5 space-y-4">{airlineData.slice(0, 6).map((item) => <div key={item.name}><div className="mb-1.5 flex justify-between text-xs"><span className="truncate text-slate-600">{item.name}</span><span className="font-bold text-slate-900">{item.value}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${total ? Math.max(4, (item.value / total) * 100) : 0}%`, background: item.color }} /></div></div>)}</div>
          </article>

          <article className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_14px_44px_rgba(15,23,42,.06)]">
            <h2 className="font-bold text-slate-950">Popular routes</h2><p className="mt-1 text-xs text-slate-400">Most frequent routes in the database</p>
            <div className="mt-4 divide-y divide-slate-100">{routeData.map((item, index) => <div key={item.route} className="flex items-center gap-3 py-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-xs font-black text-blue-600">{index + 1}</span><span className="flex-1 text-sm font-semibold text-slate-700">{item.route}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{item.count}</span></div>)}</div>
          </article>

          <article className="relative overflow-hidden rounded-[26px] bg-[#07111f] p-5 text-white shadow-[0_18px_48px_rgba(7,17,31,.22)]">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="relative flex items-center gap-2 text-blue-300"><Sparkles className="h-4 w-4" /><span className="text-[11px] font-bold uppercase tracking-[0.18em]">AI operations</span></div>
            <h2 className="relative mt-4 text-xl font-bold">Turn these numbers into decisions.</h2>
            <p className="relative mt-3 text-sm leading-6 text-slate-400">Ask SkyTrack AI to explain delays, airport activity or operational risks using current aviation data.</p>
            <div className="relative mt-5 rounded-2xl bg-white/[0.06] p-4">
              <div className="flex items-start gap-3"><Activity className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /><p className="text-xs leading-5 text-slate-300">{delayed > 0 ? `${delayed} delayed flight${delayed === 1 ? "" : "s"} currently require operational attention.` : "No delayed scheduled flights are recorded."}</p></div>
            </div>
            <Link href="/admin/ai" className="relative mt-5 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold transition hover:bg-blue-500">Open AI report</Link>
          </article>
        </section>
      </div>
    </main>
  );
}
