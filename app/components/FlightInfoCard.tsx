'use client'

import { Plane, X } from 'lucide-react'

// Interface cho dữ liệu thô truyền từ MapView vào (khi click vào máy bay)
interface RealtimeFlightInfo {
  icao24?: string
  callsign?: string
  originCountry?: string
  longitude?: number
  latitude?: number
  altitude?: number
  velocity?: number
  heading?: number
  onGround?: boolean
}

// Interface cho dữ liệu đã được map để hiển thị đẹp
interface FlightInfo {
  code: string
  airlineCode: string
  airlineName: string
  fromCode: string
  fromCity: string
  toCode: string
  toCity: string
  departure: string
  arrival: string
  aircraft: string
  gate: string
  altitude: string
  speed: string
  status: string
}

function formatAltitude(value?: number) {
  if (typeof value !== 'number') return 'N/A'
  return `${Math.round(value * 3.28084).toLocaleString()} ft`
}

function formatSpeed(value?: number) {
  if (typeof value !== 'number') return 'N/A'
  return `${Math.round(value * 1.94384).toLocaleString()} kt`
}

function mapFlightInfo(f: RealtimeFlightInfo): FlightInfo {
  const callsign = f.callsign?.trim() || f.icao24 || 'Unknown'

  return {
    code: callsign,
    airlineCode: callsign.slice(0, 2).toUpperCase(),
    airlineName: f.originCountry || 'OpenSky aircraft',
    fromCode: 'LIVE',
    fromCity: 'Position',
    toCode: f.onGround ? 'GND' : 'AIR',
    toCity: f.onGround ? 'On ground' : 'Airborne',
    departure: typeof f.latitude === 'number' ? f.latitude.toFixed(3) : 'N/A',
    arrival: typeof f.longitude === 'number' ? f.longitude.toFixed(3) : 'N/A',
    aircraft: f.icao24 || 'N/A',
    gate: typeof f.heading === 'number' ? `${Math.round(f.heading)} deg` : 'N/A',
    altitude: formatAltitude(f.altitude),
    speed: formatSpeed(f.velocity),
    status: f.onGround ? 'On Ground' : 'Airborne',
  }
}

// Props component nhận vào
interface FlightInfoCardProps {
  flight: RealtimeFlightInfo | null
  onClose: () => void
}

export default function FlightInfoCard({ flight, onClose }: FlightInfoCardProps) {
  // Nếu không có chuyến bay nào được chọn thì ẩn đi
  if (!flight) return null

  // Map dữ liệu thô sang dữ liệu hiển thị
  const mappedFlight = mapFlightInfo(flight)

  return (
    // Đổi vị trí cho hợp lý: góc phải trên, thêm animation slide-in
    <div className="pointer-events-auto absolute right-4 top-4 w-[320px] bg-white rounded-2xl shadow-2xl p-5 flex flex-col gap-4 border border-gray-100 animate-slide-in z-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
            <span className="text-red-600 text-xs font-bold">{mappedFlight.airlineCode}</span>
          </div>
          <span className="font-bold text-base text-[#0f172a]">{mappedFlight.code}</span>
          <span className="text-xs text-gray-400">{mappedFlight.airlineName}</span>
        </div>
        {/* Gắn sự kiện onClose cho nút X */}
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Flight Route */}
      <div className="flex items-center justify-between my-2">
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg text-[#0f172a]">{mappedFlight.fromCode}</span>
          <span className="text-xs text-gray-400">{mappedFlight.fromCity}</span>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="flex-1 h-px bg-gray-200" />
          <Plane className="h-4 w-4 text-blue-600 mx-2" />
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg text-[#0f172a]">{mappedFlight.toCode}</span>
          <span className="text-xs text-gray-400">{mappedFlight.toCity}</span>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-2 gap-y-3 text-sm">
        <div>
          <span className="text-gray-400 text-xs">Latitude</span>
          <p className="font-medium text-[#0f172a]">{mappedFlight.departure}</p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">Longitude</span>
          <p className="font-medium text-[#0f172a]">{mappedFlight.arrival}</p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">ICAO24</span>
          <p className="font-medium text-[#0f172a]">{mappedFlight.aircraft}</p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">Heading</span>
          <p className="font-medium text-[#0f172a]">{mappedFlight.gate}</p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">Altitude</span>
          <p className="font-medium text-[#0f172a]">{mappedFlight.altitude}</p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">Speed</span>
          <p className="font-medium text-[#0f172a]">{mappedFlight.speed}</p>
        </div>
        <div className="col-span-2">
          <span className="text-gray-400 text-xs">Status</span>
          <div className="mt-1">
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
              mappedFlight.status === 'Airborne' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {mappedFlight.status}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>{mappedFlight.fromCode}</span>
          <span>{mappedFlight.toCode}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#0066ff] rounded-full transition-all duration-500" style={{ width: mappedFlight.status === 'Airborne' ? '75%' : '20%' }} />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>Lat {mappedFlight.departure}</span>
          <span>Lng {mappedFlight.arrival}</span>
        </div>
      </div>
    </div>
  )
}