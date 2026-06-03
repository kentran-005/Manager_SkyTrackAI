'use client'

import { useState } from 'react'
import { Search, Plane, Building2, TrendingUp, MapPin } from 'lucide-react'

interface Airport {
  code: string
  name: string
  city: string
  iata: string
  dailyFlights: number
  onTimeRate: number
  terminals: number
  runways: number
}

const airports: Airport[] = [
  { code: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi', iata: 'HAN', dailyFlights: 342, onTimeRate: 87.5, terminals: 2, runways: 2 },
  { code: 'DAD', name: 'Da Nang International Airport', city: 'Da Nang', iata: 'DAD', dailyFlights: 218, onTimeRate: 91.2, terminals: 2, runways: 1 },
  { code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', iata: 'SGN', dailyFlights: 456, onTimeRate: 84.3, terminals: 2, runways: 2 },
  { code: 'CXR', name: 'Cam Ranh International Airport', city: 'Nha Trang', iata: 'CXR', dailyFlights: 128, onTimeRate: 93.1, terminals: 1, runways: 1 },
  { code: 'PQC', name: 'Phu Quoc International Airport', city: 'Phu Quoc', iata: 'PQC', dailyFlights: 96, onTimeRate: 90.8, terminals: 1, runways: 1 },
  { code: 'HPQ', name: 'Cat Bi International Airport', city: 'Hai Phong', iata: 'HPH', dailyFlights: 72, onTimeRate: 92.4, terminals: 1, runways: 1 },
  { code: 'VII', name: 'Vinh International Airport', city: 'Vinh', iata: 'VII', dailyFlights: 34, onTimeRate: 95.2, terminals: 1, runways: 1 },
  { code: 'BMV', name: 'Buon Ma Thuot Airport', city: 'Buon Ma Thuot', iata: 'BMV', dailyFlights: 28, onTimeRate: 94.7, terminals: 1, runways: 1 },
]

function getOnTimeColor(rate: number) {
  if (rate >= 90) return 'text-emerald-600 bg-emerald-50'
  if (rate >= 85) return 'text-amber-600 bg-amber-50'
  return 'text-red-600 bg-red-50'
}

function getOnTimeBarColor(rate: number) {
  if (rate >= 90) return 'bg-emerald-500'
  if (rate >= 85) return 'bg-amber-500'
  return 'bg-red-500'
}

export default function AirportsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAirports = airports.filter((airport) =>
    searchQuery === '' ||
    airport.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    airport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    airport.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    airport.iata.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Airports</h1>
          <p className="text-sm text-[#64748b] mt-1">Vietnam airport network overview and statistics</p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Search airports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#e2e8f0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>

        {/* Airport Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAirports.map((airport) => (
            <div
              key={airport.code}
              className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
            >
              <div className="p-5">
                {/* Airport Code & Name */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                    <span className="text-lg font-bold text-[#0066ff]">{airport.code}</span>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${getOnTimeColor(airport.onTimeRate)}`}>
                    {airport.onTimeRate}%
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-[#0f172a] mb-0.5 line-clamp-1">{airport.name}</h3>
                <div className="flex items-center gap-1 text-xs text-[#64748b] mb-4">
                  <MapPin className="w-3 h-3" />
                  {airport.city} · {airport.iata}
                </div>

                {/* On-Time Rate Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#64748b]">On-Time Rate</span>
                    <span className="font-medium text-[#334155]">{airport.onTimeRate}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getOnTimeBarColor(airport.onTimeRate)}`}
                      style={{ width: `${airport.onTimeRate}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#f1f5f9]">
                  <div className="flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-[#94a3b8]" />
                    <div>
                      <p className="text-[10px] text-[#94a3b8]">Daily Flights</p>
                      <p className="text-xs font-semibold text-[#334155]">{airport.dailyFlights}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#94a3b8]" />
                    <div>
                      <p className="text-[10px] text-[#94a3b8]">Terminals</p>
                      <p className="text-xs font-semibold text-[#334155]">{airport.terminals}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAirports.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-[#cbd5e1] mx-auto mb-3" />
            <p className="text-[#64748b] font-medium">No airports found</p>
            <p className="text-sm text-[#94a3b8] mt-1">Try adjusting your search</p>
          </div>
        )}
      </div>
    </main>
  )
}
