'use client'

import { Plus, Minus, Crosshair, Maximize } from 'lucide-react'

type MapControlAction = 'zoom-in' | 'zoom-out' | 'focus-vietnam' | 'fullscreen'

function triggerMapControl(action: MapControlAction) {
  window.dispatchEvent(new CustomEvent('skytrack-map-control', { detail: action }))
}

export default function MapControls() {
  return (
    <div className="pointer-events-auto absolute right-4 top-4 flex flex-col shadow-md rounded-lg bg-white overflow-hidden border border-gray-200 max-sm:hidden">
      <button
        type="button"
        aria-label="Zoom in"
        title="Zoom in"
        onClick={() => triggerMapControl('zoom-in')}
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <Plus className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Zoom out"
        title="Zoom out"
        onClick={() => triggerMapControl('zoom-out')}
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-200"
      >
        <Minus className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Focus Vietnam airspace"
        title="Focus Vietnam airspace"
        onClick={() => triggerMapControl('focus-vietnam')}
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-200"
      >
        <Crosshair className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Toggle fullscreen"
        title="Toggle fullscreen"
        onClick={() => triggerMapControl('fullscreen')}
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-200"
      >
        <Maximize className="h-4 w-4" />
      </button>
    </div>
  )
}
