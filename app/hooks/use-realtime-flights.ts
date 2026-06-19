'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/axios'
import type { RealtimeFlight, RealtimeFlightStatus } from '@/lib/skytrack-data'

interface RealtimeFlightSnapshotResponse {
  flights?: RealtimeFlight[]
  status?: RealtimeFlightStatus
}

interface RealtimeFlightState {
  flights: RealtimeFlight[]
  status: RealtimeFlightStatus | null
  loading: boolean
  error: string
  fetchedAt: Date | null
}

const POLL_INTERVAL_MS = 15_000
const REQUEST_DEDUP_MS = 5_000
const REQUEST_TIMEOUT_MS = 10_000
const listeners = new Set<(state: RealtimeFlightState) => void>()

let sharedState: RealtimeFlightState = {
  flights: [],
  status: null,
  loading: true,
  error: '',
  fetchedAt: null,
}
let activeRequest: Promise<void> | null = null
let pollTimer: ReturnType<typeof setTimeout> | null = null
let lastRequestAt = 0

function publish(nextState: RealtimeFlightState) {
  sharedState = nextState
  listeners.forEach((listener) => listener(sharedState))
}

async function requestSnapshot() {
  try {
    const response = await api.get<RealtimeFlightSnapshotResponse>('/api/realtime-flights/snapshot', {
      timeout: REQUEST_TIMEOUT_MS,
    })
    return response.data
  } catch (error: unknown) {
    const status = (error as { status?: number }).status

    if (status !== 404 && status !== 405) throw error

    const [flightsResult, statusResult] = await Promise.allSettled([
      api.get<RealtimeFlight[]>('/api/realtime-flights', { timeout: REQUEST_TIMEOUT_MS }),
      api.get<RealtimeFlightStatus>('/api/realtime-flights/status', { timeout: REQUEST_TIMEOUT_MS }),
    ])

    if (flightsResult.status === 'rejected') throw flightsResult.reason
    return {
      flights: Array.isArray(flightsResult.value.data) ? flightsResult.value.data : [],
      status: statusResult.status === 'fulfilled' ? statusResult.value.data : undefined,
    }
  }
}

async function loadRealtimeFlights(force = false) {
  if (activeRequest) return activeRequest
  if (!force && Date.now() - lastRequestAt < REQUEST_DEDUP_MS) return

  lastRequestAt = Date.now()
  if (sharedState.flights.length === 0) {
    publish({ ...sharedState, loading: true, error: '' })
  }

  activeRequest = requestSnapshot()
    .then((snapshot) => {
      const flights = Array.isArray(snapshot?.flights) ? snapshot.flights : []
      publish({
        flights,
        status: snapshot?.status ?? null,
        loading: false,
        error: '',
        fetchedAt: new Date(),
      })
    })
    .catch(() => {
      publish({
        ...sharedState,
        loading: false,
        error: sharedState.flights.length > 0
          ? 'Cannot refresh traffic right now. Keeping the last available snapshot.'
          : 'Realtime traffic is temporarily unavailable.',
      })
    })
    .finally(() => {
      activeRequest = null
    })

  return activeRequest
}

function scheduleNextPoll() {
  if (pollTimer) clearTimeout(pollTimer)
  if (listeners.size === 0) {
    pollTimer = null
    return
  }

  pollTimer = setTimeout(() => {
    void loadRealtimeFlights(true).finally(scheduleNextPoll)
  }, POLL_INTERVAL_MS)
}

function refreshWhenActive() {
  if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
  void loadRealtimeFlights(true).finally(scheduleNextPoll)
}

function subscribe(listener: (state: RealtimeFlightState) => void) {
  listeners.add(listener)
  listener(sharedState)

  if (listeners.size === 1) {
    void loadRealtimeFlights().finally(scheduleNextPoll)
    window.addEventListener('focus', refreshWhenActive)
    window.addEventListener('online', refreshWhenActive)
    document.addEventListener('visibilitychange', refreshWhenActive)
  }

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      if (pollTimer) {
        clearTimeout(pollTimer)
        pollTimer = null
      }
      window.removeEventListener('focus', refreshWhenActive)
      window.removeEventListener('online', refreshWhenActive)
      document.removeEventListener('visibilitychange', refreshWhenActive)
    }
  }
}

export function useRealtimeFlights() {
  const [state, setState] = useState(sharedState)

  useEffect(() => subscribe(setState), [])

  return {
    ...state,
    refresh: () => loadRealtimeFlights(true),
  }
}
