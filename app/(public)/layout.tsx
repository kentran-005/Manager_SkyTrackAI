'use client'

import { usePathname } from 'next/navigation'
import Footer from '../components/Footer'
import Header from '../components/Header'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLiveMap = pathname === '/live-map'

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f4f7fb]">
      <Header />
      <div className={isLiveMap ? 'flex-1 overflow-hidden' : 'flex-1'}>{children}</div>
      {!isLiveMap && <Footer />}
    </div>
  )
}
