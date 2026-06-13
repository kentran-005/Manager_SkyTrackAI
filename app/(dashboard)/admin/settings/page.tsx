"use client";
import { useEffect, useRef, useState } from "react";
import buttonStyle from "./css/button.module.css";
import switchStyle from "./css/switch.module.css";
import {
  Settings,
  Bell,
  Shield,
  Bot,
  Cloud,
  Database,
  Info,
  RefreshCw,
  Download,
  Globe,
  Clock,
  Calendar,
  Zap,
  Server,
  Activity,
  ChevronRight,
} from "lucide-react";
import api from "@/lib/axios";
import { testBackendService } from "@/lib/aviation-ai";
import type { BackendAirport } from "@/lib/skytrack-data";

// ── Types ──
interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
}

interface SystemSettingsPayload {
  systemName: string;
  defaultAirport: string;
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  notifications: {
    flightDelay: boolean;
    airport: boolean;
    weather: boolean;
    aiPrediction: boolean;
    maintenance: boolean;
  };
  security: {
    minPasswordLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecial: boolean;
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
  };
  ai: {
    delayPrediction: boolean;
    weatherAnalysis: boolean;
    aiSummary: boolean;
    smartRecommendations: boolean;
  };
}

interface SettingsBackup {
  format: string;
  createdAt: string;
  settings: SystemSettingsPayload;
}

interface SystemInfo {
  version?: string;
  environment?: string;
  database?: string;
  backend?: string;
  frontend?: string;
  uptimeSeconds?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  storageUsage?: number;
  availableProcessors?: number;
  lastBackupAt?: string | null;
}

function formatUptime(seconds = 0) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h ${minutes}m`;
}

// ── Toggle Component ──
function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <label className={switchStyle["plane-switch"]}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={checked ? "Enabled" : "Disabled"}
      />
      <div>
        <div>
          <svg viewBox="0 0 13 13" aria-hidden="true">
            <path d="M1.55989957,5.41666667 L5.51582215,5.41666667 L4.47015462,0.108333333 C4.47015462,0.0634601974 4.49708054,0.0249592654 4.5354546,0.00851337035 L4.57707145,0 L5.36229752,0 C5.43359776,0 5.50087375,0.028779451 5.55026392,0.0782711996 L5.59317877,0.134368264 L7.13659662,2.81558333 L8.29565964,2.81666667 C8.53185377,2.81666667 8.72332694,3.01067661 8.72332694,3.25 C8.72332694,3.48932339 8.53185377,3.68333333 8.29565964,3.68333333 L7.63589819,3.68225 L8.63450135,5.41666667 L11.9308317,5.41666667 C12.5213171,5.41666667 13,5.90169152 13,6.5 C13,7.09830848 12.5213171,7.58333333 11.9308317,7.58333333 L8.63450135,7.58333333 L7.63589819,9.31666667 L8.29565964,9.31666667 C8.53185377,9.31666667 8.72332694,9.51067661 8.72332694,9.75 C8.72332694,9.98932339 8.53185377,10.1833333 8.29565964,10.1833333 L7.13659662,10.1833333 L5.59317877,12.8656317 C5.55725264,12.9280353 5.49882018,12.9724157 5.43174295,12.9907056 L5.36229752,13 L4.57707145,13 C4.51267695,12.9890959 4.48069792,12.9547924 4.47230803,12.9134397 L5.51582215,7.58333333 L1.55989957,7.58333333 L0.891288881,8.55114605 C0.853775374,8.60544678 0.798421006,8.64327676 0.73629202,8.65879796 L0.106844414,8.66666667 C0.0297243066,8.6457608 0.00275502199,8.60729104 0,8.5651586 L0.580855011,6.85813984 C0.64492547,6.67265611 0.6577034,6.47392717 0.619193545,6.28316421 L0.00601851064,4.48064746 C0.00203480725,4.4691314 0,4.45701613 0,4.44481314 C0,4.39994001 0.0269259152,4.36143908 0.0652999725,4.34499318 L0.672546853,4.33647981 C0.737865848,4.33647981 0.80011301,4.36066329 0.848265401,4.40322477 L1.55989957,5.41666667 Z" fill="currentColor" />
          </svg>
        </div>
        <span className={switchStyle["street-middle"]} />
        <span className={switchStyle.cloud} />
        <span className={`${switchStyle.cloud} ${switchStyle.two}`} />
      </div>
    </label>
  );
}

// ── Section Card ──
function SectionCard({
  icon: Icon,
  title,
  children,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-50",
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ── Settings Row ──
function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0 ml-4">{children}</div>
    </div>
  );
}

// ── API Badge ──
type ApiStatus = "idle" | "connected" | "error" | "testing";

function ApiBadge({ status }: { status: ApiStatus }) {
  const styles = {
    idle: "bg-slate-100 text-slate-500",
    connected: "bg-emerald-50 text-emerald-600",
    error: "bg-red-50 text-red-500",
    testing: "bg-amber-50 text-amber-600",
  };
  const labels = { idle: "Not tested", connected: "Connected", error: "Error", testing: "Testing..." };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function SaveButton({
  section,
  savedSection,
  onSave,
  saving,
}: {
  section: string;
  savedSection: string | null;
  onSave: (section: string) => void;
  saving?: boolean;
}) {
  const isSaved = savedSection === section;

  return (
    <button
      type="button"
      onClick={() => onSave(section)}
      disabled={saving}
      className={buttonStyle.btn}
    >
      <span className={buttonStyle.label}>
        {saving ? "Saving..." : isSaved ? "Saved" : "Save changes"}
      </span>
      <span className={buttonStyle.containerStars} aria-hidden="true">
        <span className={buttonStyle.stars} />
      </span>
      <span className={buttonStyle.glow} aria-hidden="true">
        <span className={buttonStyle.circle} />
        <span className={buttonStyle.circle} />
      </span>
    </button>
  );
}

// ── Main Page ──
export default function AdminSettingsPage() {
  // General Settings
  const [systemName, setSystemName] = useState("SkyTrack AI");
  const [defaultAirport, setDefaultAirport] = useState("SGN");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [language, setLanguage] = useState("en");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [timeFormat, setTimeFormat] = useState("24h");
  const [managedAirports, setManagedAirports] = useState<BackendAirport[]>([]);

  // Notifications
  const [notif, setNotif] = useState({
    flightDelay: true,
    airport: true,
    weather: true,
    aiPrediction: true,
    maintenance: true,
  });

  // Security
  const [minPassLen, setMinPassLen] = useState(8);
  const [requireUpper, setRequireUpper] = useState(true);
  const [requireNumbers, setRequireNumbers] = useState(true);
  const [requireSpecial, setRequireSpecial] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);

  // AI
  const [aiFeatures, setAiFeatures] = useState({
    delayPrediction: true,
    weatherAnalysis: true,
    aiSummary: true,
    smartRecommendations: true,
  });

  // Saved indicator
  const [savedSection, setSavedSection] = useState<string | null>(null);
  const [apiStatuses, setApiStatuses] = useState<Record<"flights" | "airports" | "weather" | "ai", ApiStatus>>({
    flights: "idle",
    airports: "idle",
    weather: "idle",
    ai: "idle",
  });
  const [apiError, setApiError] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({});
  const [backup, setBackup] = useState<SettingsBackup | null>(null);
  const [backupBusy, setBackupBusy] = useState(false);
  const [backupMessage, setBackupMessage] = useState("");
  const restoreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      api.get<BackendAirport[]>("/api/airports"),
      api.get<SystemSettingsPayload>("/api/admin/settings"),
      api.get<SystemInfo>("/api/admin/system-info"),
    ])
      .then(([airportsResponse, settingsResponse, infoResponse]) => {
        const airports = Array.isArray(airportsResponse.data) ? airportsResponse.data : [];
        const settings = settingsResponse.data;
        setManagedAirports(airports);
        setSystemName(settings.systemName);
        setDefaultAirport(settings.defaultAirport);
        setTimezone(settings.timezone);
        setLanguage(settings.language);
        setDateFormat(settings.dateFormat);
        setTimeFormat(settings.timeFormat);
        setNotif(settings.notifications);
        setMinPassLen(settings.security.minPasswordLength);
        setRequireUpper(settings.security.requireUppercase);
        setRequireNumbers(settings.security.requireNumbers);
        setRequireSpecial(settings.security.requireSpecial);
        setSessionTimeout(String(settings.security.sessionTimeoutMinutes));
        setMaxLoginAttempts(settings.security.maxLoginAttempts);
        setAiFeatures(settings.ai);
        setSystemInfo(infoResponse.data);
      })
      .catch((requestError) => {
        setSettingsError(requestError instanceof Error ? requestError.message : "Could not load settings.");
      })
      .finally(() => setLoadingSettings(false));
  }, []);

  const testService = async (service: "flights" | "airports" | "weather" | "ai") => {
    setApiStatuses((current) => ({ ...current, [service]: "testing" }));
    setApiError("");
    const selectedAirport = managedAirports.find((airport) => airport.code === defaultAirport);

    try {
      await testBackendService(service, selectedAirport);
      setApiStatuses((current) => ({ ...current, [service]: "connected" }));
    } catch (requestError) {
      setApiStatuses((current) => ({ ...current, [service]: "error" }));
      setApiError(requestError instanceof Error ? requestError.message : "Service test failed.");
    }
  };

  const testAllServices = async () => {
    await Promise.all(
      (["flights", "airports", "weather", "ai"] as const).map((service) => testService(service)),
    );
  };

  const settingsPayload = (): SystemSettingsPayload => ({
    systemName,
    defaultAirport,
    timezone,
    language,
    dateFormat,
    timeFormat,
    notifications: notif,
    security: {
      minPasswordLength: minPassLen,
      requireUppercase: requireUpper,
      requireNumbers,
      requireSpecial,
      sessionTimeoutMinutes: Number(sessionTimeout),
      maxLoginAttempts,
    },
    ai: aiFeatures,
  });

  const applySettings = (settings: SystemSettingsPayload) => {
    setSystemName(settings.systemName);
    setDefaultAirport(settings.defaultAirport);
    setTimezone(settings.timezone);
    setLanguage(settings.language);
    setDateFormat(settings.dateFormat);
    setTimeFormat(settings.timeFormat);
    setNotif(settings.notifications);
    setMinPassLen(settings.security.minPasswordLength);
    setRequireUpper(settings.security.requireUppercase);
    setRequireNumbers(settings.security.requireNumbers);
    setRequireSpecial(settings.security.requireSpecial);
    setSessionTimeout(String(settings.security.sessionTimeoutMinutes));
    setMaxLoginAttempts(settings.security.maxLoginAttempts);
    setAiFeatures(settings.ai);
  };

  const handleSave = async (section: string) => {
    setSavingSection(section);
    setSettingsError("");
    try {
      const response = await api.put<SystemSettingsPayload>("/api/admin/settings", settingsPayload());
      applySettings(response.data);
      setSavedSection(section);
      window.setTimeout(() => setSavedSection(null), 2000);
    } catch (requestError) {
      setSettingsError(requestError instanceof Error ? requestError.message : "Could not save settings.");
    } finally {
      setSavingSection(null);
    }
  };

  const refreshSystemInfo = async () => {
    const response = await api.get<SystemInfo>("/api/admin/system-info");
    setSystemInfo(response.data);
  };

  const createBackup = async () => {
    setBackupBusy(true);
    setBackupMessage("");
    try {
      const response = await api.post<SettingsBackup>("/api/admin/backup");
      setBackup(response.data);
      setBackupMessage("Configuration backup created successfully.");
      await refreshSystemInfo();
    } catch (requestError) {
      setBackupMessage(requestError instanceof Error ? requestError.message : "Could not create backup.");
    } finally {
      setBackupBusy(false);
    }
  };

  const downloadBackup = async () => {
    let currentBackup = backup;
    if (!currentBackup) {
      const response = await api.post<SettingsBackup>("/api/admin/backup");
      currentBackup = response.data;
      setBackup(currentBackup);
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(currentBackup, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `skytrack-settings-${new Date().toISOString().replaceAll(":", "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const restoreBackup = async (file?: File) => {
    if (!file) return;
    setBackupBusy(true);
    setBackupMessage("");
    try {
      const parsed = JSON.parse(await file.text()) as SettingsBackup;
      const response = await api.post<SystemSettingsPayload>("/api/admin/backup/restore", parsed);
      applySettings(response.data);
      setBackupMessage("Configuration restored successfully.");
    } catch (requestError) {
      setBackupMessage(requestError instanceof Error ? requestError.message : "Invalid backup file.");
    } finally {
      setBackupBusy(false);
      if (restoreInputRef.current) restoreInputRef.current.value = "";
    }
  };

  // Sidebar tabs
  const sidebarTabs = [
    { id: "general", label: "General", desc: "General system settings", icon: Settings },
    { id: "notifications", label: "Notifications", desc: "Configure alert preferences", icon: Bell },
    { id: "security", label: "Security", desc: "Security and access control", icon: Shield },
    { id: "ai", label: "AI Settings", desc: "AI model and features", icon: Bot },
    { id: "api", label: "API Services", desc: "External API management", icon: Cloud },
    { id: "backup", label: "Backup & Restore", desc: "System backup and restore", icon: Database },
    { id: "info", label: "System Information", desc: "System status and details", icon: Info },
  ];
  const [activeTab, setActiveTab] = useState("general");

  return (
    <main className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800 antialiased sm:p-6 lg:p-8">

      {/* ── PAGE HEADER ── */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h2>
          <p className="text-slate-500 text-sm mt-0.5">Configure and manage SkyTrack AI system</p>
        </div>
      </div>

      {settingsError && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {settingsError}
        </div>
      )}
      {loadingSettings && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <RefreshCw className="h-4 w-4 animate-spin" /> Loading system settings...
        </div>
      )}

      <div className="flex flex-col items-start gap-6 lg:flex-row">

        {/* ── SIDEBAR TABS ── */}
        <aside className="flex w-full flex-shrink-0 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-xs lg:sticky lg:top-6 lg:block lg:w-56 lg:overflow-hidden">
          {sidebarTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-w-40 items-center gap-3 border-b border-slate-50 px-4 py-3.5 text-left transition-colors last:border-0 lg:w-full lg:min-w-0 ${
                  isActive
                    ? "bg-blue-50 border-l-2 border-l-blue-600"
                    : "hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <div className="min-w-0">
                  <p className={`text-xs font-semibold truncate ${isActive ? "text-blue-700" : "text-slate-700"}`}>
                    {tab.label}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{tab.desc}</p>
                </div>
                {isActive && <ChevronRight className="w-3 h-3 text-blue-500 ml-auto flex-shrink-0" />}
              </button>
            );
          })}
        </aside>

        {/* ── CONTENT ── */}
        <div className="flex-1 min-w-0 grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* ═══════════ GENERAL ═══════════ */}
          {activeTab === "general" && (
            <>
              <SectionCard icon={Globe} title="General Settings">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      System Name
                    </label>
                    <input
                      value={systemName}
                      onChange={(e) => setSystemName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Default Airport
                    </label>
                    <select
                      value={defaultAirport}
                      onChange={(e) => setDefaultAirport(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-400 transition appearance-none cursor-pointer"
                    >
                      {managedAirports.length === 0 && <option value="">No managed airports available</option>}
                      {managedAirports.map((airport) => (
                        <option key={airport.id ?? airport.code} value={airport.code ?? airport.iata}>
                          {airport.name} ({airport.code ?? airport.iata})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                        Timezone
                      </label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-400 transition cursor-pointer"
                      >
                        <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
                        <option value="UTC">UTC</option>
                        <option value="Asia/Bangkok">Asia/Bangkok</option>
                        <option value="Asia/Singapore">Asia/Singapore</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                        Language
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-400 transition cursor-pointer"
                      >
                        <option value="en">English</option>
                        <option value="vi">Tiếng Việt</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                        Date Format
                      </label>
                      <select
                        value={dateFormat}
                        onChange={(e) => setDateFormat(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-400 transition cursor-pointer"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                        Time Format
                      </label>
                      <select
                        value={timeFormat}
                        onChange={(e) => setTimeFormat(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-400 transition cursor-pointer"
                      >
                        <option value="24h">24 Hour</option>
                        <option value="12h">12 Hour</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <SaveButton section="general" savedSection={savedSection} onSave={handleSave} saving={savingSection === "general"} />
                  </div>
                </div>
              </SectionCard>

              
            </>
          )}

          {/* ═══════════ NOTIFICATIONS ═══════════ */}
          {activeTab === "notifications" && (
            <SectionCard icon={Bell} title="Notification Settings" iconColor="text-violet-600" iconBg="bg-violet-50">
              <SettingRow label="Flight Delay Alerts" description="Notify when flights are delayed">
                <Toggle checked={notif.flightDelay} onChange={(v) => setNotif({ ...notif, flightDelay: v })} />
              </SettingRow>
              <SettingRow label="Airport Alerts" description="Gate changes and closures">
                <Toggle checked={notif.airport} onChange={(v) => setNotif({ ...notif, airport: v })} />
              </SettingRow>
              <SettingRow label="Weather Alerts" description="Severe weather warnings">
                <Toggle checked={notif.weather} onChange={(v) => setNotif({ ...notif, weather: v })} />
              </SettingRow>
              <SettingRow label="AI Prediction Alerts" description="AI-generated flight insights">
                <Toggle checked={notif.aiPrediction} onChange={(v) => setNotif({ ...notif, aiPrediction: v })} />
              </SettingRow>
              <SettingRow label="System Maintenance Alerts" description="Scheduled downtime notifications">
                <Toggle checked={notif.maintenance} onChange={(v) => setNotif({ ...notif, maintenance: v })} />
              </SettingRow>
              <div className="pt-4 flex justify-end">
                <SaveButton section="notifications" savedSection={savedSection} onSave={handleSave} saving={savingSection === "notifications"} />
              </div>
            </SectionCard>
          )}

          {/* ═══════════ SECURITY ═══════════ */}
          {activeTab === "security" && (
            <SectionCard icon={Shield} title="Security Settings" iconColor="text-rose-600" iconBg="bg-rose-50">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Minimum Password Length</p>
                    <p className="text-xs text-slate-400 mt-0.5">Characters required</p>
                  </div>
                  <input
                    type="number"
                    min={6}
                    max={32}
                    value={minPassLen}
                    onChange={(e) => setMinPassLen(Number(e.target.value))}
                    className="w-20 text-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-400 transition"
                  />
                </div>
                <SettingRow label="Require Uppercase Letters">
                  <Toggle checked={requireUpper} onChange={setRequireUpper} />
                </SettingRow>
                <SettingRow label="Require Numbers">
                  <Toggle checked={requireNumbers} onChange={setRequireNumbers} />
                </SettingRow>
                <SettingRow label="Require Special Characters">
                  <Toggle checked={requireSpecial} onChange={setRequireSpecial} />
                </SettingRow>
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Session Timeout</p>
                    <p className="text-xs text-slate-400 mt-0.5">Auto-logout after inactivity</p>
                  </div>
                  <select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-400 transition cursor-pointer"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="120">2 Hours</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Max Login Attempts</p>
                    <p className="text-xs text-slate-400 mt-0.5">Before account lockout</p>
                  </div>
                  <input
                    type="number"
                    min={3}
                    max={10}
                    value={maxLoginAttempts}
                    onChange={(e) => setMaxLoginAttempts(Number(e.target.value))}
                    className="w-20 text-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-400 transition"
                  />
                </div>
                <div className="pt-2 flex justify-end">
                  <SaveButton section="security" savedSection={savedSection} onSave={handleSave} saving={savingSection === "security"} />
                </div>
              </div>
            </SectionCard>
          )}

          {/* ═══════════ AI SETTINGS ═══════════ */}
          {activeTab === "ai" && (
            <SectionCard icon={Bot} title="AI Settings" iconColor="text-purple-600" iconBg="bg-purple-50">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    AI Provider
                  </label>
                  <select
                    value="gemini"
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-600"
                  >
                    <option value="gemini">Gemini</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    AI Model
                  </label>
                  <select
                    value="backend"
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-600"
                  >
                    <option value="backend">Configured by the Spring Boot backend</option>
                  </select>
                </div>
                <SettingRow label="Enable Flight Delay Prediction">
                  <Toggle checked={aiFeatures.delayPrediction} onChange={(v) => setAiFeatures({ ...aiFeatures, delayPrediction: v })} />
                </SettingRow>
                <SettingRow label="Enable Weather Analysis">
                  <Toggle checked={aiFeatures.weatherAnalysis} onChange={(v) => setAiFeatures({ ...aiFeatures, weatherAnalysis: v })} />
                </SettingRow>
                <SettingRow label="Enable AI Summary">
                  <Toggle checked={aiFeatures.aiSummary} onChange={(v) => setAiFeatures({ ...aiFeatures, aiSummary: v })} />
                </SettingRow>
                <SettingRow label="Enable Smart Recommendations">
                  <Toggle checked={aiFeatures.smartRecommendations} onChange={(v) => setAiFeatures({ ...aiFeatures, smartRecommendations: v })} />
                </SettingRow>
                <div className="pt-2 flex items-center gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => void testService("ai")}
                    disabled={apiStatuses.ai === "testing"}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-purple-200 text-purple-600 hover:bg-purple-50 transition disabled:cursor-wait disabled:opacity-60"
                  >
                    <Zap size={14} /> {apiStatuses.ai === "testing" ? "Testing..." : "Test AI Connection"}
                  </button>
                  <SaveButton section="ai" savedSection={savedSection} onSave={handleSave} saving={savingSection === "ai"} />
                </div>
              </div>
            </SectionCard>
          )}

          {/* ═══════════ API SERVICES ═══════════ */}
          {activeTab === "api" && (
            <div className="xl:col-span-2">
              <SectionCard icon={Cloud} title="API Services" iconColor="text-cyan-600" iconBg="bg-cyan-50">
                <div className="space-y-3">
                  {[
                    { key: "flights" as const, name: "Flight Data API", provider: "SkyTrack flights" },
                    { key: "airports" as const, name: "Airport Data API", provider: "Managed airports" },
                    { key: "weather" as const, name: "Weather API", provider: "OpenWeather" },
                    { key: "ai" as const, name: "AI Service", provider: "Gemini API" },
                  ].map((api) => (
                    <div
                      key={api.key}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                          <Cloud className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{api.name}</p>
                          <p className="text-xs text-slate-400">{api.provider}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <ApiBadge status={apiStatuses[api.key]} />
                        <button
                          type="button"
                          onClick={() => void testService(api.key)}
                          disabled={apiStatuses[api.key] === "testing"}
                          className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-white hover:border-blue-300 hover:text-blue-600 transition disabled:cursor-wait disabled:opacity-60"
                        >
                          {apiStatuses[api.key] === "testing" ? "Testing" : "Test"}
                        </button>
                      </div>
                    </div>
                  ))}
                  {apiError && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {apiError}
                    </div>
                  )}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => void testAllServices()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
                    >
                      <RefreshCw size={14} /> Test All Connections
                    </button>
                  </div>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ═══════════ BACKUP ═══════════ */}
          {activeTab === "backup" && (
            <div className="xl:col-span-2">
              <SectionCard icon={Database} title="Backup & Restore" iconColor="text-amber-600" iconBg="bg-amber-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Last Backup</p>
                    <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-700">
                        {systemInfo.lastBackupAt
                          ? new Date(systemInfo.lastBackupAt).toLocaleString()
                          : "No backup created yet"}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => void createBackup()}
                        disabled={backupBusy}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition disabled:cursor-wait disabled:opacity-60"
                      >
                        <Database size={14} /> {backupBusy ? "Working..." : "Create Backup"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void downloadBackup()}
                        disabled={backupBusy}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition disabled:cursor-wait disabled:opacity-60"
                      >
                        <Download size={14} /> Download Backup
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Restore Database</p>
                    <input
                      ref={restoreInputRef}
                      type="file"
                      accept="application/json,.json"
                      className="hidden"
                      onChange={(event) => void restoreBackup(event.target.files?.[0])}
                    />
                    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                      <span className="text-sm text-slate-400 flex-1">SkyTrack settings JSON only</span>
                      <button
                        type="button"
                        onClick={() => restoreInputRef.current?.click()}
                        disabled={backupBusy}
                        className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-blue-300 hover:text-blue-600 transition disabled:cursor-wait disabled:opacity-60"
                      >
                        Browse
                      </button>
                    </div>
                    <p className="text-xs leading-5 text-slate-400">
                      Selecting a valid backup restores settings immediately. Operational database backups should be managed at MySQL level.
                    </p>
                  </div>
                </div>
                {backupMessage && (
                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {backupMessage}
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* ═══════════ SYSTEM INFO ═══════════ */}
          {activeTab === "info" && (
            <div className="xl:col-span-2">
              <SectionCard icon={Info} title="System Information" iconColor="text-slate-600" iconBg="bg-slate-100">
                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                  {[
                    { label: "Version", value: `v${systemInfo.version ?? "1.0.0"}`, icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Environment", value: systemInfo.environment ?? "Unknown", icon: Server, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Database", value: systemInfo.database ?? "Unknown", icon: Database, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Backend", value: systemInfo.backend ?? "Unknown", icon: Zap, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "Frontend", value: systemInfo.frontend ?? "Unknown", icon: Globe, color: "text-cyan-600", bg: "bg-cyan-50" },
                    { label: "Server Uptime", value: formatUptime(systemInfo.uptimeSeconds), icon: Clock, color: "text-rose-600", bg: "bg-rose-50" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                        <div className={`w-8 h-8 ${item.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                          <Icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <p className="text-sm font-bold text-slate-800">{item.value}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Resource Usage */}
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Resource Usage</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "CPU Usage", value: systemInfo.cpuUsage ?? 0, color: "bg-blue-500" },
                    { label: "JVM Memory", value: systemInfo.memoryUsage ?? 0, color: "bg-emerald-500" },
                    { label: "Storage Usage", value: systemInfo.storageUsage ?? 0, color: "bg-amber-500" },
                    { label: "Processors", value: systemInfo.availableProcessors ?? 0, color: "bg-purple-500", suffix: " cores", percentage: false },
                  ].map((resource) => (
                    <div key={resource.label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-slate-600">{resource.label}</span>
                        <span className="text-xs font-bold text-slate-800">{resource.value}{resource.suffix ?? "%"}</span>
                      </div>
                      {resource.percentage !== false && (
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${resource.color}`}
                            style={{ width: `${Math.min(100, resource.value)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => void refreshSystemInfo()}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
                  >
                    <RefreshCw size={14} /> Refresh metrics
                  </button>
                </div>
              </SectionCard>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
