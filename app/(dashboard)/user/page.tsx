"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BellOff,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Clock3,
  LoaderCircle,
  MapPinned,
  Plane,
  Search,
  SlidersHorizontal,
  Sparkles,
  TicketCheck,
  TriangleAlert,
} from "lucide-react";
import api from "@/lib/axios";
import type { FlightSubscription } from "@/lib/flight-subscriptions";
import {
  getAirlineColor,
  mapBackendFlight,
  normalizeText,
  type FlightCard,
  type FlightUiStatus,
} from "@/lib/skytrack-data";

type FlightFilter = "all" | "active" | "delayed" | "cancelled";
type SortOption = "departure" | "recent" | "flight";

interface TrackedFlight {
  subscriptionId: number;
  followedAt?: string;
  departureAt?: string;
  card: FlightCard;
}

const PAGE_SIZE = 5;

const FILTERS: Array<{ value: FlightFilter; label: string }> = [
  { value: "all", label: "All flights" },
  { value: "active", label: "On track" },
  { value: "delayed", label: "Delayed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES: Record<FlightUiStatus, string> = {
  "On Time": "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  Scheduled: "bg-blue-50 text-blue-700 ring-blue-600/10",
  Boarding: "bg-violet-50 text-violet-700 ring-violet-600/10",
  Delayed: "bg-amber-50 text-amber-700 ring-amber-600/10",
  Cancelled: "bg-rose-50 text-rose-700 ring-rose-600/10",
};

function isActiveStatus(status: FlightUiStatus) {
  return status === "On Time" || status === "Scheduled" || status === "Boarding";
}

function toTimestamp(value?: string) {
  if (!value) return Number.POSITIVE_INFINITY;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

function departureLabel(value?: string, status?: FlightUiStatus) {
  if (status === "Cancelled") return "Service cancelled";
  if (!value) return "Schedule pending";

  const difference = new Date(value).getTime() - Date.now();
  if (Number.isNaN(difference)) return "Schedule pending";
  if (difference <= 0) return status === "Boarding" ? "Boarding now" : "Departed";

  const minutes = Math.ceil(difference / 60000);
  if (minutes < 60) return `Departs in ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) return `Departs in ${hours}h ${remainingMinutes}m`;
  const days = Math.floor(hours / 24);
  return `Departs in ${days} day${days === 1 ? "" : "s"}`;
}

function parseSubscriptions(payload: unknown): TrackedFlight[] {
  if (!Array.isArray(payload)) return [];

  return (payload as FlightSubscription[])
    .filter((subscription) => subscription.flight)
    .map((subscription) => ({
      subscriptionId: subscription.id,
      followedAt: subscription.createdAt,
      departureAt: subscription.flight?.departureTime,
      card: mapBackendFlight(subscription.flight!),
    }));
}

function statusIcon(status: FlightUiStatus) {
  if (status === "Cancelled") return CircleX;
  if (status === "Delayed") return TriangleAlert;
  return CheckCircle2;
}

export default function MyFlightsPage() {
  const [trackedFlights, setTrackedFlights] = useState<TrackedFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FlightFilter>("all");
  const [sort, setSort] = useState<SortOption>("departure");
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    let mounted = true;

    api
      .get("/api/subscriptions/me")
      .then((response) => {
        if (!mounted) return;
        setTrackedFlights(parseSubscriptions(response.data));
        setError("");
      })
      .catch(() => {
        if (!mounted) return;
        setTrackedFlights([]);
        setError("We could not load your followed flights. Please try again.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const counts = useMemo(() => {
    const active = trackedFlights.filter((flight) => isActiveStatus(flight.card.status)).length;
    const delayed = trackedFlights.filter((flight) => flight.card.status === "Delayed").length;
    const cancelled = trackedFlights.filter((flight) => flight.card.status === "Cancelled").length;
    return { total: trackedFlights.length, active, delayed, cancelled };
  }, [trackedFlights]);

  const visibleFlights = useMemo(() => {
    const normalizedQuery = normalizeText(deferredQuery).toLowerCase();
    const filtered = trackedFlights.filter(({ card }) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          card.flightNo,
          card.airline,
          card.from.code,
          card.from.city,
          card.to.code,
          card.to.city,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && isActiveStatus(card.status)) ||
        (filter === "delayed" && card.status === "Delayed") ||
        (filter === "cancelled" && card.status === "Cancelled");

      return matchesQuery && matchesFilter;
    });

    return [...filtered].sort((left, right) => {
      if (sort === "flight") return left.card.flightNo.localeCompare(right.card.flightNo);
      if (sort === "recent") return toTimestamp(right.followedAt) - toTimestamp(left.followedAt);
      return toTimestamp(left.departureAt) - toTimestamp(right.departureAt);
    });
  }, [deferredQuery, filter, sort, trackedFlights]);

  const totalPages = Math.max(1, Math.ceil(visibleFlights.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageFlights = visibleFlights.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const pageStart = visibleFlights.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, visibleFlights.length);

  useEffect(() => {
    setPage(1);
  }, [deferredQuery, filter, sort]);

  async function unfollow(flight: TrackedFlight) {
    setRemovingId(flight.card.id);
    setActionError("");

    try {
      await api.delete(`/api/subscriptions/me/${flight.card.id}`);
      setTrackedFlights((current) => current.filter((item) => item.card.id !== flight.card.id));
    } catch {
      setActionError(`Could not unfollow ${flight.card.flightNo}. Please try again.`);
    } finally {
      setRemovingId(null);
    }
  }

  const activePercent = counts.total ? (counts.active / counts.total) * 100 : 0;
  const delayedPercent = counts.total ? (counts.delayed / counts.total) * 100 : 0;
  const summaryGradient = counts.total
    ? `conic-gradient(#22c55e 0 ${activePercent}%, #f59e0b ${activePercent}% ${activePercent + delayedPercent}%, #f43f5e ${activePercent + delayedPercent}% 100%)`
    : "conic-gradient(#e2e8f0 0 100%)";

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_28%),#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              Personal flight watchlist
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">My Flights</h1>
            <p className="mt-2 text-sm text-slate-500">
              Every flight you follow from Search Flights or Live Map appears here.
            </p>
          </div>
          <Link
            href="/user/searchflight"
            className="inline-flex w-fit items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500"
          >
            <Search className="h-4 w-4" />
            Find another flight
          </Link>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by flight number, route or airline..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <label className="relative">
                <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortOption)}
                  className="h-12 min-w-48 appearance-none rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-semibold text-slate-600 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="departure">Departure time</option>
                  <option value="recent">Recently followed</option>
                  <option value="flight">Flight number</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Following", value: counts.total, icon: Plane, tone: "bg-blue-50 text-blue-600" },
                { label: "On track", value: counts.active, icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" },
                { label: "Delayed", value: counts.delayed, icon: Clock3, tone: "bg-amber-50 text-amber-600" },
                { label: "Cancelled", value: counts.cancelled, icon: CircleX, tone: "bg-rose-50 text-rose-600" },
              ].map(({ label, value, icon: Icon, tone }) => (
                <article key={label} className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-11 w-11 place-items-center rounded-2xl ${tone}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-xs font-medium text-slate-500">{label}</div>
                      <div className="mt-0.5 text-2xl font-bold text-slate-950">{loading ? "-" : value}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
              {FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`relative shrink-0 px-4 py-3 text-sm font-semibold transition ${
                    filter === item.value ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {item.label}
                  {filter === item.value && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-blue-600" />}
                </button>
              ))}
            </div>

            {(error || actionError) && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {actionError || error}
              </div>
            )}

            <div className="space-y-3">
              {loading &&
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-40 animate-pulse rounded-[24px] border border-slate-200 bg-white" />
                ))}

              {!loading &&
                pageFlights.map((flight) => {
                  const { card } = flight;
                  const StatusIcon = statusIcon(card.status);
                  const airlineColor = getAirlineColor(card.airlineCode);

                  return (
                    <article
                      key={flight.subscriptionId}
                      className="group overflow-hidden rounded-[24px] border border-slate-200/90 bg-white shadow-[0_10px_32px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_44px_rgba(37,99,235,0.1)]"
                    >
                      <div className="grid gap-5 p-5 lg:grid-cols-[180px_minmax(0,1fr)_170px] lg:items-center">
                        <div className="flex items-center gap-3">
                          <span
                            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-sm font-black text-white shadow-sm"
                            style={{ backgroundColor: airlineColor }}
                          >
                            {card.airlineCode || card.flightNo.slice(0, 2)}
                          </span>
                          <div className="min-w-0">
                            <div className="text-base font-bold text-slate-950">{card.flightNo}</div>
                            <div className="truncate text-xs text-slate-500">{card.airline}</div>
                            <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                              {card.aircraft}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                          <div>
                            <div className="text-lg font-bold text-slate-950">{card.from.code}</div>
                            <div className="truncate text-xs text-slate-500">{card.from.city}</div>
                            <div className="mt-2 text-sm font-bold text-slate-800">{card.from.time}</div>
                            <div className="text-[11px] text-slate-400">{card.from.date}</div>
                          </div>
                          <div className="flex min-w-24 items-center text-slate-300">
                            <span className="h-px flex-1 bg-slate-200" />
                            <Plane className="mx-2 h-4 w-4 rotate-90 text-blue-500" />
                            <span className="h-px flex-1 bg-slate-200" />
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-slate-950">{card.to.code}</div>
                            <div className="truncate text-xs text-slate-500">{card.to.city}</div>
                            <div className="mt-2 text-sm font-bold text-slate-800">{card.to.time}</div>
                            <div className="text-[11px] text-slate-400">{card.to.date}</div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 lg:items-end">
                          <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ring-1 ring-inset ${STATUS_STYLES[card.status]}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {card.status}
                          </span>
                          <div className="text-xs font-semibold text-slate-500">
                            {departureLabel(flight.departureAt, card.status)}
                          </div>
                          <div className="mt-1 grid w-full grid-cols-2 gap-2 lg:w-40">
                            <Link
                              href={`/user/live-map?flight=${encodeURIComponent(card.flightNo)}`}
                              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-blue-500"
                            >
                              View map
                            </Link>
                            <button
                              type="button"
                              disabled={removingId === card.id}
                              onClick={() => void unfollow(flight)}
                              className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-wait disabled:opacity-60"
                            >
                              {removingId === card.id ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <BellOff className="h-3.5 w-3.5" />}
                              Unfollow
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>

            {!loading && visibleFlights.length === 0 && (
              <div className="grid min-h-80 place-items-center rounded-[28px] border border-dashed border-slate-300 bg-white px-6 text-center">
                <div>
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-blue-50 text-blue-600">
                    <TicketCheck className="h-7 w-7" />
                  </span>
                  <h2 className="mt-5 text-xl font-bold text-slate-950">
                    {trackedFlights.length === 0 ? "No followed flights yet" : "No matching flights"}
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    {trackedFlights.length === 0
                      ? "Follow a flight from Search Flights or select an aircraft on Live Map to add it to this watchlist."
                      : "Try another search term or choose a different status filter."}
                  </p>
                  {trackedFlights.length === 0 && (
                    <Link href="/user/searchflight" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
                      Search flights
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {!loading && visibleFlights.length > 0 && (
              <div className="flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-slate-500">
                  Showing {pageStart}-{pageEnd} of {visibleFlights.length} followed flights
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous page"
                    disabled={currentPage === 1}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="min-w-20 text-center text-xs font-semibold text-slate-600">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    aria-label="Next page"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-950">My Flights Summary</div>
                  <div className="mt-1 text-xs text-slate-400">Current watchlist</div>
                </div>
                <CalendarDays className="h-5 w-5 text-blue-500" />
              </div>
              <div className="mt-6 flex items-center gap-6">
                <div className="relative grid h-32 w-32 shrink-0 place-items-center rounded-full" style={{ background: summaryGradient }}>
                  <div className="grid h-[88px] w-[88px] place-items-center rounded-full bg-white text-center shadow-inner">
                    <div>
                      <div className="text-2xl font-black text-slate-950">{counts.total}</div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total</div>
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  {[
                    { label: "On track", value: counts.active, color: "bg-emerald-500" },
                    { label: "Delayed", value: counts.delayed, color: "bg-amber-500" },
                    { label: "Cancelled", value: counts.cancelled, color: "bg-rose-500" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-xs">
                      <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      <span className="flex-1 text-slate-500">{item.label}</span>
                      <span className="font-bold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
              <div>
                <h2 className="text-sm font-bold text-slate-950">Tracking activity</h2>
                <p className="mt-1 text-xs text-slate-400">Updates from followed flights</p>
              </div>
              <div className="mt-5 space-y-4">
                {trackedFlights.slice(0, 4).map(({ card }) => {
                  const Icon = statusIcon(card.status);
                  const tone =
                    card.status === "Cancelled"
                      ? "bg-rose-50 text-rose-600"
                      : card.status === "Delayed"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-emerald-50 text-emerald-600";
                  return (
                    <div key={card.id} className="flex items-start gap-3">
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tone}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-bold text-slate-900">{card.flightNo} {card.status.toLowerCase()}</div>
                        <div className="mt-1 truncate text-[11px] text-slate-400">{card.from.code} to {card.to.code}</div>
                      </div>
                      <span className="text-[10px] text-slate-400">{card.from.time}</span>
                    </div>
                  );
                })}
                {!loading && trackedFlights.length === 0 && (
                  <div className="rounded-2xl bg-slate-50 p-5 text-center text-xs leading-5 text-slate-500">
                    Follow a flight to see tracking activity here.
                  </div>
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-[26px] bg-[#07111f] p-5 text-white shadow-[0_18px_48px_rgba(7,17,31,0.22)]">
              <div className="text-sm font-bold">Quick actions</div>
              <div className="mt-4 space-y-2">
                {[
                  { label: "Search Flights", desc: "Find and follow flights", href: "/user/searchflight", icon: Search, tone: "text-blue-300" },
                  { label: "Live Map", desc: "Track aircraft in real time", href: "/user/live-map", icon: MapPinned, tone: "text-emerald-300" },
                  { label: "AI Assistant", desc: "Ask about your journey", href: "/user/ai", icon: Bot, tone: "text-violet-300" },
                ].map(({ label, desc, href, icon: Icon, tone }) => (
                  <Link key={href} href={href} className="group flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3 transition hover:bg-white/[0.1]">
                    <span className={`grid h-9 w-9 place-items-center rounded-xl bg-white/[0.06] ${tone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold">{label}</span>
                      <span className="mt-0.5 block text-[10px] text-slate-500">{desc}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-white" />
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </div>
  );
}
