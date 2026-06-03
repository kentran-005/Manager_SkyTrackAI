"use client";

import { 
  Search, ChevronDown, Calendar, Plus, Eye, Edit3, Trash2, 
  ArrowRight, CheckCircle2, Clock, AlertTriangle, 
  Sidebar
} from "lucide-react";

export default function AdminFlightsPage() {
  // Mock Data khớp hoàn toàn với ảnh mẫu
  const stats = [
    { title: "Total Flights", count: "1,540", color: "bg-blue-50 text-blue-600" },
    { title: "On Time", count: "1,235", color: "bg-emerald-50 text-emerald-600" },
    { title: "Delayed", count: "87", color: "bg-amber-50 text-amber-600" },
    { title: "Cancelled", count: "12", color: "bg-rose-50 text-rose-600" },
    { title: "In Air", count: "200", color: "bg-cyan-50 text-cyan-600" },
  ];

  const flightsData = [
    { id: 1, code: "VN220", airline: "Vietnam Airlines", logo: "🟨", route: { from: "SGN", to: "HAN" }, dep: "10:30", arr: "12:45", status: "On Time" },
    { id: 2, code: "VJ123", airline: "VietJet Air", logo: "🟥", route: { from: "SGN", to: "DAD" }, dep: "11:45", arr: "14:00", status: "Delayed" },
    { id: 3, code: "QH206", airline: "Bamboo Airways", logo: "🟩", route: { from: "HAN", to: "PQC" }, dep: "13:00", arr: "15:15", status: "On Time" },
    { id: 4, code: "BL789", airline: "Pacific Airlines", logo: "🟪", route: { from: "CXR", to: "SGN" }, dep: "15:30", arr: "17:45", status: "On Time" },
    { id: 5, code: "VJ125", airline: "VietJet Air", logo: "🟥", route: { from: "HAN", to: "SGN" }, dep: "18:00", arr: "20:15", status: "Cancelled" },
    { id: 6, code: "VN226", airline: "Vietnam Airlines", logo: "🟨", route: { from: "SGN", to: "DAD" }, dep: "20:30", arr: "22:45", status: "On Time" },
    { id: 7, code: "QH210", airline: "Bamboo Airways", logo: "🟩", route: { from: "DAD", to: "HAN" }, dep: "09:00", arr: "11:15", status: "On Time" },
    { id: 8, code: "VJ129", airline: "VietJet Air", logo: "🟥", route: { from: "SGN", to: "PQC" }, dep: "07:20", arr: "08:45", status: "On Time" },
  ];

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
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-blue-500/10">
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
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          
          {/* Lọc Trạng thái */}
          <button className="flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-slate-300 transition">
            <span>All Status</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

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
                {flightsData.map((flight) => (
                  <tr key={flight.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="py-3.5 px-6 text-center text-slate-400 font-normal">{flight.id}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-600">{flight.code}</td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg leading-none">{flight.logo}</span>
                        <span className="font-semibold text-slate-800">{flight.airline}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <span>{flight.route.from}</span>
                        <ArrowRight size={14} className="text-slate-300" />
                        <span>{flight.route.to}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 font-mono">{flight.dep}</td>
                    <td className="py-3.5 px-6 text-slate-600 font-mono">{flight.arr}</td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        flight.status === "On Time" ? "bg-emerald-50 text-emerald-600" :
                        flight.status === "Delayed" ? "bg-amber-50 text-amber-600" :
                        "bg-rose-50 text-rose-600"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          flight.status === "On Time" ? "bg-emerald-500" :
                          flight.status === "Delayed" ? "bg-amber-500" :
                          "bg-rose-500"
                        }`} />
                        {flight.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center justify-center gap-2 text-slate-400">
                        <button className="p-1.5 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition">
                          <Eye size={16} />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 hover:text-amber-600 rounded-lg transition">
                          <Edit3 size={16} />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 hover:text-rose-600 rounded-lg transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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