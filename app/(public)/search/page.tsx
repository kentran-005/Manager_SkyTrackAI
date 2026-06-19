"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Building2, Clock3, Loader2, Plane, Search, Sparkles } from "lucide-react";
import api from "@/lib/axios";
import {
  type BackendFlight,
  type FlightCard,
  mapBackendFlight,
  mapStatus,
  normalizeCode,
  normalizeText,
} from "@/lib/skytrack-data";

const POPULAR_QUERIES = ["VN220", "VJ123", "HAN", "SGN", "QH301", "DAD"];

type SearchState = {
  query: string;
  results: FlightCard[];
  loading: boolean;
  error: string;
  searched: boolean;
};

async function searchFlights(query: string) {
  const { data } = await api.get(`/api/flights/search?q=${encodeURIComponent(query)}`, {
    timeout: 10_000,
  });
  return Array.isArray(data) ? (data as BackendFlight[]).map(mapBackendFlight) : [];
}

function SearchResultCard({ flight }: { flight: FlightCard }) {
  const statusStyles: Record<string, { border: string; chip: string; dot: string }> = {
    "On Time": { border: "border-emerald-200", chip: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
    Delayed: { border: "border-amber-200", chip: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
    Cancelled: { border: "border-rose-200", chip: "bg-rose-50 text-rose-700", dot: "bg-rose-500" },
    Scheduled: { border: "border-sky-200", chip: "bg-sky-50 text-sky-700", dot: "bg-sky-500" },
    Boarding: { border: "border-violet-200", chip: "bg-violet-50 text-violet-700", dot: "bg-violet-500" },
  };

  const status = statusStyles[mapStatus(flight.status)];

  return (
    <div className={`group rounded-3xl border bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.14)] ${status.border}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-xs font-semibold text-white">
              {normalizeCode(flight.airlineCode || flight.flightNo).slice(0, 2) || "ST"}
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-950">{flight.flightNo}</h3>
              <p className="text-sm text-slate-500">{flight.airline}</p>
            </div>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.chip}`}>
          <span className={`h-2 w-2 rounded-full ${status.dot}`} />
          {flight.status}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">From</div>
          <div className="mt-1 text-lg font-semibold text-slate-950">{flight.from.code}</div>
          <div className="text-sm text-slate-500">{flight.from.city}</div>
        </div>
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <ArrowRight className="h-4 w-4" />
          <span className="text-[11px] font-mono">{flight.duration}</span>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3 text-right">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">To</div>
          <div className="mt-1 text-lg font-semibold text-slate-950">{flight.to.code}</div>
          <div className="text-sm text-slate-500">{flight.to.city}</div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-sm">
        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock3 className="h-4 w-4" />
            <span>Departure</span>
          </div>
          <div className="mt-1 font-semibold text-slate-950">{flight.from.time}</div>
          <div className="text-xs text-slate-500">{flight.from.date}</div>
        </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-slate-400">
            <Plane className="h-4 w-4" />
            <span>Gate</span>
          </div>
          <div className="mt-1 font-semibold text-slate-950">{flight.gate}</div>
          <div className="text-xs text-slate-500">{flight.terminal}</div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Building2 className="h-4 w-4" />
            <span>Route</span>
          </div>
          <div className="mt-1 font-semibold text-slate-950">{flight.stops}</div>
          <div className="text-xs text-slate-500">Direct/Transit</div>
        </div>
      </div>
    </div>
  );
}

function FlightSearchContent() {
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") ?? "";
  const [state, setState] = useState<SearchState>({
    query: queryFromUrl,
    results: [],
    loading: false,
    error: "",
    searched: false,
  });

  const searchHints = useMemo(() => {
    const base = queryFromUrl.trim() || state.query.trim();
    const hint = normalizeCode(base);
    return POPULAR_QUERIES.filter((item) => normalizeCode(item).includes(hint) || hint === "");
  }, [queryFromUrl, state.query]);

  useEffect(() => {
    if (!queryFromUrl.trim()) return;

    let mounted = true;
    setState((current) => ({ ...current, query: queryFromUrl, loading: true, searched: true, error: "" }));

    void searchFlights(queryFromUrl)
      .then((results) => {
        if (!mounted) return;
        setState((current) => ({ ...current, results, loading: false, error: "" }));
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        setState((current) => ({
          ...current,
          results: [],
          loading: false,
          error: error instanceof Error ? error.message : "Cannot search flights right now.",
        }));
      });

    return () => {
      mounted = false;
    };
  }, [queryFromUrl]);

  async function handleSearch(value: string) {
    const query = normalizeText(value);
    if (!query) return;

    setState((current) => ({ ...current, query, loading: true, searched: true, error: "" }));

    try {
      const results = await searchFlights(query);
      setState((current) => ({ ...current, results, loading: false, error: "" }));
    } catch (error: unknown) {
      setState((current) => ({
        ...current,
        results: [],
        loading: false,
        error: error instanceof Error ? error.message : "Cannot search flights right now.",
      }));
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_42%),linear-gradient(135deg,_#0f172a,_#111827_40%,_#1e293b)] p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.24)] lg:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-100 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Fast backend flight search
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Search flights, routes, airports and real-time status in one place.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Query the backend directly and get structured flight cards with route, gate, timing and status details.
          </p>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/8 p-3 backdrop-blur-xl">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={state.query}
                  onChange={(event) => setState((current) => ({ ...current, query: event.target.value }))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleSearch(state.query);
                    }
                  }}
                  placeholder="Try VN220, SGN, HAN, VJ123..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                type="button"
                onClick={() => void handleSearch(state.query)}
                disabled={state.loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {state.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {searchHints.map((hint) => (
              <button
                key={hint}
                type="button"
                onClick={() => void handleSearch(hint)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
              >
                {hint}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_12px_48px_rgba(15,23,42,0.08)]">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-slate-950 p-4 text-white">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Query</div>
              <div className="mt-2 text-2xl font-semibold">{state.query.trim() || "Ready"}</div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">{state.loading ? "Searching" : `${state.results.length}`}</div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Quick tips</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Search by flight code, airline or airport code.</li>
              <li>Press Enter to search immediately.</li>
              <li>Use public search or the user live map to inspect a tracked flight.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {state.error && (
          <div className="mb-5 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {state.error}
          </div>
        )}

        {state.searched && !state.loading && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Search results</h2>
              <p className="text-sm text-slate-500">
                {state.results.length > 0
                  ? `${state.results.length} result${state.results.length > 1 ? "s" : ""} found for "${state.query.trim()}"`
                  : `No results found for "${state.query.trim()}"`}
              </p>
            </div>
          </div>
        )}

        {state.loading && (
          <div className="grid gap-4">
            {[0, 1, 2].map((index) => (
              <div key={index} className="animate-pulse rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="h-5 w-32 rounded bg-slate-200" />
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="h-20 rounded-2xl bg-slate-100" />
                  <div className="h-20 rounded-2xl bg-slate-100" />
                  <div className="h-20 rounded-2xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!state.loading && state.results.length > 0 && (
          <div className="grid gap-4">
            {state.results.map((flight) => (
              <SearchResultCard key={flight.id} flight={flight} />
            ))}
          </div>
        )}

        {!state.loading && state.searched && state.results.length === 0 && !state.error && (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            <Search className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-4 text-lg font-semibold text-slate-950">No flight matched your search.</p>
            <p className="mt-2 text-sm text-slate-500">Try a flight code, airline, or an airport code like HAN or SGN.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading search...</div>}>
      <FlightSearchContent />
    </Suspense>
  );
}
