import { http, HttpResponse, delay } from 'msw'
import { generateChartData, generateDashboardStats, generateModuleRecords, computeStats, computeColumnTotals } from './data/generators'
import { flowHandlers } from './flowHandlers'
import { getModuleConfig } from '@/config/modules'
import type { ListParams } from '@/api/client'

const store = new Map<string, Record<string, unknown>[]>()

function getStore(slug: string) {
  if (!store.has(slug)) {
    store.set(slug, generateModuleRecords(slug, 55 + (slug.length % 20)))
  }
  return store.get(slug)!
}

function filter(records: Record<string, unknown>[], params: ListParams) {
  let result = [...records]
  const { search, status, dateFrom, dateTo } = params
  if (search) {
    const q = search.toLowerCase()
    result = result.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(q)),
    )
  }
  if (status) result = result.filter((r) => r.status === status)
  if (dateFrom) result = result.filter((r) => String(r.date ?? '') >= dateFrom)
  if (dateTo) result = result.filter((r) => String(r.date ?? '') <= dateTo)
  return result
}

function paginate<T>(items: T[], page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize
  return { data: items.slice(start, start + pageSize), total: items.length, page, pageSize }
}

export const handlers = [
  ...flowHandlers,

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
    const url = new URL(request.url)
    const listParams: ListParams = {
      page: Number(url.searchParams.get('page') || 1),
      pageSize: Number(url.searchParams.get('pageSize') || 10),
      search: url.searchParams.get('search') || undefined,
      status: url.searchParams.get('status') || undefined,
      dateFrom: url.searchParams.get('dateFrom') || undefined,
      dateTo: url.searchParams.get('dateTo') || undefined,
    }

    const all = getStore(slug)
    const filtered = filter(all, listParams)
    const page = paginate(filtered, listParams.page, listParams.pageSize)
    const statKeys = config.stats.map((s) => s.key)
    const sumFields = config.sumFields
      ?? (config.features?.includes('reportTotals')
        ? config.columns.filter((c) => c.type === 'currency' || c.type === 'number').map((c) => c.field)
        : [])

    return HttpResponse.json({
      ...page,
      stats: computeStats(filtered, statKeys),
      chart: config.showChart ? generateChartData(slug, 12, config.layout === 'report' ? 2 : 1) : undefined,
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
    const config = getModuleConfig(`/${slug.replace(/-/g, '/')}`)
    const newRecord = {
      id: String(Date.now()),
      code: `${slug.slice(0, 3).toUpperCase()}-${String(records.length + 1).padStart(4, '0')}`,
      status: 'active',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      ...(slug === 'logistics-e-way-bills' && !body.ewayBill
        ? { ewayBill: `EWB${Date.now().toString().slice(-12)}` }
        : {}),
      ...body,
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
    records[idx] = { ...records[idx], ...body, updatedAt: new Date().toISOString() }
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
