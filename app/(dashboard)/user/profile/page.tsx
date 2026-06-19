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
  type LucideIcon,
} from 'lucide-react'
import api from '@/lib/axios'
import { useAuth } from '@/lib/authContext'
import buttonStyle from '../../admin/settings/css/button.module.css'
import switchStyle from '../../admin/settings/css/switch.module.css'

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
  onChange: (checked: boolean) => void
}

function PreferenceRow({ label, description, checked, onChange }: PreferenceRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-0">
      <div>
        <div className="text-sm font-semibold text-slate-800">{label}</div>
        <div className="mt-1 text-xs leading-5 text-slate-500">{description}</div>
      </div>
      <label className={switchStyle['plane-switch']}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-label={`${label}: ${checked ? 'enabled' : 'disabled'}`}
        />
        <div>
          <div>
            <svg viewBox="0 0 13 13" aria-hidden="true">
              <path d="M1.55989957,5.41666667 L5.51582215,5.41666667 L4.47015462,0.108333333 C4.47015462,0.0634601974 4.49708054,0.0249592654 4.5354546,0.00851337035 L4.57707145,0 L5.36229752,0 C5.43359776,0 5.50087375,0.028779451 5.55026392,0.0782711996 L5.59317877,0.134368264 L7.13659662,2.81558333 L8.29565964,2.81666667 C8.53185377,2.81666667 8.72332694,3.01067661 8.72332694,3.25 C8.72332694,3.48932339 8.53185377,3.68333333 8.29565964,3.68333333 L7.63589819,3.68225 L8.63450135,5.41666667 L11.9308317,5.41666667 C12.5213171,5.41666667 13,5.90169152 13,6.5 C13,7.09830848 12.5213171,7.58333333 11.9308317,7.58333333 L8.63450135,7.58333333 L7.63589819,9.31666667 L8.29565964,9.31666667 C8.53185377,9.31666667 8.72332694,9.51067661 8.72332694,9.75 C8.72332694,9.98932339 8.53185377,10.1833333 8.29565964,10.1833333 L7.13659662,10.1833333 L5.59317877,12.8656317 C5.55725264,12.9280353 5.49882018,12.9724157 5.43174295,12.9907056 L5.36229752,13 L4.57707145,13 C4.51267695,12.9890959 4.48069792,12.9547924 4.47230803,12.9134397 L5.51582215,7.58333333 L1.55989957,7.58333333 L0.891288881,8.55114605 C0.853775374,8.60544678 0.798421006,8.64327676 0.73629202,8.65879796 L0.106844414,8.66666667 C0.0297243066,8.6457608 0.00275502199,8.60729104 0,8.5651586 L0.580855011,6.85813984 C0.64492547,6.67265611 0.6577034,6.47392717 0.619193545,6.28316421 L0.00601851064,4.48064746 C0.00203480725,4.4691314 0,4.45701613 0,4.44481314 C0,4.39994001 0.0269259152,4.36143908 0.0652999725,4.34499318 L0.672546853,4.33647981 C0.737865848,4.33647981 0.80011301,4.36066329 0.848265401,4.40322477 L1.55989957,5.41666667 Z" fill="currentColor" />
            </svg>
          </div>
          <span className={switchStyle['street-middle']} />
          <span className={switchStyle.cloud} />
          <span className={`${switchStyle.cloud} ${switchStyle.two}`} />
        </div>
      </label>
    </div>
  )
}

function ProfileActionButton({
  icon: Icon,
  idleLabel,
  busyLabel,
  savedLabel,
  busy,
  saved,
  onClick,
}: {
  icon: LucideIcon
  idleLabel: string
  busyLabel: string
  savedLabel: string
  busy: boolean
  saved: boolean
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} disabled={busy} className={buttonStyle.btn}>
      <span className={`${buttonStyle.label} inline-flex items-center gap-2`}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
        {busy ? busyLabel : saved ? savedLabel : idleLabel}
      </span>
      <span className={buttonStyle.containerStars} aria-hidden="true">
        <span className={buttonStyle.stars} />
      </span>
      <span className={buttonStyle.glow} aria-hidden="true">
        <span className={buttonStyle.circle} />
        <span className={buttonStyle.circle} />
      </span>
    </button>
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
  const [savedAction, setSavedAction] = useState<'profile' | 'preferences' | 'password' | null>(null)

  function showSuccess(action: 'profile' | 'preferences' | 'password', message: string) {
    setSavedAction(action)
    setSuccess(message)
    window.setTimeout(() => {
      setSavedAction((current) => current === action ? null : current)
    }, 2000)
  }

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
      showSuccess('profile', 'Profile information updated.')
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
      showSuccess('preferences', 'Notification preferences saved.')
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
      showSuccess('password', 'Password changed successfully.')
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
                <ProfileActionButton
                  icon={Save}
                  idleLabel="Save profile"
                  busyLabel="Saving..."
                  savedLabel="Saved"
                  busy={savingProfile}
                  saved={savedAction === 'profile'}
                  onClick={() => void saveProfile()}
                />
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div><h2 className="text-lg font-semibold">Notification preferences</h2><p className="mt-1 text-sm text-slate-500">Choose how SkyTrack should keep you informed.</p></div>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Bell className="h-5 w-5" /></span>
              </div>
              <div className="mt-5">
                <PreferenceRow label="Email notifications" description="Receive important flight updates by email." checked={preferences.emailNotifications} onChange={(checked) => setPreferences((value) => ({ ...value, emailNotifications: checked }))} />
                <PreferenceRow label="Browser notifications" description="Show updates while the SkyTrack workspace is open." checked={preferences.pushNotifications} onChange={(checked) => setPreferences((value) => ({ ...value, pushNotifications: checked }))} />
                <PreferenceRow label="Flight status alerts" description="Notify when a tracked flight is delayed, boarding or cancelled." checked={preferences.flightAlerts} onChange={(checked) => setPreferences((value) => ({ ...value, flightAlerts: checked }))} />
                <PreferenceRow label="Price drop alerts" description="Receive promotional fare and price change notifications." checked={preferences.priceAlerts} onChange={(checked) => setPreferences((value) => ({ ...value, priceAlerts: checked }))} />
              </div>
              <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
                <ProfileActionButton
                  icon={Bell}
                  idleLabel="Save preferences"
                  busyLabel="Saving..."
                  savedLabel="Saved"
                  busy={savingPreferences}
                  saved={savedAction === 'preferences'}
                  onClick={() => void savePreferences()}
                />
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
                <ProfileActionButton
                  icon={KeyRound}
                  idleLabel="Update password"
                  busyLabel="Updating..."
                  savedLabel="Updated"
                  busy={changingPassword}
                  saved={savedAction === 'password'}
                  onClick={() => void changePassword()}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
