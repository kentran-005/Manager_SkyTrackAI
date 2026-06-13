'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  MapPinned,
  Plane,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import api from '@/lib/axios'
import { getAirlineColor, mapBackendFlight, type BackendFlight, type FlightCard } from '@/lib/skytrack-data'

const PAGE_SIZE = 8
const POPULAR_SEARCHES = ['VN220', 'VJ123', 'QH210', 'HAN', 'SGN', 'DAD']

function extractFlights(payload: unknown): FlightCard[] {
  if (Array.isArray(payload)) return (payload as BackendFlight[]).map(mapBackendFlight)
  if (!payload || typeof payload !== 'object') return []
  const record = payload as Record<string, unknown>
  const nested = record.content ?? record.data ?? record.results
  return Array.isArray(nested) ? (nested as BackendFlight[]).map(mapBackendFlight) : []
}

function statusClass(status: FlightCard['status']) {
  if (status === 'On Time' || status === 'Boarding') return 'bg-emerald-50 text-emerald-700 ring-emerald-600/10'
  if (status === 'Delayed') return 'bg-amber-50 text-amber-700 ring-amber-600/10'
  if (status === 'Cancelled') return 'bg-rose-50 text-rose-700 ring-rose-600/10'
  return 'bg-blue-50 text-blue-700 ring-blue-600/10'
}

export default function SearchFlightPage() {
  const router = useRouter()
  const requestId = useRef(0)
  const [input, setInput] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [flights, setFlights] = useState<FlightCard[]>([])
  const [airline, setAirline] = useState('All airlines')
  const [airport, setAirport] = useState('All airports')
  const [status, setStatus] = useState('All statuses')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function requestFlights(query = '') {
    const currentRequest = ++requestId.current
    setLoading(true)
    setError('')
    try {
      const endpoint = query.trim()
        ? `/api/flights/search?q=${encodeURIComponent(query.trim())}`
        : '/api/flights'
      const response = await api.get(endpoint)
      if (currentRequest !== requestId.current) return
      setFlights(extractFlights(response.data))
      setActiveQuery(query.trim())
      setPage(1)
    } catch (requestError: unknown) {
      if (currentRequest !== requestId.current) return
      setFlights([])
      setError(requestError instanceof Error ? requestError.message : 'Unable to load flight data.')
    } finally {
      if (currentRequest === requestId.current) setLoading(false)
    }
  }

  useEffect(() => {
    void requestFlights()
    return () => { requestId.current += 1 }
  }, [])

  const airlineOptions = useMemo(() => ['All airlines', ...Array.from(new Set(flights.map((flight) => flight.airline).filter(Boolean))).sort()], [flights])
  const airportOptions = useMemo(() => ['All airports', ...Array.from(new Set(flights.flatMap((flight) => [flight.from.code, flight.to.code]).filter((code) => code !== 'N/A'))).sort()], [flights])
  const statusOptions = ['All statuses', 'On Time', 'Scheduled', 'Boarding', 'Delayed', 'Cancelled']

  const filteredFlights = useMemo(() => flights.filter((flight) => {
    const matchesAirline = airline === 'All airlines' || flight.airline === airline
    const matchesAirport = airport === 'All airports' || flight.from.code === airport || flight.to.code === airport
    const matchesStatus = status === 'All statuses' || flight.status === status
    return matchesAirline && matchesAirport && matchesStatus
  }), [airline, airport, flights, status])

  useEffect(() => { setPage(1) }, [airline, airport, status])

  const totalPages = Math.max(1, Math.ceil(filteredFlights.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visibleFlights = filteredFlights.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const onTime = flights.filter((flight) => flight.status === 'On Time' || flight.status === 'Boarding').length
  const delayed = flights.filter((flight) => flight.status === 'Delayed').length

  function submit(event: React.FormEvent) {
    event.preventDefault()
    void requestFlights(input)
  }

  function reset() {
    setInput('')
    setAirline('All airlines')
    setAirport('All airports')
    setStatus('All statuses')
    void requestFlights()
  }

  return (
    <main className="min-h-full bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <section className="relative overflow-hidden rounded-[30px] bg-[#07111f] p-6 text-white shadow-xl shadow-slate-950/10 sm:p-8">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(37,99,235,.35),transparent_60%)]" />
          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Flight intelligence</div>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Find the flight that matters, fast.</h1>
              <p className="mt-3 text-sm leading-6 text-slate-400">Search live backend records by flight number, airline, route or airport, then narrow the result with operational filters.</p>
            </div>
            <button type="button" onClick={() => router.push('/user/live-map')} className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500">
              <MapPinned className="h-4 w-4" /> Open live map
            </button>
          </div>

          <form onSubmit={submit} className="relative mt-7 flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.07] p-2 sm:flex-row">
            <label className="flex min-w-0 flex-1 items-center gap-3 px-3">
              <Search className="h-5 w-5 shrink-0 text-blue-300" />
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Search VN220, Vietnam Airlines, SGN or Hanoi..."
                className="h-12 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </label>
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-blue-50 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search backend
            </button>
          </form>
          <div className="relative mt-3 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[11px] uppercase tracking-wider text-slate-600">Popular</span>
            {POPULAR_SEARCHES.map((value) => (
              <button key={value} type="button" onClick={() => { setInput(value); void requestFlights(value) }} className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-blue-400/40 hover:bg-blue-400/10 hover:text-white">{value}</button>
            ))}
          </div>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            { label: activeQuery ? 'Search results' : 'Available flights', value: flights.length, icon: Plane, color: 'text-blue-600 bg-blue-50' },
            { label: 'On time / boarding', value: onTime, icon: Clock3, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Delayed flights', value: delayed, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${item.color}`}><item.icon className="h-5 w-5" /></span>
              <div><div className="text-2xl font-bold text-slate-950">{loading ? '—' : item.value}</div><div className="text-xs text-slate-500">{item.label}</div></div>
            </div>
          ))}
        </section>

        <section className="mt-5 rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><SlidersHorizontal className="h-4 w-4 text-blue-600" /> Refine results</div>
            <div className="grid gap-2 sm:grid-cols-3 xl:flex">
              {[
                { value: airline, setter: setAirline, options: airlineOptions, label: 'Airline' },
                { value: airport, setter: setAirport, options: airportOptions, label: 'Airport' },
                { value: status, setter: setStatus, options: statusOptions, label: 'Status' },
              ].map((filter) => (
                <label key={filter.label} className="relative">
                  <span className="sr-only">{filter.label}</span>
                  <select value={filter.value} onChange={(event) => filter.setter(event.target.value)} className="h-11 min-w-[170px] appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400">
                    {filter.options.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
              ))}
              <button type="button" onClick={reset} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"><RotateCcw className="h-4 w-4" /> Reset</button>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div><div className="font-semibold">Could not load flights</div><div className="mt-1 text-rose-700">{error}</div><button type="button" onClick={() => void requestFlights(activeQuery)} className="mt-2 font-semibold underline">Try again</button></div>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between">
          <div><h2 className="font-semibold text-slate-950">{activeQuery ? `Results for “${activeQuery}”` : 'All flights'}</h2><p className="mt-1 text-xs text-slate-500">{filteredFlights.length} matching record{filteredFlights.length === 1 ? '' : 's'}</p></div>
          {activeQuery && <button type="button" onClick={reset} className="text-sm font-semibold text-blue-600 hover:text-blue-500">Clear search</button>}
        </div>

        {loading ? (
          <div className="mt-4 space-y-3">{[0, 1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div>
        ) : visibleFlights.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
            <div className="hidden grid-cols-[1.2fr_1.6fr_1.2fr_.8fr_.5fr] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 lg:grid">
              <span>Flight</span><span>Route</span><span>Schedule</span><span>Status</span><span />
            </div>
            <div className="divide-y divide-slate-100">
              {visibleFlights.map((flight) => (
                <article key={flight.id} className="grid gap-4 p-5 transition hover:bg-blue-50/30 lg:grid-cols-[1.2fr_1.6fr_1.2fr_.8fr_.5fr] lg:items-center">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xs font-bold text-white" style={{ backgroundColor: getAirlineColor(flight.airlineCode) }}>{flight.airlineCode || 'ST'}</span>
                    <div className="min-w-0"><div className="font-mono font-bold text-slate-950">{flight.flightNo}</div><div className="truncate text-xs text-slate-500">{flight.airline}</div><div className="mt-0.5 text-[10px] text-slate-400">{flight.aircraft}</div></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div><div className="text-lg font-bold text-slate-950">{flight.from.code}</div><div className="text-xs text-slate-500">{flight.from.city}</div></div>
                    <div className="flex flex-1 items-center gap-2 text-slate-300"><span className="h-px flex-1 bg-slate-200" /><Plane className="h-4 w-4 rotate-90 text-blue-500" /><span className="h-px flex-1 bg-slate-200" /></div>
                    <div className="text-right"><div className="text-lg font-bold text-slate-950">{flight.to.code}</div><div className="text-xs text-slate-500">{flight.to.city}</div></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-400"><CalendarDays className="h-3 w-3" /> Departure</div><div className="mt-1 text-sm font-semibold">{flight.from.time}</div><div className="text-[10px] text-slate-400">{flight.from.date}</div></div>
                    <div><div className="text-[10px] uppercase tracking-wider text-slate-400">Arrival</div><div className="mt-1 text-sm font-semibold">{flight.to.time}</div><div className="text-[10px] text-slate-400">{flight.duration}</div></div>
                  </div>
                  <div><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(flight.status)}`}>{flight.status}</span></div>
                  <button type="button" onClick={() => router.push('/user/live-map')} className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-500">Map <ArrowRight className="h-3.5 w-3.5" /></button>
                </article>
              ))}
            </div>
          </div>
        ) : !error && (
          <div className="mt-4 grid min-h-72 place-items-center rounded-[26px] border border-dashed border-slate-300 bg-white text-center">
            <div><Search className="mx-auto h-9 w-9 text-slate-300" /><h3 className="mt-4 font-semibold text-slate-800">No flights found</h3><p className="mt-1 max-w-sm text-sm text-slate-500">Try another flight number, airport code or clear the filters.</p></div>
          </div>
        )}

        {!loading && filteredFlights.length > PAGE_SIZE && (
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <span className="text-xs text-slate-500">Page {safePage} of {totalPages}</span>
            <div className="flex gap-2">
              <button type="button" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
              <button type="button" disabled={safePage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
