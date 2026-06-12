"use client";
import switchStyle from "./css/switch.module.css";
import { useState } from "react";
import styles from "./css/button.module.css"
import {
  Settings,
  Bell,
  Shield,
  Bot,
  Cloud,
  Database,
  Info,
  Save,
  RefreshCw,
  Download,
  Upload,
  Check,
  Globe,
  Clock,
  Calendar,
  Zap,
  Server,
  Cpu,
  HardDrive,
  Activity,
  ChevronRight,
} from "lucide-react";

// ── Types ──
interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
}

// ── Toggle Component ──
function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <label className={switchStyle.switch}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />

      <span className={switchStyle.slider}></span>

      <img
        src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAQABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAIG/8QAIxAAAgIABQQDAAAAAAAAAAAAAQMCBAAREiExBUFRcROBsf/EABQBAQAAAAAAAAAAAAAAAAAAAAX/xAAWEQADAAAAAAAAAAAAAAAAAAAAEiL/2gAMAwEAAhEDEQA/AMBTp03dNglMVuttjqnKQ2UPOfntkOThbqVVUJ12BKnogZQZpy+Ucc8knwePWJrWqyqEHVmrTahEBqpbBoAH1n635wt3a9mjN1p8X2pw0qVEbKB/CO/c4OphSVP/2Q=="
        className={switchStyle.off}
        alt=""
      />

      <img
        src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAQABADASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAQIEBf/EACMQAAEDAwQDAQEAAAAAAAAAAAQBAgUDESEAEjFBBlFhMkL/xAAUAQEAAAAAAAAAAAAAAAAAAAAF/8QAGBEAAwEBAAAAAAAAAAAAAAAAABIiMUH/2gAMAwEAAhEDEQA/AM+Bg4mS8coRccMOdNG01qVyH/kRvHPKKmMdr8uujPwUTG+NkRpw1AKWCbvHKa2zTGphc9u9p0q+rLqeMl4kSCGkYgtoE0HTahIz3bWGNanPrdyqWzn7p5ibh5CArnyZNMyVLpK0QSkt2BNXtVX+7ol1wuLJiyaHt+6Kyp//2Q=="
        className={switchStyle.on}
        alt=""
      />
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
function ApiBadge({ status }: { status: "connected" | "error" | "testing" }) {
  const styles = {
    connected: "bg-emerald-50 text-emerald-600",
    error: "bg-red-50 text-red-500",
    testing: "bg-amber-50 text-amber-600",
  };
  const labels = { connected: "Connected", error: "Error", testing: "Testing..." };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${styles[status]}`}>
      {labels[status]}
    </span>
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
  const [aiProvider, setAiProvider] = useState("gemini");
  const [aiModel, setAiModel] = useState("gemini-2.5-flash");
  const [aiFeatures, setAiFeatures] = useState({
    delayPrediction: true,
    weatherAnalysis: true,
    aiSummary: true,
    smartRecommendations: true,
  });

  // Saved indicator
  const [savedSection, setSavedSection] = useState<string | null>(null);

  const handleSave = (section: string) => {
    setSavedSection(section);
    setTimeout(() => setSavedSection(null), 2000);
  };

  const SaveButton = ({ section }: { section: string }) => (
    <button type="button" onClick={() => handleSave(section)} className={styles.btn}>
      <strong className={styles.label}>{savedSection === section ? "Saved" : "🗁Save Changes"}</strong>
      <div className={styles.containerStars}>
        <div className={styles.stars} />
      </div>
      <div className={styles.glow}>
        <div className={styles.circle} />
        <div className={styles.circle} />
      </div>
    </button>
  );

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
    <main className="p-8 bg-slate-50 min-h-screen font-sans text-slate-800 antialiased">

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

      <div className="flex gap-6 items-start">

        {/* ── SIDEBAR TABS ── */}
        <aside className="w-56 flex-shrink-0 bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden sticky top-6">
          {sidebarTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-slate-50 last:border-0 cursor-pointer ${
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
                      <option value="SGN">Tan Son Nhat Intl Airport (SGN)</option>
                      <option value="HAN">Noi Bai Intl Airport (HAN)</option>
                      <option value="DAD">Da Nang Intl Airport (DAD)</option>
                      <option value="CXR">Cam Ranh Intl Airport (CXR)</option>
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
                    <SaveButton section="general" />
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
                <SaveButton section="notifications" />
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
                  <SaveButton section="security" />
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
                    value={aiProvider}
                    onChange={(e) => setAiProvider(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-400 transition cursor-pointer"
                  >
                    <option value="gemini">Gemini</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic Claude</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    AI Model
                  </label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-400 transition cursor-pointer"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
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
                  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-purple-200 text-purple-600 hover:bg-purple-50 transition cursor-pointer">
                    <Zap size={14} /> Test AI Connection
                  </button>
                  <SaveButton section="ai" />
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
                    { name: "Flight Data API", provider: "AviationStack", status: "connected" as const },
                    { name: "Airport Data API", provider: "AirportDB", status: "connected" as const },
                    { name: "Weather API", provider: "OpenWeather", status: "connected" as const },
                    { name: "AI Service", provider: "Gemini API", status: "connected" as const },
                  ].map((api) => (
                    <div
                      key={api.name}
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
                        <ApiBadge status={api.status} />
                        <button className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-white hover:border-blue-300 hover:text-blue-600 transition cursor-pointer">
                          Test
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-end">
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer">
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
                      <span className="text-sm font-semibold text-slate-700">01/06/2026 10:30:00</span>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition cursor-pointer">
                        <Database size={14} /> Create Backup
                      </button>
                      <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition cursor-pointer">
                        <Download size={14} /> Download Backup
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Restore Database</p>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                      <span className="text-sm text-slate-400 flex-1">Choose backup file...</span>
                      <button className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-blue-300 hover:text-blue-600 transition cursor-pointer">
                        Browse
                      </button>
                    </div>
                    <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-xl transition cursor-pointer">
                      <Upload size={14} /> Restore Database
                    </button>
                  </div>
                </div>
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
                    { label: "Version", value: "v1.0.0", icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Environment", value: "Production", icon: Server, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Database", value: "MySQL 8.0", icon: Database, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Backend", value: "Spring Boot 3", icon: Zap, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "Frontend", value: "Next.js 15", icon: Globe, color: "text-cyan-600", bg: "bg-cyan-50" },
                    { label: "Server Uptime", value: "256 Days", icon: Clock, color: "text-rose-600", bg: "bg-rose-50" },
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
                    { label: "CPU Usage", value: 42, color: "bg-blue-500" },
                    { label: "RAM Usage", value: 58, color: "bg-emerald-500" },
                    { label: "Storage Usage", value: 65, color: "bg-amber-500" },
                    { label: "Disk Usage", value: 48, color: "bg-purple-500" },
                  ].map((resource) => (
                    <div key={resource.label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-slate-600">{resource.label}</span>
                        <span className="text-xs font-bold text-slate-800">{resource.value}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${resource.color}`}
                          style={{ width: `${resource.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}