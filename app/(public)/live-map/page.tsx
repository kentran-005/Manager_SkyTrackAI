'use client'

import dynamic from 'next/dynamic'
import SearchFilterPanel from '../../components/SearchFilterPanel'
import FlightInfoCard from '../../components/FlightInfoCard'
import MapControls from '../../components/MapControls'
import StatusLegend from '../../components/StatusLegend'
import FooterStats from '../../components/FooterStats'

const MapView = dynamic(() => import('../../components/MapView'), { ssr: false })

export default function LiveMapPage() {
  return (
    <>
      {/* Main Canvas */}
      <main className="relative flex-1 min-h-screen w-full overflow-hidden">
        {/* Layer 1: Map */}
        <MapView />

        {/* Layer 2: Floating Overlays */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <SearchFilterPanel />
          <FlightInfoCard />
          <MapControls />
          <StatusLegend />
        </div>
      </main>

      {/* Footer */}
      <FooterStats />
    </>
  )
}
