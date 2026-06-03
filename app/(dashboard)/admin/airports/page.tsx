"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Edit3, Trash2, ChevronDown, X, Save } from "lucide-react";

interface Airport {
  id?: number;
  code: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

const emptyForm: Airport = { code: "", name: "", city: "", country: "Vietnam", latitude: 0, longitude: 0 };

export default function AirportsManagement() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [form, setForm] = useState<Airport>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State phục vụ giao diện mới
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Gọi API lấy danh sách sân bay
  useEffect(() => {
    fetchAirports();
  }, []);

  const fetchAirports = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/airports");
      const data = await res.json();
      setAirports(data);
    } catch (error) {
      console.error("Lỗi tải sân bay:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "latitude" || name === "longitude" ? parseFloat(value) || 0 : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `http://localhost:8080/api/airports/${editingId}` : "http://localhost:8080/api/airports";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save airport");

      setForm(emptyForm);
      setEditingId(null);
      setIsModalOpen(false); // Đóng modal sau khi lưu thành công
      fetchAirports();
      alert(editingId ? "Cập nhật thành công!" : "Thêm mới thành công!");
    } catch (error) {
      alert("Lỗi: Mã sân bay có thể đã tồn tại!");
    }
  };

  const handleEdit = (airport: Airport) => {
    setForm(airport);
    setEditingId(airport.id || null);
    setIsModalOpen(true); // Mở modal form sửa dữ liệu
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sân bay này?")) return;

    try {
      await fetch(`http://localhost:8080/api/airports/${id}`, { method: "DELETE" });
      fetchAirports();
    } catch (error) {
      alert("Lỗi khi xóa sân bay!");
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsModalOpen(false);
  };

  // Bộ lọc tìm kiếm nhanh trực tiếp trên giao diện
  const filteredAirports = airports.filter(airport => 
    airport.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    airport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    airport.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="flex-1 p-8 bg-slate-50 min-h-screen font-sans text-slate-800 antialiased">
      
      {/* ── HEADER TIÊU ĐỀ & NÚT THÊM ── */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Airports</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage all airports in the system</p>
        </div>
        <button 
          onClick={() => { setForm(emptyForm); setEditingId(null); setIsModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-blue-500/10 cursor-pointer"
        >
          <Plus size={16} /> Add Airport
        </button>
      </div>

      {/* ── THANH TÌM KIẾM CHIỀU RỘNG CHUẨN ── */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search airport code, name, city..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 transition shadow-2xs"
          />
        </div>
      </div>

      {/* ── BẢNG DỮ LIỆU SÂN BAY ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 font-medium">Loading data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6 w-16 text-center">ID</th>
                  <th className="py-4 px-4 w-24">Code</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">City</th>
                  <th className="py-4 px-6">Country</th>
                  <th className="py-4 px-6">Latitude</th>
                  <th className="py-4 px-6">Longitude</th>
                  <th className="py-4 px-6 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {filteredAirports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-normal">
                      No airports found.
                    </td>
                  </tr>
                ) : (
                  filteredAirports.map((airport) => (
                    <tr key={airport.id} className="hover:bg-slate-50/40 transition duration-150">
                      <td className="py-3.5 px-6 text-center text-slate-400 font-normal">{airport.id}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block bg-blue-50 text-blue-600 font-bold text-xs px-2.5 py-1 rounded-lg tracking-wide">
                          {airport.code}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-800">{airport.name}</td>
                      <td className="py-3.5 px-6 text-slate-600">{airport.city}</td>
                      <td className="py-3.5 px-6 text-slate-600">{airport.country}</td>
                      <td className="py-3.5 px-6 font-mono text-slate-500 text-xs">{airport.latitude}</td>
                      <td className="py-3.5 px-6 font-mono text-slate-500 text-xs">{airport.longitude}</td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center justify-center gap-3 text-slate-400">
                          <button 
                            onClick={() => handleEdit(airport)}
                            className="p-1.5 hover:bg-slate-100 hover:text-amber-600 rounded-lg transition cursor-pointer" 
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(airport.id!)}
                            className="p-1.5 hover:bg-slate-100 hover:text-rose-600 rounded-lg transition cursor-pointer" 
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── PHÂN TRANG (PAGINATION) ── */}
        <div className="p-4 bg-slate-50/40 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((page) => (
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
            <span className="text-slate-300 px-1 text-xs font-bold">—</span>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
              10
            </button>
          </div>

          <button className="flex items-center justify-between gap-4 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:border-slate-300 transition">
            <span>10 / page</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* ── MODAL FORM THÊM / SỬA (CHỈ HIỂN THỊ KHI ĐƯỢC KÍCH HOẠT) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden transform scale-100 transition-all">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {editingId ? "✏️ Edit Airport" : "➕ Add New Airport"}
              </h3>
              <button 
                onClick={handleCancel}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-600">Code (e.g. SGN)</label>
                  <input 
                    className="px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400 font-semibold tracking-wide uppercase transition" 
                    name="code" value={form.code} onChange={handleInputChange} required disabled={!!editingId} 
                  />
                </div>
                
                <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-600">City</label>
                  <input 
                    className="px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition" 
                    name="city" value={form.city} onChange={handleInputChange} required 
                  />
                </div>

                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-xs font-bold text-slate-600">Airport Name</label>
                  <input 
                    className="px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition" 
                    name="name" value={form.name} onChange={handleInputChange} required 
                  />
                </div>

                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-xs font-bold text-slate-600">Country</label>
                  <input 
                    className="px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition" 
                    name="country" value={form.country} onChange={handleInputChange} required 
                  />
                </div>

                <div className="flex flex-col gap-1.5 col-span-1">
                  <label className="text-xs font-bold text-slate-600">Latitude</label>
                  <input 
                    className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:border-blue-500 transition" 
                    type="number" step="any" name="latitude" value={form.latitude} onChange={handleInputChange} required 
                  />
                </div>

                <div className="flex flex-col gap-1.5 col-span-1">
                  <label className="text-xs font-bold text-slate-600">Longitude</label>
                  <input 
                    className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:border-blue-500 transition" 
                    type="number" step="any" name="longitude" value={form.longitude} onChange={handleInputChange} required 
                  />
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/10 transition cursor-pointer"
                >
                  <Save size={16} />
                  {editingId ? "Update" : "Save Airport"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}