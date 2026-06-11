'use client';

import { useState } from 'react';
import {
  Search,
  Plane,
  Clock,
  XCircle,
  CheckCircle,
  TrendingUp,
  ChevronDown,
  Eye,
  Bookmark,
  Calendar,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type FlightStatus = 'on-time' | 'delayed' | 'cancelled';

interface Flight {
  id: string;
  code: string;
  airlineName: string;
  airlineColor: string;
  airlineBadge: string;
  fromCode: string;
  fromCity: string;
  toCode: string;
  toCity: string;
  departure: string;
  arrival: string;
  status: FlightStatus;
  statusLabel: string;
  statusDetail: string;
  aircraft: string;
}

// ─────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────
const POPULAR_SEARCHES = ['VN220', 'VJ123', 'QH210', 'BL789', 'VN192', 'AK524'];

const FLIGHTS: Flight[] = [
  {
    id: '1',
    code: 'VN220',
    airlineName: 'Vietnam Airlines',
    airlineColor: '#b8860b',
    airlineBadge: 'VN',
    fromCode: 'SGN',
    fromCity: 'Ho Chi Minh City',
    toCode: 'HAN',
    toCity: 'Hanoi',
    departure: '10:30',
    arrival: '12:45',
    status: 'on-time',
    statusLabel: 'On Time',
    statusDetail: 'On schedule',
    aircraft: 'Boeing 787-9',
  },
  {
    id: '2',
    code: 'VJ123',
    airlineName: 'VietJet Air',
    airlineColor: '#e31837',
    airlineBadge: 'VJ',
    fromCode: 'SGN',
    fromCity: 'Ho Chi Minh City',
    toCode: 'DAD',
    toCity: 'Da Nang',
    departure: '11:15',
    arrival: '12:30',
    status: 'delayed',
    statusLabel: 'Delayed',
    statusDetail: 'Delayed 35m',
    aircraft: 'Airbus A321',
  },
  {
    id: '3',
    code: 'QH210',
    airlineName: 'Bamboo Airways',
    airlineColor: '#007a3d',
    airlineBadge: 'QH',
    fromCode: 'HAN',
    fromCity: 'Hanoi',
    toCode: 'CXR',
    toCity: 'Nha Trang',
    departure: '14:00',
    arrival: '15:45',
    status: 'on-time',
    statusLabel: 'On Time',
    statusDetail: 'On schedule',
    aircraft: 'Airbus A320',
  },
  {
    id: '4',
    code: 'BL789',
    airlineName: 'Pacific Airlines',
    airlineColor: '#0055a5',
    airlineBadge: 'BL',
    fromCode: 'DAD',
    fromCity: 'Da Nang',
    toCode: 'SGN',
    toCity: 'Ho Chi Minh City',
    departure: '15:20',
    arrival: '16:35',
    status: 'cancelled',
    statusLabel: 'Cancelled',
    statusDetail: 'Cancelled',
    aircraft: 'Airbus A321',
  },
  {
    id: '5',
    code: 'VN182',
    airlineName: 'Vietnam Airlines',
    airlineColor: '#b8860b',
    airlineBadge: 'VN',
    fromCode: 'SGN',
    fromCity: 'Ho Chi Minh City',
    toCode: 'PQC',
    toCity: 'Phu Quoc',
    departure: '16:45',
    arrival: '17:45',
    status: 'on-time',
    statusLabel: 'On Time',
    statusDetail: 'On schedule',
    aircraft: 'Airbus A321',
  },
  {
    id: '6',
    code: 'VN192',
    airlineName: 'Vietnam Airlines',
    airlineColor: '#b8860b',
    airlineBadge: 'VN',
    fromCode: 'SGN',
    fromCity: 'Ho Chi Minh City',
    toCode: 'VII',
    toCity: 'Vinh',
    departure: '17:30',
    arrival: '19:10',
    status: 'on-time',
    statusLabel: 'On Time',
    statusDetail: 'On schedule',
    aircraft: 'Airbus A321',
  },
  {
    id: '7',
    code: 'AK524',
    airlineName: 'AirAsia',
    airlineColor: '#e31837',
    airlineBadge: 'AK',
    fromCode: 'SGN',
    fromCity: 'Ho Chi Minh City',
    toCode: 'KUL',
    toCity: 'Kuala Lumpur',
    departure: '18:05',
    arrival: '21:20',
    status: 'delayed',
    statusLabel: 'Delayed',
    statusDetail: 'Delayed 20m',
    aircraft: 'Airbus A320neo',
  },
  {
    id: '8',
    code: 'QH315',
    airlineName: 'Bamboo Airways',
    airlineColor: '#007a3d',
    airlineBadge: 'QH',
    fromCode: 'HAN',
    fromCity: 'Hanoi',
    toCode: 'SGN',
    toCity: 'Ho Chi Minh City',
    departure: '18:30',
    arrival: '20:45',
    status: 'on-time',
    statusLabel: 'On Time',
    statusDetail: 'On schedule',
    aircraft: 'Boeing 787-9',
  },
  {
    id: '9',
    code: 'VJ456',
    airlineName: 'VietJet Air',
    airlineColor: '#e31837',
    airlineBadge: 'VJ',
    fromCode: 'DAD',
    fromCity: 'Da Nang',
    toCode: 'HAN',
    toCity: 'Hanoi',
    departure: '19:15',
    arrival: '20:45',
    status: 'on-time',
    statusLabel: 'On Time',
    statusDetail: 'On schedule',
    aircraft: 'Airbus A321',
  },
  {
    id: '10',
    code: 'BL102',
    airlineName: 'Pacific Airlines',
    airlineColor: '#0055a5',
    airlineBadge: 'BL',
    fromCode: 'SGN',
    fromCity: 'Ho Chi Minh City',
    toCode: 'CAN',
    toCity: 'Guangzhou',
    departure: '20:00',
    arrival: '23:30',
    status: 'cancelled',
    statusLabel: 'Cancelled',
    statusDetail: 'Cancelled',
    aircraft: 'Airbus A321',
  },
];

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/** Mini sparkline bar chart for the summary cards */
function MiniBarChart({ color, bars }: { color: string; bars: number[] }) {
  const max = Math.max(...bars);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {bars.map((val, i) => (
        <div
          key={i}
          className="w-1.5 rounded-sm transition-all"
          style={{
            height: `${(val / max) * 100}%`,
            backgroundColor: color,
            opacity: i === bars.length - 1 ? 1 : 0.4 + (i / bars.length) * 0.5,
          }}
        />
      ))}
    </div>
  );
}

/** Progress bar for On Time card */
function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
      <div
        className="h-1.5 rounded-full transition-all"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  );
}

/** Status badge */
function StatusBadge({ status, label, detail }: { status: FlightStatus; label: string; detail: string }) {
  const styles: Record<FlightStatus, { dot: string; badge: string; detail: string }> = {
    'on-time': {
      dot: 'bg-emerald-500',
      badge: 'text-emerald-600 bg-emerald-50',
      detail: 'text-emerald-600',
    },
    delayed: {
      dot: 'bg-amber-500',
      badge: 'text-amber-600 bg-amber-50',
      detail: 'text-amber-600',
    },
    cancelled: {
      dot: 'bg-red-500',
      badge: 'text-red-600 bg-red-50',
      detail: 'text-red-600',
    },
  };

  const s = styles[status];

  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${s.badge}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {label}
      </span>
      <span className={`text-xs ${s.detail}`}>{detail}</span>
    </div>
  );
}

/** Airline logo badge */
function AirlineBadge({ badge, color }: { badge: string; color: string }) {
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
      style={{ backgroundColor: color }}
    >
      {badge}
    </div>
  );
}

/** Select dropdown (uncontrolled styling wrapper) */
function SelectDropdown({ options, value, onChange }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-sm text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-w-[130px]"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function SearchFlightPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAirline, setSelectedAirline] = useState('All Airlines');
  const [selectedAirport, setSelectedAirport] = useState('All Airports');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('Departure Time');

  const totalPages = 154;

  const handlePopularSearch = (tag: string) => {
    setSearchQuery(tag);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-6">

      {/* ── Page Header ──────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Flights</h1>
        <p className="text-sm text-gray-500 mt-0.5">Search and track real-time flight information</p>
      </div>

      {/* ── Search Panel ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        {/* Search bar + filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Text search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by flight code, airport or airline..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 placeholder-gray-400 transition-all"
            />
          </div>

          {/* Dropdowns */}
          <SelectDropdown
            options={['All Airlines', 'Vietnam Airlines', 'VietJet Air', 'Bamboo Airways', 'Pacific Airlines', 'AirAsia']}
            value={selectedAirline}
            onChange={setSelectedAirline}
          />
          <SelectDropdown
            options={['All Airports', 'SGN – Ho Chi Minh City', 'HAN – Hanoi', 'DAD – Da Nang', 'PQC – Phu Quoc', 'CXR – Nha Trang']}
            value={selectedAirport}
            onChange={setSelectedAirport}
          />
          <SelectDropdown
            options={['All Status', 'On Time', 'Delayed', 'Cancelled']}
            value={selectedStatus}
            onChange={setSelectedStatus}
          />

          {/* Search button */}
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-200 ml-auto">
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>

        {/* Popular searches */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Popular Searches:</span>
          {POPULAR_SEARCHES.map((tag) => (
            <button
              key={tag}
              onClick={() => handlePopularSearch(tag)}
              className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary Cards ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* Total Flights */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Flights</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">1,540</p>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-[11px] text-gray-400">Today</span>
                <span className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                  12.5%
                </span>
                <span className="text-[11px] text-gray-400">vs yesterday</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Plane className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-3">
            <MiniBarChart color="#3b82f6" bars={[60, 75, 55, 80, 70, 90, 85, 95, 88, 100]} />
          </div>
        </div>

        {/* On Time */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">On Time</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">1,235</p>
              <p className="text-[11px] text-gray-400 mt-1.5">80.2% of total flights</p>
              <ProgressBar value={80.2} color="#10b981" />
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Delayed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Delayed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">228</p>
              <p className="text-[11px] text-gray-400 mt-1.5">14.8% of total flights</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="mt-3">
            <MiniBarChart color="#f59e0b" bars={[30, 45, 25, 55, 40, 60, 35, 50, 42, 48]} />
          </div>
        </div>

        {/* Cancelled */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cancelled</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">77</p>
              <p className="text-[11px] text-gray-400 mt-1.5">5.0% of total flights</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <div className="mt-3">
            <MiniBarChart color="#ef4444" bars={[10, 18, 8, 22, 15, 25, 12, 20, 17, 16]} />
          </div>
        </div>
      </div>

      {/* ── Flights Table ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Table Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">All Flights</h2>
            <p className="text-xs text-gray-400 mt-0.5">Showing 10 of 1,540 flights</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Sort by */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2 pr-8 text-sm text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option>Departure Time</option>
                  <option>Arrival Time</option>
                  <option>Flight Code</option>
                  <option>Status</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Date picker display */}
            <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>01 Jun 2026</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/70">
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Flight</th>
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Route</th>
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Schedule</th>
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Airline</th>
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {FLIGHTS.map((flight) => (
                <tr key={flight.id} className="hover:bg-blue-50/30 transition-colors group">

                  {/* Flight code + airline */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <AirlineBadge badge={flight.airlineBadge} color={flight.airlineColor} />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{flight.code}</p>
                        <p className="text-xs text-gray-400">{flight.airlineName}</p>
                      </div>
                    </div>
                  </td>

                  {/* Route */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{flight.fromCode}</p>
                        <p className="text-xs text-gray-400">{flight.fromCity}</p>
                      </div>
                      <div className="flex items-center px-1">
                        <Plane className="w-4 h-4 text-blue-400 rotate-0" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{flight.toCode}</p>
                        <p className="text-xs text-gray-400">{flight.toCity}</p>
                      </div>
                    </div>
                  </td>

                  {/* Schedule */}
                  <td className="px-4 py-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{flight.departure}</span>
                        <span className="text-[10px] text-gray-400 font-medium">Departure</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-600">{flight.arrival}</span>
                        <span className="text-[10px] text-gray-400 font-medium">Arrival</span>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <StatusBadge
                      status={flight.status}
                      label={flight.statusLabel}
                      detail={flight.statusDetail}
                    />
                  </td>

                  {/* Airline + Aircraft */}
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-gray-800">{flight.airlineName}</p>
                    <p className="text-xs text-gray-400">{flight.aircraft}</p>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                        View Details
                      </button>
                      <button className="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50/40">
          <span className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-700">1</span> to{' '}
            <span className="font-semibold text-gray-700">10</span> of{' '}
            <span className="font-semibold text-gray-700">1,540</span> flights
          </span>

          <div className="flex items-center gap-1.5">
            {/* Prev */}
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Pages */}
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                  currentPage === p
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 border border-blue-600'
                    : 'border border-gray-200 text-gray-600 hover:bg-white hover:border-blue-300'
                }`}
              >
                {p}
              </button>
            ))}

            <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">...</span>

            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold border transition-all ${
                currentPage === totalPages
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-200 text-gray-600 hover:bg-white hover:border-blue-300'
              }`}
            >
              {totalPages}
            </button>

            {/* Next */}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Per page */}
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2 pr-8 text-sm text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
              <option>10 / page</option>
              <option>20 / page</option>
              <option>50 / page</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
