'use client'

import { Plane, Building2, Navigation, Clock, AlertTriangle, XCircle } from 'lucide-react'

interface StatItem {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  value: string
  label: string
  change: string
  changeColor: string
}

const stats: StatItem[] = [
  {
    icon: <Plane className="h-5 w-5" />,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    value: '2,847',
    label: 'Total Flights',
    change: '+12.5%',
    changeColor: 'text-emerald-600',
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    value: '156',
    label: 'Airports',
    change: '+3 this month',
    changeColor: 'text-emerald-600',
  },
  {
    icon: <Navigation className="h-5 w-5" />,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    value: '48',
    label: 'Airlines',
    change: '+2 new',
    changeColor: 'text-emerald-600',
  },
  {
    icon: <Clock className="h-5 w-5" />,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    value: '89.2%',
    label: 'On Time',
    change: '+2.1%',
    changeColor: 'text-emerald-600',
  },
  {
    icon: <AlertTriangle className="h-5 w-5" />,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    value: '156',
    label: 'Delayed',
    change: '-8.3%',
    changeColor: 'text-emerald-600',
  },
  {
    icon: <XCircle className="h-5 w-5" />,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    value: '12',
    label: 'Cancelled',
    change: '-25%',
    changeColor: 'text-emerald-600',
  },
]

export default function FooterStats() {
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
