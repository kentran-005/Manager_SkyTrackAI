'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Checkbox } from '../components/ui/checkbox'
import { Slider } from '../components/ui/slider'

export default function SearchFilterPanel() {
  const [altitudeRange, setAltitudeRange] = useState<number[]>([0, 40000])

  return (
    <div className="pointer-events-auto absolute left-4 top-4 bottom-4 w-[320px] bg-white rounded-2xl shadow-xl flex flex-col p-5 overflow-y-auto max-lg:hidden">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search flights, airports..."
          className="w-full bg-[#f8fafc] border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
        />
      </div>

      {/* Flight Type Filter */}
      <div className="flex flex-col gap-3 mt-6">
        <span className="text-sm font-semibold text-gray-700">Flight Type</span>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox defaultChecked className="accent-[#0066ff] data-[state=checked]:bg-[#0066ff] data-[state=checked]:border-[#0066ff]" />
          <span className="text-sm text-gray-600">Domestic</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox className="accent-[#0066ff] data-[state=checked]:bg-[#0066ff] data-[state=checked]:border-[#0066ff]" />
          <span className="text-sm text-gray-600">International</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox className="accent-[#0066ff] data-[state=checked]:bg-[#0066ff] data-[state=checked]:border-[#0066ff]" />
          <span className="text-sm text-gray-600">All Flights</span>
        </label>
      </div>

      {/* Status Filter */}
      <div className="flex flex-col gap-3 mt-6">
        <span className="text-sm font-semibold text-gray-700">Status</span>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox defaultChecked className="accent-[#0066ff] data-[state=checked]:bg-[#0066ff] data-[state=checked]:border-[#0066ff]" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-sm text-gray-600">On Time</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox className="accent-[#0066ff] data-[state=checked]:bg-[#0066ff] data-[state=checked]:border-[#0066ff]" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          <span className="text-sm text-gray-600">Delayed</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox className="accent-[#0066ff] data-[state=checked]:bg-[#0066ff] data-[state=checked]:border-[#0066ff]" />
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
          <span className="text-sm text-gray-600">Cancelled</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox className="accent-[#0066ff] data-[state=checked]:bg-[#0066ff] data-[state=checked]:border-[#0066ff]" />
          <span className="text-sm text-gray-600">All Status</span>
        </label>
      </div>

      {/* Airline Filter */}
      <div className="flex flex-col gap-3 mt-6">
        <span className="text-sm font-semibold text-gray-700">Airline</span>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox className="accent-[#0066ff] data-[state=checked]:bg-[#0066ff] data-[state=checked]:border-[#0066ff]" />
          <span className="text-sm text-gray-600">Vietnam Airlines</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox className="accent-[#0066ff] data-[state=checked]:bg-[#0066ff] data-[state=checked]:border-[#0066ff]" />
          <span className="text-sm text-gray-600">Vietjet Air</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox className="accent-[#0066ff] data-[state=checked]:bg-[#0066ff] data-[state=checked]:border-[#0066ff]" />
          <span className="text-sm text-gray-600">Bamboo Airways</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox className="accent-[#0066ff] data-[state=checked]:bg-[#0066ff] data-[state=checked]:border-[#0066ff]" />
          <span className="text-sm text-gray-600">All Airlines</span>
        </label>
      </div>

      {/* Altitude Range */}
      <div className="flex flex-col gap-3 mt-6">
        <span className="text-sm font-semibold text-gray-700">Altitude Range</span>
        <Slider
          min={0}
          max={40000}
          step={1000}
          value={altitudeRange}
          onValueChange={setAltitudeRange}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>{altitudeRange[0].toLocaleString()} ft</span>
          <span>{altitudeRange[1].toLocaleString()} ft</span>
        </div>
      </div>
    </div>
  )
}
