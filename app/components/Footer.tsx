import Link from 'next/link'
import { ArrowUpRight, Mail, MapPin, Plane, Radar } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#07111f] text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr_0.8fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-blue-600">
                <Radar className="absolute h-8 w-8 opacity-35" />
                <Plane className="h-4 w-4 -rotate-12" fill="currentColor" />
              </span>
              <span>
                <span className="block font-bold">SkyTrack AI</span>
                <span className="text-xs text-slate-500">Vietnam flight intelligence</span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
              A clearer way to discover flights, monitor Vietnamese airspace and make operational decisions from live aviation data.
            </p>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Explore</div>
            <div className="mt-4 grid gap-3 text-sm text-slate-300">
              <Link href="/flights" className="hover:text-white">Flights</Link>
              <Link href="/airports" className="hover:text-white">Airports</Link>
              <Link href="/search" className="hover:text-white">Flight search</Link>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Contact</div>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <div className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />Ho Chi Minh City, Vietnam</div>
              <a href="mailto:contact@skytrackai.com" className="flex gap-2 hover:text-white"><Mail className="h-4 w-4 shrink-0 text-blue-400" />contact@skytrackai.com</a>
            </div>
          </div>

          <Link href="/live-map" className="group rounded-3xl border border-white/10 bg-white/[0.05] p-5 transition hover:border-blue-400/40 hover:bg-blue-500/10">
            <div className="flex items-center justify-between">
              <Radar className="h-5 w-5 text-blue-400" />
              <ArrowUpRight className="h-4 w-4 text-slate-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
            </div>
            <div className="mt-5 font-semibold">Open live radar</div>
            <p className="mt-1 text-xs leading-5 text-slate-400">Follow aircraft over Vietnam in real time.</p>
          </Link>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} SkyTrack AI. All rights reserved.</span>
          <span>Built for safer, smarter aviation operations.</span>
        </div>
      </div>
    </footer>
  )
}
