import type { UserRole } from '@/store/authStore'

export interface LatLng {
  lat: number
  lng: number
}

export interface WarehouseRecord extends LatLng {
  id: string
  name: string
  address: string
}

export type VehicleStatus = 'available' | 'on_route' | 'maintenance'

export interface VehicleRecord {
  id: string
  name: string
  plateNumber: string
  type: string
  capacityKg: number
  status: VehicleStatus
}

export interface DriverRecord {
  id: string
  name: string
  role: UserRole
  mobile: string
  vehiclePreference?: string
}

export interface RouteCustomer extends LatLng {
  id: string
  name: string
  address: string
  phone: string
  category: string
  avgOrderValue: number
}

export type RouteStopStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

export interface RouteStop extends LatLng {
  id: string
  customerId: string
  name: string
  address: string
  phone: string
  sequence: number
  status: RouteStopStatus
  plannedEtaMins: number
  legDistanceKm: number
  orderValue: number
  collectionAmount: number
  notes?: string
  completedAt?: string
}

export type ManagedRouteStatus = 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

export interface ManagedRoute {
  id: string
  code: string
  name: string
  warehouseId: string
  vehicleId: string
  driverId: string
  driverName: string
  driverRole: UserRole
  deliveryDate: string
  status: ManagedRouteStatus
  stops: RouteStop[]
  totalDistanceKm: number
  totalDurationMins: number
  polyline: [number, number][]
  optimized: boolean
  routingSource: 'osrm' | 'estimate'
  createdAt: string
  startedAt?: string
  completedAt?: string
}

export interface RouteProgressSummary {
  totalStops: number
  completed: number
  pending: number
  skipped: number
  inProgress: number
  progressPct: number
  totalOrders: number
  totalSales: number
  totalCollections: number
  distanceCoveredKm: number
}
