'use client';

import { Star, Bell, Wind, Droplets, Eye, Navigation } from 'lucide-react';

interface Flight {
  id: string | number;
  flightNumber: string;
  airline?: { name: string; code: string; logo?: string };
  origin: string;
  originName?: string;
  destination: string;
  destinationName?: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  status: string;
  aircraft?: string;
  registration?: string;
  distance?: string;
  [key: string]: any;
}

interface FlightDetailsProps {
  flight: Flight;
}

export default function FlightDetails({ flight }: FlightDetailsProps) {
  const isVN = flight.flightNumber?.startsWith('VN');
  const isVJ = flight.flightNumber?.startsWith('VJ');
  const isQH = flight.flightNumber?.startsWith('QH');

  const getStatusStyle = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes('DEL')) return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400' };
    if (s.includes('CANCEL')) return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-400' };
    return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' };
  };

  const statusStyle = getStatusStyle(flight.status);

  const getHeadingDirection = (heading: number) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(heading / 45) % 8;
    return dirs[idx];
  };

  return (
    <div className="p-4 flex flex-col gap-4 h-full">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 bg-[#182235] border border-[#24344f] rounded-lg flex items-center justify-center">
            {isVN ? (
              <span className="text-[#eab308] text-lg">⚜</span>
            ) : isVJ ? (
              <span className="text-orange-400 text-xs font-bold font-mono">VJ</span>
            ) : isQH ? (
              <span className="text-teal-400 text-xs font-bold font-mono">QH</span>
            ) : (
              <span className="text-blue-400 text-sm">✈</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">{flight.flightNumber}</h2>
              <Star className="w-3.5 h-3.5 text-slate-600 cursor-pointer hover:text-yellow-500 transition-colors" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">{flight.airline?.name || 'Commercial Airline'}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold ${statusStyle.bg} ${statusStyle.text} rounded-md border ${statusStyle.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
          {flight.status}
        </span>
      </div>

      {/* Route: SGN -> HAN */}
      <div className="flex justify-between items-center px-2 py-3 bg-[#0d1424] rounded-lg border border-[#161f30]">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-white font-mono tracking-wider">{flight.origin}</span>
          <span className="text-[10px] text-slate-500 truncate max-w-[110px]">{flight.originName || 'Departure'}</span>
        </div>
        
        <div className="flex-1 flex items-center justify-center px-4 relative">
          <div className="w-full border-t border-dashed border-[#24344f] relative flex items-center justify-center">
            <svg
              className="absolute w-4 h-4 text-blue-400"
              style={{ transform: `rotate(${flight.heading || 0}deg)` }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5L21 16z"/>
            </svg>
          </div>
        </div>

        <div className="flex flex-col text-right">
          <span className="text-2xl font-bold text-white font-mono tracking-wider">{flight.destination}</span>
          <span className="text-[10px] text-slate-500 truncate max-w-[110px]">{flight.destinationName || 'Destination'}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex justify-between items-center text-[11px] font-mono border-b border-[#161f30] pb-4">
        <div>
          <div className="text-white font-bold">09:15</div>
          <div className="text-[10px] text-slate-500 mt-0.5">May 17, 2024</div>
          <div className="text-[10px] text-slate-500">Scheduled 09:15</div>
        </div>
        <div className="text-center text-[10px] text-blue-400 font-sans border border-blue-500/20 bg-blue-500/5 px-3 py-1 rounded-full">
          1h 45m In Air
        </div>
        <div className="text-right">
          <div className="text-white font-bold">11:20</div>
          <div className="text-[10px] text-slate-500 mt-0.5">May 17, 2024</div>
          <div className="text-[10px] text-slate-500">Scheduled 11:30</div>
        </div>
      </div>

      {/* Flight Specifications Grid */}
      <div className="grid grid-cols-2 border border-[#161f30] rounded-lg overflow-hidden bg-[#0d1424] text-[11px] font-mono divide-y divide-x divide-[#161f30]">
        {[
          { label: 'Aircraft', value: flight.aircraft || 'Boeing 787-9' },
          { label: 'Registration', value: flight.registration || 'VN-A879' },
          { label: 'Altitude', value: `${(flight.altitude || 36000).toLocaleString()} ft` },
          { label: 'Speed', value: `${flight.speed || 872} km/h` },
          { label: 'Heading', value: `${flight.heading || 42}° ${getHeadingDirection(flight.heading || 42)}` },
          { label: 'Distance', value: flight.distance || '1,123 km' },
          { label: 'From', value: `${flight.origin} / VVTS` },
          { label: 'To', value: `${flight.destination} / VVNB` },
        ].map((item, idx) => (
          <div key={idx} className="p-2.5 flex flex-col gap-0.5 bg-[#0b101d] hover:bg-[#0f1628] transition-colors">
            <span className="text-slate-500 text-[10px] font-sans uppercase tracking-wide">{item.label}</span>
            <span className="font-medium text-slate-200">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Weather at Destination */}
      <div className="border border-[#161f30] bg-[#0c1221] p-3 rounded-lg flex flex-col gap-2">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Weather at Destination</span>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌧️</span>
            <div>
              <div className="text-base font-bold text-white font-mono">27°C</div>
              <div className="text-[10px] text-slate-400 font-sans">Rain</div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-400 space-y-1 text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <Wind className="w-3 h-3" />
              <span>Wind: <span className="text-white">15 km/h</span></span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <Droplets className="w-3 h-3" />
              <span>Humidity: <span className="text-white">78%</span></span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <Eye className="w-3 h-3" />
              <span>Visibility: <span className="text-white">10 km</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Follow Flight Button */}
      <button className="w-full mt-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-950/40 transition-all active:scale-[0.98]">
        <Bell className="w-3.5 h-3.5" />
        Follow This Flight
      </button>
    </div>
  );
}
