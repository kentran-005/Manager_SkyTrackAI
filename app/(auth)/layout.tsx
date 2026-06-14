import { Plane, Radar } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#020b19] px-4 py-8 text-white sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(37,99,235,.3),transparent_27%),radial-gradient(circle_at_82%_75%,rgba(6,182,212,.16),transparent_30%),linear-gradient(145deg,#020817_0%,#06162b_48%,#03101f_100%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(96,165,250,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(96,165,250,.15)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" />
      <div className="absolute -left-32 top-1/3 h-80 w-80 rounded-full border border-blue-400/10" />
      <div className="absolute -left-20 top-1/3 h-56 w-56 rounded-full border border-blue-400/10" />
      <div className="absolute -right-28 bottom-10 h-72 w-72 rounded-full border border-cyan-400/10" />

      <div className="relative z-10 w-full max-w-[460px]">
        <div className="mb-5 flex items-center justify-center gap-3">
          <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 shadow-[0_12px_35px_rgba(37,99,235,.42)]">
            <Radar className="absolute h-9 w-9 opacity-35" strokeWidth={1.3} />
            <Plane className="h-5 w-5 -rotate-12" fill="currentColor" />
          </span>
          <div>
            <div className="text-xl font-black tracking-[-0.03em]">SkyTrack AI</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300/70">Vietnam Flight Intelligence</div>
          </div>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#06172c]/90 p-5 shadow-[0_35px_100px_rgba(0,0,0,.55)] backdrop-blur-2xl sm:p-7">
          <div className="pointer-events-none absolute inset-x-10 top-20 h-32 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative">{children}</div>
        </section>

        <p className="mt-5 text-center text-[11px] text-slate-600">
          Secure access powered by SkyTrack AI
        </p>
      </div>
    </main>
  );
}
