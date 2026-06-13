'use client'

import { useMemo } from 'react'
import { useRealtimeFlights } from '@/app/hooks/use-realtime-flights'

export default function StatusLegend() {
  const { flights, status } = useRealtimeFlights()
  const stats = useMemo(() => {
    const visibleFlights = flights.filter(
      (flight) => typeof flight.latitude === 'number' && typeof flight.longitude === 'number',
    )
    const groundFlights = visibleFlights.filter((flight) => flight.onGround).length
    return {
      totalFlights: visibleFlights.length,
      airborneFlights: visibleFlights.length - groundFlights,
      groundFlights,
    }
  }, [flights])

  return (
    <div className="pointer-events-auto absolute right-4 bottom-4 bg-white rounded-2xl shadow-lg p-4 w-[180px] flex flex-col gap-2.5 border border-gray-100 max-sm:hidden">
      <span className={`text-xs font-semibold uppercase tracking-wide mb-1 ${status?.stale ? 'text-amber-600' : 'text-gray-500'}`}>
        {status?.stale ? 'Cached Traffic' : 'Live Traffic'}
      </span>
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
