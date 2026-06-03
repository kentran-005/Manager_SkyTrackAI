'use client';

import { useMemo } from 'react';
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

interface Flight {
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
  const map = useMap();

  useMemo(() => {
    if (!flight) return;
    map.flyTo([flight.latitude, flight.longitude], 6, { duration: 1.2 });
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
  onSelect
}: {
  flights: Flight[];
  selectedFlight: Flight | null;
  onSelect: (flight: Flight) => void;
}) {
  return (
    <div className="w-full h-full relative">
      {/* Top Search Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex gap-3 bg-[#0b101d]/90 backdrop-blur-xl border border-[#1f2b42] rounded-xl px-4 py-2.5 shadow-2xl shadow-black/40">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            placeholder="Search flight number..."
            className="w-56 bg-[#131a2a] border border-[#1f2b42] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input
            placeholder="Search airport..."
            className="w-56 bg-[#131a2a] border border-[#1f2b42] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <button className="px-3 py-1.5 rounded-lg bg-[#182338] border border-[#1f2b42] text-slate-300 text-xs font-medium hover:bg-[#1f2b42] transition-colors flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filters
        </button>
      </div>

      <MapContainer
        center={[15.5, 108]}
        zoom={5}
        zoomControl={false}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <ZoomControl position="bottomright" />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <FlyToSelected flight={selectedFlight} />

        {flights.map((flight: Flight) => {
          const selected = selectedFlight?.id === flight.id;
          const originCoord = airportCoords[flight.origin];
          const destCoord = airportCoords[flight.destination];

          return (
            <div key={String(flight.id)}>
              <Marker
                position={[flight.latitude, flight.longitude]}
                icon={createPlaneIcon(flight.heading, selected)}
                eventHandlers={{ click: () => onSelect(flight) }}
              >
                {selected && (
                  <Tooltip
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
                  </Tooltip>
                )}
              </Marker>

              {/* Route polylines for selected flight */}
              {selected && originCoord && (
                <Polyline
                  positions={[originCoord, [flight.latitude, flight.longitude]]}
                  pathOptions={{ color: '#3b82f6', weight: 2, dashArray: '8 8', opacity: 0.7 }}
                />
              )}
              {selected && destCoord && (
                <Polyline
                  positions={[[flight.latitude, flight.longitude], destCoord]}
                  pathOptions={{ color: '#3b82f6', weight: 1.5, dashArray: '4 8', opacity: 0.4 }}
                />
              )}
            </div>
          );
        })}
      </MapContainer>

      {/* Bottom Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-[#0b101d]/90 backdrop-blur-xl border border-[#1f2b42] rounded-xl p-1.5 flex gap-1 shadow-2xl shadow-black/40">
        {[
          { name: 'Heatmap', icon: '🔥' },
          { name: 'Weather', icon: '☁️' },
          { name: 'Airports', icon: '✈️' },
          { name: 'Routes', icon: '⟶' },
          { name: 'Traffic', icon: '📊' },
        ].map((item, idx) => (
          <button
            key={item.name}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              idx === 0
                ? 'bg-[#182338] text-white border border-[#1f2b42]'
                : 'text-slate-400 hover:bg-[#182338] hover:text-slate-200'
            }`}
          >
            <span className="text-sm">{item.icon}</span>
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}
