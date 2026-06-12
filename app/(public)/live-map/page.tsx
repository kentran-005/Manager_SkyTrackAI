'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import FlightInfoCard from '../../components/FlightInfoCard'
import MapControls from '../../components/MapControls'
import StatusLegend from '../../components/StatusLegend'

const MapView = dynamic(() => import('../../components/MapView'), { ssr: false })

export default function LiveMapPage() {
  // State quản lý chuyến bay được click chọn
  const [selectedFlight, setSelectedFlight] = useState<any>(null)

  return (
    <>
      <main className="relative flex-1 min-h-screen w-full overflow-hidden">
        {/* Truyền hàm setSelectedFlight xuống MapView */}
        <MapView 
          selectedFlight={selectedFlight} 
          onSelectFlight={setSelectedFlight} 
        />

        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* ĐÃ XÓA: <SearchFilterPanel /> */}
          
          {/* Truyền chuyến bay được chọn và hàm đóng xuống FlightInfoCard */}
          <FlightInfoCard 
            flight={selectedFlight} 
            onClose={() => setSelectedFlight(null)} 
          />
          
          <MapControls />
          <StatusLegend />
        </div>
      </main>
    </>
  )
}