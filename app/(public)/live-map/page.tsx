'use client'

import dynamic from 'next/dynamic'
import {
  Crosshair,
  Expand,
  Layers3,
  LocateFixed,
  Minus,
  Plane,
  Plus,
  Radar,
  Search,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FlightMarkerData } from '../../components/MapView'

const MapView = dynamic(() => import('../../components/MapView'), { ssr: false })
type FlightFilter = 'all' | 'airborne' | 'ground'

function dispatchMapControl(action: 'zoom-in' | 'zoom-out' | 'focus-vietnam' | 'fullscreen') {
  window.dispatchEvent(new CustomEvent('skytrack-map-control', { detail: action }))
}

function formatAltitude(value: number | null) {
  return value === null ? 'N/A' : `${Math.round(value * 3.28084).toLocaleString()} ft`
}

function formatSpeed(value: number | null) {
  return value === null ? 'N/A' : `${Math.round(value * 3.6)} km/h`
}

export default function LiveMapPage() {
  const [flights, setFlights] = useState<FlightMarkerData[]>([])
  const [selectedFlight, setSelectedFlight] = useState<FlightMarkerData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<FlightFilter>('all')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const filteredFlights = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return flights.filter((flight) => {
      const matchesSearch = !query || flight.callsign.toLowerCase().includes(query) || flight.icao24.toLowerCase().includes(query)
      const matchesFilter = filter === 'all' || (filter === 'airborne' && !flight.onGround) || (filter === 'ground' && flight.onGround)
      return matchesSearch && matchesFilter
    })
  }, [filter, flights, searchTerm])

  const airborne = flights.filter((flight) => !flight.onGround).length
  const ground = flights.length - airborne

  return (
    <main className="relative h-[calc(100vh-72px)] min-h-[640px] overflow-hidden bg-[#07111f] text-white">
      <MapView
        selectedFlight={selectedFlight}
        onSelectFlight={setSelectedFlight}
        onFlightsChange={setFlights}
        searchTerm={searchTerm}
        filter={filter}
      />

      <aside className={`absolute bottom-3 left-3 top-3 z-[1000] flex w-[min(360px,calc(100vw-24px))] flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#0a111d]/95 shadow-2xl shadow-black/50 backdrop-blur-xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+20px)]'}`}>
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Live traffic</span>
            </div>
            <button type="button" onClick={() => setSidebarOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close traffic panel">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="text-3xl font-semibold tracking-tight">{flights.length}</div>
              <div className="text-xs text-slate-500">aircraft currently tracked</div>
            </div>
            <Radar className="h-9 w-9 text-blue-400/70" strokeWidth={1.4} />
          </div>

          <label className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 focus-within:border-blue-400/50">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search callsign or ICAO24"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
            />
            {searchTerm && <button type="button" onClick={() => setSearchTerm('')}><X className="h-3.5 w-3.5 text-slate-500" /></button>}
          </label>

          <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-black/20 p-1">
            {([
              ['all', `All ${flights.length}`],
              ['airborne', `Air ${airborne}`],
              ['ground', `Ground ${ground}`],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-lg px-2 py-2 text-[11px] font-semibold transition ${filter === value ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2 [scrollbar-color:#334155_transparent]">
          {filteredFlights.map((flight) => (
            <button
              key={flight.id}
              type="button"
              onClick={() => setSelectedFlight(flight)}
              className={`mb-1 w-full rounded-2xl border p-3 text-left transition ${selectedFlight?.id === flight.id ? 'border-yellow-300/50 bg-yellow-300/10' : 'border-transparent hover:border-white/10 hover:bg-white/[0.05]'}`}
            >
              <div className="flex items-center gap-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${flight.onGround ? 'bg-slate-700 text-slate-300' : 'bg-blue-500/15 text-blue-300'}`}>
                  <Plane className="h-4 w-4 -rotate-12" fill="currentColor" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-mono text-sm font-bold tracking-wide">{flight.callsign}</span>
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${flight.onGround ? 'bg-slate-500' : 'bg-emerald-400'}`} />
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3 text-[11px] text-slate-500">
                    <span className="truncate">{flight.originCountry}</span>
                    <span>{formatAltitude(flight.altitude)}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}

          {filteredFlights.length === 0 && (
            <div className="grid h-48 place-items-center px-6 text-center">
              <div>
                <Crosshair className="mx-auto h-7 w-7 text-slate-700" />
                <p className="mt-3 text-sm font-semibold text-slate-400">No aircraft match this view</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">Try another callsign or clear the status filter.</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {!sidebarOpen && (
        <button type="button" onClick={() => setSidebarOpen(true)} className="absolute left-4 top-4 z-[1000] flex items-center gap-2 rounded-xl border border-white/10 bg-[#0a111d]/90 px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] shadow-xl backdrop-blur hover:bg-slate-800">
          <Radar className="h-4 w-4 text-blue-400" /> Traffic
        </button>
      )}

      <div className="absolute right-3 top-3 z-[1000] hidden items-center gap-2 rounded-2xl border border-white/10 bg-[#0a111d]/90 p-2 shadow-xl backdrop-blur sm:flex">
        <button type="button" onClick={() => dispatchMapControl('focus-vietnam')} className="grid h-9 w-9 place-items-center rounded-xl text-slate-300 hover:bg-white/10" title="Focus Vietnam"><LocateFixed className="h-4 w-4" /></button>
        <button type="button" onClick={() => dispatchMapControl('zoom-in')} className="grid h-9 w-9 place-items-center rounded-xl text-slate-300 hover:bg-white/10" title="Zoom in"><Plus className="h-4 w-4" /></button>
        <button type="button" onClick={() => dispatchMapControl('zoom-out')} className="grid h-9 w-9 place-items-center rounded-xl text-slate-300 hover:bg-white/10" title="Zoom out"><Minus className="h-4 w-4" /></button>
        <button type="button" onClick={() => dispatchMapControl('fullscreen')} className="grid h-9 w-9 place-items-center rounded-xl text-slate-300 hover:bg-white/10" title="Fullscreen"><Expand className="h-4 w-4" /></button>
      </div>

      <div className="absolute bottom-3 right-3 z-[1000] hidden rounded-2xl border border-white/10 bg-[#0a111d]/90 px-4 py-3 shadow-xl backdrop-blur sm:block">
        <div className="flex items-center gap-4 text-[11px] font-medium text-slate-400">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-400" /> Cruise</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-400" /> Low altitude</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-400" /> Ground</span>
          <Layers3 className="h-4 w-4 text-slate-600" />
        </div>
      </div>

      {selectedFlight && (
        <section className={`absolute bottom-3 z-[1100] w-[min(420px,calc(100vw-24px))] overflow-hidden rounded-[24px] border border-white/10 bg-[#0a111d]/95 shadow-2xl shadow-black/50 backdrop-blur-xl ${sidebarOpen ? 'left-[384px]' : 'left-3'} max-lg:left-auto max-lg:right-3 max-lg:top-3 max-lg:bottom-auto`}>
          <div className="flex items-start justify-between border-b border-white/10 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-yellow-300 text-slate-950"><Plane className="h-5 w-5 -rotate-12" fill="currentColor" /></span>
              <div>
                <div className="font-mono text-lg font-bold tracking-wide">{selectedFlight.callsign}</div>
                <div className="text-xs text-slate-500">{selectedFlight.icao24.toUpperCase()} · {selectedFlight.originCountry}</div>
              </div>
            </div>
            <button type="button" onClick={() => setSelectedFlight(null)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-3 divide-x divide-white/10 p-4 text-center">
            <div><div className="text-[10px] uppercase tracking-wider text-slate-600">Altitude</div><div className="mt-1 text-sm font-semibold">{formatAltitude(selectedFlight.altitude)}</div></div>
            <div><div className="text-[10px] uppercase tracking-wider text-slate-600">Ground speed</div><div className="mt-1 text-sm font-semibold">{formatSpeed(selectedFlight.velocity)}</div></div>
            <div><div className="text-[10px] uppercase tracking-wider text-slate-600">Heading</div><div className="mt-1 text-sm font-semibold">{Math.round(selectedFlight.rotation)}°</div></div>
          </div>
        </section>
      )}
    </main>
  )
}
