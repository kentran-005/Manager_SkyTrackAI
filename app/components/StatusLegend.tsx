'use client'

export default function StatusLegend() {
  return (
    <div className="pointer-events-auto absolute right-4 bottom-4 bg-white rounded-2xl shadow-lg p-4 w-[180px] flex flex-col gap-2.5 border border-gray-100 max-sm:hidden">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</span>
      <div className="flex items-center justify-between text-xs font-medium text-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>On Time</span>
        </div>
        <span className="text-gray-400">2,540</span>
      </div>
      <div className="flex items-center justify-between text-xs font-medium text-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Delayed</span>
        </div>
        <span className="text-gray-400">156</span>
      </div>
      <div className="flex items-center justify-between text-xs font-medium text-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span>Cancelled</span>
        </div>
        <span className="text-gray-400">12</span>
      </div>
    </div>
  )
}
