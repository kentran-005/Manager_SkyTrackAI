"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  UserPlus,
  UsersRound,
} from "lucide-react";
import api from "@/lib/axios";

type UserRole = "ADMIN" | "USER" | "GUEST";

interface BackendUser {
  id: number;
  name?: string;
  email?: string;
  role?: UserRole;
  lockedUntil?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const PAGE_SIZE = 8;
const COLORS = ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#d97706", "#e11d48"];

function isBlocked(user: BackendUser) {
  return Boolean(user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now());
}

function initials(user: BackendUser) {
  const value = user.name?.trim() || user.email?.split("@")[0] || "User";
  return value.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function formatDate(value?: string) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<number | null>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    api.get<BackendUser[]>("/api/users")
      .then((response) => {
        setUsers(Array.isArray(response.data) ? response.data : []);
        setError("");
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load users."))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: users.length,
      active: users.filter((user) => !isBlocked(user)).length,
      admins: users.filter((user) => user.role === "ADMIN").length,
      newUsers: users.filter((user) => {
        if (!user.createdAt) return false;
        const created = new Date(user.createdAt);
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length,
      blocked: users.filter(isBlocked).length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    return users.filter((user) => {
      const matchesQuery = !normalized || user.name?.toLowerCase().includes(normalized) || user.email?.toLowerCase().includes(normalized);
      const matchesRole = role === "ALL" || user.role === role;
      const blocked = isBlocked(user);
      const matchesStatus = status === "ALL" || (status === "ACTIVE" ? !blocked : blocked);
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [deferredQuery, role, status, users]);

  useEffect(() => setPage(1), [deferredQuery, role, status]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  async function updateUser(user: BackendUser, changes: Record<string, string>) {
    setBusyId(user.id);
    setError("");
    try {
      const response = await api.put<BackendUser>(`/api/users/${user.id}`, changes);
      setUsers((current) => current.map((item) => item.id === user.id ? response.data : item));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update user.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeUser(user: BackendUser) {
    if (!window.confirm(`Delete ${user.name || user.email}? This action cannot be undone.`)) return;
    setBusyId(user.id);
    setError("");
    try {
      await api.delete(`/api/users/${user.id}`);
      setUsers((current) => current.filter((item) => item.id !== user.id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete user.");
    } finally {
      setBusyId(null);
    }
  }

  const statCards = [
    { label: "Total users", value: stats.total, icon: UsersRound, tone: "bg-blue-50 text-blue-600" },
    { label: "Active", value: stats.active, icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Administrators", value: stats.admins, icon: ShieldCheck, tone: "bg-violet-50 text-violet-600" },
    { label: "New this month", value: stats.newUsers, icon: UserPlus, tone: "bg-cyan-50 text-cyan-600" },
    { label: "Blocked", value: stats.blocked, icon: Ban, tone: "bg-rose-50 text-rose-600" },
  ];

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,.08),transparent_30%),#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Access control</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950">Users</h1>
            <p className="mt-2 text-sm text-slate-500">Manage Railway accounts, roles and access status.</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-700">
            Administrator accounts are protected from self-deletion and self-demotion.
          </div>
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {statCards.map(({ label, value, icon: Icon, tone }) => (
            <article key={label} className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,.05)]">
              <div className="flex items-center gap-3">
                <span className={`grid h-11 w-11 place-items-center rounded-2xl ${tone}`}><Icon className="h-5 w-5" /></span>
                <div><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-2xl font-black text-slate-950">{loading ? "-" : value}</div></div>
              </div>
            </article>
          ))}
        </section>

        {error && <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <section className="mt-5 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_14px_44px_rgba(15,23,42,.06)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
            <label className="relative min-w-0 flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or email..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100" />
            </label>
            <select value={role} onChange={(event) => setRole(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none focus:border-blue-400">
              <option value="ALL">All roles</option><option value="ADMIN">Administrators</option><option value="USER">Users</option><option value="GUEST">Guests</option>
            </select>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none focus:border-blue-400">
              <option value="ALL">All status</option><option value="ACTIVE">Active</option><option value="BLOCKED">Blocked</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                <tr><th className="px-5 py-4">User</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Joined</th><th className="px-5 py-4">Updated</th><th className="px-5 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleUsers.map((user) => {
                  const blocked = isBlocked(user);
                  const busy = busyId === user.id;
                  return (
                    <tr key={user.id} className="transition hover:bg-blue-50/30">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-xs font-bold text-white" style={{ background: COLORS[user.id % COLORS.length] }}>{initials(user)}</span>
                          <div className="min-w-0"><div className="truncate text-sm font-bold text-slate-900">{user.name || "Unnamed user"}</div><div className="truncate text-xs text-slate-500">{user.email}</div></div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-[11px] font-bold ${user.role === "ADMIN" ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-slate-600"}`}>{user.role || "USER"}</span></td>
                      <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${blocked ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}><span className={`h-1.5 w-1.5 rounded-full ${blocked ? "bg-rose-500" : "bg-emerald-500"}`} />{blocked ? "Blocked" : "Active"}</span></td>
                      <td className="px-5 py-4 text-xs text-slate-500">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-4 text-xs text-slate-500">{formatDate(user.updatedAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button disabled={busy} onClick={() => void updateUser(user, { role: user.role === "ADMIN" ? "USER" : "ADMIN" })} title={user.role === "ADMIN" ? "Change to user" : "Promote to admin"} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600 disabled:opacity-40"><UserCog className="h-4 w-4" /></button>
                          <button disabled={busy} onClick={() => void updateUser(user, { blocked: String(!blocked) })} title={blocked ? "Unblock" : "Block"} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600 disabled:opacity-40">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : blocked ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}</button>
                          <button disabled={busy} onClick={() => void removeUser(user)} title="Delete" className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!loading && filteredUsers.length === 0 && <div className="grid min-h-52 place-items-center border-t border-slate-100 text-center"><div><UsersRound className="mx-auto h-8 w-8 text-slate-300" /><div className="mt-3 text-sm font-semibold text-slate-700">No matching users</div><div className="mt-1 text-xs text-slate-400">Try changing the search or filters.</div></div></div>}

          <footer className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">{filteredUsers.length} of {users.length} accounts</div>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
              <span className="min-w-20 text-center text-xs font-semibold text-slate-600">{currentPage} / {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}
