'use client'

import { type ComponentType, type PropsWithChildren, useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  ZoomControl,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '@/lib/axios';
import { Search, Plane, BarChart3, Navigation2 } from 'lucide-react';

// ================= INTERFACES =================
interface Airport {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

interface FlightMarkerData {
  id: string;
  callsign: string;
  icao24: string;
  originCountry: string;
  lat: number;
  lng: number;
  rotation: number;
  altitude: number | null;
  velocity: number | null;
  onGround: boolean;
}

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

type LeafletComponentProps = PropsWithChildren<Record<string, unknown>>;
interface InteractiveMap {
  flyTo(center: [number, number], zoom?: number, options?: { duration?: number }): void;
  getContainer(): HTMLElement;
  invalidateSize(): void;
  zoomIn(): void;
  zoomOut(): void;
}

const LeafletMapContainer = MapContainer as unknown as ComponentType<LeafletComponentProps>;
const LeafletTileLayer = TileLayer as unknown as ComponentType<Record<string, unknown>>;
const LeafletMarker = Marker as unknown as ComponentType<LeafletComponentProps>;
const LeafletZoomControl = ZoomControl as unknown as ComponentType<Record<string, unknown>>;

// ================= ICONS =================
function createPlaneIcon(altitude: number | null, onGround: boolean, rotation: number) {
  // Logic phân màu theo độ cao
  let color = '#3b82f6'; // Xanh dương: Bay cao (>9000m)
  let size = 24;
  let glow = 'drop-shadow(0 0 4px #3b82f680)';

  if (onGround) {
    color = '#64748b'; // Xám: Đỗ trên mặt đất
    size = 18;
    glow = '';
  } else if (altitude !== null && altitude < 2500) {
    color = '#06b6d4'; // Cyan: Đang cất cánh/hạ cánh độ cao thấp
    size = 22;
    glow = 'drop-shadow(0 0 6px #06b6d480)';
  }

  return L.divIcon({
    className: 'custom-flight-marker',
    html: `<div style="transform: rotate(${rotation}deg); width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; filter: ${glow}; transition: all 0.3s ease;">
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="0.6" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
      </svg>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function createAirportIcon(code: string) {
  return L.divIcon({
    className: 'custom-airport-marker',
    html: `<div style="background: rgba(15, 23, 42, 0.8); color: #94a3b8; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 3px; border: 1px solid #334155; white-space: nowrap; text-align: center; letter-spacing: 0.5px;">${code}</div>`,
    iconSize: [36, 18],
    iconAnchor: [18, 9],
  })
}

// ================= MAP HELPERS =================
function MapResizeHandler() {
  const map = useMap() as unknown as InteractiveMap
  useEffect(() => { const timer = setTimeout(() => map.invalidateSize(), 200); return () => clearTimeout(timer) }, [map])
  return null
}

function MapControlBridge() {
  const map = useMap() as unknown as InteractiveMap
  useEffect(() => {
    type MapControlAction = 'zoom-in' | 'zoom-out' | 'focus-vietnam' | 'fullscreen'
    function handleControl(event: Event) {
      const action = (event as CustomEvent<MapControlAction>).detail
      if (action === 'zoom-in') map.zoomIn()
      else if (action === 'zoom-out') map.zoomOut()
      else if (action === 'focus-vietnam') map.flyTo([14.0, 108.0], 6, { duration: 0.9 })
      else if (action === 'fullscreen') {
        const container = map.getContainer().parentElement
        if (!container) return
        if (document.fullscreenElement) document.exitFullscreen().finally(() => map.invalidateSize())
        else container.requestFullscreen().finally(() => map.invalidateSize())
      }
    }
    window.addEventListener('skytrack-map-control', handleControl)
    return () => window.removeEventListener('skytrack-map-control', handleControl)
  }, [map])
  return null
}

function FlyToSelected({ flight }: { flight: FlightMarkerData | null }) {
  const map = useMap() as unknown as InteractiveMap;
  useEffect(() => {
    if (!flight) return;
    map.flyTo([flight.lat, flight.lng], 9, { duration: 1.2 });
  }, [flight, map]);
  return null;
}

// ================= DATA MAPPERS =================
function mapRealtimeFlight(f: RealtimeFlight): FlightMarkerData | null {
  if (typeof f.latitude !== 'number' || typeof f.longitude !== 'number') return null

  const callsign = f.callsign?.trim() || 'Unknown'
  const icao24 = f.icao24?.trim() || 'N/A'
  const altitude = typeof f.altitude === 'number' ? f.altitude : null
  const velocity = typeof f.velocity === 'number' ? f.velocity : null
  const onGround = Boolean(f.onGround)

  // FIX LỖI DUPLICATE KEY: Tạo ID duy nhất bằng cách nối chuỗi an toàn
  // Nếu icao24 có -> dùng nó (vì nó là định danh vật lý của máy bay).
  // Nếu không có -> ghép callsign + tọa độ để không bao giờ bị trùng.
  const uniqueId = icao24 !== 'N/A' 
    ? icao24 
    : `${callsign}_${f.latitude.toFixed(3)}_${f.longitude.toFixed(3)}`;

  return {
    id: uniqueId,
    callsign,
    icao24,
    originCountry: f.originCountry || 'Unknown',
    lat: f.latitude,
    lng: f.longitude,
    rotation: typeof f.heading === 'number' ? f.heading : 0,
    altitude,
    velocity,
    onGround,
  }
}

const airports: Airport[] = [
  { code: 'HAN', name: 'Hanoi', lat: 21.2213, lng: 105.808 },
  { code: 'DAD', name: 'Da Nang', lat: 16.0439, lng: 108.212 },
  { code: 'SGN', name: 'Ho Chi Minh City', lat: 10.8188, lng: 106.651 },
  { code: 'CXR', name: 'Nha Trang', lat: 12.2213, lng: 109.191 },
  { code: 'PQC', name: 'Phu Quoc', lat: 10.1667, lng: 103.983 },
  { code: 'HPQ', name: 'Hai Phong', lat: 20.8421, lng: 106.726 },
]

// ================= MAIN COMPONENT =================
export default function MapView({ 
  selectedFlight, 
  onSelectFlight 
}: { 
  selectedFlight: FlightMarkerData | null; 
  onSelectFlight: (flight: FlightMarkerData) => void;
}) {
  const [flightMarkers, setFlightMarkers] = useState<FlightMarkerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let mounted = true
    async function loadRealtimeFlights() {
      try {
        const res = await api.get('/api/realtime-flights')
        const markers = Array.isArray(res.data) ? (res.data.map(mapRealtimeFlight).filter(Boolean) as FlightMarkerData[]) : []
        if (mounted) { setFlightMarkers(markers); setLastUpdated(new Date()) }
      } catch { if (mounted) setFlightMarkers([]) } 
      finally { if (mounted) setLoading(false) }
    }
    loadRealtimeFlights()
    const interval = window.setInterval(loadRealtimeFlights, 60000)
    return () => { mounted = false; window.clearInterval(interval) }
  }, [])

  // Filter flights based on search
  const filteredFlights = searchTerm.trim() 
    ? flightMarkers.filter(f => f.callsign.toLowerCase().includes(searchTerm.toLowerCase()) || f.icao24.toLowerCase().includes(searchTerm.toLowerCase()))
    : flightMarkers;

  // Stats calculation
  const airborneCount = flightMarkers.filter(f => !f.onGround).length;
  const groundCount = flightMarkers.filter(f => f.onGround).length;

  return (
    <div className="absolute inset-0 bg-[#0b101d]" style={{ zIndex: 0 }}>
      
      {/* TOP SEARCH BAR - ATC Style */}
      <form 
        onSubmit={(e) => e.preventDefault()} 
        className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-[#0b101d]/90 backdrop-blur-xl border border-[#1f2b42] rounded-xl px-4 py-2 shadow-2xl shadow-black/60"
      >
        <Search className="h-4 w-4 text-slate-500" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search callsign (e.g. VNA220)..."
          className="w-64 bg-transparent border-none outline-none text-sm text-white placeholder-slate-500"
        />
        <div className="h-4 w-px bg-[#1f2b42]"></div>
        <span className="text-[10px] font-mono text-slate-400">{lastUpdated?.toLocaleTimeString('en-GB') || '...'}</span>
      </form>

      <LeafletMapContainer center={[14.0, 108.0]} zoom={6} zoomControl={false} attributionControl={false} className="absolute inset-0 w-full h-full">
        
        {/* DARK MODE MAP LAYER */}
        <LeafletTileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        
        <LeafletZoomControl position="bottomright" />
        <MapResizeHandler />
        <MapControlBridge />
        <FlyToSelected flight={selectedFlight} />

        {airports.map((airport) => (
          <LeafletMarker key={airport.code} position={[airport.lat, airport.lng]} icon={createAirportIcon(airport.code)} />
        ))}

        {filteredFlights.map((flight) => {
          const isSelected = selectedFlight?.id === flight.id;
          return (
            <LeafletMarker
              key={flight.id}
              position={[flight.lat, flight.lng]}
              icon={createPlaneIcon(isSelected ? null : flight.altitude, flight.onGround, flight.rotation)}
              eventHandlers={{ click: () => onSelectFlight(flight) }}
            />
          )
        })}
      </LeafletMapContainer>

      {/* BOTTOM STATS BAR */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-[#0b101d]/90 backdrop-blur-xl border border-[#1f2b42] rounded-xl px-6 py-3 shadow-2xl shadow-black/60 flex items-center gap-8">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-blue-400" />
          <div>
            <div className="text-xs text-slate-500">Airborne</div>
            <div className="text-sm font-bold text-blue-400">{airborneCount}</div>
          </div>
        </div>
        <div className="h-8 w-px bg-[#1f2b42]"></div>
        <div className="flex items-center gap-2">
          <Navigation2 className="w-4 h-4 text-slate-400" />
          <div>
            <div className="text-xs text-slate-500">On Ground</div>
            <div className="text-sm font-bold text-slate-300">{groundCount}</div>
          </div>
        </div>
        <div className="h-8 w-px bg-[#1f2b42]"></div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <div>
            <div className="text-xs text-slate-500">Tracked</div>
            <div className="text-sm font-bold text-emerald-400">{flightMarkers.length}</div>
          </div>
        </div>
      </div>

    </div>
  )
}