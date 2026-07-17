import { useState, useEffect } from 'react'

export interface RouteItem {
  id: string
  code: string
  name: string
  salesman: string
  deliveryAgent: string
  outlets: number
  visited: number
  collections: number
  sales: number
  status: 'completed' | 'pending' | 'in_transit' | 'active'
  date: string
}

export interface WeeklySchedule {
  id: string
  routeName: string
  salesmanCount: number
  deliveryAgentCount: number
  shopsCount: number
  isActive: boolean
  days: string[]
}

export interface VisitRecord {
  id: string
  routeName: string
  shopName: string
  salesman: string
  date: string
  status: 'completed' | 'failed' | 'pending'
  collectionAmount: number
  notes?: string
}

export interface ShopItem {
  id: string
  name: string
  route: string
  owner: string
  phone: string
}

export interface StaffItem {
  id: string
  name: string
  role: 'Salesman' | 'Delivery Agent'
  routesAssigned: string[]
  status: 'active' | 'inactive'
}

// Initial mock data
const INITIAL_ROUTES: RouteItem[] = [
  { id: 'rt-1', code: 'RT-0001', name: 'Route A - North', salesman: 'Rahul Sharma', deliveryAgent: 'Vikram Singh', outlets: 18, visited: 15, collections: 45000, sales: 85000, status: 'active', date: new Date().toISOString().split('T')[0] },
  { id: 'rt-2', code: 'RT-0002', name: 'Route B - South', salesman: 'Priya Patel', deliveryAgent: 'Suresh Kumar', outlets: 22, visited: 22, collections: 68000, sales: 124000, status: 'completed', date: new Date().toISOString().split('T')[0] },
  { id: 'rt-3', code: 'RT-0003', name: 'Route C - East', salesman: 'Amit Kumar', deliveryAgent: 'Ramesh Rao', outlets: 12, visited: 4, collections: 12000, sales: 34000, status: 'in_transit', date: new Date().toISOString().split('T')[0] },
  { id: 'rt-4', code: 'RT-0004', name: 'Route D - West', salesman: 'Sneha Reddy', deliveryAgent: 'Anita Desai', outlets: 15, visited: 0, collections: 0, sales: 0, status: 'pending', date: new Date().toISOString().split('T')[0] },
  { id: 'rt-5', code: 'RT-0005', name: 'Route E - Central', salesman: 'Vikram Singh', deliveryAgent: 'Suresh Kumar', outlets: 25, visited: 18, collections: 52000, sales: 98000, status: 'active', date: new Date().toISOString().split('T')[0] },
  { id: 'rt-6', code: 'RT-0006', name: 'Route F - Outer Bypass', salesman: 'Priya Patel', deliveryAgent: 'Ramesh Rao', outlets: 10, visited: 10, collections: 30000, sales: 55000, status: 'completed', date: new Date(Date.now() - 86400000).toISOString().split('T')[0] }, // yesterday
]

const INITIAL_SCHEDULES: WeeklySchedule[] = [
  { id: 'sch-1', routeName: 'Route A - North', salesmanCount: 3, deliveryAgentCount: 2, shopsCount: 18, isActive: true, days: ['Monday', 'Wednesday', 'Friday'] },
  { id: 'sch-2', routeName: 'Route B - South', salesmanCount: 2, deliveryAgentCount: 1, shopsCount: 22, isActive: true, days: ['Tuesday', 'Thursday', 'Saturday'] },
  { id: 'sch-3', routeName: 'Route C - East', salesmanCount: 1, deliveryAgentCount: 1, shopsCount: 12, isActive: false, days: ['Monday', 'Thursday'] },
  { id: 'sch-4', routeName: 'Route D - West', salesmanCount: 2, deliveryAgentCount: 2, shopsCount: 15, isActive: true, days: ['Wednesday', 'Saturday'] },
]

const INITIAL_VISITS: VisitRecord[] = [
  { id: 'vis-1', routeName: 'Route A - North', shopName: 'Ahmad Traders', salesman: 'Rahul Sharma', date: new Date().toISOString().split('T')[0], status: 'completed', collectionAmount: 12000 },
  { id: 'vis-2', routeName: 'Route A - North', shopName: 'Green Valley Store', salesman: 'Rahul Sharma', date: new Date().toISOString().split('T')[0], status: 'completed', collectionAmount: 8500 },
  { id: 'vis-3', routeName: 'Route B - South', shopName: 'City Mart', salesman: 'Priya Patel', date: new Date().toISOString().split('T')[0], status: 'completed', collectionAmount: 25000 },
  { id: 'vis-4', routeName: 'Route C - East', shopName: 'Sunrise Distributors', salesman: 'Amit Kumar', date: new Date().toISOString().split('T')[0], status: 'failed', collectionAmount: 0, notes: 'Shop closed' },
  { id: 'vis-5', routeName: 'Route F - Outer Bypass', shopName: 'Lakshmi Stores', salesman: 'Priya Patel', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], status: 'completed', collectionAmount: 15000 },
]

const INITIAL_SHOPS: ShopItem[] = [
  { id: 'shp-1', name: 'Ahmad Traders', route: 'Route A - North', owner: 'Ahmad Khan', phone: '9876543210' },
  { id: 'shp-2', name: 'Green Valley Store', route: 'Route A - North', owner: 'John Doe', phone: '8765432109' },
  { id: 'shp-3', name: 'City Mart', route: 'Route B - South', owner: 'M. S. Rao', phone: '7654321098' },
  { id: 'shp-4', name: 'Sunrise Distributors', route: 'Route C - East', owner: 'R. K. Gupta', phone: '6543210987' },
  { id: 'shp-5', name: 'Metro Wholesale', route: 'Route D - West', owner: 'Suresh Patel', phone: '9988776655' },
  { id: 'shp-6', name: 'Prime Retail', route: 'Route E - Central', owner: 'Anita Nair', phone: '8877665544' },
]

const INITIAL_STAFF: StaffItem[] = [
  { id: 'stf-1', name: 'Rahul Sharma', role: 'Salesman', routesAssigned: ['Route A - North'], status: 'active' },
  { id: 'stf-2', name: 'Priya Patel', role: 'Salesman', routesAssigned: ['Route B - South', 'Route F - Outer Bypass'], status: 'active' },
  { id: 'stf-3', name: 'Amit Kumar', role: 'Salesman', routesAssigned: ['Route C - East'], status: 'active' },
  { id: 'stf-4', name: 'Sneha Reddy', role: 'Salesman', routesAssigned: ['Route D - West'], status: 'active' },
  { id: 'stf-5', name: 'Vikram Singh', role: 'Delivery Agent', routesAssigned: ['Route A - North', 'Route E - Central'], status: 'active' },
  { id: 'stf-6', name: 'Suresh Kumar', role: 'Delivery Agent', routesAssigned: ['Route B - South', 'Route E - Central'], status: 'active' },
  { id: 'stf-7', name: 'Ramesh Rao', role: 'Delivery Agent', routesAssigned: ['Route C - East', 'Route F - Outer Bypass'], status: 'active' },
  { id: 'stf-8', name: 'Anita Desai', role: 'Delivery Agent', routesAssigned: ['Route D - West'], status: 'active' },
]

// LocalStorage helpers
export const loadData = <T>(key: string, initial: T): T => {
  const data = localStorage.getItem(key)
  if (data) {
    try {
      return JSON.parse(data)
    } catch {
      return initial
    }
  }
  return initial
}

export const saveData = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data))
}

// React Hook for state management
export function useRouteState() {
  const [routes, setRoutes] = useState<RouteItem[]>(() => loadData('rs_routes', INITIAL_ROUTES))
  const [schedules, setSchedules] = useState<WeeklySchedule[]>(() => loadData('rs_schedules', INITIAL_SCHEDULES))
  const [visits, setVisits] = useState<VisitRecord[]>(() => loadData('rs_visits', INITIAL_VISITS))
  const [shops, setShops] = useState<ShopItem[]>(() => loadData('rs_shops', INITIAL_SHOPS))
  const [staff, setStaff] = useState<StaffItem[]>(() => loadData('rs_staff', INITIAL_STAFF))

  useEffect(() => { saveData('rs_routes', routes) }, [routes])
  useEffect(() => { saveData('rs_schedules', schedules) }, [schedules])
  useEffect(() => { saveData('rs_visits', visits) }, [visits])
  useEffect(() => { saveData('rs_shops', shops) }, [shops])
  useEffect(() => { saveData('rs_staff', staff) }, [staff])

  const addRoute = (route: Omit<RouteItem, 'id' | 'code' | 'visited' | 'collections' | 'sales'>) => {
    const nextCode = `RT-${String(routes.length + 1).padStart(4, '0')}`
    const nextId = `rt-${Date.now()}`
    const newRoute: RouteItem = {
      ...route,
      id: nextId,
      code: nextCode,
      visited: 0,
      collections: 0,
      sales: 0,
    }
    setRoutes((prev) => [newRoute, ...prev])
    return newRoute
  }

  const removeRoute = (id: string) => {
    setRoutes((prev) => prev.filter((r) => r.id !== id))
  }

  const addVisit = (visit: Omit<VisitRecord, 'id'>) => {
    const newVisit: VisitRecord = {
      ...visit,
      id: `vis-${Date.now()}`,
    }
    setVisits((prev) => [newVisit, ...prev])

    // Update routes stats if matching route & date
    setRoutes((prev) => prev.map((r) => {
      if (r.name === visit.routeName && r.date === visit.date) {
        return {
          ...r,
          visited: r.visited + (visit.status === 'completed' ? 1 : 0),
          collections: r.collections + visit.collectionAmount,
          sales: r.sales + (visit.status === 'completed' ? visit.collectionAmount * 1.5 : 0), // estimation
        }
      }
      return r
    }))
  }

  const removeVisit = (id: string) => {
    const target = visits.find((v) => v.id === id)
    setVisits((prev) => prev.filter((v) => v.id !== id))

    if (target) {
      setRoutes((prev) => prev.map((r) => {
        if (r.name === target.routeName && r.date === target.date) {
          return {
            ...r,
            visited: Math.max(0, r.visited - (target.status === 'completed' ? 1 : 0)),
            collections: Math.max(0, r.collections - target.collectionAmount),
            sales: Math.max(0, r.sales - (target.status === 'completed' ? target.collectionAmount * 1.5 : 0)),
          }
        }
        return r
      }))
    }
  }

  const addShop = (shop: Omit<ShopItem, 'id'>) => {
    const newShop = {
      ...shop,
      id: `shp-${Date.now()}`,
    }
    setShops((prev) => [...prev, newShop])
    return newShop
  }

  const addSchedule = (schedule: Omit<WeeklySchedule, 'id'>) => {
    const newSch = {
      ...schedule,
      id: `sch-${Date.now()}`,
    }
    setSchedules((prev) => [...prev, newSch])
    return newSch
  }

  const updateSchedule = (updated: WeeklySchedule) => {
    setSchedules((prev) => prev.map((s) => s.id === updated.id ? updated : s))
  }

  const removeSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id))
  }

  const generateRoutesFromSchedules = (selectedDays: string[], targetDateStr: string) => {
    const activeSchedules = schedules.filter((s) => s.isActive && s.days.some((d) => selectedDays.includes(d)))
    
    let generatedCount = 0
    activeSchedules.forEach((sch, idx) => {
      // Check if route already generated for this date
      const exists = routes.some((r) => r.name === sch.routeName && r.date === targetDateStr)
      if (!exists) {
        const matchingStaff = staff.filter((st) => st.routesAssigned.includes(sch.routeName))
        const salesman = matchingStaff.find((s) => s.role === 'Salesman')?.name || 'Rahul Sharma'
        const deliveryAgent = matchingStaff.find((s) => s.role === 'Delivery Agent')?.name || 'Vikram Singh'
        
        addRoute({
          name: sch.routeName,
          salesman,
          deliveryAgent,
          outlets: sch.shopsCount,
          status: 'pending',
          date: targetDateStr,
        })
        generatedCount++
      }
    })

    return generatedCount
  }

  return {
    routes,
    schedules,
    visits,
    shops,
    staff,
    addRoute,
    removeRoute,
    addVisit,
    removeVisit,
    addShop,
    addSchedule,
    updateSchedule,
    removeSchedule,
    generateRoutesFromSchedules,
  }
}
