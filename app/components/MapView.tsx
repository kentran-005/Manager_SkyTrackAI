'use client'

import { type ComponentType, type PropsWithChildren, useEffect, useMemo } from 'react'
import { MapContainer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useRealtimeFlights } from '@/app/hooks/use-realtime-flights'
import VietnameseVectorBasemap from '@/app/components/VietnameseVectorBasemap'
import { mapRealtimeFlight, type RealtimeFlight, type RealtimeFlightStatus } from '@/lib/skytrack-data'

export interface FlightMarkerData {
  id: string
  callsign: string
  icao24: string
  originCountry: string
  lat: number
  lng: number
  rotation: number
  altitude: number | null
  velocity: number | null
  onGround: boolean
}

type FlightFilter = 'all' | 'airborne' | 'ground'
type LeafletComponentProps = PropsWithChildren<Record<string, unknown>>

interface InteractiveMap {
  flyTo(center: [number, number], zoom?: number, options?: { duration?: number }): void
  getContainer(): HTMLElement
  invalidateSize(): void
  zoomIn(): void
  zoomOut(): void
}

interface MapViewProps {
  selectedFlight: FlightMarkerData | null
  onSelectFlight: (flight: FlightMarkerData) => void
  onFlightsChange?: (flights: FlightMarkerData[]) => void
  onStatusChange?: (status: RealtimeFlightStatus | null) => void
  searchTerm?: string
  filter?: FlightFilter
  showAirports?: boolean
}

const LeafletMapContainer = MapContainer as unknown as ComponentType<LeafletComponentProps>
const LeafletMarker = Marker as unknown as ComponentType<LeafletComponentProps>

const AIRPORTS = [
  { code: 'HAN', lat: 21.2213, lng: 105.808 },
  { code: 'DAD', lat: 16.0439, lng: 108.212 },
  { code: 'SGN', lat: 10.8188, lng: 106.651 },
  { code: 'CXR', lat: 12.2213, lng: 109.191 },
  { code: 'PQC', lat: 10.1667, lng: 103.983 },
  { code: 'HPH', lat: 20.8421, lng: 106.726 },
]

function createPlaneIcon(flight: FlightMarkerData, selected: boolean) {
  const color = selected ? '#fef08a' : flight.onGround ? '#e2e8f0' : flight.altitude !== null && flight.altitude < 2500 ? '#2dd4bf' : '#fb923c'
  const glow = selected ? '#facc15' : flight.onGround ? '#64748b' : flight.altitude !== null && flight.altitude < 2500 ? '#14b8a6' : '#f97316'
  const size = selected ? 32 : flight.onGround ? 20 : 25

  return L.divIcon({
    className: 'custom-flight-marker',
    html: `<div style="position:relative;width:${size}px;height:${size}px;display:grid;place-items:center;transform:rotate(${flight.rotation}deg);filter:drop-shadow(0 1px 1px #020617) drop-shadow(0 0 ${selected ? 10 : 6}px ${glow});transition:all .2s ease">
      ${selected ? '<span style="position:absolute;inset:-7px;border:1px solid rgba(250,204,21,.65);border-radius:50%"></span>' : ''}
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="0.9" paint-order="stroke">
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
    html: `<div style="display:flex;align-items:center;gap:4px;color:#94a3b8;font:700 10px ui-monospace,monospace;letter-spacing:.08em;text-shadow:0 1px 3px #000">
      <span style="width:6px;height:6px;border:1px solid #38bdf8;border-radius:50%;box-shadow:0 0 8px #38bdf8"></span>${code}
    </div>`,
    iconSize: [45, 16],
    iconAnchor: [8, 8],
  })
}

function MapLifecycle({ selectedFlight }: { selectedFlight: FlightMarkerData | null }) {
  const map = useMap() as unknown as InteractiveMap

  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 150)
    return () => window.clearTimeout(timer)
  }, [map])

  useEffect(() => {
    if (selectedFlight) map.flyTo([selectedFlight.lat, selectedFlight.lng], 8, { duration: 0.8 })
  }, [map, selectedFlight])

  useEffect(() => {
    type MapControlAction = 'zoom-in' | 'zoom-out' | 'focus-vietnam' | 'fullscreen'
    function handleControl(event: Event) {
      const action = (event as CustomEvent<MapControlAction>).detail
      if (action === 'zoom-in') map.zoomIn()
      if (action === 'zoom-out') map.zoomOut()
      if (action === 'focus-vietnam') map.flyTo([14, 108], 6, { duration: 0.8 })
      if (action === 'fullscreen') {
        const container = map.getContainer().parentElement
        if (!container) return
        const actionPromise = document.fullscreenElement ? document.exitFullscreen() : container.requestFullscreen()
        actionPromise.finally(() => map.invalidateSize())
      }
    }
    window.addEventListener('skytrack-map-control', handleControl)
    return () => window.removeEventListener('skytrack-map-control', handleControl)
  }, [map])

  return null
}

function toMarker(flight: RealtimeFlight): FlightMarkerData | null {
  const mapped = mapRealtimeFlight(flight)
  if (!mapped) return null
  return {
    id: mapped.id,
    callsign: mapped.flightNumber,
    icao24: flight.icao24?.trim() || 'N/A',
    originCountry: flight.originCountry?.trim() || 'Unknown',
    lat: mapped.latitude,
    lng: mapped.longitude,
    rotation: mapped.heading,
    altitude: typeof flight.altitude === 'number' ? flight.altitude : null,
    velocity: typeof flight.velocity === 'number' ? flight.velocity : null,
    onGround: mapped.onGround,
  }
}

export default function MapView({
  selectedFlight,
  onSelectFlight,
  onFlightsChange,
  onStatusChange,
  searchTerm = '',
  filter = 'all',
  showAirports = true,
}: MapViewProps) {
  const { flights: realtimeFlights, status, loading, error } = useRealtimeFlights()
  const flights = useMemo(
    () => realtimeFlights.map(toMarker).filter(Boolean) as FlightMarkerData[],
    [realtimeFlights],
  )

  useEffect(() => {
    onFlightsChange?.(flights)
  }, [flights, onFlightsChange])

  useEffect(() => {
    onStatusChange?.(status)
  }, [onStatusChange, status])

  const visibleFlights = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return flights.filter((flight) => {
      const matchesSearch = !query || flight.callsign.toLowerCase().includes(query) || flight.icao24.toLowerCase().includes(query)
      const matchesFilter = filter === 'all' || (filter === 'airborne' && !flight.onGround) || (filter === 'ground' && flight.onGround)
      return matchesSearch && matchesFilter
    })
  }, [filter, flights, searchTerm])

  return (
    <div className="absolute inset-0 bg-[#07111f]">
      <LeafletMapContainer center={[14, 108]} zoom={6} zoomControl={false} attributionControl={false} className="absolute inset-0 h-full w-full">
        <VietnameseVectorBasemap />
        <MapLifecycle selectedFlight={selectedFlight} />

        {showAirports && AIRPORTS.map((airport) => (
          <LeafletMarker key={airport.code} position={[airport.lat, airport.lng]} icon={createAirportIcon(airport.code)} />
        ))}

        {visibleFlights.map((flight) => (
          <LeafletMarker
            key={flight.id}
            position={[flight.lat, flight.lng]}
            icon={createPlaneIcon(flight, selectedFlight?.id === flight.id)}
            eventHandlers={{ click: () => onSelectFlight(flight) }}
          />
        ))}
      </LeafletMapContainer>

      <div className="pointer-events-none absolute inset-0 z-[400] bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(3,8,16,0.3)_100%)]" />
      {loading && (
        <div className="absolute left-1/2 top-1/2 z-[900] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-950/80 px-5 py-3 text-sm font-semibold text-slate-200 backdrop-blur">
          Connecting to live traffic...
        </div>
      )}
      {!loading && error && (
        <div className="absolute left-1/2 top-1/2 z-[900] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-amber-400/20 bg-slate-950/90 px-5 py-3 text-sm text-amber-200 backdrop-blur">
          {error}
        </div>
      )}
      {!loading && !error && status?.stale && (
        <div className="absolute left-1/2 top-4 z-[900] -translate-x-1/2 rounded-full border border-amber-300/20 bg-slate-950/90 px-4 py-2 text-xs font-semibold text-amber-200 shadow-xl backdrop-blur">
          Cached traffic · last source update {status.lastSuccessfulUpdate ? new Date(status.lastSuccessfulUpdate).toLocaleTimeString('en-GB') : 'unavailable'}
        </div>
      )}
    </div>
  )
}
