import type { LatLng } from '@/types/route'
import { estimateDurationMins, estimateLegDistanceKm } from '@/utils/geo'

export interface DrivingRouteResult {
  distanceKm: number
  durationMins: number
  /** [lat, lng] pairs suitable for a Leaflet polyline */
  geometry: [number, number][]
  legs: { distanceKm: number; durationMins: number }[]
  source: 'osrm' | 'estimate'
}

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving'
const FETCH_TIMEOUT_MS = 7000

/** Straight-line fallback used when the OSRM public demo server is unreachable */
function buildEstimateRoute(points: LatLng[]): DrivingRouteResult {
  const legs = []
  let totalDistance = 0
  for (let i = 0; i < points.length - 1; i++) {
    const distanceKm = estimateLegDistanceKm(points[i], points[i + 1])
    totalDistance += distanceKm
    legs.push({ distanceKm, durationMins: estimateDurationMins(distanceKm) })
  }
  return {
    distanceKm: totalDistance,
    durationMins: estimateDurationMins(totalDistance),
    geometry: points.map((p) => [p.lat, p.lng] as [number, number]),
    legs,
    source: 'estimate',
  }
}

/**
 * Fetches a real, road-following driving route (distance, duration and
 * polyline geometry) from the OSRM public demo server. Falls back to a
 * straight-line haversine estimate on any network error, timeout, or if
 * fewer than 2 points are supplied — so the UI keeps working offline.
 */
export async function fetchDrivingRoute(points: LatLng[]): Promise<DrivingRouteResult> {
  if (points.length < 2) {
    return { distanceKm: 0, durationMins: 0, geometry: points.map((p) => [p.lat, p.lng]), legs: [], source: 'estimate' }
  }

  const coordsParam = points.map((p) => `${p.lng},${p.lat}`).join(';')
  const url = `${OSRM_BASE}/${coordsParam}?overview=full&geometries=geojson&steps=false&annotations=false`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`OSRM responded ${res.status}`)
    const data = await res.json()
    const route = data?.routes?.[0]
    if (!route) throw new Error('OSRM returned no route')

    const geometry: [number, number][] = (route.geometry?.coordinates ?? []).map(
      ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
    )
    const legs = (route.legs ?? []).map((leg: { distance: number; duration: number }) => ({
      distanceKm: leg.distance / 1000,
      durationMins: leg.duration / 60,
    }))

    return {
      distanceKm: route.distance / 1000,
      durationMins: route.duration / 60,
      geometry: geometry.length > 0 ? geometry : points.map((p) => [p.lat, p.lng]),
      legs,
      source: 'osrm',
    }
  } catch {
    return buildEstimateRoute(points)
  } finally {
    clearTimeout(timeout)
  }
}
