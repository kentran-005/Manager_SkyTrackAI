'use client'

import { useEffect, useState } from 'react'
import { Plane, Building2, Navigation, Clock, AlertTriangle, XCircle } from 'lucide-react'
import api from '@/lib/axios'

interface StatItem {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  value: string
  label: string
  change: string
  changeColor: string
}

export default function FooterStats() {
  const [stats, setStats] = useState<StatItem[]>([
    {
      icon: <Plane className="h-5 w-5" />,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      value: '...',
      label: 'Total Flights',
      change: 'From backend',
      changeColor: 'text-slate-500',
    },
    {
      icon: <Building2 className="h-5 w-5" />,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      value: '...',
      label: 'Airports',
      change: 'From backend',
      changeColor: 'text-slate-500',
    },
    {
      icon: <Navigation className="h-5 w-5" />,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      value: '...',
      label: 'Airlines',
      change: 'From backend',
      changeColor: 'text-slate-500',
    },
    {
      icon: <Clock className="h-5 w-5" />,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      value: '...',
      label: 'Passengers',
      change: 'From backend',
      changeColor: 'text-slate-500',
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      value: '...',
      label: 'Delayed',
      change: 'From backend',
      changeColor: 'text-slate-500',
    },
    {
      icon: <XCircle className="h-5 w-5" />,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      value: 'N/A',
      label: 'Cancelled',
      change: 'Not provided',
      changeColor: 'text-slate-500',
    },
  ])

  useEffect(() => {
    let mounted = true

    async function loadStats() {
      try {
        const res = await api.get('/api/dashboard/stats')
        const data = res.data || {}
        if (!mounted) return

        setStats((current) => [
          { ...current[0], value: String(data.totalFlights ?? 0) },
          { ...current[1], value: String(data.totalAirports ?? 0) },
          { ...current[2], value: String(data.totalAirlines ?? 0) },
          { ...current[3], value: String(data.totalPassengers ?? 0) },
          { ...current[4], value: String(data.delayedFlights ?? 0) },
          current[5],
        ])
      } catch {
        if (!mounted) return
        setStats((current) => current.map((item) => ({ ...item, value: item.value === 'N/A' ? 'N/A' : '0' })))
      }
    }

    loadStats()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <footer className="w-full bg-[#f8fafc] px-8 py-4 border-t border-gray-200 z-50 max-sm:px-4">
      <div className="grid grid-cols-6 w-full gap-4 max-lg:grid-cols-3 max-sm:grid-cols-2">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${stat.iconBg} ${stat.iconColor}`}>
              {stat.icon}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-2xl font-bold text-[#0f172a] max-sm:text-lg">{stat.value}</span>
              <span className="text-xs text-gray-400 font-medium">{stat.label}</span>
              <span className={`text-[11px] font-semibold ${stat.changeColor}`}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>
    </footer>
  )
}
