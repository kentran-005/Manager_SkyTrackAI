import type { BackendFlight, FlightCard } from '@/lib/skytrack-data'

export interface FlightSubscription {
  id: number
  flight?: BackendFlight
}

export function extractSubscribedFlightIds(payload: unknown) {
  if (!Array.isArray(payload)) return new Set<string>()
  return new Set(
    (payload as FlightSubscription[])
      .map((subscription) => subscription.flight?.id)
      .filter((id): id is string | number => id !== undefined && id !== null)
      .map(String),
  )
}

export function numericFlightId(flight: Pick<FlightCard, 'id'>) {
  const id = Number(flight.id)
  return Number.isInteger(id) && id > 0 ? id : null
}

export function normalizeFlightIdentifier(value?: string | null) {
  const normalized = (value ?? '').replace(/\s+/g, '').toUpperCase()
  const aliases: Array<[string, string]> = [
    ['HVN', 'VN'],
    ['VNA', 'VN'],
    ['VJC', 'VJ'],
    ['BAV', 'QH'],
    ['PIC', 'BL'],
  ]
  const alias = aliases.find(([icao]) => normalized.startsWith(icao))
  return alias ? `${alias[1]}${normalized.slice(alias[0].length)}` : normalized
}
