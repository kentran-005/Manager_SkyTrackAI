'use client'

import { useState } from 'react'
import { Search, Filter, Plane, ArrowRight, Clock, MoreHorizontal } from 'lucide-react'

type FlightStatus = 'On Time' | 'Delayed' | 'Cancelled'

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

const allFlights: Flight[] = [
  { code: 'VN220', airline: 'Vietnam Airlines', airlineColor: '#0066ff', from: 'SGN', fromCity: 'Ho Chi Minh City', to: 'HAN', toCity: 'Hanoi', departure: '06:30', arrival: '08:45', status: 'On Time', aircraft: 'A321', gate: 'A12' },
  { code: 'VJ351', airline: 'Vietjet Air', airlineColor: '#e63946', from: 'HAN', fromCity: 'Hanoi', to: 'DAD', toCity: 'Da Nang', departure: '07:15', arrival: '08:30', status: 'Delayed', aircraft: 'A320', gate: 'B05' },
  { code: 'VN148', airline: 'Vietnam Airlines', airlineColor: '#0066ff', from: 'DAD', fromCity: 'Da Nang', to: 'SGN', toCity: 'Ho Chi Minh City', departure: '08:00', arrival: '09:50', status: 'On Time', aircraft: 'B787', gate: 'C03' },
  { code: 'QH203', airline: 'Bamboo Airways', airlineColor: '#2d9f4c', from: 'SGN', fromCity: 'Ho Chi Minh City', to: 'CXR', toCity: 'Nha Trang', departure: '09:20', arrival: '10:30', status: 'On Time', aircraft: 'A319', gate: 'D08' },
  { code: 'VN512', airline: 'Vietnam Airlines', airlineColor: '#0066ff', from: 'HAN', fromCity: 'Hanoi', to: 'PQC', toCity: 'Phu Quoc', departure: '10:00', arrival: '12:15', status: 'Cancelled', aircraft: 'A350', gate: 'A01' },
  { code: 'VJ102', airline: 'Vietjet Air', airlineColor: '#e63946', from: 'SGN', fromCity: 'Ho Chi Minh City', to: 'HPQ', toCity: 'Hai Phong', departure: '11:30', arrival: '12:45', status: 'Delayed', aircraft: 'A321', gate: 'B11' },
  { code: 'VN780', airline: 'Vietnam Airlines', airlineColor: '#0066ff', from: 'HAN', fromCity: 'Hanoi', to: 'SGN', toCity: 'Ho Chi Minh City', departure: '12:00', arrival: '14:15', status: 'On Time', aircraft: 'B787', gate: 'A09' },
  { code: 'VJ456', airline: 'Vietjet Air', airlineColor: '#e63946', from: 'SGN', fromCity: 'Ho Chi Minh City', to: 'DAD', toCity: 'Da Nang', departure: '13:30', arrival: '14:45', status: 'On Time', aircraft: 'A320', gate: 'C07' },
  { code: 'QH301', airline: 'Bamboo Airways', airlineColor: '#2d9f4c', from: 'DAD', fromCity: 'Da Nang', to: 'HAN', toCity: 'Hanoi', departure: '14:00', arrival: '15:15', status: 'Delayed', aircraft: 'A319', gate: 'B03' },
  { code: 'VN312', airline: 'Vietnam Airlines', airlineColor: '#0066ff', from: 'CXR', fromCity: 'Nha Trang', to: 'SGN', toCity: 'Ho Chi Minh City', departure: '15:30', arrival: '16:40', status: 'On Time', aircraft: 'A321', gate: 'D12' },
  { code: 'VJ789', airline: 'Vietjet Air', airlineColor: '#e63946', from: 'HPQ', fromCity: 'Hai Phong', to: 'SGN', toCity: 'Ho Chi Minh City', departure: '16:00', arrival: '18:10', status: 'On Time', aircraft: 'A320', gate: 'A06' },
  { code: 'VN901', airline: 'Vietnam Airlines', airlineColor: '#0066ff', from: 'PQC', fromCity: 'Phu Quoc', to: 'HAN', toCity: 'Hanoi', departure: '17:00', arrival: '19:20', status: 'On Time', aircraft: 'A350', gate: 'C10' },
]

const statusFilters: { label: string; value: FlightStatus | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'On Time', value: 'On Time' },
  { label: 'Delayed', value: 'Delayed' },
  { label: 'Cancelled', value: 'Cancelled' },
]

function getStatusBadge(status: FlightStatus) {
  switch (status) {
    case 'On Time':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'Delayed':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'Cancelled':
      return 'bg-red-50 text-red-700 border-red-200'
  }
}

function getStatusDot(status: FlightStatus) {
  switch (status) {
    case 'On Time':
      return 'bg-emerald-500'
    case 'Delayed':
      return 'bg-amber-500'
    case 'Cancelled':
      return 'bg-red-500'
  }
}

export default function FlightsPage() {
  const [activeFilter, setActiveFilter] = useState<FlightStatus | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFlights = allFlights.filter((flight) => {
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
            Showing <span className="font-semibold text-[#0f172a]">{filteredFlights.length}</span> of {allFlights.length} flights
          </p>
        </div>

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

        {filteredFlights.length === 0 && (
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
