'use client'

import { Plus, Minus, Crosshair, Maximize } from 'lucide-react'

export default function MapControls() {
  return (
    <div className="pointer-events-auto absolute right-4 top-4 flex flex-col shadow-md rounded-lg bg-white overflow-hidden border border-gray-200 max-sm:hidden">
      <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
        <Plus className="h-4 w-4" />
      </button>
      <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-200">
        <Minus className="h-4 w-4" />
      </button>
      <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-200">
        <Crosshair className="h-4 w-4" />
      </button>
      <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-200">
        <Maximize className="h-4 w-4" />
      </button>
    </div>
  )
}
