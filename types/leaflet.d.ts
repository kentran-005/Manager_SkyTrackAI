declare module 'leaflet' {
  export interface DivIconOptions {
    className?: string
    html?: string
    iconSize?: [number, number]
    iconAnchor?: [number, number]
  }

  export interface LeafletMap {
    invalidateSize(): void
  }

  const L: {
    divIcon(options: DivIconOptions): unknown
  }

  export default L
}
