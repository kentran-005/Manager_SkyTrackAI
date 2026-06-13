"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
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
import { askAviationAssistant } from "@/lib/aviation-ai";

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

// ── Render markdown-like content ──
function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");

  const renderInline = (text: string) =>
    text.split(/(\*\*.*?\*\*)/g).map((part, index) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
      ) : (
        part
      ),
    );

  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        if (line.startsWith("•") || line.startsWith("-")) {
          return (
            <p key={i} className="flex gap-1.5 text-sm leading-relaxed">
              <span className="flex-shrink-0 mt-0.5 text-blue-400">•</span>
              <span>{renderInline(line.replace(/^[•-]\s*/, ""))}</span>
            </p>
          );
        }
        if (line.match(/^\d+\.\s/)) {
          return (
            <p key={i} className="text-sm leading-relaxed">{renderInline(line)}</p>
          );
        }
        if (line === "") return <div key={i} className="h-1" />;
        return (
          <p key={i} className="text-sm leading-relaxed">{renderInline(line)}</p>
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
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isTyping) return;
    const history = messages.map(({ role, content }) => ({ role, content }));

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setError("");

    try {
      const response = await askAviationAssistant(messageText, history, "admin");
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "AI service is temporarily unavailable.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    setMessages(initialMessages);
    setInput("");
    setIsTyping(false);
    setError("");
  };

  const handleExport = () => {
    const transcript = messages
      .map((message) => `[${message.time}] ${message.role.toUpperCase()}\n${message.content}`)
      .join("\n\n");
    const url = URL.createObjectURL(new Blob([transcript], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `skytrack-admin-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex h-[calc(100vh-72px)] min-h-[680px] flex-col overflow-hidden bg-slate-50 p-4 font-sans text-slate-800 antialiased sm:p-6 lg:p-8">

      {/* ── PAGE HEADER ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <Download size={14} /> Export Chat
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">

        {/* ── QUICK PROMPTS SIDEBAR ── */}
        <aside className="w-full flex-shrink-0 lg:w-52">
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
                  <span className="text-xs font-semibold text-purple-600">Gemini</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Status</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold ${error ? "text-rose-600" : "text-emerald-600"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${error ? "bg-rose-500" : "bg-emerald-500"}`} /> {error ? "Error" : "Ready"}
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
                <p className="text-xs text-slate-400">Gemini with live SkyTrack context · Admin mode</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${error ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${error ? "bg-rose-500" : "bg-emerald-500"}`} />
                {error ? "Unavailable" : "API ready"}
              </span>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="Refresh"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
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
            {error && (
              <div className="ml-11 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <div className="font-semibold">Could not get an AI response</div>
                <div className="mt-1">{error}</div>
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
              Answers use available SkyTrack flights, airports, live traffic and weather data
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
