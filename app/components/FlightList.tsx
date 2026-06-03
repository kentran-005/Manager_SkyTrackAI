'use client';

interface Flight {
  id: string | number;
  flightNumber: string;
  airline?: { name: string; code: string; logo?: string };
  origin: string;
  originName?: string;
  destination: string;
  destinationName?: string;
  altitude: number;
  speed: number;
  heading: number;
  status: string;
  aircraft?: string;
  registration?: string;
  distance?: string;
  [key: string]: any;
}

interface FlightListProps {
  flights: Flight[];
  selectedId: string | number | null;
  onSelect: (flight: Flight) => void;
}

export default function FlightList({ flights, selectedId, onSelect }: FlightListProps) {
  const getStatusColor = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes('DEL')) return 'text-amber-400';
    if (s.includes('CANCEL')) return 'text-red-400';
    if (s.includes('LAND')) return 'text-cyan-400';
    return 'text-emerald-400';
  };

  const getStatusBg = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes('DEL')) return 'bg-amber-400';
    if (s.includes('CANCEL')) return 'bg-red-400';
    if (s.includes('LAND')) return 'bg-cyan-400';
    return 'bg-emerald-400';
  };

  return (
    <div className="flex flex-col">
      {flights.map((flight) => {
        const isSelected = selectedId === flight.id;
        const isVN = flight.flightNumber.startsWith('VN');
        const isVJ = flight.flightNumber.startsWith('VJ');
        const isQH = flight.flightNumber.startsWith('QH');

        return (
          <div
            key={flight.id}
            onClick={() => onSelect(flight)}
            className={`px-4 py-3 cursor-pointer transition-all duration-150 flex items-center justify-between border-b border-[#161f30]/40 group ${
              isSelected
                ? 'bg-[#141e33] border-l-2 border-l-blue-500'
                : 'bg-transparent hover:bg-[#0f1628] border-l-2 border-l-transparent'
            }`}
          >
            {/* Left: Airline logo + Flight info */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                isSelected
                  ? 'bg-blue-500/15 border-blue-500/30'
                  : 'bg-[#182235] border-[#24344f] group-hover:border-[#2d4060]'
              }`}>
                {isVN ? (
                  <span className="text-[#eab308] text-sm">⚜</span>
                ) : isVJ ? (
                  <span className="text-orange-400 text-[10px] font-bold font-mono">VJ</span>
                ) : isQH ? (
                  <span className="text-teal-400 text-[10px] font-bold font-mono">QH</span>
                ) : (
                  <span className="text-blue-400 text-[10px] font-bold font-mono">{flight.flightNumber.substring(0, 2)}</span>
                )}
              </div>
              <div>
                <div className="font-bold text-xs text-white tracking-wide">{flight.flightNumber}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {flight.origin} → {flight.destination}
                </div>
              </div>
            </div>

            {/* Right: Altitude, Speed, Status */}
            <div className="flex items-center gap-4 text-right">
              <div className="text-[11px] font-mono leading-tight">
                <div className="text-slate-300">{flight.altitude.toLocaleString()} ft</div>
                <div className="text-slate-600 text-[10px] mt-0.5">{flight.speed} km/h</div>
              </div>
              <div className="flex items-center gap-1.5 min-w-[70px] justify-end">
                <span className={`w-1.5 h-1.5 rounded-full ${getStatusBg(flight.status)}`} />
                <span className={`text-[10px] font-medium ${getStatusColor(flight.status)}`}>
                  {flight.status}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
