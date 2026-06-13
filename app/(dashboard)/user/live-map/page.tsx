"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Bell, BellOff, CloudSun, Droplets, Eye, Gauge, Loader2, MapPinned, Plane, Radar, Wind } from "lucide-react";
import FlightMap, { type Flight, type MapWeather } from "@/app/components/FlightMap";
import { useRealtimeFlights } from "@/app/hooks/use-realtime-flights";
import api from "@/lib/axios";
import {
  extractSubscribedFlightIds,
  normalizeFlightIdentifier,
  numericFlightId,
} from "@/lib/flight-subscriptions";
import {
  mapBackendFlight,
  mapRealtimeFlight,
  type BackendAirport,
  type BackendFlight,
  type FlightCard,
} from "@/lib/skytrack-data";

function findFlight(flights: Flight[], query: string) {
  const normalizedQuery = query.trim().replace(/\s+/g, "").toUpperCase();
  if (!normalizedQuery) return null;

  return flights.find((flight) => {
    const normalizedFlight = flight.flightNumber.replace(/\s+/g, "").toUpperCase();
    const normalizedId = String(flight.id).replace(/\s+/g, "").toUpperCase();
    return normalizedFlight === normalizedQuery || normalizedId === normalizedQuery || normalizedFlight.includes(normalizedQuery);
  }) ?? null;
}

interface WeatherApiResponse {
  error?: string;
  name?: string;
  provider?: string;
  observedAt?: string | null;
  main?: { temp?: number; feels_like?: number; humidity?: number };
  weather?: Array<{ description?: string }>;
  wind?: { speed?: number };
  visibility?: number;
}

interface ManagedAirport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

function UserLiveMapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFlight = searchParams.get("flight") ?? "";
  const {
    flights: realtimeFlights,
    status: trafficStatus,
    loading,
    error: trafficError,
    fetchedAt,
  } = useRealtimeFlights();
  const flights = useMemo(
    () => realtimeFlights.map(mapRealtimeFlight).filter(Boolean) as Flight[],
    [realtimeFlights],
  );

  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialFlight);
  const [message, setMessage] = useState<string | null>(null);
  const [weatherVisible, setWeatherVisible] = useState(false);
  const [weatherUpdated, setWeatherUpdated] = useState<Date | null>(null);
  const [weatherObservedAt, setWeatherObservedAt] = useState<Date | null>(null);
  const [airports, setAirports] = useState<ManagedAirport[]>([]);
  const [selectedAirportId, setSelectedAirportId] = useState("");
  const [airportsLoading, setAirportsLoading] = useState(true);
  const [airportsError, setAirportsError] = useState("");
  const [scheduledFlights, setScheduledFlights] = useState<FlightCard[]>([]);
  const [subscribedFlightIds, setSubscribedFlightIds] = useState<Set<string>>(new Set());
  const [subscriptionBusy, setSubscriptionBusy] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState("");
  const [weather, setWeather] = useState<MapWeather>({
    city: "Select an airport",
    temperature: null,
    feelsLike: null,
    description: "No weather data",
    humidity: null,
    windSpeed: null,
    visibility: null,
    loading: true,
    error: "",
  });

  useEffect(() => {
    const selectedFromUrl = initialFlight ? findFlight(flights, initialFlight) : null;
    if (selectedFromUrl) {
      setSelectedFlight(selectedFromUrl);
      setMessage(null);
      return;
    }

    if (initialFlight && !loading) {
      setSelectedFlight(null);
      setMessage(`Flight ${initialFlight.toUpperCase()} is not visible in current traffic.`);
      return;
    }

    if (!initialFlight && flights.length > 0) {
      setSelectedFlight((current) => flights.find((flight) => flight.id === current?.id) ?? flights[0]);
    }
  }, [flights, initialFlight, loading]);

  useEffect(() => {
    let mounted = true;
    Promise.all([api.get<BackendFlight[]>("/api/flights"), api.get("/api/subscriptions/me")])
      .then(([flightsResponse, subscriptionsResponse]) => {
        if (!mounted) return;
        setScheduledFlights(
          Array.isArray(flightsResponse.data) ? flightsResponse.data.map(mapBackendFlight) : [],
        );
        setSubscribedFlightIds(extractSubscribedFlightIds(subscriptionsResponse.data));
      })
      .catch((requestError) => {
        if (mounted) {
          setSubscriptionError(requestError instanceof Error ? requestError.message : "Cannot load followed flights.");
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadManagedAirports() {
      try {
        const response = await api.get("/api/airports");
        const nextAirports = Array.isArray(response.data)
          ? (response.data as BackendAirport[])
              .filter((airport) =>
                Boolean(airport.city?.trim()) &&
                typeof airport.latitude === "number" &&
                typeof airport.longitude === "number",
              )
              .map((airport) => ({
                id: String(airport.id ?? airport.code ?? airport.city),
                code: airport.code?.trim() || "N/A",
                name: airport.name?.trim() || "Unknown airport",
                city: airport.city?.trim() || "",
                country: airport.country?.trim() || "Vietnam",
                latitude: airport.latitude as number,
                longitude: airport.longitude as number,
              }))
          : [];
        if (!mounted) return;
        setAirports(nextAirports);
        setSelectedAirportId((current) => current || nextAirports[0]?.id || "");
        setAirportsError(nextAirports.length === 0 ? "No managed airports have valid coordinates configured." : "");
      } catch (airportError: unknown) {
        if (!mounted) return;
        setAirports([]);
        setAirportsError(airportError instanceof Error ? airportError.message : "Cannot load managed airports.");
      } finally {
        if (mounted) setAirportsLoading(false);
      }
    }

    void loadManagedAirports();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedAirport = useMemo(
    () => airports.find((airport) => airport.id === selectedAirportId) ?? null,
    [airports, selectedAirportId],
  );

  const selectedScheduledFlight = useMemo(() => {
    if (!selectedFlight) return null;
    const selectedCode = normalizeFlightIdentifier(selectedFlight.flightNumber);
    return scheduledFlights.find(
      (flight) => normalizeFlightIdentifier(flight.flightNo) === selectedCode,
    ) ?? null;
  }, [scheduledFlights, selectedFlight]);

  const selectedScheduledFlightId = selectedScheduledFlight
    ? numericFlightId(selectedScheduledFlight)
    : null;
  const selectedFlightIsFollowed = selectedScheduledFlightId !== null
    && subscribedFlightIds.has(String(selectedScheduledFlightId));

  useEffect(() => {
    if (!selectedAirport) {
      setWeather((current) => ({
        ...current,
        city: "Select an airport",
        loading: false,
        error: airportsLoading ? "" : airportsError || "No airport selected.",
      }));
      return;
    }

    const airport = selectedAirport;
    let mounted = true;

    async function loadWeather() {
      setWeather((current) => ({ ...current, city: airport.city, loading: true, error: "" }));
      try {
        const params = new URLSearchParams({
          latitude: String(airport.latitude),
          longitude: String(airport.longitude),
        });
        const response = await fetch(`/api/weather?${params}`);
        const data = (await response.json()) as WeatherApiResponse;
        if (!mounted) return;
        if (!response.ok || data.error) throw new Error(data.error || "Cannot load airport weather.");
        setWeather({
          city: data.name || airport.city,
          temperature: typeof data.main?.temp === "number" ? data.main.temp : null,
          feelsLike: typeof data.main?.feels_like === "number" ? data.main.feels_like : null,
          description: data.weather?.[0]?.description || "Weather condition unavailable",
          humidity: typeof data.main?.humidity === "number" ? data.main.humidity : null,
          windSpeed: typeof data.wind?.speed === "number" ? data.wind.speed : null,
          visibility: typeof data.visibility === "number" ? data.visibility / 1000 : null,
          loading: false,
          error: "",
        });
        setWeatherUpdated(new Date());
        setWeatherObservedAt(data.observedAt ? new Date(data.observedAt) : null);
      } catch (weatherError: unknown) {
        if (!mounted) return;
        setWeather((current) => ({
          ...current,
          loading: false,
          error: weatherError instanceof Error ? weatherError.message : "Cannot load weather data.",
        }));
      }
    }

    void loadWeather();
    const interval = window.setInterval(loadWeather, 5 * 60 * 1000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [airportsError, airportsLoading, selectedAirport]);

  const airborneFlights = useMemo(
    () => flights.filter((flight) => flight.status === "Airborne").length,
    [flights],
  );

  const groundedFlights = flights.length - airborneFlights;

  function handleSearchSubmit() {
    const query = searchTerm.trim();
    if (!query) {
      setMessage(null);
      router.push("/user/live-map");
      return;
    }

    const matchedFlight = findFlight(flights, query);
    router.push(`/user/live-map?flight=${encodeURIComponent(query)}`);

    if (matchedFlight) {
      setSelectedFlight(matchedFlight);
      setMessage(null);
    } else {
      setSelectedFlight(null);
      setMessage(`Flight ${query.toUpperCase()} is not visible in current traffic.`);
    }
  }

  async function toggleSelectedFlightFollow() {
    if (selectedScheduledFlightId === null) return;
    setSubscriptionBusy(true);
    setSubscriptionError("");
    try {
      if (selectedFlightIsFollowed) {
        await api.delete(`/api/subscriptions/me/${selectedScheduledFlightId}`);
      } else {
        await api.post(`/api/subscriptions/me/${selectedScheduledFlightId}`);
      }
      setSubscribedFlightIds((current) => {
        const next = new Set(current);
        const id = String(selectedScheduledFlightId);
        if (selectedFlightIsFollowed) next.delete(id);
        else next.add(id);
        return next;
      });
    } catch (requestError) {
      setSubscriptionError(requestError instanceof Error ? requestError.message : "Could not update followed flight.");
    } finally {
      setSubscriptionBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-72px)] space-y-6 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_30%),linear-gradient(180deg,_#f8fafc,_#eef4ff)] p-4 sm:p-6 lg:p-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-7 text-white shadow-[0_24px_80px_rgba(15,23,42,0.24)] sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-100 backdrop-blur">
              <Radar className="h-3.5 w-3.5" />
              User live map
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Track realtime aircraft with a cleaner control panel.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Search by callsign or ICAO24, inspect the selected aircraft, and keep the map visible with enough context to make fast decisions.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:min-w-[320px]">
            <div className="rounded-3xl bg-white/8 p-4 backdrop-blur">
              <Plane className="h-4 w-4 text-blue-300" />
              <div className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">Total</div>
              <div className="mt-1 text-2xl font-semibold">{flights.length}</div>
            </div>
            <div className="rounded-3xl bg-white/8 p-4 backdrop-blur">
              <Gauge className="h-4 w-4 text-emerald-300" />
              <div className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">Airborne</div>
              <div className="mt-1 text-2xl font-semibold text-emerald-300">{airborneFlights}</div>
            </div>
            <div className="rounded-3xl bg-white/8 p-4 backdrop-blur">
              <MapPinned className="h-4 w-4 text-amber-300" />
              <div className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">Ground</div>
              <div className="mt-1 text-2xl font-semibold">{groundedFlights}</div>
            </div>
          </div>
        </div>
      </section>

      {message && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}
      {trafficError && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {trafficError}
        </div>
      )}
      {trafficStatus?.stale && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            {trafficStatus.message}
            {trafficStatus.lastSuccessfulUpdate && (
              <> Last successful update: {new Date(trafficStatus.lastSuccessfulUpdate).toLocaleString()}.</>
            )}
          </span>
        </div>
      )}

      <section className="grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="self-start overflow-hidden rounded-[2rem] border border-slate-200 bg-[#0b101d] shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
          <div className="relative h-[72vh] min-h-[620px]">
            {loading && (
              <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-[#070b13]/70 text-white">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading realtime aircraft...
              </div>
            )}
            <FlightMap
              flights={flights}
              selectedFlight={selectedFlight}
              onSelect={(flight) => {
                setSelectedFlight(flight);
                setSearchTerm(flight.flightNumber);
                setMessage(null);
              }}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              onSearchSubmit={handleSearchSubmit}
              weather={weather}
              onWeatherToggle={setWeatherVisible}
            />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.08)]">
            <h2 className="text-lg font-semibold text-slate-950">Flight detail</h2>
            {selectedFlight ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-3xl bg-slate-950 p-4 text-white">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Callsign</div>
                  <div className="mt-2 text-2xl font-semibold">{selectedFlight.flightNumber}</div>
                  <div className="mt-1 text-sm text-slate-300">{selectedFlight.airline?.name ?? "OpenSky aircraft"}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Position</div>
                    <div className="mt-1 text-sm font-semibold text-slate-950">
                      {selectedFlight.latitude.toFixed(3)}, {selectedFlight.longitude.toFixed(3)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Heading</div>
                    <div className="mt-1 text-sm font-semibold text-slate-950">{Math.round(selectedFlight.heading)}°</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Altitude</div>
                    <div className="mt-1 text-sm font-semibold text-slate-950">{selectedFlight.altitude.toLocaleString()} ft</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Speed</div>
                    <div className="mt-1 text-sm font-semibold text-slate-950">{selectedFlight.speed.toLocaleString()} km/h</div>
                  </div>
                </div>
                {selectedScheduledFlight ? (
                  <button
                    type="button"
                    onClick={() => void toggleSelectedFlightFollow()}
                    disabled={subscriptionBusy || selectedScheduledFlightId === null}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${selectedFlightIsFollowed ? "border border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600" : "bg-blue-600 text-white hover:bg-blue-500"}`}
                  >
                    {subscriptionBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : selectedFlightIsFollowed ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                    {selectedFlightIsFollowed ? "Unfollow this flight" : "Follow this flight"}
                  </button>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-700">
                    This OpenSky callsign does not match a scheduled flight in the SkyTrack database, so it cannot be followed yet.
                  </div>
                )}
                {subscriptionError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700">
                    {subscriptionError}
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-500">Select a marker to inspect it here.</p>
            )}
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
            <h2 className="text-lg font-semibold text-slate-950">Search tips</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Use callsigns like VNA220 or aircraft IDs like 3c4b1f.</li>
              <li>Click the Track button in the map header to focus the map.</li>
              <li>Layer buttons let you switch context on and off quickly.</li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_12px_36px_rgba(15,23,42,0.08)]">
            <div className="bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,.24),transparent_45%),linear-gradient(135deg,#0f172a,#172554)] p-5 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">Weather conditions</div>
                  <h2 className="mt-2 text-lg font-semibold">{selectedAirport ? `${selectedAirport.code} · ${selectedAirport.city}` : weather.city}</h2>
                  {selectedAirport && <div className="mt-1 text-xs text-slate-400">{selectedAirport.name}</div>}
                </div>
                <CloudSun className="h-7 w-7 text-amber-300" />
              </div>
              {weather.loading ? (
                <div className="mt-5 h-20 animate-pulse rounded-2xl bg-white/[0.08]" />
              ) : weather.error ? (
                <div className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">{weather.error}</div>
              ) : (
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div className="text-5xl font-semibold tracking-tight">{weather.temperature === null ? "--" : `${Math.round(weather.temperature)}°C`}</div>
                  <div className="text-right"><div className="text-sm capitalize text-blue-100">{weather.description}</div><div className="mt-1 text-xs text-slate-400">Feels like {weather.feelsLike === null ? "--" : `${Math.round(weather.feelsLike)}°C`}</div></div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 divide-x divide-slate-100 p-4 text-center">
              <div><Droplets className="mx-auto h-4 w-4 text-blue-500" /><div className="mt-2 text-sm font-semibold">{weather.humidity === null ? "--" : `${weather.humidity}%`}</div><div className="text-[10px] uppercase tracking-wider text-slate-400">Humidity</div></div>
              <div><Wind className="mx-auto h-4 w-4 text-cyan-500" /><div className="mt-2 text-sm font-semibold">{weather.windSpeed === null ? "--" : `${weather.windSpeed.toFixed(1)} m/s`}</div><div className="text-[10px] uppercase tracking-wider text-slate-400">Wind</div></div>
              <div><Eye className="mx-auto h-4 w-4 text-violet-500" /><div className="mt-2 text-sm font-semibold">{weather.visibility === null ? "--" : `${weather.visibility.toFixed(1)} km`}</div><div className="text-[10px] uppercase tracking-wider text-slate-400">Visibility</div></div>
            </div>
            <div className="border-t border-slate-100 p-4">
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Managed airport</span>
                <div className="relative mt-2">
                  <select
                    value={selectedAirportId}
                    onChange={(event) => setSelectedAirportId(event.target.value)}
                    disabled={airportsLoading || airports.length === 0}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-10 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {airportsLoading && <option value="">Loading airports...</option>}
                    {!airportsLoading && airports.length === 0 && <option value="">No airports available</option>}
                    {airports.map((airport) => (
                      <option key={airport.id} value={airport.id}>
                        {airport.code} · {airport.name} ({airport.city})
                      </option>
                    ))}
                  </select>
                  <MapPinned className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600" />
                </div>
              </label>
              {airportsError && <p className="mt-2 text-xs leading-5 text-rose-600">{airportsError}</p>}
              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                <span>
                  OpenWeather · {weatherObservedAt?.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                    ?? weatherUpdated?.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                    ?? "--:--"}
                </span>
                <span>{weatherVisible ? "Visible on map" : "Enable Weather on map"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.08)]">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Auto refresh</div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">60 seconds</div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              All live-map widgets share one refresh request, reducing OpenSky quota usage while keeping the latest available snapshot visible.
            </p>
            <div className="mt-4 space-y-1 text-xs text-slate-400">
              <div>
                Source updated: {trafficStatus?.lastSuccessfulUpdate
                  ? new Date(trafficStatus.lastSuccessfulUpdate).toLocaleString()
                  : "--"}
              </div>
              <div>Checked by browser: {fetchedAt?.toLocaleTimeString("en-GB") ?? "--:--"}</div>
              {trafficStatus?.nextRefreshAllowedAt && (
                <div>Next source retry: {new Date(trafficStatus.nextRefreshAllowedAt).toLocaleString()}</div>
              )}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default function UserLiveMapPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading live map...</div>}>
      <UserLiveMapContent />
    </Suspense>
  );
}
