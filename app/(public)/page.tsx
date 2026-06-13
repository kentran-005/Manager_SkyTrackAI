'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  CloudSun,
  Gauge,
  MapPin,
  Plane,
  Radar,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '@/lib/axios'
import type { RealtimeFlight } from '@/lib/skytrack-data'

interface WeatherData {
  name?: string
  main?: { temp?: number }
  weather?: Array<{ description?: string }>
}

export default function SkyTrackLanding() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [flights, setFlights] = useState<RealtimeFlight[]>([])
  const [weather, setWeather] = useState<WeatherData | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadOverview() {
      const [flightResult, weatherResult] = await Promise.allSettled([
        api.get('/api/realtime-flights'),
        api.get('/api/weather/Hanoi'),
      ])
      if (!mounted) return
      if (flightResult.status === 'fulfilled' && Array.isArray(flightResult.value.data)) setFlights(flightResult.value.data)
      if (weatherResult.status === 'fulfilled') setWeather(weatherResult.value.data)
    }

    loadOverview()
    const interval = window.setInterval(loadOverview, 60000)
    return () => {
      mounted = false
      window.clearInterval(interval)
    }
  }, [])

  const airborne = flights.filter((flight) => !flight.onGround).length
  const grounded = flights.length - airborne
  const recentFlights = flights.slice(0, 5)

  function submitSearch(event: React.FormEvent) {
    event.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <main>
      <section className="relative overflow-hidden bg-[#07111f] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(37,99,235,0.3),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(14,165,233,0.15),transparent_25%)]" />
        <div className="absolute inset-y-0 right-0 hidden w-[52%] opacity-80 lg:block">
          <div className="absolute left-[42%] top-[18%] h-80 w-80 rounded-full border border-blue-400/20" />
          <div className="absolute left-[32%] top-[8%] h-[520px] w-[520px] rounded-full border border-blue-400/10" />
          <div className="absolute left-[22%] top-[-2%] h-[760px] w-[760px] rounded-full border border-blue-400/[0.06]" />
          <div className="absolute left-[52%] top-[35%] h-3 w-3 rounded-full bg-blue-400 shadow-[0_0_35px_10px_rgba(96,165,250,0.55)]" />
          <div className="absolute left-[25%] top-[62%] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_24px_8px_rgba(103,232,249,0.35)]" />
          <Plane className="absolute left-[37%] top-[29%] h-8 w-8 rotate-[24deg] text-blue-300 drop-shadow-[0_0_12px_rgba(96,165,250,.8)]" fill="currentColor" />
          <Plane className="absolute left-[67%] top-[53%] h-5 w-5 rotate-[70deg] text-cyan-300" fill="currentColor" />
        </div>

        <div className="relative mx-auto grid min-h-[670px] max-w-7xl items-center gap-12 px-5 py-20 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold text-blue-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Vietnam airspace is live
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              See every journey.<br /><span className="text-blue-400">Understand the sky.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              Search scheduled flights, follow aircraft in real time and explore Vietnam&apos;s aviation network from one clear operational view.
            </p>

            <form onSubmit={submitSearch} className="mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.07] p-2 shadow-2xl shadow-black/30 backdrop-blur sm:flex-row">
              <label className="flex min-w-0 flex-1 items-center gap-3 px-3">
                <Search className="h-5 w-5 shrink-0 text-blue-300" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Flight number, airport or route"
                  className="h-12 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </label>
              <button type="submit" disabled={!query.trim()} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40">
                Search flight
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              <span>Try: VN220</span><span>SGN → HAN</span><span>Noi Bai Airport</span>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="ml-auto w-[390px] rounded-[32px] border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="flex items-center justify-between px-2 py-1">
                <div><div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Live snapshot</div><div className="mt-1 text-sm font-semibold">Vietnam FIR</div></div>
                <Radar className="h-6 w-6 text-blue-400" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  ['Tracked', flights.length],
                  ['Airborne', airborne],
                  ['Ground', grounded],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-black/20 p-3"><div className="text-xl font-semibold">{value}</div><div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">{label}</div></div>
                ))}
              </div>
              <div className="mt-3 space-y-1">
                {recentFlights.length > 0 ? recentFlights.map((flight, index) => (
                  <div key={flight.icao24 || `${flight.callsign}-${index}`} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-white/[0.05]">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/15 text-blue-300"><Plane className="h-4 w-4 -rotate-12" fill="currentColor" /></span>
                    <div className="min-w-0 flex-1"><div className="truncate font-mono text-sm font-bold">{flight.callsign?.trim() || flight.icao24 || 'Unknown'}</div><div className="truncate text-[11px] text-slate-500">{flight.originCountry || 'Live OpenSky traffic'}</div></div>
                    <span className={`h-2 w-2 rounded-full ${flight.onGround ? 'bg-slate-500' : 'bg-emerald-400'}`} />
                  </div>
                )) : (
                  <div className="grid h-52 place-items-center text-center text-xs text-slate-500">Waiting for live traffic data...</div>
                )}
              </div>
              <Link href="/live-map" className="mt-3 flex items-center justify-between rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold transition hover:bg-blue-500">
                Open full live map <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-slate-200 px-5 sm:grid-cols-4 sm:divide-y-0 sm:px-6 lg:px-8">
          {[
            { icon: Plane, label: 'Live aircraft', value: flights.length || '—' },
            { icon: Gauge, label: 'Currently airborne', value: airborne || '—' },
            { icon: MapPin, label: 'Coverage', value: 'Vietnam FIR' },
            { icon: CloudSun, label: weather?.name || 'Hanoi weather', value: weather?.main?.temp !== undefined ? `${Math.round(weather.main.temp)}°C` : '—' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 px-4 py-6 first:pl-0 sm:px-6">
              <item.icon className="h-5 w-5 text-blue-600" />
              <div><div className="text-lg font-bold text-slate-950">{item.value}</div><div className="text-xs text-slate-500">{item.label}</div></div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f4f7fb] px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">One connected platform</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">Built to make aviation data feel useful, not overwhelming.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { icon: Radar, title: 'Live traffic radar', text: 'Inspect active aircraft, altitude, speed and status on an interactive map.', href: '/live-map' },
              { icon: Search, title: 'Fast flight discovery', text: 'Find a flight by number, airline, route or airport with clear operational context.', href: '/flights' },
              { icon: ShieldCheck, title: 'Operational workspace', text: 'Role-based tools keep public discovery and management workflows focused.', href: '/login' },
            ].map((feature, index) => (
              <Link key={feature.title} href={feature.href} className={`group rounded-[28px] border p-6 transition hover:-translate-y-1 hover:shadow-xl ${index === 0 ? 'border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'border-slate-200 bg-white text-slate-950'}`}>
                <feature.icon className={`h-6 w-6 ${index === 0 ? 'text-blue-100' : 'text-blue-600'}`} />
                <h3 className="mt-8 text-xl font-semibold">{feature.title}</h3>
                <p className={`mt-2 text-sm leading-6 ${index === 0 ? 'text-blue-100' : 'text-slate-500'}`}>{feature.text}</p>
                <div className="mt-6 flex items-center gap-2 text-sm font-semibold">Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
