"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Plane,
  Clock,
  MapPin,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Users,
  BarChart3,
  Activity,
  ShieldAlert,
  Zap,
  ChevronRight,
  Download,
  RefreshCw,
} from "lucide-react";

// ── Types ──
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

// ── Quick prompts for Admin ──
const quickPrompts = [
  { icon: BarChart3,    label: "Daily Report",       prompt: "Generate a daily flight operations summary for today",   color: "blue"    },
  { icon: AlertTriangle, label: "Delay Analysis",    prompt: "Which routes have the highest delay rates this week?",   color: "amber"   },
  { icon: Users,        label: "Passenger Stats",    prompt: "Show me total passenger statistics for this month",      color: "emerald" },
  { icon: TrendingUp,   label: "Performance",        prompt: "Analyze on-time performance across all airlines",        color: "purple"  },
  { icon: MapPin,       label: "Airport Status",     prompt: "What is the current status of all tracked airports?",    color: "cyan"    },
  { icon: ShieldAlert,  label: "System Alerts",      prompt: "Are there any system anomalies or alerts I should know?", color: "rose"   },
];

const colorMap: Record<string, string> = {
  blue:    "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100",
  amber:   "bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-100",
  emerald: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100",
  purple:  "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-100",
  cyan:    "bg-cyan-50 text-cyan-600 hover:bg-cyan-100 border-cyan-100",
  rose:    "bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100",
};

// ── Initial Message ──
const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello, Admin! I'm **SkyTrack AI** — your intelligent operations assistant.\n\nI can help you with:\n• Flight operations reports & analytics\n• Delay and cancellation analysis\n• Passenger traffic summaries\n• Airline performance comparisons\n• System health checks\n\nWhat would you like to analyze today?",
    time: "Just now",
  },
];

// ── Simulate admin-specific responses ──
function simulateAdminResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes("daily") || msg.includes("summary") || msg.includes("report")) {
    return "**Daily Flight Operations Summary — 01/06/2026**\n\n📊 Overview\n• Total flights tracked: **1,540**\n• On-time departures: **1,441** (93.6%)\n• Delayed flights: **87** (5.7%)\n• Cancelled flights: **12** (0.8%)\n\n✈ Top Performing Routes\n1. SGN ↔ HAN — 156 flights, 96.2% on-time\n2. SGN ↔ DAD — 98 flights, 94.1% on-time\n3. HAN ↔ PQC — 72 flights, 92.3% on-time\n\n⚠ Notable Issues\n• Tan Son Nhat (SGN): Air traffic congestion caused average 18-min delays in morning peak\n• Noi Bai (HAN): Runway maintenance scheduled for 02:00–04:00 tonight\n\nWould you like a breakdown by airline or time slot?";
  }
  if (msg.includes("delay") || msg.includes("route")) {
    return "**Delay Analysis — Top Routes by Delay Rate (Last 7 Days)**\n\n🔴 High Delay Rate (>10%)\n• SGN → HAN: **13.2%** avg delay (main cause: air traffic)\n• HAN → SGN: **11.8%** avg delay (weather impact: 3 days)\n\n🟡 Moderate Delay Rate (5–10%)\n• SGN → DAD: **8.7%** avg delay\n• HAN → DAD: **7.2%** avg delay\n• SGN → CXR: **6.5%** avg delay\n\n🟢 Low Delay Rate (<5%)\n• HAN → PQC: **3.1%** avg delay\n• DAD → SGN: **2.8%** avg delay\n\n💡 Recommendation: Consider increasing buffer time for SGN–HAN slots during peak hours (07:00–09:00, 17:00–19:00).";
  }
  if (msg.includes("passenger") || msg.includes("traffic")) {
    return "**Passenger Statistics — June 2026**\n\n👥 Total Passengers: **3,842,150**\n• Domestic: 2,914,300 (75.8%)\n• International: 927,850 (24.2%)\n\n📈 Month-over-Month Growth: +8.4%\n\n🏆 Busiest Airports\n1. SGN (Tan Son Nhat) — 1,847,200 pax\n2. HAN (Noi Bai) — 1,294,600 pax\n3. DAD (Da Nang) — 432,100 pax\n4. CXR (Cam Ranh) — 187,400 pax\n5. PQC (Phu Quoc) — 80,850 pax\n\n✈ Top Airlines by Passenger Volume\n1. Vietnam Airlines — 42%\n2. VietJet Air — 28%\n3. Bamboo Airways — 18%\n4. Pacific Airlines — 7%\n5. Others — 5%";
  }
  if (msg.includes("performance") || msg.includes("airline")) {
    return "**Airline On-Time Performance Analysis**\n\n🏅 Rankings (On-Time Rate)\n\n1. **Vietnam Airlines** — 91.4% ⬆ +2.1%\n   Flights: 8,240 | Delayed: 708 | Avg delay: 12 min\n\n2. **Bamboo Airways** — 89.7% ⬆ +0.8%\n   Flights: 3,640 | Delayed: 375 | Avg delay: 15 min\n\n3. **Pacific Airlines** — 85.2% ⬇ -1.3%\n   Flights: 1,420 | Delayed: 210 | Avg delay: 22 min\n\n4. **VietJet Air** — 82.0% ⬇ -0.5%\n   Flights: 5,680 | Delayed: 1,022 | Avg delay: 28 min\n\n💡 VietJet Air remains the most delayed carrier. Root cause analysis suggests high turnaround utilization rate (94%) leaving minimal buffer for recovery.";
  }
  if (msg.includes("airport") || msg.includes("status")) {
    return "**Airport Status — Real-time Overview**\n\n🟢 **SGN — Tan Son Nhat Intl** — Operational\n• Active runways: 2/2\n• Current weather: 32°C, Clear\n• Congestion level: High (peak hours)\n• Delay index: 13.2%\n\n🟢 **HAN — Noi Bai Intl** — Operational\n• Active runways: 2/2\n• Current weather: 29°C, Partly Cloudy\n• Congestion level: Medium\n• Delay index: 8.7%\n\n🟢 **DAD — Da Nang Intl** — Operational\n• Active runways: 1/1\n• Current weather: 34°C, Sunny\n• Congestion level: Low\n• Delay index: 6.1%\n\n🟡 **CXR — Cam Ranh Intl** — Minor Advisory\n• Crosswind advisory in effect (gusts 25 kt)\n• Delay index: 4.3%\n\n🟢 **PQC — Phu Quoc Intl** — Operational\n• Normal operations\n• Delay index: 3.2%";
  }
  if (msg.includes("alert") || msg.includes("anomal") || msg.includes("system")) {
    return "**System Health Check — All Services Operational**\n\n✅ No critical alerts at this time.\n\n📋 Active Advisories\n• ⚠ SGN airport congestion above normal threshold (13.2% delay rate)\n• ⚠ CXR crosswind advisory active until 18:00 local time\n• ℹ HAN runway maintenance scheduled tonight 02:00–04:00\n\n🖥 System Status\n• API Gateway: ✅ Online (99.98% uptime)\n• Flight Data Feed: ✅ Connected — last sync 2 min ago\n• Weather Service: ✅ Connected\n• Database: ✅ MySQL 8.0 — healthy\n• AI Service (Gemini): ✅ Connected\n\n📊 Resource Usage\n• CPU: 42% | RAM: 58% | Storage: 65% | Disk: 48%\n\nAll systems nominal. No intervention required.";
  }
  return `I understand your query: **"${userMessage}"**\n\nAs the Admin AI assistant, I can generate:\n• Operations summaries & daily reports\n• Delay and route performance analysis\n• Passenger traffic statistics\n• Airline on-time rankings\n• Airport status overviews\n• System health checks\n\nTry one of the quick prompts above or ask me anything about flight operations!`;
}

// ── Render markdown-like content ──
function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        // Bold **text**
        const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        if (line.startsWith("•") || line.startsWith("-")) {
          return (
            <p key={i} className="flex gap-1.5 text-sm leading-relaxed">
              <span className="flex-shrink-0 mt-0.5 text-blue-400">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^[•\-]\s*/, "") }} />
            </p>
          );
        }
        if (line.match(/^\d+\.\s/)) {
          return (
            <p key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />
          );
        }
        if (line === "") return <div key={i} className="h-1" />;
        return (
          <p key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />
        );
      })}
    </div>
  );
}

// ── Main Component ──
export default function AdminAIPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = simulateAdminResponse(messageText);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 1600);
  };

  const handleReset = () => {
    setMessages(initialMessages);
    setInput("");
  };

  return (
    <main className="p-8 bg-slate-50 min-h-screen font-sans text-slate-800 antialiased flex flex-col">

      {/* ── PAGE HEADER ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">AI Summary</h2>
            <p className="text-slate-500 text-sm mt-0.5">Intelligent flight operations assistant for admins</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer">
            <Download size={14} /> Export Chat
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">

        {/* ── QUICK PROMPTS SIDEBAR ── */}
        <aside className="w-52 flex-shrink-0">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden sticky top-6">
            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Quick Prompts</span>
            </div>
            <div className="p-2 space-y-1">
              {quickPrompts.map((qp) => {
                const Icon = qp.icon;
                return (
                  <button
                    key={qp.label}
                    onClick={() => handleSend(qp.prompt)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition border cursor-pointer ${colorMap[qp.color]}`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-xs font-semibold">{qp.label}</span>
                    <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0 opacity-50" />
                  </button>
                );
              })}
            </div>

            {/* Live Status */}
            <div className="mx-3 mb-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-bold text-slate-600">AI Status</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Model</span>
                  <span className="text-xs font-semibold text-purple-600">Gemini 2.5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Status</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Queries</span>
                  <span className="text-xs font-semibold text-slate-700">{messages.filter(m => m.role === "user").length}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── CHAT AREA ── */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">

          {/* Chat Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">SkyTrack AI Assistant</p>
                <p className="text-xs text-slate-400">Powered by Gemini 2.5 Flash · Admin Mode</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </span>
              <button
                onClick={() => setMessages(initialMessages)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="Refresh"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: "calc(100vh - 340px)" }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {msg.role === "assistant" ? (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      A
                    </div>
                  )}
                </div>

                {/* Bubble */}
                <div className={`max-w-2xl ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : "bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-sm"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <MessageContent content={msg.content} />
                    ) : (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 mt-1 px-1">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="px-6 py-4 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 gap-3 focus-within:border-blue-400 focus-within:bg-white transition">
                <Zap className="w-4 h-4 text-slate-300 flex-shrink-0" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Ask about flights, delays, passengers, reports..."
                  className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none font-medium"
                  disabled={isTyping}
                />
                {input && (
                  <span className="text-xs text-slate-300 flex-shrink-0">Enter ↵</span>
                )}
              </div>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="w-11 h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-300 mt-2 text-center">
              SkyTrack AI · Admin Mode · Powered by Gemini 2.5 Flash
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}