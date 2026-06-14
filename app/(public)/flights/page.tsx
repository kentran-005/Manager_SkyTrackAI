"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock3, Plane, Search, SlidersHorizontal } from "lucide-react";
import api from "@/lib/axios";
import { type BackendFlight, type FlightCard, mapBackendFlight, normalizeText } from "@/lib/skytrack-data";

const FILTERS = ["All", "On Time", "Scheduled", "Boarding", "Delayed", "Cancelled"] as const;

function mapFlights(data: unknown): FlightCard[] {
  return Array.isArray(data) ? (data as BackendFlight[]).map(mapBackendFlight) : [];
}

export default function FlightsPage() {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [flights, setFlights] = useState<FlightCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadFlights() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/api/flights");
        if (mounted) setFlights(mapFlights(res.data));
      } catch (err: unknown) {
        if (mounted) setError(err instanceof Error ? err.message : "Cannot load flights");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadFlights();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredFlights = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return flights.filter((flight) => {
      const matchesFilter = activeFilter === "All" || flight.status === activeFilter;
      const matchesSearch =
        query === "" ||
        flight.flightNo.toLowerCase().includes(query) ||
        flight.airline.toLowerCase().includes(query) ||
        flight.from.code.toLowerCase().includes(query) ||
        flight.to.code.toLowerCase().includes(query) ||
        flight.from.city.toLowerCase().includes(query) ||
        flight.to.city.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, flights, searchQuery]);

  const summary = useMemo(() => {
    const delayed = flights.filter((flight) => flight.status === "Delayed").length;
    const onTime = flights.filter((flight) => flight.status === "On Time" || flight.status === "Boarding").length;
    return { delayed, onTime };
  }, [flights]);

  return (
    <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.08),_transparent_35%),linear-gradient(180deg,_#f8fafc,_#eef4ff)] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-7 text-white shadow-[0_24px_80px_rgba(15,23,42,0.2)] sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-blue-200/80">Public Flights</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Track and explore flights with a cleaner, faster search flow.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Search backend flight records, filter by status, and inspect timing, route and gate information in a layout that is easier to scan.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[300px]">
              <div className="rounded-3xl bg-white/8 p-4 backdrop-blur">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Flights</div>
                <div className="mt-2 text-3xl font-semibold">{flights.length}</div>
              </div>
              <div className="rounded-3xl bg-white/8 p-4 backdrop-blur">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Delayed</div>
                <div className="mt-2 text-3xl font-semibold text-amber-300">{summary.delayed}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search flights, route codes, airports..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  activeFilter === filter
                    ? "bg-slate-950 text-white shadow"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-950">{filteredFlights.length}</span> of {flights.length} flights
          </p>
          <p className="text-sm text-slate-500">{summary.onTime} on time / boarding</p>
        </div>

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="grid gap-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="animate-pulse rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="h-5 w-40 rounded bg-slate-200" />
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="h-24 rounded-2xl bg-slate-100" />
                  <div className="h-24 rounded-2xl bg-slate-100" />
                  <div className="h-24 rounded-2xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredFlights.length === 0 && (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            <Plane className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-4 text-lg font-semibold text-slate-950">No flights found.</p>
            <p className="mt-2 text-sm text-slate-500">Try another keyword or clear the filter to see the full list.</p>
          </div>
        )}

        {!loading && filteredFlights.length > 0 && (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredFlights.map((flight) => (
              <article
                key={flight.id}
                className="group rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_10px_32px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(15,23,42,0.12)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                        <Plane className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-950">{flight.flightNo}</h2>
                        <p className="text-sm text-slate-500">{normalizeText(flight.airline)}</p>
                      </div>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                    {flight.status}
                  </span>
                </div>

                <div className="mt-5 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">From</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-950">{flight.from.code}</div>
                    <div className="text-sm text-slate-500">{flight.from.city}</div>
                    <div className="mt-2 text-xs text-slate-400">{flight.from.airport}</div>
                  </div>
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <ArrowRight className="h-4 w-4" />
                    <span className="text-[11px] font-mono">{flight.duration}</span>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-right">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">To</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-950">{flight.to.code}</div>
                    <div className="text-sm text-slate-500">{flight.to.city}</div>
                    <div className="mt-2 text-xs text-slate-400">{flight.to.airport}</div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock3 className="h-4 w-4" />
                      <span className="text-xs">Dep</span>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-950">{flight.from.time}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock3 className="h-4 w-4" />
                      <span className="text-xs">Arr</span>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-950">{flight.to.time}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Gate</div>
                    <div className="mt-1 text-sm font-semibold text-slate-950">{flight.gate}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Aircraft</div>
                    <div className="mt-1 text-sm font-semibold text-slate-950">{flight.aircraft}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
