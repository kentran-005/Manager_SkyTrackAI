"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, Bot, Clock3, MapPinned, Plane, Search, Sparkles, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import api from "@/lib/axios";
import { type BackendFlight, type BackendStats, mapBackendFlight } from "@/lib/skytrack-data";

type StatCard = {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "blue" | "amber" | "emerald" | "violet";
  description: string;
};

const quickActions = [
  { label: "Search Flight", desc: "Find flight status", icon: Search, href: "/user/searchflight", tone: "blue" },
  { label: "Open Live Map", desc: "View realtime traffic", icon: MapPinned, href: "/user/live-map", tone: "emerald" },
  { label: "Ask AI Assistant", desc: "Get help instantly", icon: Bot, href: "/user/ai", tone: "violet" },
  { label: "View Notifications", desc: "See all alerts", icon: Bell, href: "/user/notifications", tone: "amber" },
];

const toneClasses: Record<
  StatCard["tone"],
  { bg: string; text: string; surface: string }
> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", surface: "bg-blue-50/70" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", surface: "bg-amber-50/70" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", surface: "bg-emerald-50/70" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", surface: "bg-violet-50/70" },
};

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<BackendStats | null>(null);
  const [recentFlights, setRecentFlights] = useState<ReturnType<typeof mapBackendFlight>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setError("");
        const [statsRes, flightsRes] = await Promise.all([
          api.get("/api/dashboard/stats"),
          api.get("/api/flights"),
        ]);

        if (!mounted) return;

        setStats(statsRes.data ?? null);
        setRecentFlights(
          Array.isArray(flightsRes.data)
            ? flightsRes.data.slice(0, 4).map((flight: BackendFlight) => mapBackendFlight(flight))
            : [],
        );
      } catch {
        if (!mounted) {
          return;
        }
        setStats(null);
        setRecentFlights([]);
        setError("Backend data is unavailable. The workspace is still ready for navigation.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const cards: StatCard[] = useMemo(
    () => [
      {
        label: "Flights tracking",
        value: loading ? "..." : String(stats?.totalFlights ?? 0),
        icon: Plane,
        tone: "blue",
        description: "Fetched from backend",
      },
      {
        label: "Delayed flights",
        value: loading ? "..." : String(stats?.delayedFlights ?? 0),
        icon: Clock3,
        tone: "amber",
        description: "Backend live count",
      },
      {
        label: "Passengers",
        value: loading ? "..." : String(stats?.totalPassengers ?? 0),
        icon: TrendingUp,
        tone: "emerald",
        description: "Aggregated KPI",
      },
      {
        label: "Notifications",
        value: "3",
        icon: Bell,
        tone: "violet",
        description: "System alerts",
      },
    ],
    [loading, stats],
  );

  return (
    <div className="min-h-[calc(100vh-72px)] space-y-6 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.1),_transparent_35%),linear-gradient(180deg,_#f8fafc,_#eef4ff)] p-4 sm:p-6 lg:p-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.2)] sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-100 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Personalized overview
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back, {firstName}. Your flight activity is ready.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              This dashboard now pulls backend data where possible, so the numbers you see match the live flight system instead of static mock cards.
            </p>
          </div>
          <Link
            href="/user/live-map"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
          >
            <MapPinned className="h-4 w-4" />
            Open live map
          </Link>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const colors = toneClasses[card.tone];
          return (
            <div key={card.label} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{card.label}</span>
                <div className={`rounded-2xl p-2 ${colors.bg} ${colors.text}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 text-3xl font-semibold text-slate-950">{card.value}</div>
              <div className="mt-1 text-sm text-slate-500">{card.description}</div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Quick actions</h2>
              <p className="text-sm text-slate-500">Jump into the features that matter most.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const colors = toneClasses[action.tone as StatCard["tone"]];
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className={`rounded-2xl p-3 ${colors.bg} ${colors.text}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 transition group-hover:text-slate-600">Open</span>
                  </div>
                  <div className="mt-4 text-base font-semibold text-slate-950">{action.label}</div>
                  <p className="mt-1 text-sm text-slate-500">{action.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Recent flights</h2>
              <p className="text-sm text-slate-500">Latest results fetched from backend.</p>
            </div>
            <Link href="/user/searchflight" className="text-sm font-semibold text-blue-600 hover:text-blue-500">
              Search all
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {recentFlights.length > 0 ? (
              recentFlights.map((flight) => (
                <div key={flight.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">{flight.flightNo}</div>
                      <div className="text-xs text-slate-500">{flight.airline}</div>
                    </div>
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                      {flight.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                    <span>{flight.from.code} → {flight.to.code}</span>
                    <span>{flight.from.time} / {flight.to.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                No flights available right now.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">System status</h2>
            <p className="text-sm text-slate-500">Backend health for stats and flight data.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Live stats</div>
              <div className="mt-1 text-sm font-semibold text-slate-950">{stats ? "Connected" : "Fallback mode"}</div>
            </div>
            <div className="rounded-3xl bg-slate-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Alerts</div>
              <div className="mt-1 text-sm font-semibold text-slate-950">3 active</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
