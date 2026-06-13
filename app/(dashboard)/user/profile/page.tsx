'use client'

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Bell,
  Check,
  Globe2,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Plane,
  Save,
  ShieldCheck,
  User,
} from 'lucide-react'
import api from '@/lib/axios'
import { useAuth } from '@/lib/authContext'

interface ProfileData {
  id: number
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  location: string
  language: string
  preferences: {
    emailNotifications: boolean
    pushNotifications: boolean
    flightAlerts: boolean
    priceAlerts: boolean
  }
  trackedFlights: number
  activeAlerts: number
  createdAt?: string | null
  updatedAt?: string | null
  token?: string | null
}

interface PreferenceRowProps {
  label: string
  description: string
  checked: boolean
  onChange: () => void
}

function PreferenceRow({ label, description, checked, onChange }: PreferenceRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-0">
      <div>
        <div className="text-sm font-semibold text-slate-800">{label}</div>
        <div className="mt-1 text-xs leading-5 text-slate-500">{description}</div>
      </div>
      <button type="button" role="switch" aria-checked={checked} onClick={onChange} className={`relative h-7 w-12 shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

export default function ProfilePage() {
  const { user, updateSession, logout } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [location, setLocation] = useState('Vietnam')
  const [language, setLanguage] = useState('English')
  const [preferences, setPreferences] = useState<ProfileData['preferences']>({
    emailNotifications: true,
    pushNotifications: true,
    flightAlerts: true,
    priceAlerts: false,
  })
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPreferences, setSavingPreferences] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function applyProfile(data: ProfileData) {
    setProfile(data)
    setName(data.name)
    setEmail(data.email)
    setLocation(data.location || 'Vietnam')
    setLanguage(data.language || 'English')
    setPreferences(data.preferences)
  }

  useEffect(() => {
    let mounted = true
    api.get<ProfileData>('/api/profile')
      .then((response) => {
        if (mounted) applyProfile(response.data)
      })
      .catch((requestError) => {
        if (mounted) setError(requestError instanceof Error ? requestError.message : 'Could not load your profile.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  async function saveProfile() {
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.')
      return
    }
    setSavingProfile(true)
    setError('')
    setSuccess('')
    try {
      const response = await api.put<ProfileData>('/api/profile', { name, email, location, language })
      applyProfile(response.data)
      updateSession(
        { ...user, name: response.data.name, email: response.data.email, role: response.data.role },
        response.data.token ?? undefined,
      )
      setSuccess('Profile information updated.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update your profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function savePreferences() {
    setSavingPreferences(true)
    setError('')
    setSuccess('')
    try {
      const response = await api.put<ProfileData>('/api/profile/preferences', preferences)
      applyProfile(response.data)
      setSuccess('Notification preferences saved.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not save notification preferences.')
    } finally {
      setSavingPreferences(false)
    }
  }

  async function changePassword() {
    if (!currentPassword || !newPassword) {
      setError('Enter your current and new password.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New password confirmation does not match.')
      return
    }
    setChangingPassword(true)
    setError('')
    setSuccess('')
    try {
      await api.put('/api/profile/password', { currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess('Password changed successfully.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not change your password.')
    } finally {
      setChangingPassword(false)
    }
  }

  const initial = profile?.name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'

  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-72px)] place-items-center bg-[#f4f7fb] text-slate-500">
        <div className="flex items-center gap-2 text-sm font-semibold"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /> Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[28px] bg-[#07111f] p-6 text-white shadow-xl sm:p-8">
          <div className="absolute right-0 top-0 h-full w-2/3 bg-[radial-gradient(circle_at_center,rgba(37,99,235,.35),transparent_60%)]" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-[28px] border border-white/10 bg-gradient-to-br from-blue-500 to-cyan-400 text-3xl font-bold shadow-xl shadow-blue-950/30">{initial}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-3xl font-semibold tracking-[-0.04em]">{profile?.name || 'SkyTrack member'}</h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300"><ShieldCheck className="h-3 w-3" /> Verified</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{profile?.email}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-blue-400" /> {profile?.location}</span>
                <span className="flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5 text-blue-400" /> {profile?.language}</span>
              </div>
            </div>
          </div>
        </section>

        {(error || success) && (
          <div className={`mt-5 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${error ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            {error ? <AlertCircle className="h-4 w-4 shrink-0" /> : <Check className="h-4 w-4 shrink-0" />}
            {error || success}
          </div>
        )}

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-5">
            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Account details</div>
              <div className="mt-4 space-y-3">
                {[
                  { icon: User, label: 'Display name', value: profile?.name || 'Not provided' },
                  { icon: Mail, label: 'Email address', value: profile?.email || 'Not provided' },
                  { icon: ShieldCheck, label: 'Account role', value: profile?.role === 'ADMIN' ? 'Administrator' : 'Member' },
                ].map((field) => (
                  <div key={field.label} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-blue-600 shadow-sm"><field.icon className="h-4 w-4" /></span>
                    <div className="min-w-0"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{field.label}</div><div className="mt-0.5 truncate text-sm font-semibold text-slate-800">{field.value}</div></div>
                  </div>
                ))}
              </div>
              {profile?.createdAt && <p className="mt-4 text-[11px] text-slate-400">Member since {new Date(profile.createdAt).toLocaleDateString()}</p>}
            </section>

            <section className="grid grid-cols-2 gap-3">
              <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm"><Plane className="h-5 w-5 text-blue-600" /><div className="mt-4 text-2xl font-bold">{profile?.trackedFlights ?? 0}</div><div className="text-xs text-slate-500">Tracked flights</div></div>
              <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm"><Bell className="h-5 w-5 text-amber-500" /><div className="mt-4 text-2xl font-bold">{profile?.activeAlerts ?? 0}</div><div className="text-xs text-slate-500">Unread alerts</div></div>
            </section>

            <button type="button" onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"><LogOut className="h-4 w-4" /> Sign out of SkyTrack</button>
          </div>

          <div className="space-y-5">
            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div><h2 className="text-lg font-semibold">Personal information</h2><p className="mt-1 text-sm text-slate-500">Keep your account details current across SkyTrack.</p></div>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><User className="h-5 w-5" /></span>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold text-slate-600">Display name<input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-400 focus:bg-white" /></label>
                <label className="text-xs font-semibold text-slate-600">Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-400 focus:bg-white" /></label>
                <label className="text-xs font-semibold text-slate-600">Location<input value={location} onChange={(event) => setLocation(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-400 focus:bg-white" /></label>
                <label className="text-xs font-semibold text-slate-600">Language<select value={language} onChange={(event) => setLanguage(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-400 focus:bg-white"><option>English</option><option>Tiếng Việt</option></select></label>
              </div>
              <div className="mt-5 flex justify-end">
                <button type="button" onClick={() => void saveProfile()} disabled={savingProfile} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60">{savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save profile</button>
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div><h2 className="text-lg font-semibold">Notification preferences</h2><p className="mt-1 text-sm text-slate-500">Choose how SkyTrack should keep you informed.</p></div>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Bell className="h-5 w-5" /></span>
              </div>
              <div className="mt-5">
                <PreferenceRow label="Email notifications" description="Receive important flight updates by email." checked={preferences.emailNotifications} onChange={() => setPreferences((value) => ({ ...value, emailNotifications: !value.emailNotifications }))} />
                <PreferenceRow label="Browser notifications" description="Show updates while the SkyTrack workspace is open." checked={preferences.pushNotifications} onChange={() => setPreferences((value) => ({ ...value, pushNotifications: !value.pushNotifications }))} />
                <PreferenceRow label="Flight status alerts" description="Notify when a tracked flight is delayed, boarding or cancelled." checked={preferences.flightAlerts} onChange={() => setPreferences((value) => ({ ...value, flightAlerts: !value.flightAlerts }))} />
                <PreferenceRow label="Price drop alerts" description="Receive promotional fare and price change notifications." checked={preferences.priceAlerts} onChange={() => setPreferences((value) => ({ ...value, priceAlerts: !value.priceAlerts }))} />
              </div>
              <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
                <button type="button" onClick={() => void savePreferences()} disabled={savingPreferences} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-wait disabled:opacity-60">{savingPreferences ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save preferences</button>
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div><h2 className="text-lg font-semibold">Change password</h2><p className="mt-1 text-sm text-slate-500">Your new password follows the policy configured by the administrator.</p></div>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600"><KeyRound className="h-5 w-5" /></span>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <label className="text-xs font-semibold text-slate-600">Current password<input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-400 focus:bg-white" /></label>
                <label className="text-xs font-semibold text-slate-600">New password<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-400 focus:bg-white" /></label>
                <label className="text-xs font-semibold text-slate-600">Confirm password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-400 focus:bg-white" /></label>
              </div>
              <div className="mt-5 flex justify-end">
                <button type="button" onClick={() => void changePassword()} disabled={changingPassword} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-wait disabled:opacity-60">{changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Update password</button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
