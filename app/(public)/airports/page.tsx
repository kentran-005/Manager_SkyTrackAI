'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Building2, Map, MapPin, Search } from 'lucide-react'
import api from '@/lib/axios'
import { mapBackendAirport, type AirportCard, type BackendAirport } from '@/lib/skytrack-data'

export default function AirportsPage() {
  const [query, setQuery] = useState('')
  const [airports, setAirports] = useState<AirportCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api.get('/api/airports')
      .then((response) => {
        if (!mounted) return
        setAirports(Array.isArray(response.data) ? response.data.map((airport: BackendAirport) => mapBackendAirport(airport)) : [])
        setError('')
      })
      .catch(() => {
        if (mounted) setError('Airport data is temporarily unavailable. Please try again shortly.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  const filteredAirports = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return airports
    return airports.filter((airport) => [airport.code, airport.iata, airport.name, airport.city, airport.country].some((field) => field.toLowerCase().includes(value)))
  }, [airports, query])

  const countries = new Set(airports.map((airport) => airport.country)).size

  return (
    <main className="bg-[#f4f7fb]">
      <section className="relative overflow-hidden bg-[#07111f] px-5 py-16 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(37,99,235,.28),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Airport directory</div>
          <div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Explore the airports shaping every journey.</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">Search Vietnam&apos;s airport network and quickly identify each location by IATA code, city and country.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-[300px]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><Building2 className="h-5 w-5 text-blue-300" /><div className="mt-4 text-2xl font-semibold">{airports.length || '—'}</div><div className="text-xs text-slate-500">Airports indexed</div></div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><Map className="h-5 w-5 text-cyan-300" /><div className="mt-4 text-2xl font-semibold">{countries || '—'}</div><div className="text-xs text-slate-500">Countries covered</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Airport network</h2>
            <p className="mt-1 text-sm text-slate-500">{filteredAirports.length} location{filteredAirports.length === 1 ? '' : 's'} shown</p>
          </div>
          <label className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-blue-400 sm:w-[360px]">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search code, airport or city" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
          </label>
        </div>

        {error && <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>}

        {loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-64 animate-pulse rounded-[28px] border border-slate-200 bg-white" />)}
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAirports.map((airport, index) => (
              <article key={airport.id} className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-50 transition group-hover:scale-125" />
                <div className="relative flex items-start justify-between">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 font-mono text-lg font-bold text-white shadow-lg">{airport.code}</div>
                  <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">#{String(index + 1).padStart(2, '0')} <ArrowUpRight className="h-3 w-3" /></span>
                </div>
                <h3 className="relative mt-8 text-lg font-semibold text-slate-950">{airport.name}</h3>
                <div className="relative mt-2 flex items-center gap-2 text-sm text-slate-500"><MapPin className="h-4 w-4 text-blue-500" />{airport.city}, {airport.country}</div>
                <div className="relative mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
                  <div><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">IATA code</div><div className="mt-1 font-mono text-sm font-bold text-slate-800">{airport.iata}</div></div>
                  <div><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Coordinates</div><div className="mt-1 text-sm font-semibold text-slate-800">{airport.latitude !== undefined ? `${airport.latitude.toFixed(2)}, ${airport.longitude?.toFixed(2)}` : 'Not available'}</div></div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && filteredAirports.length === 0 && (
          <div className="mt-8 grid min-h-80 place-items-center rounded-[28px] border border-dashed border-slate-300 bg-white text-center">
            <div><Building2 className="mx-auto h-9 w-9 text-slate-300" /><h3 className="mt-4 font-semibold text-slate-800">No airport found</h3><p className="mt-1 text-sm text-slate-500">Try a different airport name, city or IATA code.</p></div>
          </div>
        )}
      </section>
    </main>
  )
}
