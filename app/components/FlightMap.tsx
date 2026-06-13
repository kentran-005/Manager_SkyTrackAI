'use client';

import { Fragment, type ComponentType, type PropsWithChildren, useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  ZoomControl,
  useMap,
  Tooltip
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BarChart3, Building2, CloudSun, Filter, Flame, Route, Search } from 'lucide-react';

export interface Flight {
  id: string | number;
  flightNumber: string;
  airline?: { name: string; code: string };
  origin: string;
  destination: string;
  latitude: number;
  longitude: number;
  heading: number;
  altitude: number;
  speed: number;
  status: string;
}

export interface MapWeather {
  city: string;
  temperature: number | null;
  feelsLike: number | null;
  description: string;
  humidity: number | null;
  windSpeed: number | null;
  visibility: number | null;
  loading: boolean;
  error: string;
}

type LeafletComponentProps = PropsWithChildren<Record<string, unknown>>;

const LeafletMapContainer = MapContainer as unknown as ComponentType<LeafletComponentProps>;
const LeafletTileLayer = TileLayer as unknown as ComponentType<Record<string, unknown>>;
const LeafletMarker = Marker as unknown as ComponentType<LeafletComponentProps>;
const LeafletPolyline = Polyline as unknown as ComponentType<Record<string, unknown>>;
const LeafletTooltip = Tooltip as unknown as ComponentType<LeafletComponentProps>;
const LeafletZoomControl = ZoomControl as unknown as ComponentType<Record<string, unknown>>;

interface InteractiveMap {
  flyTo(center: [number, number], zoom?: number, options?: { duration?: number }): void;
}

function createPlaneIcon(heading: number, selected: boolean) {
  const size = selected ? 32 : 22;
  const color = selected ? '#3b82f6' : '#facc15';
  const shadow = selected ? 'filter:drop-shadow(0 0 6px #3b82f680);' : '';

  return L.divIcon({
    className: '',
    html: `
      <div style="transform:rotate(${heading}deg);width:${size}px;height:${size}px;${shadow}transition:all 0.3s ease;">
        <svg viewBox="0 0 24 24" fill="${color}" width="100%" height="100%">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5L21 16z"/>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
}

function FlyToSelected({ flight }: { flight: Flight | null }) {
  const map = useMap() as unknown as InteractiveMap;

  useEffect(() => {
    if (!flight) return;
    map.flyTo([flight.latitude, flight.longitude], 7, { duration: 1.2 });
  }, [flight, map]);

  return null;
}

// Airport coordinates for route lines
const airportCoords: Record<string, [number, number]> = {
  'SGN': [10.8231, 106.6297],
  'HAN': [21.0285, 105.8542],
  'DAD': [16.0471, 108.1796],
  'KUL': [2.7456, 101.7099],
  'SIN': [1.3644, 103.9915],
  'HKG': [22.3080, 113.9185],
};

export default function FlightMap({
  flights,
  selectedFlight,
  onSelect,
  searchTerm,
  onSearchTermChange,
  onSearchSubmit,
  weather,
  onWeatherToggle,
}: {
  flights: Flight[];
  selectedFlight: Flight | null;
  onSelect: (flight: Flight) => void;
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  weather?: MapWeather;
  onWeatherToggle?: (active: boolean) => void;
}) {
  const [activeLayers, setActiveLayers] = useState({
    heatmap: false,
    weather: false,
    airports: true,
    routes: true,
    traffic: true,
  });

  function toggleLayer(layer: keyof typeof activeLayers) {
    const nextValue = !activeLayers[layer];
    setActiveLayers((current) => ({ ...current, [layer]: nextValue }));
    if (layer === 'weather') onWeatherToggle?.(nextValue);
  }

  return (
    <div className="w-full h-full relative">
      {/* Top Search Overlay */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSearchSubmit?.();
        }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-wrap justify-center gap-3 bg-[#0b101d]/90 backdrop-blur-xl border border-[#1f2b42] rounded-xl px-4 py-2.5 shadow-2xl shadow-black/40"
      >
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
          <input
            value={searchTerm ?? ''}
            onChange={(event) => onSearchTermChange?.(event.target.value)}
            placeholder="Search flight number..."
            className="w-56 bg-[#131a2a] border border-[#1f2b42] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg bg-blue-600 border border-blue-500 text-white text-xs font-semibold hover:bg-blue-500 transition-colors flex items-center gap-1.5"
        >
          <Search className="w-3.5 h-3.5" />
          Track
        </button>
        <button
          type="button"
          onClick={() => onSearchTermChange?.('')}
          className="px-3 py-1.5 rounded-lg bg-[#182338] border border-[#1f2b42] text-slate-300 text-xs font-medium hover:bg-[#1f2b42] transition-colors flex items-center gap-1.5"
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
        </button>
      </form>

      <LeafletMapContainer
        center={[15.5, 108]}
        zoom={5}
        zoomControl={false}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <LeafletZoomControl position="bottomright" />
        <LeafletTileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <FlyToSelected flight={selectedFlight} />

        {activeLayers.traffic && flights.map((flight: Flight) => {
          const selected = selectedFlight?.id === flight.id;
          const originCoord = airportCoords[flight.origin];
          const destCoord = airportCoords[flight.destination];

          return (
            <Fragment key={String(flight.id)}>
              <LeafletMarker
                position={[flight.latitude, flight.longitude]}
                icon={createPlaneIcon(flight.heading, selected)}
                eventHandlers={{ click: () => onSelect(flight) }}
              >
                {selected && (
                  <LeafletTooltip
                    direction="top"
                    offset={[0, -16]}
                    permanent
                    className="custom-tooltip"
                  >
                    <div className="text-[10px] font-mono bg-[#0b101d] border border-[#1f2b42] rounded-lg px-3 py-2 text-white shadow-xl">
                      <div className="font-bold text-blue-400">{flight.flightNumber}</div>
                      <div className="text-slate-400">{flight.origin} → {flight.destination}</div>
                      <div className="text-slate-500">{flight.altitude.toLocaleString()} ft • {flight.speed} km/h</div>
                    </div>
                  </LeafletTooltip>
                )}
              </LeafletMarker>

              {/* Route polylines for selected flight */}
              {activeLayers.routes && selected && originCoord && (
                <LeafletPolyline
                  positions={[originCoord, [flight.latitude, flight.longitude]]}
                  pathOptions={{ color: '#3b82f6', weight: 2, dashArray: '8 8', opacity: 0.7 }}
                />
              )}
              {activeLayers.routes && selected && destCoord && (
                <LeafletPolyline
                  positions={[[flight.latitude, flight.longitude], destCoord]}
                  pathOptions={{ color: '#3b82f6', weight: 1.5, dashArray: '4 8', opacity: 0.4 }}
                />
              )}
            </Fragment>
          );
        })}
      </LeafletMapContainer>

      {activeLayers.weather && weather && (
        <div className="absolute right-4 top-4 z-[1000] w-[min(280px,calc(100%-32px))] rounded-2xl border border-white/10 bg-[#0b101d]/92 p-4 text-white shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">Weather layer</div>
              <div className="mt-1 font-semibold">{weather.city}</div>
            </div>
            <CloudSun className="h-6 w-6 text-amber-300" />
          </div>
          {weather.loading ? (
            <div className="mt-5 h-20 animate-pulse rounded-xl bg-white/[0.06]" />
          ) : weather.error ? (
            <p className="mt-4 text-xs leading-5 text-amber-200">{weather.error}</p>
          ) : (
            <>
              <div className="mt-4 flex items-end justify-between">
                <div className="text-4xl font-semibold">{weather.temperature === null ? '--' : `${Math.round(weather.temperature)}°`}</div>
                <div className="max-w-32 text-right text-xs capitalize leading-5 text-slate-400">{weather.description}</div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center">
                <div><div className="text-[9px] uppercase tracking-wider text-slate-600">Humidity</div><div className="mt-1 text-xs font-semibold">{weather.humidity === null ? '--' : `${weather.humidity}%`}</div></div>
                <div><div className="text-[9px] uppercase tracking-wider text-slate-600">Wind</div><div className="mt-1 text-xs font-semibold">{weather.windSpeed === null ? '--' : `${weather.windSpeed.toFixed(1)} m/s`}</div></div>
                <div><div className="text-[9px] uppercase tracking-wider text-slate-600">Visibility</div><div className="mt-1 text-xs font-semibold">{weather.visibility === null ? '--' : `${weather.visibility.toFixed(1)} km`}</div></div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Bottom Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-[#0b101d]/90 backdrop-blur-xl border border-[#1f2b42] rounded-xl p-1.5 flex gap-1 shadow-2xl shadow-black/40">
        {[
          { name: 'Heatmap', key: 'heatmap', Icon: Flame },
          { name: 'Weather', key: 'weather', Icon: CloudSun },
          { name: 'Airports', key: 'airports', Icon: Building2 },
          { name: 'Routes', key: 'routes', Icon: Route },
          { name: 'Traffic', key: 'traffic', Icon: BarChart3 },
        ].map((item) => {
          const layerKey = item.key as keyof typeof activeLayers;
          const Icon = item.Icon;

          return (
          <button
            key={item.name}
            type="button"
            onClick={() => toggleLayer(layerKey)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeLayers[layerKey]
                ? 'bg-[#182338] text-white border border-[#1f2b42]'
                : 'text-slate-400 hover:bg-[#182338] hover:text-slate-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {item.name}
          </button>
        )})}
      </div>
    </div>
  );
}
