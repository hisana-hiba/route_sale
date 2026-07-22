import type { RouteCustomer, RouteStop, WarehouseRecord } from '@/types/route'
import { estimateDurationMins, estimateLegDistanceKm, nearestNeighborOrder } from '@/utils/geo'
import { fetchDrivingRoute } from '@/utils/osrm'

export interface ComputedRoute {
  stops: RouteStop[]
  totalDistanceKm: number
  totalDurationMins: number
  polyline: [number, number][]
  routingSource: 'osrm' | 'estimate'
}

function buildPreliminaryStops(
  origin: WarehouseRecord,
  ordered: RouteCustomer[],
  existingIdByCustomer?: Record<string, string>,
): RouteStop[] {
  let current: { lat: number; lng: number } = origin
  return ordered.map((c, idx) => {
    const legDistanceKm = estimateLegDistanceKm(current, c)
    current = c
    return {
      id: existingIdByCustomer?.[c.id] ?? `stop-${c.id}-${idx}-${Date.now()}`,
      customerId: c.id,
      name: c.name,
      address: c.address,
      phone: c.phone,
      lat: c.lat,
      lng: c.lng,
      sequence: idx + 1,
      status: 'pending',
      plannedEtaMins: Math.round(estimateDurationMins(legDistanceKm)),
      legDistanceKm,
      orderValue: c.avgOrderValue,
      collectionAmount: 0,
    }
  })
}

/**
 * Orders the given customers (optionally via the nearest-neighbour
 * heuristic), then asks OSRM for the real driving distance/duration/polyline
 * — falling back transparently to a straight-line estimate if OSRM is
 * unreachable. `existingIdByCustomer` lets callers keep stable stop ids
 * across re-optimizations and manual drag reorders.
 */
export async function computeRoute(
  origin: WarehouseRecord,
  customers: RouteCustomer[],
  optimize: boolean,
  existingIdByCustomer?: Record<string, string>,
): Promise<ComputedRoute> {
  const ordered = optimize ? nearestNeighborOrder(origin, customers) : customers
  const prelimStops = buildPreliminaryStops(origin, ordered, existingIdByCustomer)

  const points = [origin, ...ordered]
  const routing = await fetchDrivingRoute(points)

  const stops = prelimStops.map((s, idx) => {
    const leg = routing.legs[idx]
    return leg ? { ...s, legDistanceKm: leg.distanceKm, plannedEtaMins: Math.max(1, Math.round(leg.durationMins)) } : s
  })

  return {
    stops,
    totalDistanceKm: routing.distanceKm,
    totalDurationMins: routing.durationMins,
    polyline: routing.geometry,
    routingSource: routing.source,
  }
}

/** Recomputes distance/duration/polyline for a manually-reordered stop list, keeping the given order */
export async function reorderRoute(origin: WarehouseRecord, stopsInOrder: RouteStop[]): Promise<ComputedRoute> {
  const existingIdByCustomer: Record<string, string> = {}
  const customers: RouteCustomer[] = stopsInOrder.map((s) => {
    existingIdByCustomer[s.customerId] = s.id
    return { id: s.customerId, name: s.name, address: s.address, phone: s.phone, lat: s.lat, lng: s.lng, category: '', avgOrderValue: s.orderValue }
  })
  return computeRoute(origin, customers, false, existingIdByCustomer)
}
