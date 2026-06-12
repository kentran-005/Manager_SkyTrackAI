'use client'

import { type Dispatch, type FormEvent, type SetStateAction, useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Checkbox } from '../components/ui/checkbox'
import { Slider } from '../components/ui/slider'
import api from '@/lib/axios'

interface Airline {
  id?: number
  code?: string
  name?: string
}

interface LiveMapFilters {
  query: string
  flightTypes: string[]
  statuses: string[]
  airlines: string[]
  altitudeRange: number[]
}

const defaultFlightTypes = ['domestic']
const defaultStatuses = ['airborne']

function isChecked(value: boolean | 'indeterminate') {
  return value === true
}

export default function SearchFilterPanel() {
  const [altitudeRange, setAltitudeRange] = useState<number[]>([0, 40000])
  const [query, setQuery] = useState('')
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [flightTypes, setFlightTypes] = useState<string[]>(defaultFlightTypes)
  const [statuses, setStatuses] = useState<string[]>(defaultStatuses)
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([])

  useEffect(() => {
    let mounted = true

    async function loadAirlines() {
      try {
        const res = await api.get('/api/airlines')
        if (mounted) setAirlines(Array.isArray(res.data) ? res.data : [])
      } catch {
        if (mounted) setAirlines([])
      }
    }

    loadAirlines()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const filters: LiveMapFilters = {
      query,
      flightTypes,
      statuses,
      airlines: selectedAirlines,
      altitudeRange,
    }

    window.dispatchEvent(new CustomEvent('skytrack-live-map-filter', { detail: filters }))
  }, [altitudeRange, flightTypes, query, selectedAirlines, statuses])

  function toggleValue(value: string, checked: boolean, setter: Dispatch<SetStateAction<string[]>>) {
    setter((current) => {
      if (checked) return Array.from(new Set([...current, value]))
      return current.filter((item) => item !== value)
    })
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    window.dispatchEvent(new CustomEvent('skytrack-live-map-focus-search'))
  }

  return (
    <div className="pointer-events-auto absolute left-4 top-4 bottom-4 w-[320px] bg-white rounded-2xl shadow-xl flex flex-col p-5 overflow-y-auto max-lg:hidden">
      {/* Search Input */}
      <form className="relative" onSubmit={handleSearch}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search flights, airports..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full bg-[#f8fafc] border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
        />
      </form>

      {/* Flight Type Filter */}
      <div className="flex flex-col gap-3 mt-6">
        <span className="text-sm font-semibold text-gray-700">Flight Type</span>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox
            checked={flightTypes.includes('domestic')}
            onCheckedChange={(checked) => toggleValue('domestic', isChecked(checked), setFlightTypes)}
            className="accent-[#0066ff] data-[state=checked]:bg-[#0066ff] data-[state=checked]:border-[#0066ff]"
          />
          <span className="text-sm text-gray-600">Domestic</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox
            checked={flightTypes.includes('international')}
            onCheckedChange={(checked) => toggleValue('international', isChecked(checked), setFlightTypes)}
            className="accent-[#0066ff] data-[state=checked]:bg-[#0066ff] data-[state=checked]:border-[#0066ff]"
          />
          <span className="text-sm text-gray-600">International</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox
            checked={flightTypes.length === 0}
            onCheckedChange={(checked) => {
              if (isChecked(checked)) setFlightTypes([])
            }}
            className="accent-[#0066ff] data-[state=checked]:bg-[#0066ff] data-[state=checked]:border-[#0066ff]"
          />
          <span className="text-sm text-gray-600">All Flights</span>
        </label>
      </div>

      {/* Status Filter */}
      <div className="flex flex-col gap-3 mt-6">
        <span className="text-sm font-semibold text-gray-700">Status</span>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox
            checked={statuses.includes('airborne')}
            onCheckedChange={(checked) => toggleValue('airborne', isChecked(checked), setStatuses)}
            className="accent-[#0066ff] data-[state=checked]:bg-[#0066ff] data-[state=checked]:border-[#0066ff]"
          />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-sm text-gray-600">Airborne</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox
            checked={statuses.includes('ground')}
            onCheckedChange={(checked) => toggleValue('ground', isChecked(checked), setStatuses)}
            className="accent-[#0066ff] data-[state=checked]:bg-[#0066ff] data-[state=checked]:border-[#0066ff]"
          />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0" />
          <span className="text-sm text-gray-600">On Ground</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox
            checked={statuses.length === 0}
            onCheckedChange={(checked) => {
              if (isChecked(checked)) setStatuses([])
            }}
            className="accent-[#0066ff] data-[state=checked]:bg-[#0066ff] data-[state=checked]:border-[#0066ff]"
          />
          <span className="text-sm text-gray-600">All Status</span>
        </label>
      </div>

      {/* Airline Filter */}
      <div className="flex flex-col gap-3 mt-6">
        <span className="text-sm font-semibold text-gray-700">Airline</span>
        {airlines.length > 0 ? (
          airlines.slice(0, 6).map((airline) => (
            <label key={airline.id ?? airline.code ?? airline.name} className="flex items-center gap-2.5 cursor-pointer">
              <Checkbox
                checked={Boolean(airline.code && selectedAirlines.includes(airline.code))}
                onCheckedChange={(checked) => {
                  if (airline.code) toggleValue(airline.code, isChecked(checked), setSelectedAirlines)
                }}
                className="accent-[#0066ff] data-[state=checked]:bg-[#0066ff] data-[state=checked]:border-[#0066ff]"
              />
              <span className="text-sm text-gray-600">{airline.name || airline.code || 'Unknown Airline'}</span>
            </label>
          ))
        ) : (
          <span className="text-sm text-gray-400">No airlines loaded</span>
        )}
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox
            checked={selectedAirlines.length === 0}
            onCheckedChange={(checked) => {
              if (isChecked(checked)) setSelectedAirlines([])
            }}
            className="accent-[#0066ff] data-[state=checked]:bg-[#0066ff] data-[state=checked]:border-[#0066ff]"
          />
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
