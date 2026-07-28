/**
 * In-memory module CRUD + dashboard — no HTTP.
 * Used by src/api/client.ts so the portal runs on mock data only.
 */
import {
  generateChartData,
  generateDashboardStats,
  generateModuleRecords,
  computeStats,
  computeColumnTotals,
  generateOrdersChart,
  calculateIncentive,
  calculateAchievementPercent,
} from './data/generators'
import { getModuleConfig } from '@/config/modules'
import type { ModuleListResponse, DashboardData } from '@/types/module'
import type { PeriodFilterParams } from '@/types/period'

/** Local params shape — kept here to avoid circular import with api/client */
export type ModuleListParams = {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
} & Partial<PeriodFilterParams> & Partial<{
  route: string
  shopCategory: string
  warehouse: string
  lastVisitFrom: string
  lastVisitTo: string
  creditMin: string
  creditMax: string
  outstandingMin: string
  outstandingMax: string
  view: string
  payrollMonth: string
}>

const store = new Map<string, Record<string, unknown>[]>()

function getStore(slug: string) {
  if (!store.has(slug)) {
    store.set(slug, generateModuleRecords(slug, 55 + (slug.length % 20)))
  }
  const records = store.get(slug)!
  const needsRefresh =
    (slug.includes('expiry-report') && records.length > 0 && records[0].view == null) ||
    (slug === 'purchase-purchases' && records.length > 0 && records[0].credit == null) ||
    (slug === 'purchase-supplier-management' && records.length > 0 && (records[0].name == null || records[0].gst == null)) ||
    (slug === 'purchase-purchase-return' && records.length > 0 && (records[0].product != null || records[0].invoice == null)) ||
    (slug === 'logistics-vehicle-management' && records.length > 0 && records[0].vehicleName == null) ||
    (slug === 'logistics-driver-management' && records.length > 0 && records[0].licenseNumber == null) ||
    (slug === 'logistics-dispatch' && records.length > 0 && records[0].deliverySchedule == null) ||
    (slug === 'logistics-e-way-bills' && records.length > 0 && (records[0].invoiceNo == null || records[0].transporter == null)) ||
    (slug === 'hr-employees' && records.length > 0 && records[0].emergencyContact == null) ||
    (slug === 'hr-payroll' && records.length > 0 && (records[0].payrollMonth == null || records[0].monthlyBase == null || records[0].incentiveAmount == null)) ||
    (slug === 'hr-incentives' && records.length > 0 && records[0].incentiveEarned == null) ||
    (slug === 'hr-leave-management' && records.length > 0 && records[0].leaveType == null) ||
    (slug === 'hr-sales-targets' && records.length > 0 && records[0].targetName == null) ||
    (slug === 'user-management-users' && records.length > 0 && records[0].email == null) ||
    (slug === 'user-management-roles' && records.length > 0 && records[0].description == null) ||
    (slug === 'admin-notifications' && records.length > 0 && records[0].title == null) ||
    (slug === 'stock-management-current-stock' && records.length > 0 && records[0].date == null)

  if (needsRefresh) {
    const fresh = generateModuleRecords(slug, 55 + (slug.length % 20))
    store.set(slug, fresh)
    return fresh
  }
  return records
}

function applyIncentiveCalculation(body: Record<string, unknown>) {
  const target = Number(body.target) || 0
  const achieved = Number(body.achieved) || 0
  const role = String(body.role ?? 'Salesman')
  const { achievementPercent, incentiveEarned } = calculateIncentive(role, target, achieved)
  return { ...body, target, achieved, achievementPercent, incentiveEarned }
}

function calculateLeaveDays(fromDate: string, toDate: string) {
  const from = new Date(fromDate)
  const to = new Date(toDate)
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to < from) return 0
  return Math.ceil((to.getTime() - from.getTime()) / 86400000) + 1
}

function applyLeaveCalculation(body: Record<string, unknown>) {
  const fromDate = String(body.fromDate ?? '')
  const toDate = String(body.toDate ?? '')
  const totalDays = calculateLeaveDays(fromDate, toDate)
  const appliedDate = body.appliedDate ? String(body.appliedDate) : new Date().toISOString().split('T')[0]
  return { ...body, fromDate, toDate, totalDays, appliedDate, status: body.status ?? 'pending' }
}

function applySalesTargetCalculation(body: Record<string, unknown>) {
  const targetValue = Number(body.targetValue) || 0
  const achievedValue = Number(body.achievedValue) || 0
  const achievementPercent = calculateAchievementPercent(targetValue, achievedValue)
  return { ...body, targetValue, achievedValue, achievementPercent, status: body.status ?? 'active' }
}

function applyPayrollCalculation(body: Record<string, unknown>) {
  const monthlyBase = Number(body.monthlyBase) || 0
  const pendingSalary = Number(body.pendingSalary) || 0
  const incentiveAmount = Number(body.incentiveAmount) || 0
  const totalDeductions = Number(body.totalDeductions) || 0
  const grossSalary = body.grossSalary != null
    ? Number(body.grossSalary)
    : monthlyBase + pendingSalary + incentiveAmount
  const netSalary = body.netSalary != null
    ? Number(body.netSalary)
    : Math.max(0, grossSalary - totalDeductions)
  return {
    ...body,
    monthlyBase,
    pendingSalary,
    incentiveAmount,
    grossSalary,
    totalDeductions,
    netSalary,
    status: body.status ?? 'pending',
  }
}

function enrichPayload(slug: string, body: Record<string, unknown>) {
  if (slug === 'hr-incentives') return applyIncentiveCalculation(body)
  if (slug === 'hr-leave-management') return applyLeaveCalculation(body)
  if (slug === 'hr-sales-targets') return applySalesTargetCalculation(body)
  if (slug === 'hr-payroll') return applyPayrollCalculation(body)
  return body
}

function filter(records: Record<string, unknown>[], params: ModuleListParams) {
  let result = [...records]
  const {
    search, status, dateFrom, dateTo, route, shopCategory, warehouse,
    lastVisitFrom, lastVisitTo, creditMin, creditMax, outstandingMin, outstandingMax,
    view, payrollMonth,
  } = params

  if (search) {
    const q = search.toLowerCase()
    result = result.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(q)),
    )
  }
  if (status) result = result.filter((r) => r.status === status)
  if (view) result = result.filter((r) => r.view === view)
  if (payrollMonth) result = result.filter((r) => String(r.payrollMonth) === payrollMonth)
  if (dateFrom) result = result.filter((r) => String(r.date ?? r.createdAt ?? '').slice(0, 10) >= dateFrom)
  if (dateTo) result = result.filter((r) => String(r.date ?? r.createdAt ?? '').slice(0, 10) <= dateTo)
  if (route) result = result.filter((r) => String(r.route) === route)
  if (shopCategory) result = result.filter((r) => r.shopCategory === shopCategory)
  if (warehouse) result = result.filter((r) => String(r.warehouse) === warehouse)
  if (lastVisitFrom) result = result.filter((r) => String(r.lastVisit ?? '') >= lastVisitFrom)
  if (lastVisitTo) result = result.filter((r) => String(r.lastVisit ?? '') <= lastVisitTo)
  if (creditMin) result = result.filter((r) => Number(r.creditLimit) >= Number(creditMin))
  if (creditMax) result = result.filter((r) => Number(r.creditLimit) <= Number(creditMax))
  if (outstandingMin) result = result.filter((r) => Number(r.outstanding) >= Number(outstandingMin))
  if (outstandingMax) result = result.filter((r) => Number(r.outstanding) <= Number(outstandingMax))
  return result
}

function generateFilteredCustomerChart(records: Record<string, unknown>[], slug: string) {
  const base = generateChartData(slug, 12, 1)
  const factor = records.length > 0 ? Math.max(records.length / 70, 0.08) : 0
  return {
    ...base,
    series: base.series.map((s) => ({
      ...s,
      data: s.data.map((v) => Math.round(v * factor)),
    })),
  }
}

function paginate<T>(items: T[], page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize
  return { data: items.slice(start, start + pageSize), total: items.length, page, pageSize }
}

function normalizeSlug(endpoint: string) {
  return endpoint.replace(/^\//, '').replace(/\/$/, '')
}

export function listModule(endpoint: string, params: ModuleListParams = {}): ModuleListResponse {
  const slug = normalizeSlug(endpoint)
  const config = getModuleConfig(`/${slug.replace(/-/g, '/')}`)
  const all = getStore(slug)
  const filtered = filter(all, params)
  const page = paginate(filtered, params.page ?? 1, params.pageSize ?? 10)
  const statKeys = config.stats.map((s) => s.key)
  const sumFields = config.sumFields
    ?? (config.features?.includes('reportTotals')
      ? config.columns.filter((c) => c.type === 'currency' || c.type === 'number').map((c) => c.field)
      : [])

  const chart = config.showChart
    ? (slug === 'sales-orders'
      ? generateOrdersChart(filtered)
      : config.layout === 'customer' || config.layout === 'transaction'
        ? generateFilteredCustomerChart(filtered, slug)
        : generateChartData(slug, 12, config.layout === 'report' ? 2 : 1))
    : undefined

  return {
    ...page,
    stats: computeStats(filtered, statKeys),
    chart,
    totals: sumFields.length > 0 ? computeColumnTotals(filtered, sumFields) : undefined,
  }
}

export function getModuleRecord<T>(endpoint: string, id: string): T {
  const slug = normalizeSlug(endpoint)
  const record = getStore(slug).find((r) => r.id === id)
  if (!record) throw new Error('Not found')
  return record as T
}

export function createModuleRecord<T>(endpoint: string, body: Record<string, unknown>): T {
  const slug = normalizeSlug(endpoint)
  const records = getStore(slug)
  const payload = enrichPayload(slug, body)
  const newRecord = {
    id: String(Date.now()),
    code: slug === 'hr-sales-targets'
      ? `TGT-${String(records.length + 1).padStart(5, '0')}`
      : `${slug.slice(0, 3).toUpperCase()}-${String(records.length + 1).padStart(4, '0')}`,
    status: 'active',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    ...(slug === 'logistics-e-way-bills' && !body.ewayBill
      ? { ewayBill: `EWB${Date.now().toString().slice(-12)}` }
      : {}),
    ...payload,
  }
  records.unshift(newRecord)
  return newRecord as T
}

export function updateModuleRecord<T>(endpoint: string, id: string, body: Record<string, unknown>): T {
  const slug = normalizeSlug(endpoint)
  const records = getStore(slug)
  const idx = records.findIndex((r) => r.id === id)
  if (idx === -1) throw new Error('Not found')
  const payload = enrichPayload(slug, body)
  records[idx] = { ...records[idx], ...payload, updatedAt: new Date().toISOString() }
  return records[idx] as T
}

export function deleteModuleRecord(endpoint: string, id: string): void {
  const slug = normalizeSlug(endpoint)
  const records = getStore(slug)
  const idx = records.findIndex((r) => r.id === id)
  if (idx === -1) throw new Error('Not found')
  records.splice(idx, 1)
}

export function getDashboard(): DashboardData {
  const stats = generateDashboardStats()
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const dailySales = generateChartData('dashboard-daily', 7, 1)
  dailySales.categories = weekdays

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const salesVsCollection = generateChartData('dashboard-collection', 12, 2)
  salesVsCollection.categories = months
  salesVsCollection.series[0].name = 'Collection'
  salesVsCollection.series[1].name = 'Sales'

  return {
    stats,
    dailySales,
    monthlySales: generateChartData('dashboard-monthly', 12, 1),
    salesVsCollection,
    productPerformance: generateChartData('dashboard-products', 6, 1),
    routePerformance: generateChartData('dashboard-routes', 8, 1),
    expenseAnalysis: generateChartData('dashboard-expenses', 6, 2),
    profitTrend: generateChartData('dashboard-profit', 12, 1),
    purchaseTrend: generateChartData('dashboard-purchase', 12, 1),
    topSalesmen: [
      { name: 'Rahul Sharma', sales: 485000, target: 400000 },
      { name: 'Priya Patel', sales: 412000, target: 380000 },
      { name: 'Amit Kumar', sales: 398000, target: 400000 },
      { name: 'Sneha Reddy', sales: 365000, target: 350000 },
      { name: 'Vikram Singh', sales: 342000, target: 360000 },
    ],
    bestSellingProducts: [
      { name: 'Premium Banana Chips 200g', quantity: 1240, revenue: 248000, growth: 24, image: 'https://images.unsplash.com/photo-1566478989037-eec170df7845?w=88&h=88&fit=crop' },
      { name: 'Kerala Banana Halwa 500g', quantity: 980, revenue: 196000, growth: 18, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=88&h=88&fit=crop' },
      { name: 'Coconut Oil 1L', quantity: 856, revenue: 85600, growth: 12, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=88&h=88&fit=crop' },
      { name: 'Spice Mix Pack 250g', quantity: 720, revenue: 36000, growth: 9, image: 'https://images.unsplash.com/photo-1596040033229-a0b2c4d2e8f5?w=88&h=88&fit=crop' },
      { name: 'Jackfruit Chips 150g', quantity: 650, revenue: 32500, growth: 7, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=88&h=88&fit=crop' },
    ],
    recentOrders: [
      { orderNo: 'ORD-1256', customer: 'Shree Enterprises', amount: 45200, status: 'delivered', time: '2 min ago' },
      { orderNo: 'ORD-1255', customer: 'Metro Wholesale', amount: 78500, status: 'processing', time: '15 min ago' },
      { orderNo: 'ORD-1254', customer: 'Green Valley Store', amount: 23400, status: 'shipped', time: '32 min ago' },
      { orderNo: 'ORD-1253', customer: 'Ahmad Traders', amount: 56700, status: 'delivered', time: '1 hr ago' },
      { orderNo: 'ORD-1252', customer: 'City Mart', amount: 32100, status: 'pending', time: '2 hrs ago' },
    ],
    lowStockAlerts: [
      { product: 'Premium Banana Chips 200g', current: 45, minimum: 100 },
      { product: 'Jackfruit Chips 150g', current: 28, minimum: 80 },
      { product: 'Coconut Oil 1L', current: 62, minimum: 120 },
    ],
    notifications: [
      { id: '1', title: 'New order received', message: 'Order #ORD-1257 from Metro Wholesale', type: 'info', time: '2 min ago' },
      { id: '2', title: 'Payment received', message: '₹45,200 from Shree Enterprises', type: 'success', time: '10 min ago' },
      { id: '3', title: 'Low stock alert', message: 'Premium Banana Chips below minimum level', type: 'warning', time: '25 min ago' },
      { id: '4', title: 'Route completed', message: 'Route R-12 completed by Rahul Sharma', type: 'info', time: '1 hr ago' },
      { id: '5', title: 'Invoice overdue', message: '5 invoices past due date', type: 'error', time: '2 hrs ago' },
    ],
  }
}

export function getTopSalesShops(params: ModuleListParams = {}) {
  const filtered = filter(getStore('customers-customer-list'), params)
  const growthRates = [18.6, 12.4, 9.8, 7.2]

  const topShops = [...filtered]
    .sort((a, b) => Number(b.totalPurchases) - Number(a.totalPurchases))
    .slice(0, 4)
    .map((customer, i) => ({
      id: String(customer.id),
      name: String(customer.name),
      sales: Number(customer.totalPurchases) || 0,
      orders: Number(customer.visits) || 0,
      lastOrder: String(customer.lastVisit ?? '—'),
      growth: growthRates[i % growthRates.length],
    }))

  return { topShops }
}
