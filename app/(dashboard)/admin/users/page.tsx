"use client";

import { useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type Role = "Admin" | "Manager" | "Operator" | "User";
type Status = "Active" | "Inactive" | "Blocked";

interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  initials: string;
  avatarColor: string;
  role: Role;
  status: Status;
  joinedDate: string;
  lastActive: string;
}

// ── Mock Data ────────────────────────────────────────────────────────────────

const USERS: User[] = [
  {
    id: 1, name: "Minh Bui", phone: "+84 912 345 678",
    email: "minh.bui@gmail.com", initials: "MB", avatarColor: "#6366f1",
    role: "Admin", status: "Active", joinedDate: "01/01/2025", lastActive: "13/06/2025 22:15",
  },
  {
    id: 2, name: "Lan Nguyen", phone: "+84 901 234 567",
    email: "lan.nguyen@gmail.com", initials: "LN", avatarColor: "#ec4899",
    role: "Manager", status: "Active", joinedDate: "15/02/2025", lastActive: "13/06/2025 21:40",
  },
  {
    id: 3, name: "Hoang Tran", phone: "+84 903 456 789",
    email: "hoang.tran@gmail.com", initials: "HT", avatarColor: "#14b8a6",
    role: "Operator", status: "Active", joinedDate: "10/03/2025", lastActive: "13/06/2025 20:30",
  },
  {
    id: 4, name: "Phuong Thao", phone: "+84 905 678 123",
    email: "phuong.thao@gmail.com", initials: "PT", avatarColor: "#f59e0b",
    role: "User", status: "Active", joinedDate: "22/03/2025", lastActive: "13/06/2025 19:15",
  },
  {
    id: 5, name: "Quang Anh", phone: "+84 907 891 234",
    email: "quanganh@gmail.com", initials: "QA", avatarColor: "#8b5cf6",
    role: "User", status: "Inactive", joinedDate: "05/04/2025", lastActive: "10/06/2025 14:22",
  },
  {
    id: 6, name: "Thuy Dung", phone: "+84 909 123 456",
    email: "thuydung@gmail.com", initials: "TD", avatarColor: "#ef4444",
    role: "User", status: "Blocked", joinedDate: "18/04/2025", lastActive: "05/06/2025 11:05",
  },
  {
    id: 7, name: "Duc Anh", phone: "+84 911 234 567",
    email: "ducanh@gmail.com", initials: "DA", avatarColor: "#0ea5e9",
    role: "User", status: "Active", joinedDate: "28/04/2025", lastActive: "13/06/2025 18:50",
  },
  {
    id: 8, name: "Hong Linh", phone: "+84 913 456 789",
    email: "honglinh@gmail.com", initials: "HL", avatarColor: "#f97316",
    role: "User", status: "Active", joinedDate: "03/05/2025", lastActive: "13/06/2025 17:25",
  },
];

// ── Sub-components ───────────────────────────────────────────────────────────

const RoleBadge = ({ role }: { role: Role }) => {
  const map: Record<Role, string> = {
    Admin: "role-admin",
    Manager: "role-manager",
    Operator: "role-operator",
    User: "role-user",
  };
  return <span className={`role-badge ${map[role]}`}>{role}</span>;
};

const StatusBadge = ({ status }: { status: Status }) => {
  const map: Record<Status, string> = {
    Active: "status-active",
    Inactive: "status-inactive",
    Blocked: "status-blocked",
  };
  return (
    <span className={`status-badge ${map[status]}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
};

const Avatar = ({ user }: { user: User }) => (
  <div
    className="avatar"
    style={{ background: `${user.avatarColor}22`, color: user.avatarColor }}
  >
    {user.initials}
  </div>
);

// ── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  positive: boolean;
  iconBg: string;
}

const StatCard = ({ icon, label, value, change, positive, iconBg }: StatCardProps) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
    <div className="stat-body">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      <p className={`stat-change ${positive ? "positive" : "negative"}`}>
        {positive ? "▲" : "▼"} {change} <span>vs last month</span>
      </p>
    </div>
  </div>
);

// ── Main Page ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const roles = ["All Roles", "Admin", "Manager", "Operator", "User"];
  const statuses = ["All Status", "Active", "Inactive", "Blocked"];
  const dates = ["All Time", "This Week", "This Month", "Last 3 Months"];

  const filtered = USERS.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q);
    const matchRole = roleFilter === "All Roles" || u.role === roleFilter;
    const matchStatus = statusFilter === "All Status" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const toggleAll = () =>
    setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map((u) => u.id));

  const toggleOne = (id: number) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <>
      <style>{`
        /* ── Reset & base ─────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }

        /* ── Page shell ───────────────────────────── */
        .users-page {
          padding: 28px 32px;
          background: #f8f9fc;
          min-height: 100vh;
          color: #1a1d23;
        }

        /* ── Page header ──────────────────────────── */
        .page-header { margin-bottom: 24px; }
        .page-title {
          font-size: 22px;
          font-weight: 700;
          color: #1a1d23;
          letter-spacing: -0.3px;
        }
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #9ca3af;
          margin-top: 4px;
        }
        .breadcrumb span { color: #6366f1; font-weight: 500; }
        .breadcrumb-sep { color: #d1d5db; }

        /* ── Stat cards grid ──────────────────────── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: #fff;
          border-radius: 14px;
          padding: 20px 18px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,.06);
        }
        .stat-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .stat-label {
          font-size: 12px;
          font-weight: 500;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: .5px;
          margin-bottom: 4px;
        }
        .stat-value {
          font-size: 26px;
          font-weight: 700;
          color: #1a1d23;
          letter-spacing: -0.5px;
          line-height: 1;
          margin-bottom: 6px;
        }
        .stat-change {
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .stat-change span { font-weight: 400; color: #9ca3af; margin-left: 2px; }
        .positive { color: #22c55e; }
        .negative { color: #ef4444; }

        /* ── Table card ───────────────────────────── */
        .table-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,.06);
          overflow: hidden;
        }

        /* ── Toolbar ──────────────────────────────── */
        .toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 20px;
          border-bottom: 1px solid #f1f3f6;
          flex-wrap: wrap;
        }
        .search-wrap {
          flex: 1;
          min-width: 220px;
          position: relative;
        }
        .search-icon {
          position: absolute;
          left: 12px; top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          font-size: 14px;
        }
        .search-input {
          width: 100%;
          padding: 9px 12px 9px 36px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 13.5px;
          color: #374151;
          background: #f9fafb;
          outline: none;
          transition: border-color .15s;
        }
        .search-input:focus { border-color: #6366f1; background: #fff; }
        .search-input::placeholder { color: #c0c4ce; }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .filter-label {
          font-size: 12px;
          font-weight: 500;
          color: #9ca3af;
          white-space: nowrap;
        }
        .filter-select {
          padding: 8px 30px 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 13.5px;
          color: #374151;
          background: #f9fafb url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") right 10px center no-repeat;
          -webkit-appearance: none;
          cursor: pointer;
          outline: none;
          transition: border-color .15s;
        }
        .filter-select:focus { border-color: #6366f1; }

        .more-filters-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 500;
          color: #374151;
          background: #f9fafb;
          cursor: pointer;
          white-space: nowrap;
          transition: border-color .15s;
        }
        .more-filters-btn:hover { border-color: #6366f1; color: #6366f1; }

        /* ── Table ────────────────────────────────── */
        .users-table { width: 100%; border-collapse: collapse; }
        .users-table thead tr {
          background: #f8f9fc;
          border-bottom: 1px solid #f1f3f6;
        }
        .users-table th {
          padding: 11px 16px;
          font-size: 12px;
          font-weight: 600;
          color: #9ca3af;
          text-align: left;
          letter-spacing: .4px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .users-table td {
          padding: 14px 16px;
          font-size: 13.5px;
          color: #374151;
          border-bottom: 1px solid #f1f3f6;
          vertical-align: middle;
        }
        .users-table tbody tr:hover { background: #fafbff; }
        .users-table tbody tr:last-child td { border-bottom: none; }

        /* checkbox col */
        .col-check { width: 44px; text-align: center !important; }
        input[type="checkbox"] {
          width: 15px; height: 15px;
          accent-color: #6366f1;
          cursor: pointer;
          border-radius: 4px;
        }

        /* user cell */
        .user-cell { display: flex; align-items: center; gap: 12px; }
        .avatar {
          width: 38px; height: 38px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .user-name { font-size: 13.5px; font-weight: 600; color: #1a1d23; }
        .user-phone { font-size: 12px; color: #9ca3af; margin-top: 1px; }

        /* badges */
        .role-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: .2px;
        }
        .role-admin    { background: #ede9fe; color: #7c3aed; }
        .role-manager  { background: #fce7f3; color: #be185d; }
        .role-operator { background: #d1fae5; color: #065f46; }
        .role-user     { background: #f1f5f9; color: #475569; }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        .status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          display: inline-block;
        }
        .status-active   { background: #dcfce7; color: #16a34a; }
        .status-active .status-dot   { background: #22c55e; }
        .status-inactive { background: #fef9c3; color: #ca8a04; }
        .status-inactive .status-dot { background: #eab308; }
        .status-blocked  { background: #fee2e2; color: #dc2626; }
        .status-blocked .status-dot  { background: #ef4444; }

        /* date / email */
        .date-cell { font-size: 13px; color: #6b7280; white-space: nowrap; }
        .email-cell { font-size: 13px; color: #6b7280; }

        /* actions */
        .actions-cell {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .action-btn {
          width: 32px; height: 32px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #9ca3af;
          font-size: 15px;
          transition: background .15s, color .15s;
        }
        .action-btn:hover { background: #f1f3f6; color: #6366f1; }

        /* ── Pagination ────────────────────────────── */
        .table-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-top: 1px solid #f1f3f6;
        }
        .showing-text { font-size: 13px; color: #9ca3af; }
        .pagination {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .page-btn {
          width: 32px; height: 32px;
          border: 1px solid #e5e7eb;
          background: #fff;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px;
          color: #374151;
          cursor: pointer;
          transition: all .15s;
        }
        .page-btn:hover { border-color: #6366f1; color: #6366f1; }
        .page-btn.active { background: #6366f1; border-color: #6366f1; color: #fff; font-weight: 600; }
        .page-btn:disabled { opacity: .4; cursor: default; }
        .page-dots { font-size: 13px; color: #9ca3af; padding: 0 4px; }

        /* ── Responsive tweak ─────────────────────── */
        @media (max-width: 1100px) {
          .stats-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 720px) {
          .users-page { padding: 18px 14px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .toolbar { flex-direction: column; align-items: stretch; }
        }
      `}</style>

      <div className="users-page">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Users</h1>
          <div className="breadcrumb">
            <span>Dashboard</span>
            <span className="breadcrumb-sep">›</span>
            <span>Users</span>
          </div>
        </div>

        {/* Stat cards */}
        <div className="stats-grid">
          {/* Total Users – two-people silhouette, indigo bg */}
          <StatCard
            iconBg="#ede9fe"
            label="Total Users" value="12,842" change="18.3%" positive
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            }
          />

          {/* Active Users – person with checkmark, green bg */}
          <StatCard
            iconBg="#dcfce7"
            label="Active Users" value="11,458" change="15.7%" positive
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <polyline points="16 11 18 13 22 9"/>
              </svg>
            }
          />

          {/* Admin Users – crown, amber bg */}
          <StatCard
            iconBg="#fef9c3"
            label="Admin Users" value="24" change="0%" positive
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 4l4.5 7L12 4l5.5 7L22 4v12H2z"/>
                <line x1="2" y1="20" x2="22" y2="20"/>
              </svg>
            }
          />

          {/* New This Month – person+, blue bg */}
          <StatCard
            iconBg="#dbeafe"
            label="New This Month" value="128" change="25.6%" positive
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            }
          />

          {/* Blocked Users – shield with ban, red bg */}
          <StatCard
            iconBg="#fee2e2"
            label="Blocked Users" value="15" change="6.7%" positive={false}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            }
          />
        </div>

        {/* Table card */}
        <div className="table-card">
          {/* Toolbar */}
          <div className="toolbar">
            <div className="search-wrap">
              <span className="search-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                className="search-input"
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <span className="filter-label">Role</span>
              <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                {roles.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-label">Status</span>
              <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {statuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-label">Joined Date</span>
              <select className="filter-select" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                {dates.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>

            <button className="more-filters-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              More Filters
            </button>
          </div>

          {/* Table */}
          <table className="users-table">
            <thead>
              <tr>
                <th className="col-check">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                  />
                </th>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td className="col-check">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={() => toggleOne(user.id)}
                    />
                  </td>
                  <td>
                    <div className="user-cell">
                      <Avatar user={user} />
                      <div>
                        <div className="user-name">{user.name}</div>
                        <div className="user-phone">{user.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="email-cell">{user.email}</td>
                  <td><RoleBadge role={user.role} /></td>
                  <td><StatusBadge status={user.status} /></td>
                  <td className="date-cell">{user.joinedDate}</td>
                  <td className="date-cell">{user.lastActive}</td>
                  <td>
                    <div className="actions-cell">
                      <button className="action-btn" title="View">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      <button className="action-btn" title="Edit">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="action-btn" title="More">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer / Pagination */}
          <div className="table-footer">
            <span className="showing-text">
              Showing 1 to {filtered.length} of 12,842 users
            </span>
            <div className="pagination">
              <button className="page-btn" disabled>‹</button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <span className="page-dots">…</span>
              <button className="page-btn">1606</button>
              <button className="page-btn">›</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}