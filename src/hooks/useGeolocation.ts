import { useEffect, useRef, useState } from 'react'
import type { LatLng } from '@/types/route'

interface GeolocationState {
  position: LatLng | null
  accuracy: number | null
  error: string | null
  loading: boolean
  supported: boolean
}

/**
 * Wraps the browser Geolocation API with `watchPosition` for live tracking.
 * Only active while `enabled` is true, so it's easy to pair with a
 * "simulate movement" toggle without holding two GPS watchers at once.
 */
export function useGeolocation(enabled: boolean): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    accuracy: null,
    error: null,
    loading: false,
    supported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
  })
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      return
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation is not supported on this device', supported: false }))
      return
    }

    setState((s) => ({ ...s, loading: true, error: null }))

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          accuracy: pos.coords.accuracy,
          error: null,
          loading: false,
          supported: true,
        })
      },
      (err) => {
        setState((s) => ({ ...s, error: err.message, loading: false }))
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [enabled])

  return state
}
