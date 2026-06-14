'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Bell, Check, CheckCircle2, Clock3, Info, Loader2, Trash2, XCircle } from 'lucide-react'
import api from '@/lib/axios'

type NotificationType = 'warning' | 'info' | 'success' | 'error'
interface Notification {
  id: number
  title: string
  message: string
  createdAt?: string
  read: boolean
}

const TYPE_STYLE = {
  warning: { icon: AlertTriangle, box: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500' },
  info: { icon: Info, box: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
  success: { icon: CheckCircle2, box: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
  error: { icon: XCircle, box: 'bg-rose-50 text-rose-600', dot: 'bg-rose-500' },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | 'all' | null>(null)
  const [error, setError] = useState('')
  const unread = notifications.filter((item) => !item.read).length
  const visible = useMemo(() => notifications.filter((item) => filter === 'all' || (filter === 'unread' ? !item.read : item.read)), [filter, notifications])

  useEffect(() => {
    let mounted = true
    api.get<Notification[]>('/api/notifications/me')
      .then((response) => {
        if (mounted) setNotifications(Array.isArray(response.data) ? response.data : [])
      })
      .catch((requestError) => {
        if (mounted) setError(requestError instanceof Error ? requestError.message : 'Could not load notifications.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  async function markRead(id: number) {
    setBusyId(id)
    setError('')
    try {
      await api.put(`/api/notifications/me/${id}/read`)
      setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update notification.')
    } finally {
      setBusyId(null)
    }
  }

  async function markAllRead() {
    setBusyId('all')
    setError('')
    try {
      await api.put('/api/notifications/me/read-all')
      setNotifications((items) => items.map((item) => ({ ...item, read: true })))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update notifications.')
    } finally {
      setBusyId(null)
    }
  }

  async function deleteNotification(id: number) {
    setBusyId(id)
    setError('')
    try {
      await api.delete(`/api/notifications/me/${id}`)
      setNotifications((items) => items.filter((item) => item.id !== id))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not delete notification.')
    } finally {
      setBusyId(null)
    }
  }

  function notificationType(notification: Notification): NotificationType {
    const text = `${notification.title} ${notification.message}`.toLowerCase()
    if (/(cancel|failed|error)/.test(text)) return 'error'
    if (/(delay|warning|late)/.test(text)) return 'warning'
    if (/(on time|success|confirmed)/.test(text)) return 'success'
    return 'info'
  }

  function formatTime(value?: string) {
    if (!value) return 'Recently'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleString()
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[28px] bg-[#07111f] p-6 text-white shadow-xl sm:p-8">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(37,99,235,.32),transparent_60%)]" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div><div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Activity center</div><h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Stay ahead of every change.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{unread ? `${unread} unread updates need your attention.` : 'You are all caught up.'}</p></div>
            {unread > 0 && <button type="button" onClick={() => void markAllRead()} disabled={busyId !== null} className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60">{busyId === 'all' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Mark all as read</button>}
          </div>
        </section>

        {error && <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {(['all', 'unread', 'read'] as const).map((value) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-lg px-4 py-2 text-xs font-semibold capitalize transition ${filter === value ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>{value}{value === 'unread' && unread ? ` ${unread}` : ''}</button>)}
          </div>
          <div className="text-xs text-slate-500">{visible.length} notification{visible.length === 1 ? '' : 's'} shown</div>
        </div>

        <div className="mt-4 space-y-3">
          {visible.map((notification) => {
            const style = TYPE_STYLE[notificationType(notification)]
            const Icon = style.icon
            return (
              <article key={notification.id} className={`group flex gap-4 rounded-[22px] border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${notification.read ? 'border-slate-200 opacity-75' : 'border-blue-200'}`}>
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${style.box}`}><Icon className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div className="flex items-center gap-2"><h2 className="font-semibold text-slate-950">{notification.title}</h2>{!notification.read && <span className={`h-2 w-2 rounded-full ${style.dot}`} />}</div><span className="flex shrink-0 items-center gap-1 text-[11px] text-slate-400"><Clock3 className="h-3 w-3" />{formatTime(notification.createdAt)}</span></div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{notification.message}</p>
                  <div className="mt-3 flex gap-2">
                    {!notification.read && <button type="button" onClick={() => void markRead(notification.id)} disabled={busyId !== null} className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-wait disabled:opacity-60">Mark read</button>}
                    <button type="button" onClick={() => void deleteNotification(notification.id)} disabled={busyId !== null} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-wait disabled:opacity-60">{busyId === notification.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Delete</button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {!loading && visible.length === 0 && <div className="mt-4 grid min-h-72 place-items-center rounded-[28px] border border-dashed border-slate-300 bg-white text-center"><div><Bell className="mx-auto h-9 w-9 text-slate-300" /><h2 className="mt-4 font-semibold">No notifications here</h2><p className="mt-1 text-sm text-slate-500">There are no items matching the selected filter.</p></div></div>}
        {loading && <div className="mt-4 grid min-h-72 place-items-center rounded-[28px] border border-slate-200 bg-white text-sm font-semibold text-slate-500"><span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /> Loading notifications...</span></div>}
      </div>
    </div>
  )
}
