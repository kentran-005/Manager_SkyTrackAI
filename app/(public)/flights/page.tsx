'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, Plane, ArrowRight, Clock } from 'lucide-react'
import api from '@/lib/axios'

type FlightStatus = 'On Time' | 'Delayed' | 'Cancelled' | 'Scheduled' | 'Boarding'

interface Flight {
  code: string
  airline: string
  airlineColor: string
  from: string
  fromCity: string
  to: string
  toCity: string
  departure: string
  arrival: string
  status: FlightStatus
  aircraft: string
  gate: string
}

interface BackendFlight {
  flightCode?: string
  airline?: { code?: string; name?: string }
  departureAirport?: { code?: string; city?: string; name?: string }
  arrivalAirport?: { code?: string; city?: string; name?: string }
  departureTime?: string
  arrivalTime?: string
  status?: string
  aircraft?: string
  type?: string
  gate?: string
}

const statusFilters: { label: string; value: FlightStatus | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'On Time', value: 'On Time' },
  { label: 'Scheduled', value: 'Scheduled' },
  { label: 'Boarding', value: 'Boarding' },
  { label: 'Delayed', value: 'Delayed' },
  { label: 'Cancelled', value: 'Cancelled' },
]

function getStatusBadge(status: FlightStatus) {
  switch (status) {
    case 'On Time':
    case 'Boarding':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'Scheduled':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'Delayed':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'Cancelled':
      return 'bg-red-50 text-red-700 border-red-200'
  }
}

function getStatusDot(status: FlightStatus) {
  switch (status) {
    case 'On Time':
    case 'Boarding':
      return 'bg-emerald-500'
    case 'Scheduled':
      return 'bg-blue-500'
    case 'Delayed':
      return 'bg-amber-500'
    case 'Cancelled':
      return 'bg-red-500'
  }
}

function formatTime(value?: string) {
  if (!value) return '--:--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 5)
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function mapStatus(status?: string): FlightStatus {
  switch (status) {
    case 'ON_TIME':
      return 'On Time'
    case 'DELAYED':
      return 'Delayed'
    case 'CANCELLED':
      return 'Cancelled'
    case 'BOARDING':
      return 'Boarding'
    default:
      return 'Scheduled'
  }
}

function getAirlineColor(code?: string) {
  if (code === 'VJ') return '#e63946'
  if (code === 'QH') return '#2d9f4c'
  return '#0066ff'
}

function mapBackendFlight(f: BackendFlight): Flight {
  return {
    code: f.flightCode || 'N/A',
    airline: f.airline?.name || 'Unknown Airline',
    airlineColor: getAirlineColor(f.airline?.code),
    from: f.departureAirport?.code || 'N/A',
    fromCity: f.departureAirport?.city || f.departureAirport?.name || 'N/A',
    to: f.arrivalAirport?.code || 'N/A',
    toCity: f.arrivalAirport?.city || f.arrivalAirport?.name || 'N/A',
    departure: formatTime(f.departureTime),
    arrival: formatTime(f.arrivalTime),
    status: mapStatus(f.status),
    aircraft: f.aircraft || f.type || 'N/A',
    gate: f.gate || 'N/A',
  }
}

export default function FlightsPage() {
  const [activeFilter, setActiveFilter] = useState<FlightStatus | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadFlights() {
      try {
        setLoading(true)
        const res = await api.get('/api/flights')
        if (mounted) setFlights(Array.isArray(res.data) ? res.data.map(mapBackendFlight) : [])
      } catch (err: unknown) {
        if (mounted) setError(err instanceof Error ? err.message : 'Cannot load flights')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadFlights()
    return () => {
      mounted = false
    }
  }, [])

  const filteredFlights = flights.filter((flight) => {
    const matchesFilter = activeFilter === 'All' || flight.status === activeFilter
    const matchesSearch = searchQuery === '' ||
      flight.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flight.airline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flight.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flight.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flight.fromCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flight.toCity.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Flights</h1>
          <p className="text-sm text-[#64748b] mt-1">Track and manage all active flights across Vietnam</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Search flights, routes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#e2e8f0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#64748b]" />
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === filter.value
                    ? 'bg-[#0066ff] text-white shadow-sm'
                    : 'bg-white text-[#64748b] border border-[#e2e8f0] hover:bg-[#f1f5f9]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Flight Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#64748b]">
            Showing <span className="font-semibold text-[#0f172a]">{filteredFlights.length}</span> of {flights.length} flights
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Flights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredFlights.map((flight) => (
            <div
              key={flight.code}
              className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
            >
              <div className="p-5">
                {/* Flight Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: flight.airlineColor + '15', color: flight.airlineColor }}>
                      <Plane className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-[#0f172a]">{flight.code}</span>
                      <span className="text-xs text-[#94a3b8] ml-2">{flight.airline}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(flight.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(flight.status)}`}></span>
                    {flight.status}
                  </span>
                </div>

                {/* Route */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold text-[#0f172a]">{flight.from}</p>
                    <p className="text-xs text-[#94a3b8] truncate">{flight.fromCity}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#94a3b8]">
                    <div className="w-8 h-px bg-[#e2e8f0]"></div>
                    <ArrowRight className="w-4 h-4 text-[#0066ff]" />
                    <div className="w-8 h-px bg-[#e2e8f0]"></div>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold text-[#0f172a]">{flight.to}</p>
                    <p className="text-xs text-[#94a3b8] truncate">{flight.toCity}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#f1f5f9]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#94a3b8]" />
                    <div>
                      <p className="text-xs text-[#94a3b8]">Dep</p>
                      <p className="text-xs font-medium text-[#334155]">{flight.departure}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[#94a3b8]">Aircraft</p>
                    <p className="text-xs font-medium text-[#334155]">{flight.aircraft}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94a3b8]">Gate</p>
                    <p className="text-xs font-medium text-[#334155]">{flight.gate}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="text-center py-16">
            <Plane className="w-12 h-12 text-[#cbd5e1] mx-auto mb-3 animate-pulse" />
            <p className="text-[#64748b] font-medium">Loading flights...</p>
          </div>
        )}

        {!loading && filteredFlights.length === 0 && (
          <div className="text-center py-16">
            <Plane className="w-12 h-12 text-[#cbd5e1] mx-auto mb-3" />
            <p className="text-[#64748b] font-medium">No flights found</p>
            <p className="text-sm text-[#94a3b8] mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </main>
  )
}
