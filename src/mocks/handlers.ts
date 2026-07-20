import { http, HttpResponse, delay } from 'msw'
import { generateChartData, generateDashboardStats, generateModuleRecords, computeStats, computeColumnTotals, generateOrdersChart, calculateIncentive, calculateAchievementPercent } from './data/generators'
import { flowHandlers } from './flowHandlers'
import { getModuleConfig } from '@/config/modules'
import type { ModuleListParams } from '@/api/client'

const store = new Map<string, Record<string, unknown>[]>()

function getStore(slug: string) {
  if (!store.has(slug)) {
    store.set(slug, generateModuleRecords(slug, 55 + (slug.length % 20)))
  }
  const records = store.get(slug)!
  // Refresh expiry data if older records lack the role `view` field
  if (slug.includes('expiry-report') && records.length > 0 && records[0].view == null) {
    const fresh = generateModuleRecords(slug, 55 + (slug.length % 20))
    store.set(slug, fresh)
    return fresh
  }
  // Refresh purchase data if older records lack the `credit` field
  if (slug === 'purchase-purchases' && records.length > 0 && records[0].credit == null) {
    const fresh = generateModuleRecords(slug, 55 + (slug.length % 20))
    store.set(slug, fresh)
    return fresh
  }
  // Refresh supplier data if older records used purchase-order shape or missing new fields
  if (slug === 'purchase-supplier-management' && records.length > 0 && (records[0].name == null || records[0].gst == null)) {
    const fresh = generateModuleRecords(slug, 55 + (slug.length % 20))
    store.set(slug, fresh)
    return fresh
  }
  // Refresh purchase return data if older records lack product/invoice fields
  if (slug === 'purchase-purchase-return' && records.length > 0 && records[0].product == null) {
    const fresh = generateModuleRecords(slug, 55 + (slug.length % 20))
    store.set(slug, fresh)
    return fresh
  }
  // Refresh vehicle data if older records lack vehicleName field
  if (slug === 'logistics-vehicle-management' && records.length > 0 && records[0].vehicleName == null) {
    const fresh = generateModuleRecords(slug, 55 + (slug.length % 20))
    store.set(slug, fresh)
    return fresh
  }
  // Refresh driver data if older records lack driver-specific fields
  if (slug === 'logistics-driver-management' && records.length > 0 && records[0].licenseNumber == null) {
    const fresh = generateModuleRecords(slug, 55 + (slug.length % 20))
    store.set(slug, fresh)
    return fresh
  }
  // Refresh dispatch data if older records lack deliverySchedule/totalQuantity
  if (slug === 'logistics-dispatch' && records.length > 0 && records[0].deliverySchedule == null) {
    const fresh = generateModuleRecords(slug, 55 + (slug.length % 20))
    store.set(slug, fresh)
    return fresh
  }
  // Refresh e-way bill data if older records lack invoiceNo/transporter fields
  if (slug === 'logistics-e-way-bills' && records.length > 0 && (records[0].invoiceNo == null || records[0].transporter == null)) {
    const fresh = generateModuleRecords(slug, 55 + (slug.length % 20))
    store.set(slug, fresh)
    return fresh
  }
  // Refresh employee data if older records lack new HR fields
  if (slug === 'hr-employees' && records.length > 0 && records[0].emergencyContact == null) {
    const fresh = generateModuleRecords(slug, 55 + (slug.length % 20))
    store.set(slug, fresh)
    return fresh
  }
  // Refresh payroll data if older records lack payroll-specific fields
  if (slug === 'hr-payroll' && records.length > 0 && (records[0].payrollMonth == null || records[0].monthlyBase == null)) {
    const fresh = generateModuleRecords(slug, 55 + (slug.length % 20))
    store.set(slug, fresh)
    return fresh
  }
  // Refresh incentive data if older records lack incentive-specific fields
  if (slug === 'hr-incentives' && records.length > 0 && records[0].incentiveEarned == null) {
    const fresh = generateModuleRecords(slug, 55 + (slug.length % 20))
    store.set(slug, fresh)
    return fresh
  }
  // Refresh leave data if older records lack leave-specific fields
  if (slug === 'hr-leave-management' && records.length > 0 && records[0].leaveType == null) {
    const fresh = generateModuleRecords(slug, 55 + (slug.length % 20))
    store.set(slug, fresh)
    return fresh
  }
  // Refresh sales target data if older records lack target-specific fields
  if (slug === 'hr-sales-targets' && records.length > 0 && records[0].targetName == null) {
    const fresh = generateModuleRecords(slug, 55 + (slug.length % 20))
    store.set(slug, fresh)
    return fresh
  }
  // Refresh user management data if older records lack user-specific fields
  if (slug === 'user-management-users' && records.length > 0 && records[0].email == null) {
    const fresh = generateModuleRecords(slug, 55 + (slug.length % 20))
    store.set(slug, fresh)
    return fresh
  }
  if (slug === 'user-management-roles' && records.length > 0 && records[0].description == null) {
    const fresh = generateModuleRecords(slug, 55 + (slug.length % 20))
    store.set(slug, fresh)
    return fresh
  }
  // Refresh notification data if older records lack notification-specific fields
  if (slug === 'admin-notifications' && records.length > 0 && records[0].title == null) {
    const fresh = generateModuleRecords(slug, 55 + (slug.length % 20))
    store.set(slug, fresh)
    return fresh
  }
  return records
}

function parseListParams(url: URL): ModuleListParams {
  const num = (key: string) => url.searchParams.get(key) || undefined
  return {
    page: Number(url.searchParams.get('page') || 1),
    pageSize: Number(url.searchParams.get('pageSize') || 10),
    search: num('search'),
    status: num('status'),
    dateFrom: num('dateFrom'),
    dateTo: num('dateTo'),
    route: num('route'),
    shopCategory: num('shopCategory'),
    lastVisitFrom: num('lastVisitFrom'),
    lastVisitTo: num('lastVisitTo'),
    creditMin: num('creditMin'),
    creditMax: num('creditMax'),
    outstandingMin: num('outstandingMin'),
    outstandingMax: num('outstandingMax'),
    view: num('view'),
  }
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

function filter(records: Record<string, unknown>[], params: ModuleListParams) {
  let result = [...records]
  const {
    search, status, dateFrom, dateTo, route, shopCategory,
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

export const handlers = [
  ...flowHandlers,

  http.get('/api/customers/top-sales-shops', async ({ request }) => {
    await delay(300)
    const params = parseListParams(new URL(request.url))
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

    return HttpResponse.json({ topShops })
  }),

  http.get('/api/dashboard', async () => {
    await delay(350)
    const stats = generateDashboardStats()
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const dailySales = generateChartData('dashboard-daily', 7, 1)
    dailySales.categories = weekdays

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const salesVsCollection = generateChartData('dashboard-collection', 12, 2)
    salesVsCollection.categories = months
    salesVsCollection.series[0].name = 'Collection'
    salesVsCollection.series[1].name = 'Sales'

    return HttpResponse.json({
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
    })
  }),

  http.get('/api/:module', async ({ params, request }) => {
    await delay(280)
    const slug = params.module as string
    if (slug === 'dashboard') return

    const config = getModuleConfig(`/${slug.replace(/-/g, '/')}`)
    const listParams = parseListParams(new URL(request.url))

    const all = getStore(slug)
    const filtered = filter(all, listParams)
    const page = paginate(filtered, listParams.page, listParams.pageSize)
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

    return HttpResponse.json({
      ...page,
      stats: computeStats(filtered, statKeys),
      chart,
      totals: sumFields.length > 0 ? computeColumnTotals(filtered, sumFields) : undefined,
    })
  }),

  http.get('/api/:module/:id', async ({ params }) => {
    await delay(180)
    const slug = params.module as string
    const id = params.id as string
    const record = getStore(slug).find((r) => r.id === id)
    if (!record) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(record)
  }),

  http.post('/api/:module', async ({ params, request }) => {
    await delay(250)
    const slug = params.module as string
    const body = (await request.json()) as Record<string, unknown>
    const records = getStore(slug)
    const payload = slug === 'hr-incentives'
      ? applyIncentiveCalculation(body)
      : slug === 'hr-leave-management'
        ? applyLeaveCalculation(body)
        : slug === 'hr-sales-targets'
          ? applySalesTargetCalculation(body)
          : body
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
    return HttpResponse.json(newRecord, { status: 201 })
  }),

  http.put('/api/:module/:id', async ({ params, request }) => {
    await delay(250)
    const slug = params.module as string
    const id = params.id as string
    const body = (await request.json()) as Record<string, unknown>
    const records = getStore(slug)
    const idx = records.findIndex((r) => r.id === id)
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    const payload = slug === 'hr-incentives'
      ? applyIncentiveCalculation(body)
      : slug === 'hr-leave-management'
        ? applyLeaveCalculation(body)
        : slug === 'hr-sales-targets'
          ? applySalesTargetCalculation(body)
          : body
    records[idx] = { ...records[idx], ...payload, updatedAt: new Date().toISOString() }
    return HttpResponse.json(records[idx])
  }),

  http.delete('/api/:module/:id', async ({ params }) => {
    await delay(180)
    const slug = params.module as string
    const id = params.id as string
    const records = getStore(slug)
    const idx = records.findIndex((r) => r.id === id)
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    records.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  http.get('/api/:module/chart', async ({ params }) => {
    await delay(200)
    const slug = params.module as string
    return HttpResponse.json(generateChartData(slug, 12, 2))
  }),
]
