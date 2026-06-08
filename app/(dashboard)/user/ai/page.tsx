"use client";

import { Bot, Send, Sparkles, Plane, Clock, MapPin, TrendingUp, AlertTriangle, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

const quickPrompts = [
  { icon: Plane, label: "Flight status", prompt: "What's the current status of flight VN220?", color: "blue" },
  { icon: Clock, label: "Delay info", prompt: "Are there any delays at SGN airport today?", color: "amber" },
  { icon: MapPin, label: "Airport info", prompt: "Tell me about Noi Bai International Airport", color: "emerald" },
  { icon: TrendingUp, label: "Statistics", prompt: "Show me today's flight statistics", color: "purple" },
];

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! I'm SkyTrack AI Assistant. I can help you with flight tracking, airport information, delay predictions, and more. How can I assist you today?",
    time: "Just now",
  },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateResponse = (userMessage: string) => {
    setIsTyping(true);

    setTimeout(() => {
      let response = "";
      const msg = userMessage.toLowerCase();

      if (msg.includes("vn220")) {
        response = "Flight VN220 (Vietnam Airlines) is currently **On Time**\n\n• Route: SGN → HAN\n• Departure: 10:30 (Scheduled)\n• Arrival: 12:45\n• Aircraft: Airbus A321\n• Gate: A3\n\nThe flight is proceeding as scheduled. Would you like to track it on the live map?";
      } else if (msg.includes("delay") || msg.includes("sgn")) {
        response = "Here's the current delay status at SGN (Tan Son Nhat Intl)\n\n• **2 flights delayed** in the next 3 hours\n• Average delay: 25 minutes\n• VJ123 (SGN→DAD): Delayed 30 min\n• VN148 (SGN→HAN): Delayed 15 min\n\nWeather conditions are clear, delays are due to air traffic congestion.";
      } else if (msg.includes("noi bai") || msg.includes("han")) {
        response = "**Noi Bai International Airport (HAN)**\n\n• Location: Hanoi, Vietnam\n• IATA: HAN / ICAO: VVNB\n• Terminals: T1 (Domestic), T2 (International)\n• Runways: 2 (11L/29R, 11R/29L)\n• Current weather: 32°C, Partly Cloudy\n• Visibility: 10 km\n• On-time rate today: 87%\n\nNeed any specific information about this airport?";
      } else if (msg.includes("statistic") || msg.includes("stats")) {
        response = "Today's Flight Statistics\n\n• **Total flights tracked**: 847\n• **On-time flights**: 712 (84.1%)\n• **Delayed flights**: 108 (12.7%)\n• **Cancelled flights**: 27 (3.2%)\n• **Busiest route**: SGN ↔ HAN (156 flights)\n• **Most delayed airline**: VietJet Air (18% delay rate)\n\nWould you like more detailed analytics?";
      } else {
        response = "I understand your question about: \"" + userMessage + "\"\n\nWhile I'm currently in demo mode, I can help you with:\n• Flight status lookups\n• Airport information\n• Delay predictions\n• Weather impacts\n• Route statistics\n\nTry asking about a specific flight number or airport!";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: response,
          time: "Just now",
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    const userContent = input.trim();
    setInput("");
    simulateResponse(userContent);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const clearChat = () => {
    setMessages(initialMessages);
  };

  return (
    <div className="udash-ai-page">
      <div className="udash-ai-header">
        <div className="udash-ai-header-left">
          <div className="udash-ai-header-icon">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="udash-page-title">AI Assistant</h1>
            <p className="udash-ai-header-sub">
              <span className="udash-ai-header-dot" />
              Online — Powered by SkyTrack AI
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="udash-ai-clear-btn" onClick={clearChat} title="Clear chat">
            <RotateCcw className="w-4 h-4" />
          </button>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>
      </div>

      <div className="udash-ai-chat">
        <div className="udash-ai-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`udash-ai-message udash-ai-message--${msg.role}`}>
              {msg.role === "assistant" && (
                <div className="udash-ai-message-avatar">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div className="udash-ai-message-bubble">
                <div className="udash-ai-message-text">{msg.content}</div>
                <span className="udash-ai-message-time">{msg.time}</span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="udash-ai-message udash-ai-message--assistant">
              <div className="udash-ai-message-avatar">
                <Bot className="w-4 h-4" />
              </div>
              <div className="udash-ai-message-bubble">
                <div className="udash-ai-typing">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="udash-ai-quick-prompts">
            {quickPrompts.map((qp) => {
              const Icon = qp.icon;
              return (
                <button
                  key={qp.label}
                  className={`udash-ai-quick-prompt udash-ai-quick-prompt--${qp.color}`}
                  onClick={() => handleQuickPrompt(qp.prompt)}
                >
                  <Icon className="w-4 h-4" />
                  <span>{qp.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Input */}
        <div className="udash-ai-input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about flights, airports, delays..."
            className="udash-ai-input"
          />
          <button
            className="udash-ai-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}