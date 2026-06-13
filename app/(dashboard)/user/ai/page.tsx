'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, Clock3, MapPin, Plane, RotateCcw, Send, Sparkles, TrendingUp } from 'lucide-react'
import { askAviationAssistant } from '@/lib/aviation-ai'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
}

const INITIAL_MESSAGES: Message[] = [{
  id: 'welcome',
  role: 'assistant',
  content: 'Hello! I can help you understand flight status, airport information, delay patterns and routes. What would you like to check?',
  time: 'Just now',
}]

const QUICK_PROMPTS = [
  { icon: Plane, label: 'Check flight VN220', prompt: 'What is the current status of flight VN220?' },
  { icon: Clock3, label: 'Delays at SGN', prompt: 'Are there any delays at SGN airport today?' },
  { icon: MapPin, label: 'About Noi Bai', prompt: 'Tell me about Noi Bai International Airport' },
  { icon: TrendingUp, label: 'Today statistics', prompt: 'Show me today flight statistics' },
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  async function sendMessage(value = input) {
    const content = value.trim()
    if (!content || typing) return
    const history = messages.map(({ role, content: messageContent }) => ({ role, content: messageContent }))
    const userMessage: Message = { id: `user-${Date.now()}`, role: 'user', content, time: 'Just now' }
    setMessages((current) => [...current, userMessage])
    setInput('')
    setTyping(true)
    setError('')

    try {
      const answer = await askAviationAssistant(content, history, 'user')
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', content: answer, time: 'Just now' }])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'AI assistant is temporarily unavailable.')
    } finally {
      setTyping(false)
    }
  }

  return (
    <div className="h-[calc(100vh-72px)] min-h-[680px] overflow-hidden bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid h-full max-w-[1450px] gap-5 xl:grid-cols-[310px_1fr]">
        <aside className="hidden flex-col rounded-[28px] bg-[#07111f] p-5 text-white shadow-xl xl:flex">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600"><Sparkles className="h-5 w-5" /></span>
            <div><div className="font-semibold">SkyTrack Copilot</div><div className="text-xs text-slate-500">Backend-powered aviation assistant</div></div>
          </div>
          <div className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Suggested questions</div>
          <div className="mt-3 space-y-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button key={prompt.label} type="button" onClick={() => sendMessage(prompt.prompt)} className="group flex w-full items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-3 text-left text-sm text-slate-300 transition hover:border-blue-400/20 hover:bg-blue-500/10 hover:text-white">
                <prompt.icon className="h-4 w-4 shrink-0 text-blue-400" /><span>{prompt.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-auto rounded-2xl border border-amber-300/10 bg-amber-300/[0.06] p-4">
            <div className="text-xs font-semibold text-blue-200">Aviation data context</div>
            <p className="mt-2 text-xs leading-5 text-slate-500">Answers combine Gemini with SkyTrack airport, flight, traffic and weather APIs.</p>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Bot className="h-5 w-5" /><span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" /></span>
              <div><h1 className="font-semibold text-slate-950">AI assistant</h1><p className="text-xs text-slate-500">{error ? 'Connection problem' : 'Connected to SkyTrack aviation data'}</p></div>
            </div>
            <button type="button" onClick={() => { setMessages(INITIAL_MESSAGES); setTyping(false); setError('') }} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800">
              <RotateCcw className="h-3.5 w-3.5" /><span className="hidden sm:inline">New chat</span>
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(59,130,246,.06),transparent_35%)] px-4 py-6 sm:px-8">
            <div className="mx-auto max-w-3xl space-y-5">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-950 text-white"><Bot className="h-4 w-4" /></span>}
                  <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${message.role === 'user' ? 'rounded-br-md bg-blue-600 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'}`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className={`mt-2 text-[10px] ${message.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>{message.time}</div>
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white"><Bot className="h-4 w-4" /></span><div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-4">{[0, 1, 2].map((dot) => <span key={dot} className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${dot * 120}ms` }} />)}</div></div>
              )}
              {error && (
                <div className="ml-12 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <div className="font-semibold">Could not get an AI response</div>
                  <div className="mt-1">{error}</div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          <footer className="border-t border-slate-100 bg-white p-4 sm:p-5">
            <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-blue-400 focus-within:bg-white">
              <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage() } }} rows={1} placeholder="Ask about a flight, airport or delay..." className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400" />
              <button type="button" onClick={() => sendMessage()} disabled={!input.trim() || typing} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-4 w-4" /></button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  )
}
