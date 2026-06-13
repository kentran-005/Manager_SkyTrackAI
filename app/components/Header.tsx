'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Plane, Radar, X } from 'lucide-react'
import { useState } from 'react'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Live map', href: '/live-map' },
  { label: 'Flights', href: '/flights' },
  { label: 'Airports', href: '/airports' },
]

export default function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const isLiveMap = pathname === '/live-map'

  return (
    <header className={`relative z-[2000] border-b ${isLiveMap ? 'border-white/10 bg-[#0a111d] text-white' : 'border-slate-200/80 bg-white/90 text-slate-950 backdrop-blur-xl'}`}>
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" onClick={() => setMenuOpen(false)}>
          <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Radar className="absolute h-8 w-8 opacity-35" strokeWidth={1.4} />
            <Plane className="h-4 w-4 -rotate-12" fill="currentColor" />
          </span>
          <span>
            <span className="block text-[15px] font-bold tracking-[-0.02em]">SkyTrack AI</span>
            <span className={`block text-[10px] font-semibold uppercase tracking-[0.18em] ${isLiveMap ? 'text-slate-500' : 'text-slate-400'}`}>
              Vietnam airspace
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/80 p-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-white hover:text-slate-950'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${isLiveMap ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}>
            Sign in
          </Link>
          <Link href="/register" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500">
            Get started
          </Link>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          className={`grid h-10 w-10 place-items-center rounded-xl md:hidden ${isLiveMap ? 'bg-white/10' : 'bg-slate-100'}`}
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className={`absolute inset-x-0 top-[72px] border-b p-4 shadow-2xl md:hidden ${isLiveMap ? 'border-white/10 bg-[#0a111d]' : 'border-slate-200 bg-white'}`}>
          <nav className="grid gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold ${pathname === link.href ? 'bg-blue-600 text-white' : isLiveMap ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href="/login" className={`rounded-xl border px-4 py-3 text-center text-sm font-semibold ${isLiveMap ? 'border-white/10 text-white' : 'border-slate-200 text-slate-700'}`}>Sign in</Link>
            <Link href="/register" className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white">Get started</Link>
          </div>
        </div>
      )}
    </header>
  )
}
