'use client'

import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'

interface Airport {
  code: string
  name: string
  lat: number
  lng: number
}

interface FlightMarkerData {
  id: string
  from: string
  to: string
  lat: number
  lng: number
  rotation: number
  color: string
}

const airports: Airport[] = [
  { code: 'HAN', name: 'Hanoi', lat: 21.2213, lng: 105.808 },
  { code: 'DAD', name: 'Da Nang', lat: 16.0439, lng: 108.212 },
  { code: 'SGN', name: 'Ho Chi Minh City', lat: 10.8188, lng: 106.651 },
  { code: 'CXR', name: 'Nha Trang', lat: 12.2213, lng: 109.191 },
  { code: 'PQC', name: 'Phu Quoc', lat: 10.1667, lng: 103.983 },
  { code: 'HPQ', name: 'Hai Phong', lat: 20.8421, lng: 106.726 },
  { code: 'VII', name: 'Vinh', lat: 18.7375, lng: 105.241 },
  { code: 'BMV', name: 'Buon Ma Thuot', lat: 12.6681, lng: 108.1197 },
]

const flightMarkers: FlightMarkerData[] = [
  { id: 'VN220', from: 'SGN', to: 'HAN', lat: 13.5, lng: 107.0, rotation: 345, color: '#10b981' },
  { id: 'VJ351', from: 'HAN', to: 'DAD', lat: 18.5, lng: 106.8, rotation: 170, color: '#f59e0b' },
  { id: 'VN148', from: 'SGN', to: 'CXR', lat: 11.8, lng: 108.0, rotation: 150, color: '#10b981' },
  { id: 'QH203', from: 'DAD', to: 'SGN', lat: 14.5, lng: 107.5, rotation: 165, color: '#ef4444' },
  { id: 'VN512', from: 'HAN', to: 'PQC', lat: 16.5, lng: 104.5, rotation: 195, color: '#8b5cf6' },
]

const flightPaths: { from: string; to: string; color: string }[] = [
  { from: 'SGN', to: 'HAN', color: '#10b981' },
  { from: 'HAN', to: 'DAD', color: '#f59e0b' },
  { from: 'SGN', to: 'CXR', color: '#10b981' },
  { from: 'DAD', to: 'SGN', color: '#ef4444' },
  { from: 'HAN', to: 'PQC', color: '#8b5cf6' },
]

function createPlaneIcon(color: string, rotation: number): L.DivIcon {
  return L.divIcon({
    className: 'custom-flight-marker',
    html: `<div style="transform: rotate(${rotation}deg); width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
      </svg>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function createAirportIcon(code: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-airport-marker',
    html: `<div style="background: #1e293b; color: white; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); white-space: nowrap; text-align: center; letter-spacing: 0.5px;">${code}</div>`,
    iconSize: [40, 20],
    iconAnchor: [20, 10],
  })
}

function MapResizeHandler() {
  const map = useMap()

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 200)
    return () => clearTimeout(timer)
  }, [map])

  return null
}

export default function MapView() {
  return (
    <div className="absolute inset-0" style={{ zIndex: 0 }}>
      <MapContainer
        center={[14.0, 108.0]}
        zoom={6}
        zoomControl={false}
        attributionControl={true}
        className="absolute inset-0 w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapResizeHandler />

        {/* Airport Markers */}
        {airports.map((airport) => (
          <Marker
            key={airport.code}
            position={[airport.lat, airport.lng]}
            icon={createAirportIcon(airport.code)}
          />
        ))}

        {/* Flight Markers */}
        {flightMarkers.map((flight) => (
          <Marker
            key={flight.id}
            position={[flight.lat, flight.lng]}
            icon={createPlaneIcon(flight.color, flight.rotation)}
          />
        ))}

        {/* Flight Paths */}
        {flightPaths.map((path, index) => {
          const fromAirport = airports.find((a) => a.code === path.from)
          const toAirport = airports.find((a) => a.code === path.to)
          if (!fromAirport || !toAirport) return null
          return (
            <Polyline
              key={`path-${index}`}
              positions={[
                [fromAirport.lat, fromAirport.lng],
                [toAirport.lat, toAirport.lng],
              ]}
              pathOptions={{
                color: path.color,
                weight: 2,
                opacity: 0.4,
                dashArray: '6, 6',
              }}
            />
          )
        })}
      </MapContainer>
    </div>
  )
}
