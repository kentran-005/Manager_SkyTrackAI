'use client'

import { Plane, X } from 'lucide-react'

export default function FlightInfoCard() {
  return (
    <div className="pointer-events-auto absolute right-24 top-24 w-[300px] bg-white rounded-2xl shadow-2xl p-5 flex flex-col gap-4 border border-gray-100 max-md:hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
            <span className="text-red-600 text-xs font-bold">VN</span>
          </div>
          <span className="font-bold text-base text-[#0f172a]">VN220</span>
          <span className="text-xs text-gray-400">Vietnam Airlines</span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Flight Route */}
      <div className="flex items-center justify-between my-2">
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg text-[#0f172a]">SGN</span>
          <span className="text-xs text-gray-400">Ho Chi Minh</span>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="flex-1 h-px bg-gray-200" />
          <Plane className="h-4 w-4 text-blue-600 mx-2" />
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg text-[#0f172a]">HAN</span>
          <span className="text-xs text-gray-400">Hanoi</span>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-2 gap-y-3 text-sm">
        <div>
          <span className="text-gray-400 text-xs">Departure</span>
          <p className="font-medium text-[#0f172a]">08:30</p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">Arrival</span>
          <p className="font-medium text-[#0f172a]">10:45</p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">Aircraft</span>
          <p className="font-medium text-[#0f172a]">A321</p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">Gate</span>
          <p className="font-medium text-[#0f172a]">B12</p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">Altitude</span>
          <p className="font-medium text-[#0f172a]">35,000 ft</p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">Speed</span>
          <p className="font-medium text-[#0f172a]">850 km/h</p>
        </div>
        <div className="col-span-2">
          <span className="text-gray-400 text-xs">Status</span>
          <div className="mt-1">
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">
              On Time
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>SGN</span>
          <span>HAN</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#0066ff] rounded-full" style={{ width: '65%' }} />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>Departed 08:30</span>
          <span>ETA 10:45</span>
        </div>
      </div>
    </div>
  )
}
