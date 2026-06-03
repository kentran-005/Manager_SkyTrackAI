"use client";
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  ChevronDown 
} from 'lucide-react';

// Dữ liệu giả lập chuẩn theo ảnh mẫu
const airlinesData = [
  { id: 1, code: 'VN', name: 'Vietnam Airlines', logo: '🌾', country: 'Vietnam', status: 'Active' },
  { id: 2, code: 'VJ', name: 'VietJet Air', logo: '✈️', country: 'Vietnam', status: 'Active' },
  { id: 3, code: 'QH', name: 'Bamboo Airways', logo: '🎋', country: 'Vietnam', status: 'Active' },
  { id: 4, code: 'BL', name: 'Pacific Airlines', logo: '🧡', country: 'Vietnam', status: 'Active' },
  { id: 5, code: 'VAS', name: 'Vietravel Airlines', logo: '💙', country: 'Vietnam', status: 'Inactive' },
  { id: 6, code: 'JC', name: 'Jetstar Pacific', logo: '⭐', country: 'Vietnam', status: 'Active' },
];

export default function AirlinesPage() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      
      

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Airlines</h2>
            <p className="text-sm text-slate-500 mt-0.5">Manage airlines in the system</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
            <Plus className="w-4 h-4" />
            Add Airline
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-5 relative max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search airline code, name..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Airlines Data Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider bg-slate-50/50">
                <th className="py-4 px-6 w-16">ID</th>
                <th className="py-4 px-6 w-24">Code</th>
                <th className="py-4 px-6">Airline Name</th>
                <th className="py-4 px-6 w-32 text-center">Logo</th>
                <th className="py-4 px-6">Country</th>
                <th className="py-4 px-6 w-32">Status</th>
                <th className="py-4 px-6 w-28 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {airlinesData.map((airline) => (
                <tr key={airline.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 text-slate-400 font-normal">{airline.id}</td>
                  <td className="py-4 px-6">
                    <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-md text-xs font-bold tracking-wide">
                      {airline.code}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-900">{airline.name}</td>
                  <td className="py-4 px-6 text-center text-xl">{airline.logo}</td>
                  <td className="py-4 px-6 text-slate-600">{airline.country}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                      airline.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-rose-50 text-rose-600'
                    }`}>
                      {airline.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-3">
                      <button className="text-slate-400 hover:text-blue-600 transition-colors p-1 hover:bg-slate-100 rounded-lg">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button className="text-slate-400 hover:text-rose-600 transition-colors p-1 hover:bg-slate-100 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="flex justify-between items-center mt-6">
          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium bg-blue-600 text-white shadow-md shadow-blue-600/10">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium text-slate-600 hover:bg-white hover:border border-transparent hover:border-slate-200 transition-all">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium text-slate-600 hover:bg-white hover:border border-transparent hover:border-slate-200 transition-all">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium text-slate-600 hover:bg-white hover:border border-transparent hover:border-slate-200 transition-all">4</button>
            <span className="w-8 h-8 flex items-center justify-center text-slate-400">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium text-slate-600 hover:bg-white hover:border border-transparent hover:border-slate-200 transition-all">6</button>
          </div>

          {/* Rows Per Page Dropdown */}
          <div className="relative">
            <button className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              10 / page
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}