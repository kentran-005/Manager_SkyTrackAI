"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Gauge,
  Loader2,
  MapPinned,
  Plane,
  Radar,
  RefreshCw,
  Search,
  Signal,
} from "lucide-react";
import MapControls from "@/app/components/MapControls";
import MapView, { type FlightMarkerData } from "@/app/components/MapView";
import type { RealtimeFlightStatus } from "@/lib/skytrack-data";

function normalizeFlight(value: string) {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

function findFlight(flights: FlightMarkerData[], query: string) {
  const normalizedQuery = normalizeFlight(query);
  if (!normalizedQuery) return null;

  return flights.find((flight) => {
    const callsign = normalizeFlight(flight.callsign);
    const icao24 = normalizeFlight(flight.icao24);
    return callsign === normalizedQuery
      || icao24 === normalizedQuery
      || callsign.includes(normalizedQuery);
  }) ?? null;
}

function formatAltitude(value: number | null) {
  if (value === null) return "Unavailable";
  return `${Math.round(value * 3.28084).toLocaleString("en-US")} ft`;
}

function formatSpeed(value: number | null) {
  if (value === null) return "Unavailable";
  return `${Math.round(value * 1.94384).toLocaleString("en-US")} kt`;
}

function AdminLiveMapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedFlight = searchParams.get("flight") ?? "";
  const [flights, setFlights] = useState<FlightMarkerData[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightMarkerData | null>(null);
  const [search, setSearch] = useState(requestedFlight);
  const [filter, setFilter] = useState<"all" | "airborne" | "ground">("all");
  const [trafficStatus, setTrafficStatus] = useState<RealtimeFlightStatus | null>(null);
  const [message, setMessage] = useState("");

  const handleFlightsChange = useCallback((nextFlights: FlightMarkerData[]) => {
    setFlights(nextFlights);
  }, []);

  const handleStatusChange = useCallback((status: RealtimeFlightStatus | null) => {
    setTrafficStatus(status);
  }, []);

  useEffect(() => {
    setSearch(requestedFlight);
  }, [requestedFlight]);

  useEffect(() => {
    if (flights.length === 0) return;

    if (requestedFlight) {
      const matchedFlight = findFlight(flights, requestedFlight);
      setSelectedFlight(matchedFlight);
      setMessage(
        matchedFlight
          ? ""
          : `${requestedFlight.toUpperCase()} is not currently visible in OpenSky traffic.`,
      );
      return;
    }

    setSelectedFlight((current) =>
      flights.find((flight) => flight.id === current?.id) ?? null,
    );
  }, [flights, requestedFlight]);

  const airborne = useMemo(
    () => flights.filter((flight) => !flight.onGround).length,
    [flights],
  );
  const grounded = flights.length - airborne;

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    if (!query) {
      setSelectedFlight(null);
      setMessage("");
      router.replace("/admin/live-map");
      return;
    }

    const matchedFlight = findFlight(flights, query);
    setSelectedFlight(matchedFlight);
    setMessage(
      matchedFlight
        ? ""
        : `${query.toUpperCase()} is not currently visible in OpenSky traffic.`,
    );
    router.replace(`/admin/live-map?flight=${encodeURIComponent(query)}`);
  }

  function selectFlight(flight: FlightMarkerData) {
    setSelectedFlight(flight);
    setSearch(flight.callsign);
    setMessage("");
    router.replace(`/admin/live-map?flight=${encodeURIComponent(flight.callsign)}`);
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#07111f] p-4 sm:p-6">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3 text-white">
            <button
              type="button"
              onClick={() => router.push("/admin/flights")}
              className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Back to flight management"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                <Radar className="h-4 w-4" /> OpenSky traffic
              </div>
              <h1 className="mt-1 text-2xl font-semibold">Live flight operations map</h1>
            </div>
          </div>

          <form onSubmit={submitSearch} className="flex w-full gap-2 xl:max-w-xl">
            <label className="relative flex-1">
              <span className="sr-only">Search callsign or ICAO24</span>
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search callsign or ICAO24..."
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.07] pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400"
              />
            </label>
            <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500">
              <MapPinned className="h-4 w-4" /> Locate
            </button>
          </form>
        </div>

        {message && (
          <div role="alert" className="mb-4 flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {message}
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
          <section className="relative min-h-[650px] overflow-hidden rounded-[28px] border border-white/10 bg-slate-950 shadow-2xl">
            <MapView
              selectedFlight={selectedFlight}
              onSelectFlight={selectFlight}
              onFlightsChange={handleFlightsChange}
              onStatusChange={handleStatusChange}
              searchTerm=""
              filter={filter}
              showAirports
            />
            <MapControls />

            <div className="pointer-events-auto absolute bottom-4 left-4 z-[800] flex flex-wrap gap-2">
              {([
                ["all", `All ${flights.length}`],
                ["airborne", `Airborne ${airborne}`],
                ["ground", `Ground ${grounded}`],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-full border px-4 py-2 text-xs font-bold backdrop-blur transition ${
                    filter === value
                      ? "border-blue-400 bg-blue-600 text-white"
                      : "border-white/10 bg-slate-950/80 text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Tracked", value: flights.length, icon: Signal, color: "text-blue-300" },
                { label: "Airborne", value: airborne, icon: Plane, color: "text-emerald-300" },
                { label: "Ground", value: grounded, icon: MapPinned, color: "text-slate-300" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-white">
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                    <div className="mt-3 text-xl font-bold">{stat.value}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Traffic source</div>
                  <div className="mt-1 font-semibold">OpenSky Network</div>
                </div>
                <span className={`h-2.5 w-2.5 rounded-full ${trafficStatus?.stale ? "bg-amber-400" : "bg-emerald-400"}`} />
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-400">
                {trafficStatus?.stale
                  ? "Showing cached traffic because the latest source request was unavailable."
                  : "Realtime aircraft positions are updating automatically."}
              </p>
            </div>

            <div className="min-h-[370px] rounded-[24px] border border-white/10 bg-white/[0.06] p-5 text-white">
              {selectedFlight ? (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Selected aircraft</div>
                      <h2 className="mt-2 text-3xl font-semibold">{selectedFlight.callsign}</h2>
                      <p className="mt-1 font-mono text-xs text-slate-500">{selectedFlight.icao24.toUpperCase()}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${selectedFlight.onGround ? "bg-slate-500/15 text-slate-300" : "bg-emerald-400/10 text-emerald-300"}`}>
                      {selectedFlight.onGround ? "On ground" : "Airborne"}
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-950/50 p-3">
                      <Gauge className="h-4 w-4 text-cyan-300" />
                      <div className="mt-3 text-sm font-semibold">{formatAltitude(selectedFlight.altitude)}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">Altitude</div>
                    </div>
                    <div className="rounded-2xl bg-slate-950/50 p-3">
                      <Activity className="h-4 w-4 text-blue-300" />
                      <div className="mt-3 text-sm font-semibold">{formatSpeed(selectedFlight.velocity)}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">Ground speed</div>
                    </div>
                  </div>

                  <dl className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                      <dt className="text-slate-500">Origin country</dt>
                      <dd className="text-right font-medium">{selectedFlight.originCountry}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                      <dt className="text-slate-500">Heading</dt>
                      <dd className="font-mono font-medium">{Math.round(selectedFlight.rotation)}°</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Coordinates</dt>
                      <dd className="text-right font-mono text-xs">{selectedFlight.lat.toFixed(4)}, {selectedFlight.lng.toFixed(4)}</dd>
                    </div>
                  </dl>
                </>
              ) : (
                <div className="grid min-h-[330px] place-items-center text-center">
                  <div>
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-500/10 text-blue-300">
                      {flights.length === 0 ? <Loader2 className="h-6 w-6 animate-spin" /> : <Plane className="h-6 w-6" />}
                    </div>
                    <h2 className="mt-4 font-semibold">{flights.length === 0 ? "Loading live traffic" : "Select an aircraft"}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">Click a plane marker or search by callsign to inspect its live position.</p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" /> Refresh traffic
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function AdminLiveMapPage() {
  return (
    <Suspense fallback={<div className="grid min-h-[calc(100vh-72px)] place-items-center bg-[#07111f] text-slate-300"><Loader2 className="h-7 w-7 animate-spin text-blue-400" /></div>}>
      <AdminLiveMapContent />
    </Suspense>
  );
}
