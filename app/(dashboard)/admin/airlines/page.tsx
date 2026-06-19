"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import api from "@/lib/axios";
import type { BackendAirline } from "@/lib/skytrack-data";

function airlineLogoUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  return `/api/assets/${value.replace(/^\/+/, "")}`;
}

export default function AirlinesPage() {
  const [airlines, setAirlines] = useState<BackendAirline[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAirlines() {
    try {
      const response = await api.get<BackendAirline[]>("/api/airlines");
      setAirlines(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load airlines.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAirlines();
  }, []);

  const visibleAirlines = useMemo(() => {
    const query = search.trim().toLowerCase();
    return airlines.filter((airline) => !query || airline.code?.toLowerCase().includes(query) || airline.name?.toLowerCase().includes(query));
  }, [airlines, search]);

  async function addAirline() {
    const code = window.prompt("Airline code");
    if (!code) return;
    const name = window.prompt("Airline name");
    if (!name) return;
    try {
      await api.post("/api/airlines", { code: code.trim().toUpperCase(), name: name.trim(), logo: "" });
      await loadAirlines();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to add airline.");
    }
  }

  async function editAirline(airline: BackendAirline) {
    const name = window.prompt("Airline name", airline.name || "");
    if (!name || !airline.id) return;
    try {
      await api.put(`/api/airlines/${airline.id}`, { ...airline, name: name.trim() });
      await loadAirlines();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update airline.");
    }
  }

  async function deleteAirline(airline: BackendAirline) {
    if (!airline.id || !window.confirm(`Delete ${airline.name || airline.code}?`)) return;
    try {
      await api.delete(`/api/airlines/${airline.id}`);
      await loadAirlines();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete airline. It may still be used by flights.");
    }
  }

  async function uploadLogo(airline: BackendAirline, file: File) {
  if (!airline.id) return;
  const formData = new FormData();
  formData.append("logo", file);
  try {
    await api.put(`/api/airlines/${airline.id}/logo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await loadAirlines();
  } catch (requestError) {
    setError(requestError instanceof Error ? requestError.message : "Unable to upload logo.");
  }
}

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
          <button onClick={() => void addAirline()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
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
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        {error && <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        {/* Airlines Data Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider bg-slate-50/50">
                <th className="py-4 px-6 w-16">ID</th>
                <th className="py-4 px-6 w-24">Code</th>
                <th className="py-4 px-6">Airline Name</th>
                <th className="py-4 px-6 w-28 text-center">Logo</th>
                <th className="py-4 px-6 w-28 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {visibleAirlines.map((airline) => (
                <tr key={airline.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 text-slate-400 font-normal">{airline.id}</td>
                  <td className="py-4 px-6">
                    <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-md text-xs font-bold tracking-wide">
                      {airline.code}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-900">{airline.name}</td>

                  {/* Logo */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col items-center justify-center gap-1.5 group relative">
                      {airline.logo ? (
                        <>
                          <Image
                            src={airlineLogoUrl(airline.logo)}
                            alt={airline.name || airline.code || "Airline logo"}
                            width={64}
                            height={64}
                            unoptimized
                            className="w-16 h-16 object-contain"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                          {/* Nút upload chỉ hiện khi hover vào ảnh */}
                          <label
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/70 rounded-lg cursor-pointer"
                            title="Đổi logo"
                          >
                            <ImageIcon className="w-5 h-5 text-emerald-600" />
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/svg+xml"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void uploadLogo(airline, file);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        </>
                      ) : (
                        <label className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-600 transition-colors p-2 hover:bg-slate-100 rounded-lg cursor-pointer" title="Upload logo">
                          <ImageIcon className="w-5 h-5" />
                          <span className="text-xs">Upload</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) void uploadLogo(airline, file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </td>

                  {/* Actions column: chỉ còn Edit và Delete */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => void editAirline(airline)} className="text-slate-400 hover:text-blue-600 transition-colors p-1 hover:bg-slate-100 rounded-lg">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => void deleteAirline(airline)} className="text-slate-400 hover:text-rose-600 transition-colors p-1 hover:bg-slate-100 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && visibleAirlines.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-slate-400">No airlines found.</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
