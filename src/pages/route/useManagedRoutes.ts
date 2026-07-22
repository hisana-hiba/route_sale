import { useEffect, useState } from 'react'
import type { ManagedRoute, ManagedRouteStatus, RouteProgressSummary, RouteStop, RouteStopStatus } from '@/types/route'
import type { UserRole } from '@/store/authStore'
import { estimateDurationMins, estimateLegDistanceKm, nearestNeighborOrder } from '@/utils/geo'
import { WAREHOUSES, findCustomer, findWarehouse } from './routeGeoData'

const STORAGE_KEY = 'rs_managed_routes_v1'

function todayStr(offsetDays = 0): string {
  return new Date(Date.now() + offsetDays * 86400000).toISOString().split('T')[0]
}

function loadStops(customerIds: string[], warehouseId: string): RouteStop[] {
  const origin = findWarehouse(warehouseId) ?? WAREHOUSES[0]
  const customers = customerIds.map((id) => findCustomer(id)).filter(Boolean) as ReturnType<typeof findCustomer>[]
  const ordered = nearestNeighborOrder(origin, customers as NonNullable<typeof customers[number]>[])

  let current = origin
  return ordered.map((c, idx) => {
    const legDistanceKm = estimateLegDistanceKm(current, c!)
    current = c!
    return {
      id: `stop-${c!.id}-${idx}`,
      customerId: c!.id,
      name: c!.name,
      address: c!.address,
      phone: c!.phone,
      lat: c!.lat,
      lng: c!.lng,
      sequence: idx + 1,
      status: 'pending' as RouteStopStatus,
      plannedEtaMins: Math.round(estimateDurationMins(legDistanceKm)),
      legDistanceKm,
      orderValue: c!.avgOrderValue,
      collectionAmount: 0,
    }
  })
}

function buildSeedRoute(
  overrides: Partial<ManagedRoute> & { id: string; code: string; customerIds: string[]; warehouseId: string },
): ManagedRoute {
  const stops = loadStops(overrides.customerIds, overrides.warehouseId)
  const totalDistanceKm = stops.reduce((sum, s) => sum + s.legDistanceKm, 0)
  const totalDurationMins = stops.reduce((sum, s) => sum + s.plannedEtaMins, 0)
  const origin = findWarehouse(overrides.warehouseId) ?? WAREHOUSES[0]
  const polyline: [number, number][] = [[origin.lat, origin.lng], ...stops.map((s) => [s.lat, s.lng] as [number, number])]

  return {
    id: overrides.id,
    code: overrides.code,
    name: overrides.name ?? 'Route',
    warehouseId: overrides.warehouseId,
    vehicleId: overrides.vehicleId ?? 'veh-1',
    driverId: overrides.driverId ?? 'user-9876543210',
    driverName: overrides.driverName ?? 'Rahul Sharma',
    driverRole: overrides.driverRole ?? 'salesman',
    deliveryDate: overrides.deliveryDate ?? todayStr(),
    status: overrides.status ?? 'scheduled',
    stops,
    totalDistanceKm,
    totalDurationMins,
    polyline,
    optimized: true,
    routingSource: 'estimate',
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    startedAt: overrides.startedAt,
    completedAt: overrides.completedAt,
  }
}

function applyStopOutcomes(route: ManagedRoute, outcomes: Record<string, RouteStopStatus>): ManagedRoute {
  return {
    ...route,
    stops: route.stops.map((s) => {
      const status = outcomes[s.customerId]
      if (!status) return s
      const isCompleted = status === 'completed'
      return {
        ...s,
        status,
        collectionAmount: isCompleted ? Math.round(s.orderValue * 0.65) : 0,
        completedAt: status === 'completed' || status === 'skipped' ? new Date().toISOString() : undefined,
      }
    }),
  }
}

function buildSeedData(): ManagedRoute[] {
  const routeA = applyStopOutcomes(
    buildSeedRoute({
      id: 'mrt-1',
      code: 'RTM-1001',
      name: 'North Kozhikode Circuit',
      warehouseId: 'wh-1',
      vehicleId: 'veh-1',
      driverId: 'user-9876543210',
      driverName: 'Rahul Sharma',
      driverRole: 'salesman',
      deliveryDate: todayStr(),
      status: 'in_progress',
      customerIds: ['cust-1', 'cust-2', 'cust-3', 'cust-6', 'cust-17'],
      startedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      createdAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    }),
    { 'cust-1': 'completed', 'cust-2': 'completed', 'cust-3': 'in_progress' },
  )

  const routeB = buildSeedRoute({
    id: 'mrt-2',
    code: 'RTM-1002',
    name: 'East Kozhikode Delivery',
    warehouseId: 'wh-1',
    vehicleId: 'veh-3',
    driverId: 'user-9876543211',
    driverName: 'Amit Delivery',
    driverRole: 'deliveryAgent',
    deliveryDate: todayStr(),
    status: 'scheduled',
    customerIds: ['cust-4', 'cust-7', 'cust-10', 'cust-12'],
    createdAt: new Date(Date.now() - 20 * 3600000).toISOString(),
  })

  const routeC = buildSeedRoute({
    id: 'mrt-3',
    code: 'RTM-1003',
    name: 'Coastal Belt Route',
    warehouseId: 'wh-2',
    vehicleId: 'veh-2',
    driverId: 'user-9876543211',
    driverName: 'Amit Delivery',
    driverRole: 'deliveryAgent',
    deliveryDate: todayStr(),
    status: 'scheduled',
    customerIds: ['cust-13', 'cust-14', 'cust-15'],
    createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
  })

  const routeD = applyStopOutcomes(
    buildSeedRoute({
      id: 'mrt-4',
      code: 'RTM-0998',
      name: 'Hill Zone Route',
      warehouseId: 'wh-1',
      vehicleId: 'veh-4',
      driverId: 'drv-4',
      driverName: 'Vikram Singh',
      driverRole: 'deliveryAgent',
      deliveryDate: todayStr(-1),
      status: 'completed',
      customerIds: ['cust-8', 'cust-9', 'cust-11', 'cust-18'],
      createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
      startedAt: new Date(Date.now() - 30 * 3600000).toISOString(),
      completedAt: new Date(Date.now() - 27 * 3600000).toISOString(),
    }),
    { 'cust-8': 'completed', 'cust-9': 'completed', 'cust-11': 'completed', 'cust-18': 'skipped' },
  )

  const routeE = applyStopOutcomes(
    buildSeedRoute({
      id: 'mrt-5',
      code: 'RTM-0991',
      name: 'Vellimadukunnu Wholesale Run',
      warehouseId: 'wh-1',
      vehicleId: 'veh-6',
      driverId: 'drv-3',
      driverName: 'Sneha Reddy',
      driverRole: 'salesman',
      deliveryDate: todayStr(-2),
      status: 'completed',
      customerIds: ['cust-4', 'cust-19', 'cust-16'],
      createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
      startedAt: new Date(Date.now() - 55 * 3600000).toISOString(),
      completedAt: new Date(Date.now() - 52 * 3600000).toISOString(),
    }),
    { 'cust-4': 'completed', 'cust-19': 'completed', 'cust-16': 'completed' },
  )

  const routeF = buildSeedRoute({
    id: 'mrt-6',
    code: 'RTM-1004',
    name: 'Vadakara Extension',
    warehouseId: 'wh-3',
    vehicleId: 'veh-5',
    driverId: 'drv-6',
    driverName: 'Priya Patel',
    driverRole: 'salesman',
    deliveryDate: todayStr(1),
    status: 'draft',
    customerIds: ['cust-20'],
    createdAt: new Date().toISOString(),
  })

  return [routeA, routeB, routeC, routeD, routeE, routeF]
}

function loadRoutes(): ManagedRoute[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      /* fall through to seed */
    }
  }
  return buildSeedData()
}

function saveRoutes(routes: ManagedRoute[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routes))
}

function deriveRouteStatus(stops: RouteStop[], fallback: ManagedRouteStatus): ManagedRouteStatus {
  if (stops.length === 0) return fallback
  const allDone = stops.every((s) => s.status === 'completed' || s.status === 'skipped')
  if (allDone) return 'completed'
  const anyStarted = stops.some((s) => s.status !== 'pending')
  if (anyStarted) return 'in_progress'
  return fallback === 'draft' ? 'draft' : 'scheduled'
}

export function computeRouteProgress(route: ManagedRoute): RouteProgressSummary {
  const totalStops = route.stops.length
  const completed = route.stops.filter((s) => s.status === 'completed').length
  const skipped = route.stops.filter((s) => s.status === 'skipped').length
  const inProgress = route.stops.filter((s) => s.status === 'in_progress').length
  const pending = totalStops - completed - skipped - inProgress
  const progressPct = totalStops === 0 ? 0 : Math.round(((completed + skipped) / totalStops) * 100)
  const totalOrders = route.stops.filter((s) => s.status === 'completed').length
  const totalSales = route.stops.filter((s) => s.status === 'completed').reduce((sum, s) => sum + s.orderValue, 0)
  const totalCollections = route.stops.reduce((sum, s) => sum + s.collectionAmount, 0)
  const distanceCoveredKm = route.stops
    .filter((s) => s.status === 'completed' || s.status === 'skipped')
    .reduce((sum, s) => sum + s.legDistanceKm, 0)

  return { totalStops, completed, pending, skipped, inProgress, progressPct, totalOrders, totalSales, totalCollections, distanceCoveredKm }
}

export interface CreateRouteInput {
  name: string
  warehouseId: string
  vehicleId: string
  driverId: string
  driverName: string
  driverRole: UserRole
  deliveryDate: string
  stops: RouteStop[]
  totalDistanceKm: number
  totalDurationMins: number
  polyline: [number, number][]
  optimized: boolean
  routingSource: 'osrm' | 'estimate'
}

export function useManagedRoutes() {
  const [routes, setRoutes] = useState<ManagedRoute[]>(() => loadRoutes())

  useEffect(() => saveRoutes(routes), [routes])

  const createRoute = (input: CreateRouteInput): ManagedRoute => {
    const nextNumber = 1000 + routes.length + 1
    const newRoute: ManagedRoute = {
      id: `mrt-${Date.now()}`,
      code: `RTM-${nextNumber}`,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      ...input,
    }
    setRoutes((prev) => [newRoute, ...prev])
    return newRoute
  }

  const updateRoute = (id: string, patch: Partial<ManagedRoute>) => {
    setRoutes((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  const deleteRoute = (id: string) => {
    setRoutes((prev) => prev.filter((r) => r.id !== id))
  }

  const assignDriver = (routeIds: string[], driverId: string, driverName: string, driverRole: UserRole) => {
    setRoutes((prev) =>
      prev.map((r) =>
        routeIds.includes(r.id)
          ? { ...r, driverId, driverName, driverRole, status: r.status === 'draft' ? 'scheduled' : r.status }
          : r,
      ),
    )
  }

  const reorderStops = (routeId: string, newStops: RouteStop[], distanceKm: number, durationMins: number, polyline: [number, number][]) => {
    setRoutes((prev) =>
      prev.map((r) =>
        r.id === routeId
          ? {
              ...r,
              stops: newStops.map((s, idx) => ({ ...s, sequence: idx + 1 })),
              totalDistanceKm: distanceKm,
              totalDurationMins: durationMins,
              polyline,
            }
          : r,
      ),
    )
  }

  const updateStopStatus = (routeId: string, stopId: string, status: RouteStopStatus, extra?: { notes?: string; collectionAmount?: number }) => {
    setRoutes((prev) =>
      prev.map((r) => {
        if (r.id !== routeId) return r
        let stops = r.stops.map((s) =>
          s.id === stopId
            ? {
                ...s,
                status,
                notes: extra?.notes ?? s.notes,
                collectionAmount: extra?.collectionAmount ?? (status === 'completed' ? Math.round(s.orderValue * 0.65) : s.collectionAmount),
                completedAt: status === 'completed' || status === 'skipped' ? new Date().toISOString() : s.completedAt,
              }
            : s,
        )

        // Auto-advance: once a stop is finished, promote the next pending stop to "in progress"
        if (status === 'completed' || status === 'skipped') {
          const alreadyInProgress = stops.some((s) => s.status === 'in_progress')
          if (!alreadyInProgress) {
            const nextPending = stops
              .filter((s) => s.status === 'pending')
              .sort((a, b) => a.sequence - b.sequence)[0]
            if (nextPending) {
              stops = stops.map((s) => (s.id === nextPending.id ? { ...s, status: 'in_progress' } : s))
            }
          }
        }

        const derivedStatus = deriveRouteStatus(stops, r.status)
        const startedAt = r.startedAt ?? (derivedStatus === 'in_progress' ? new Date().toISOString() : r.startedAt)
        const completedAt = derivedStatus === 'completed' ? (r.completedAt ?? new Date().toISOString()) : r.completedAt
        return { ...r, stops, status: derivedStatus, startedAt, completedAt }
      }),
    )
  }

  const startRoute = (routeId: string) => {
    setRoutes((prev) =>
      prev.map((r) => {
        if (r.id !== routeId || r.status === 'in_progress' || r.status === 'completed') return r
        const firstStop = [...r.stops].sort((a, b) => a.sequence - b.sequence)[0]
        const stops = firstStop ? r.stops.map((s) => (s.id === firstStop.id ? { ...s, status: 'in_progress' as RouteStopStatus } : s)) : r.stops
        return { ...r, stops, status: 'in_progress', startedAt: r.startedAt ?? new Date().toISOString() }
      }),
    )
  }

  return {
    routes,
    createRoute,
    updateRoute,
    deleteRoute,
    assignDriver,
    reorderStops,
    updateStopStatus,
    startRoute,
  }
}
