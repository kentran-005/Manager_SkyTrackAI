'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Bell,
  BarChart3,
  Bot,
  Building2,
  LayoutDashboard,
  LogOut,
  MapIcon,
  Menu,
  MessageSquare,
  Plane,
  PlaneTakeoff,
  Radar,
  Search,
  Settings,
  Sparkles,
  Ticket,
  UserCircle,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/lib/authContext'
import api from '@/lib/axios'

interface NavLink {
  icon: LucideIcon
  label: string
  href: string
  badge?: number
}

const ADMIN_LINKS: NavLink[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Building2, label: 'Airports', href: '/admin/airports' },
  { icon: Plane, label: 'Airlines', href: '/admin/airlines' },
  { icon: PlaneTakeoff, label: 'Flights', href: '/admin/flights' },
  { icon: MapIcon, label: 'Live map', href: '/admin/live-map' },
  { icon: BarChart3, label: 'Reports', href: '/admin/reports' },
  { icon: UsersRound, label: 'Users', href: '/admin/users' },
  { icon: Bot, label: 'AI Summary', href: '/admin/ai' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
]

const USER_LINKS: NavLink[] = [
  { icon: Ticket, label: 'My flights', href: '/user' },
  { icon: Search, label: 'Search flights', href: '/user/searchflight' },
  { icon: MapIcon, label: 'Live map', href: '/user/live-map' },
  { icon: Bell, label: 'Notifications', href: '/user/notifications' },
  { icon: MessageSquare, label: 'AI assistant', href: '/user/ai' },
  { icon: UserCircle, label: 'Profile', href: '/user/profile' },
]

const PAGE_TITLES: Record<string, string> = {
  '/user': 'Flight overview',
  '/user/searchflight': 'Search flights',
  '/user/live-map': 'Live map',
  '/user/notifications': 'Notifications',
  '/user/ai': 'AI assistant',
  '/user/profile': 'Profile',
  '/admin': 'Admin overview',
  '/admin/airports': 'Airport management',
  '/admin/airlines': 'Airline management',
  '/admin/flights': 'Flight management',
  '/admin/live-map': 'Live flight map',
  '/admin/reports': 'Reports & analytics',
  '/admin/users': 'User management',
  '/admin/ai': 'AI operations',
  '/admin/settings': 'System settings',
}

function isActiveRoute(pathname: string, href: string) {
  if (href === '/admin' || href === '/user') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (pathname.startsWith('/admin') && user.role !== 'ADMIN') router.replace('/user')
  }, [isLoading, pathname, router, user])

  useEffect(() => setSidebarOpen(false), [pathname])

  useEffect(() => {
    if (isLoading || !user || user.role === 'ADMIN') {
      setUnreadNotifications(0)
      return
    }

    let active = true
    api.get<Array<{ read?: boolean }>>('/api/notifications/me')
      .then((response) => {
        if (!active) return
        const notifications = Array.isArray(response.data) ? response.data : []
        setUnreadNotifications(notifications.filter((item) => !item.read).length)
      })
      .catch(() => {
        if (active) setUnreadNotifications(0)
      })

    function handleNotificationUpdate(event: Event) {
      const nextCount = (event as CustomEvent<number>).detail
      if (Number.isFinite(nextCount)) setUnreadNotifications(Math.max(0, nextCount))
    }

    window.addEventListener('skytrack-notifications-updated', handleNotificationUpdate)
    return () => {
      active = false
      window.removeEventListener('skytrack-notifications-updated', handleNotificationUpdate)
    }
  }, [isLoading, user])

  if (isLoading || !user || (pathname.startsWith('/admin') && user.role !== 'ADMIN')) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f4f7fb]">
        <div className="text-center">
          <div className="relative mx-auto h-12 w-12">
            <div className="absolute inset-0 animate-ping rounded-full border border-blue-400/40" />
            <div className="absolute inset-2 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500">Preparing your workspace...</p>
        </div>
      </div>
    )
  }

  const isAdminRoute = pathname.startsWith('/admin')
  const links = isAdminRoute && user.role === 'ADMIN' ? ADMIN_LINKS : USER_LINKS
  const displayRole = isAdminRoute && user.role === 'ADMIN' ? 'Administrator' : 'Flight member'
  const pageTitle = PAGE_TITLES[pathname] ?? (isAdminRoute ? 'Administration' : 'Workspace')

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950">
      {sidebarOpen && <button type="button" aria-label="Close navigation overlay" className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col overflow-y-auto border-r border-white/10 bg-[#07111f] px-4 py-5 text-white shadow-2xl transition-transform duration-300 [scrollbar-color:#1e3a5f_transparent] [scrollbar-width:thin] lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2">
          <Link href={isAdminRoute ? '/admin' : '/user'} className="flex items-center gap-3">
            <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/25">
              <Radar className="absolute h-8 w-8 opacity-35" strokeWidth={1.4} />
              <Plane className="h-4 w-4 -rotate-12" fill="currentColor" />
            </span>
            <span>
              <span className="block text-[15px] font-bold">SkyTrack AI</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{isAdminRoute ? 'Control center' : 'Flight workspace'}</span>
            </span>
          </Link>
          <button type="button" onClick={() => setSidebarOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-white/10 hover:text-white lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-7 flex items-center justify-between px-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Navigation</span>
          <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-blue-300">{user.role}</span>
        </div>

        <nav className="mt-3 space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const active = isActiveRoute(pathname, link.href)
            const badge = link.href === '/user/notifications' ? unreadNotifications : (link.badge ?? 0)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                onClick={(event) => event.currentTarget.blur()}
                className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111f] ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'}`}
              >
                <Icon className={`h-[18px] w-[18px] ${active ? 'text-white' : 'text-slate-500 group-hover:text-blue-300'}`} />
                <span className="flex-1">{link.label}</span>
                {badge > 0 ? <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold ${active ? 'bg-white text-blue-700' : 'bg-rose-500 text-white'}`}>{badge > 99 ? '99+' : badge}</span> : null}
              </Link>
            )
          })}
        </nav>

        {!isAdminRoute && (
          <Link href="/user/ai" className="group relative mt-auto overflow-hidden rounded-[22px] border border-blue-400/20 bg-blue-500/10 p-4">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl" />
            <Sparkles className="relative h-5 w-5 text-blue-300" />
            <div className="relative mt-4 text-sm font-semibold">Ask SkyTrack AI</div>
            <p className="relative mt-1 text-xs leading-5 text-slate-500">Get quick help with flights, routes and airport information.</p>
            <div className="relative mt-4 text-xs font-bold text-blue-300 group-hover:text-white">Start a conversation →</div>
          </Link>
        )}

        <div className={`${isAdminRoute ? 'mt-auto' : 'mt-4'} rounded-[22px] border border-white/10 bg-white/[0.04] p-3`}>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-bold text-white">
              {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{user.name || user.email}</div>
              <div className="text-[11px] text-slate-500">{displayRole}</div>
            </div>
            <button type="button" onClick={logout} title="Sign out" className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-300">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[280px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <div className="text-sm font-semibold text-slate-950">{pageTitle}</div>
              <div className="hidden text-xs text-slate-400 sm:block">SkyTrack member workspace</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isAdminRoute && (
              <Link href="/user/searchflight" className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600 sm:flex">
                <Search className="h-3.5 w-3.5" /> Find a flight
              </Link>
            )}
            <Link href={isAdminRoute ? '/admin' : '/user/notifications'} aria-label={isAdminRoute ? 'Admin dashboard' : 'Open notifications'} className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:text-blue-600">
              <Bell className="h-4 w-4" />
              {!isAdminRoute && unreadNotifications > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />}
            </Link>
            <Link href={isAdminRoute ? '/admin' : '/user/profile'} aria-label={isAdminRoute ? 'Admin profile' : 'Open profile'} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-xs font-bold text-white">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </Link>
          </div>
        </header>
        <main className="min-h-[calc(100vh-72px)]">{children}</main>
      </div>
    </div>
  )
}
