"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, ChevronDown, Calendar, Plus, Eye, Edit3, Trash2, ArrowRight
} from "lucide-react";
import api from "@/lib/axios";
import { mapBackendFlight, type BackendFlight } from "@/lib/skytrack-data";

export default function AdminFlightsPage() {
  const router = useRouter();
  const [flights, setFlights] = useState<BackendFlight[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadFlights() {
    try {
      const response = await api.get<BackendFlight[]>("/api/flights");
      setFlights(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load flights.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFlights();
  }, []);

  const visibleFlights = useMemo(() => {
    const query = search.trim().toLowerCase();
    return flights.filter((flight) => {
      const matchesSearch = !query || [
        flight.flightCode,
        flight.airline?.name,
        flight.departureAirport?.code,
        flight.arrivalAirport?.code,
      ].some((value) => value?.toLowerCase().includes(query));
      return matchesSearch && (statusFilter === "ALL" || flight.status === statusFilter);
    });
  }, [flights, search, statusFilter]);

  const stats = [
    { title: "Total Flights", count: flights.length, color: "bg-blue-50 text-blue-600" },
    { title: "On Time", count: flights.filter((flight) => ["ON_TIME", "SCHEDULED", "BOARDING"].includes(flight.status ?? "")).length, color: "bg-emerald-50 text-emerald-600" },
    { title: "Delayed", count: flights.filter((flight) => flight.status === "DELAYED").length, color: "bg-amber-50 text-amber-600" },
    { title: "Cancelled", count: flights.filter((flight) => flight.status === "CANCELLED").length, color: "bg-rose-50 text-rose-600" },
    { title: "Boarding", count: flights.filter((flight) => flight.status === "BOARDING").length, color: "bg-cyan-50 text-cyan-600" },
  ];

  async function updateStatus(flight: BackendFlight) {
    if (!flight.id) return;
    const status = window.prompt("Status: SCHEDULED, ON_TIME, BOARDING, DELAYED, CANCELLED", flight.status || "SCHEDULED");
    if (!status) return;
    try {
      await api.put(`/api/flights/${flight.id}`, { ...flight, status: status.toUpperCase() });
      await loadFlights();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update flight.");
    }
  }

  async function deleteFlight(flight: BackendFlight) {
    if (!flight.id || !window.confirm(`Delete ${flight.flightCode}?`)) return;
    try {
      await api.delete(`/api/flights/${flight.id}`);
      await loadFlights();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete flight.");
    }
  }

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-800 antialiased">

      {/* Vùng nội dung chính bên phải */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* ---------- HEADER ---------- */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Flights</h2>
            <p className="text-slate-500 text-sm mt-0.5">Manage all flights in the system</p>
          </div>
          <button onClick={() => setError("Use the complete flight form from the API workflow to create a flight with airline, airports and schedule.")} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-blue-500/10">
            <Plus size={16} /> Add Flight
          </button>
        </div>

        {/* ---------- FILTER TOOLBAR ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Thanh tìm kiếm */}
          <div className="relative col-span-1 md:col-span-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search flight code, route, airline..." 
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          
          {/* Lọc Trạng thái */}
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 outline-none">
            <option value="ALL">All Status</option><option>SCHEDULED</option><option>ON_TIME</option><option>BOARDING</option><option>DELAYED</option><option>CANCELLED</option>
          </select>

          {/* Lọc Hãng bay */}
          <button className="flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-slate-300 transition">
            <span>All Airlines</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {/* Chọn ngày */}
          <button className="flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-slate-300 transition">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              <span>Date</span>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
        </div>
        {error && <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>}

        {/* ---------- STATS CARDS ROW ---------- */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white border border-slate-100 p-4 rounded-xl flex items-center gap-4 shadow-2xs">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${stat.color}`}>
                ✈️
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{stat.title}</p>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">{stat.count}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ---------- DATA TABLE CONTAINER ---------- */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6 w-16 text-center">ID</th>
                  <th className="py-4 px-4">Flight Code</th>
                  <th className="py-4 px-6">Airline</th>
                  <th className="py-4 px-6">Route</th>
                  <th className="py-4 px-6">Departure</th>
                  <th className="py-4 px-6">Arrival</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {visibleFlights.map((flight) => {
                  const card = mapBackendFlight(flight);
                  return (
                  <tr key={flight.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="py-3.5 px-6 text-center text-slate-400 font-normal">{flight.id}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-600">{card.flightNo}</td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg leading-none">✈</span>
                        <span className="font-semibold text-slate-800">{card.airline}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <span>{card.from.code}</span>
                        <ArrowRight size={14} className="text-slate-300" />
                        <span>{card.to.code}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 font-mono">{card.from.time}</td>
                    <td className="py-3.5 px-6 text-slate-600 font-mono">{card.to.time}</td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        card.status === "On Time" || card.status === "Scheduled" || card.status === "Boarding" ? "bg-emerald-50 text-emerald-600" :
                        card.status === "Delayed" ? "bg-amber-50 text-amber-600" :
                        "bg-rose-50 text-rose-600"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          card.status === "On Time" || card.status === "Scheduled" || card.status === "Boarding" ? "bg-emerald-500" :
                          card.status === "Delayed" ? "bg-amber-500" :
                          "bg-rose-500"
                        }`} />
                        {card.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center justify-center gap-2 text-slate-400">
                        <button onClick={() => router.push(`/user/live-map?flight=${encodeURIComponent(card.flightNo)}`)} className="p-1.5 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => void updateStatus(flight)} className="p-1.5 hover:bg-slate-100 hover:text-amber-600 rounded-lg transition">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => void deleteFlight(flight)} className="p-1.5 hover:bg-slate-100 hover:text-rose-600 rounded-lg transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
                {!loading && visibleFlights.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-slate-400">No flights found.</td></tr>}
              </tbody>
            </table>
          </div>

          {/* ---------- PAGINATION FOOTER ---------- */}
          <div className="p-4 bg-slate-50/40 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Phân trang số */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((page) => (
                <button 
                  key={page} 
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition ${
                    page === 1 
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/10" 
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <span className="text-slate-400 px-1 text-xs">...</span>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
                77
              </button>
            </div>

            {/* Số lượng hiển thị mỗi trang */}
            <button className="flex items-center justify-between gap-4 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:border-slate-300 transition">
              <span>10 / page</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
