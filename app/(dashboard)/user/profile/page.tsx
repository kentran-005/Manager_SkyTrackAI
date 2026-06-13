'use client'

import { useState } from 'react'
import { Bell, Check, Globe2, LogOut, Mail, MapPin, Plane, ShieldCheck, User } from 'lucide-react'
import { useAuth } from '@/lib/authContext'

interface PreferenceRowProps {
  label: string
  description: string
  checked: boolean
  onChange: () => void
}

function PreferenceRow({ label, description, checked, onChange }: PreferenceRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-0">
      <div><div className="text-sm font-semibold text-slate-800">{label}</div><div className="mt-1 text-xs leading-5 text-slate-500">{description}</div></div>
      <button type="button" role="switch" aria-checked={checked} onClick={onChange} className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [flightAlerts, setFlightAlerts] = useState(true)
  const [priceAlerts, setPriceAlerts] = useState(false)
  const [saved, setSaved] = useState(false)

  const initial = user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'

  function savePreferences() {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[28px] bg-[#07111f] p-6 text-white shadow-xl sm:p-8">
          <div className="absolute right-0 top-0 h-full w-2/3 bg-[radial-gradient(circle_at_center,rgba(37,99,235,.35),transparent_60%)]" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-[28px] border border-white/10 bg-gradient-to-br from-blue-500 to-cyan-400 text-3xl font-bold shadow-xl shadow-blue-950/30">{initial}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><h1 className="truncate text-3xl font-semibold tracking-[-0.04em]">{user?.name || 'SkyTrack member'}</h1><span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300"><ShieldCheck className="h-3 w-3" /> Verified</span></div>
              <p className="mt-2 text-sm text-slate-400">{user?.email || 'No email available'}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500"><span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-blue-400" /> Vietnam</span><span className="flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5 text-blue-400" /> English</span></div>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-5">
            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Account details</div>
              <div className="mt-4 space-y-3">
                {[
                  { icon: User, label: 'Display name', value: user?.name || 'Not provided' },
                  { icon: Mail, label: 'Email address', value: user?.email || 'Not provided' },
                  { icon: ShieldCheck, label: 'Account role', value: user?.role === 'ADMIN' ? 'Administrator' : 'Member' },
                ].map((field) => <div key={field.label} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-blue-600 shadow-sm"><field.icon className="h-4 w-4" /></span><div className="min-w-0"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{field.label}</div><div className="mt-0.5 truncate text-sm font-semibold text-slate-800">{field.value}</div></div></div>)}
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm"><Plane className="h-5 w-5 text-blue-600" /><div className="mt-4 text-2xl font-bold">0</div><div className="text-xs text-slate-500">Tracked flights</div></div>
              <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm"><Bell className="h-5 w-5 text-amber-500" /><div className="mt-4 text-2xl font-bold">3</div><div className="text-xs text-slate-500">Active alerts</div></div>
            </section>

            <button type="button" onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"><LogOut className="h-4 w-4" /> Sign out of SkyTrack</button>
          </div>

          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div><h2 className="text-lg font-semibold">Notification preferences</h2><p className="mt-1 text-sm text-slate-500">Choose how SkyTrack should keep you informed.</p></div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Bell className="h-5 w-5" /></span>
            </div>
            <div className="mt-5">
              <PreferenceRow label="Email notifications" description="Receive important flight updates by email." checked={emailNotifications} onChange={() => setEmailNotifications((value) => !value)} />
              <PreferenceRow label="Browser notifications" description="Show updates while the SkyTrack workspace is open." checked={pushNotifications} onChange={() => setPushNotifications((value) => !value)} />
              <PreferenceRow label="Flight status alerts" description="Notify when a tracked flight is delayed, boarding or cancelled." checked={flightAlerts} onChange={() => setFlightAlerts((value) => !value)} />
              <PreferenceRow label="Price drop alerts" description="Receive promotional fare and price change notifications." checked={priceAlerts} onChange={() => setPriceAlerts((value) => !value)} />
            </div>
            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">Preferences are stored for this session.</p>
              <button type="button" onClick={savePreferences} className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${saved ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-500'}`}>{saved ? <Check className="h-4 w-4" /> : null}{saved ? 'Preferences saved' : 'Save preferences'}</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
