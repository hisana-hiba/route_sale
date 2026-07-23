import type { LatLng } from '@/types/route'

const EARTH_RADIUS_KM = 6371

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/** Great-circle distance between two coordinates, in kilometres */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * Nearest-neighbour heuristic for the (open) travelling-salesman problem.
 * Starting from `origin`, greedily visits the closest unvisited point each
 * step. Good enough for delivery-route ordering without a real routing
 * engine; returns the points reordered.
 */
export function nearestNeighborOrder<T extends LatLng>(origin: LatLng, points: T[]): T[] {
  const remaining = [...points]
  const ordered: T[] = []
  let current: LatLng = origin

  while (remaining.length > 0) {
    let bestIdx = 0
    let bestDist = Infinity
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineKm(current, remaining[i])
      if (d < bestDist) {
        bestDist = d
        bestIdx = i
      }
    }
    const [next] = remaining.splice(bestIdx, 1)
    ordered.push(next)
    current = next
  }

  return ordered
}

/** Average urban delivery-vehicle speed used for the estimate fallback */
const FALLBACK_SPEED_KMH = 28
/** Straight-line distances underestimate real road distance */
const ROAD_FACTOR = 1.35

export function estimateLegDistanceKm(a: LatLng, b: LatLng): number {
  return haversineKm(a, b) * ROAD_FACTOR
}

export function estimateDurationMins(distanceKm: number): number {
  return (distanceKm / FALLBACK_SPEED_KMH) * 60
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

export function formatDuration(mins: number): string {
  const totalMins = Math.round(mins)
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  if (h <= 0) return `${m} min`
  return `${h}h ${m}m`
}

/**
 * Builds a Google Maps "Directions" deep link that opens with the origin,
 * an ordered list of waypoints, and a final destination pre-filled — used
 * by the "Start Navigation" action on the driver's mobile view.
 */
export function buildGoogleMapsNavUrl(origin: LatLng, stops: LatLng[]): string {
  if (stops.length === 0) {
    return `https://www.google.com/maps/dir/?api=1&destination=${origin.lat},${origin.lng}&travelmode=driving`
  }
  const destination = stops[stops.length - 1]
  const waypoints = stops.slice(0, -1)
  const params = new URLSearchParams({
    api: '1',
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    travelmode: 'driving',
  })
  if (waypoints.length > 0) {
    params.set('waypoints', waypoints.map((w) => `${w.lat},${w.lng}`).join('|'))
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

/** Linear interpolation between two coordinates, t in [0, 1] */
export function lerpLatLng(a: LatLng, b: LatLng, t: number): LatLng {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t }
}

/** Local planar metres around a reference latitude (good enough for city-scale corridors) */
function toLocalMeters(p: LatLng, origin: LatLng): { x: number; y: number } {
  const midLat = ((p.lat + origin.lat) / 2) * (Math.PI / 180)
  return {
    x: (p.lng - origin.lng) * 111_320 * Math.cos(midLat),
    y: (p.lat - origin.lat) * 110_540,
  }
}

export interface SegmentProjection {
  /** 0 = at start, 1 = at end; clamped to the segment */
  t: number
  closest: LatLng
  /** Perpendicular (or end-point) distance from the point to the segment, km */
  distanceKm: number
}

/** Project a point onto the line segment from `a` to `b`. */
export function projectOntoSegment(point: LatLng, a: LatLng, b: LatLng): SegmentProjection {
  const p = toLocalMeters(point, a)
  const bLocal = toLocalMeters(b, a)
  const lenSq = bLocal.x * bLocal.x + bLocal.y * bLocal.y
  let t = 0
  if (lenSq > 0) {
    t = (p.x * bLocal.x + p.y * bLocal.y) / lenSq
    t = Math.max(0, Math.min(1, t))
  }
  const closest = lerpLatLng(a, b, t)
  return { t, closest, distanceKm: haversineKm(point, closest) }
}

/**
 * Customers whose coordinates fall within `corridorKm` of the start→end segment,
 * ordered by progress along that segment (travel order from start to end).
 */
export function customersAlongRoute<T extends LatLng & { id: string }>(
  start: LatLng,
  end: LatLng,
  customers: T[],
  corridorKm: number,
): Array<T & { distanceFromPathKm: number; progress: number }> {
  const spanKm = haversineKm(start, end)
  if (spanKm < 0.05) return []

  return customers
    .map((c) => {
      const proj = projectOntoSegment(c, start, end)
      return { ...c, distanceFromPathKm: proj.distanceKm, progress: proj.t }
    })
    .filter((c) => c.distanceFromPathKm <= corridorKm && c.progress > 0.02 && c.progress < 0.98)
    .sort((a, b) => a.progress - b.progress || a.distanceFromPathKm - b.distanceFromPathKm)
}
