'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Loader2, Plane } from 'lucide-react';
import FlightMap, { type Flight } from '@/app/components/FlightMap';
import api from '@/lib/axios';

interface RealtimeFlight {
  icao24?: string;
  callsign?: string;
  originCountry?: string;
  longitude?: number;
  latitude?: number;
  altitude?: number;
  velocity?: number;
  heading?: number;
  onGround?: boolean;
}

function normalizeFlightCode(value: string) {
  return value.trim().replace(/\s+/g, '').toUpperCase();
}

function toDashboardFlight(flight: RealtimeFlight): Flight | null {
  if (typeof flight.latitude !== 'number' || typeof flight.longitude !== 'number') return null;

  const callsign = flight.callsign?.trim() || flight.icao24 || 'UNKNOWN';
  const icao24 = flight.icao24?.trim() || callsign;
  const altitudeFeet = typeof flight.altitude === 'number' ? Math.round(flight.altitude * 3.28084) : 0;
  const speedKmh = typeof flight.velocity === 'number' ? Math.round(flight.velocity * 3.6) : 0;

  return {
    id: icao24,
    flightNumber: callsign,
    airline: {
      code: callsign.slice(0, 2).toUpperCase(),
      name: flight.originCountry || 'OpenSky aircraft',
    },
    origin: flight.originCountry || 'LIVE',
    destination: flight.onGround ? 'GROUND' : 'AIRBORNE',
    latitude: flight.latitude,
    longitude: flight.longitude,
    heading: typeof flight.heading === 'number' ? flight.heading : 0,
    altitude: altitudeFeet,
    speed: speedKmh,
    status: flight.onGround ? 'On ground' : 'Airborne',
  };
}

function findFlight(flights: Flight[], query: string) {
  const normalizedQuery = normalizeFlightCode(query);
  if (!normalizedQuery) return null;

  return flights.find((flight) => {
    const flightNumber = normalizeFlightCode(flight.flightNumber);
    const icao24 = normalizeFlightCode(String(flight.id));
    return flightNumber === normalizedQuery || icao24 === normalizedQuery || flightNumber.includes(normalizedQuery);
  }) ?? null;
}

function UserLiveMapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFlight = searchParams.get('flight') ?? '';
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialFlight);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadFlights() {
      try {
        const res = await api.get('/api/realtime-flights');
        const nextFlights = Array.isArray(res.data)
          ? (res.data.map(toDashboardFlight).filter(Boolean) as Flight[])
          : [];

        if (!mounted) return;

        setFlights(nextFlights);
        setLastUpdated(new Date());

        const selectedFromUrl = initialFlight ? findFlight(nextFlights, initialFlight) : null;
        if (selectedFromUrl) {
          setSelectedFlight(selectedFromUrl);
          setMessage(null);
        } else if (initialFlight) {
          setSelectedFlight(null);
          setMessage(`Flight ${initialFlight.toUpperCase()} is not visible in current OpenSky traffic.`);
        } else if (nextFlights.length > 0) {
          setSelectedFlight((current) => current ?? nextFlights[0]);
        }
      } catch {
        if (mounted) {
          setFlights([]);
          setSelectedFlight(null);
          setMessage('Cannot connect to realtime flight API. Start the Spring Boot backend on port 8080.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadFlights();
    const interval = window.setInterval(loadFlights, 60000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [initialFlight]);

  const airborneFlights = useMemo(
    () => flights.filter((flight) => flight.status === 'Airborne').length,
    [flights],
  );

  function handleSearchSubmit() {
    const query = searchTerm.trim();
    if (!query) {
      setMessage(null);
      router.push('/user/live-map');
      return;
    }

    const matchedFlight = findFlight(flights, query);
    router.push(`/user/live-map?flight=${encodeURIComponent(query)}`);

    if (matchedFlight) {
      setSelectedFlight(matchedFlight);
      setMessage(null);
    } else {
      setSelectedFlight(null);
      setMessage(`Flight ${query.toUpperCase()} is not visible in current OpenSky traffic.`);
    }
  }

  return (
    <div className="min-h-[calc(100vh-32px)] bg-[#070b13] p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Map</h1>
          <p className="text-sm text-slate-400">Track realtime OpenSky aircraft and search by callsign or ICAO24.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl border border-[#1f2b42] bg-[#0b101d] px-4 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total</div>
            <div className="text-lg font-bold text-white">{flights.length}</div>
          </div>
          <div className="rounded-xl border border-[#1f2b42] bg-[#0b101d] px-4 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Airborne</div>
            <div className="text-lg font-bold text-blue-300">{airborneFlights}</div>
          </div>
          <div className="rounded-xl border border-[#1f2b42] bg-[#0b101d] px-4 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Updated</div>
            <div className="text-lg font-bold text-white">{lastUpdated?.toLocaleTimeString('en-GB') ?? '--:--'}</div>
          </div>
        </div>
      </div>

      {message && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      <div className="relative h-[calc(100vh-220px)] min-h-[560px] overflow-hidden rounded-2xl border border-[#1f2b42] bg-[#0b101d]">
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
        />
      </div>

      {selectedFlight && (
        <div className="mt-4 grid gap-4 rounded-2xl border border-[#1f2b42] bg-[#0b101d] p-4 text-sm text-slate-300 md:grid-cols-6">
          <div className="flex items-center gap-3 md:col-span-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
              <Plane className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-white">{selectedFlight.flightNumber}</div>
              <div className="text-xs text-slate-500">{selectedFlight.airline?.name ?? 'OpenSky aircraft'}</div>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Position</div>
            <div className="font-semibold text-white">{selectedFlight.latitude.toFixed(3)}, {selectedFlight.longitude.toFixed(3)}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Altitude</div>
            <div className="font-semibold text-white">{selectedFlight.altitude.toLocaleString()} ft</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Speed</div>
            <div className="font-semibold text-white">{selectedFlight.speed.toLocaleString()} km/h</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Status</div>
            <div className="font-semibold text-white">{selectedFlight.status}</div>
          </div>
        </div>
      )}
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
