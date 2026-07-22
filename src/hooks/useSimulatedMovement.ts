import { useEffect, useRef, useState } from 'react'
import type { LatLng } from '@/types/route'
import { haversineKm, lerpLatLng } from '@/utils/geo'

interface SimulatedMovementState {
  position: LatLng | null
  progressPct: number
  distanceCoveredKm: number
}

/**
 * Animates a marker along a polyline path at a roughly constant speed, used
 * to demo "live GPS tracking" when a real device location isn't available
 * (e.g. testing on desktop, or the driver's phone has location disabled).
 */
export function useSimulatedMovement(path: [number, number][], enabled: boolean, speedKmh = 26): SimulatedMovementState {
  const [state, setState] = useState<SimulatedMovementState>({ position: null, progressPct: 0, distanceCoveredKm: 0 })
  const frameRef = useRef<number | null>(null)
  const traveledRef = useRef(0)

  useEffect(() => {
    if (!enabled || path.length < 2) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      return
    }

    const points: LatLng[] = path.map(([lat, lng]) => ({ lat, lng }))
    const segmentLengths = points.slice(0, -1).map((p, i) => haversineKm(p, points[i + 1]))
    const totalKm = segmentLengths.reduce((a, b) => a + b, 0)
    if (totalKm === 0) return

    let last = performance.now()

    const tick = (now: number) => {
      const dtHours = (now - last) / 3_600_000
      last = now
      traveledRef.current = Math.min(totalKm, traveledRef.current + speedKmh * dtHours)

      let remaining = traveledRef.current
      let segIdx = 0
      while (segIdx < segmentLengths.length && remaining > segmentLengths[segIdx]) {
        remaining -= segmentLengths[segIdx]
        segIdx++
      }

      if (segIdx >= segmentLengths.length) {
        setState({ position: points[points.length - 1], progressPct: 100, distanceCoveredKm: totalKm })
        return
      }

      const segLen = segmentLengths[segIdx] || 1
      const t = Math.min(1, remaining / segLen)
      const position = lerpLatLng(points[segIdx], points[segIdx + 1], t)
      setState({
        position,
        progressPct: Math.min(100, (traveledRef.current / totalKm) * 100),
        distanceCoveredKm: traveledRef.current,
      })

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, path.length, speedKmh])

  useEffect(() => {
    if (!enabled) traveledRef.current = 0
  }, [enabled])

  return state
}
