'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/axios'

interface DashboardStats {
  totalFlights: number
  airborneFlights: number
  groundFlights: number
}

interface RealtimeFlight {
  latitude?: number
  longitude?: number
  onGround?: boolean
}

export default function StatusLegend() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFlights: 0,
    airborneFlights: 0,
    groundFlights: 0,
  })

  useEffect(() => {
    let mounted = true

    async function loadStats() {
      try {
        const res = await api.get('/api/realtime-flights')
        const flights: RealtimeFlight[] = Array.isArray(res.data) ? res.data : []
        const visibleFlights = flights.filter(
          (flight) => typeof flight.latitude === 'number' && typeof flight.longitude === 'number',
        )
        const groundFlights = visibleFlights.filter((flight) => flight.onGround).length

        if (mounted) {
          setStats({
            totalFlights: visibleFlights.length,
            airborneFlights: visibleFlights.length - groundFlights,
            groundFlights,
          })
        }
      } catch {
        if (mounted) {
          setStats({
            totalFlights: 0,
            airborneFlights: 0,
            groundFlights: 0,
          })
        }
      }
    }

    loadStats()
    const interval = window.setInterval(loadStats, 60000)

    return () => {
      mounted = false
      window.clearInterval(interval)
    }
  }, [])

  return (
    <div className="pointer-events-auto absolute right-4 bottom-4 bg-white rounded-2xl shadow-lg p-4 w-[180px] flex flex-col gap-2.5 border border-gray-100 max-sm:hidden">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Live Traffic</span>
      <div className="flex items-center justify-between text-xs font-medium text-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span>Airborne</span>
        </div>
        <span className="text-gray-400">{stats.airborneFlights}</span>
      </div>
      <div className="flex items-center justify-between text-xs font-medium text-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
          <span>On Ground</span>
        </div>
        <span className="text-gray-400">{stats.groundFlights}</span>
      </div>
      <div className="flex items-center justify-between text-xs font-medium text-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
          <span>Total</span>
        </div>
        <span className="text-gray-400">{stats.totalFlights}</span>
      </div>
    </div>
  )
}
