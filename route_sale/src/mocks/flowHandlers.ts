import { http, HttpResponse, delay } from 'msw'
import {
  demoAccounts, shops, products, staff, defaultPermissions, leaveTypes,
} from './flowData'

const orders: Record<string, unknown>[] = []
const salesReturns: Record<string, unknown>[] = []
const routeAssignments: Record<string, unknown>[] = []
const weeklySchedules: Record<string, unknown>[] = []
const shopRequests: Record<string, unknown>[] = []
const leaveRequests: Record<string, unknown>[] = []
const attendanceToday = new Map<string, Record<string, unknown>>()
const rolePermissions = { ...defaultPermissions }
let orderCounter = 1000
let returnCounter = 2000

function seedOrdersIfEmpty() {
  if (orders.length > 0) return
  const today = new Date().toISOString().split('T')[0]
  shops.forEach((shop, i) => {
    orderCounter += 1
    orders.push({
      id: String(orderCounter),
      code: `ORD-${orderCounter}`,
      shopId: shop.id,
      shopName: shop.name,
      status: i % 2 === 0 ? 'delivered' : 'completed',
      amount: 45000 + i * 12000,
      date: today,
      items: products.slice(0, 2).map((p) => ({ productId: p.id, name: p.name, qty: 10 + i, price: p.price })),
    })
  })
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Seed weekly schedules
days.forEach((day, i) => {
  if (i < 5) {
    weeklySchedules.push({
      id: `ws-${i + 1}`,
      dayOfWeek: i + 1,
      dayName: day,
      routeName: `Route ${day.slice(0, 3)}`,
      userIds: [staff[i % staff.length].id],
      userNames: [staff[i % staff.length].name],
      shopIds: shops.slice(0, 2 + (i % 2)).map((s) => s.id),
      shopNames: shops.slice(0, 2 + (i % 2)).map((s) => s.name),
      isActive: true,
    })
  }
})

// Seed route assignments for today
const today = new Date().toISOString().split('T')[0]
staff.slice(0, 3).forEach((s, i) => {
  routeAssignments.push({
    id: `ra-${i + 1}`,
    routeName: `North Zone Route ${String.fromCharCode(65 + i)}`,
    date: today,
    userId: s.id,
    userName: s.name,
    shopIds: shops.map((sh) => sh.id),
    shopNames: shops.map((sh) => sh.name),
    status: i === 0 ? 'active' : i === 1 ? 'pending' : 'completed',
    visited: i === 0 ? 2 : i === 1 ? 0 : 4,
    outlets: shops.length,
  })
})

export const flowHandlers = [
  http.post('/api/v1/auth/login', async ({ request }) => {
    await delay(400)
    const body = (await request.json()) as { mobile: string; password: string }
    const account = demoAccounts.find((a) => a.mobile === body.mobile && a.password === body.password)
    if (!account) {
      return HttpResponse.json({ success: false, error: { message: 'Invalid mobile or password' } }, { status: 401 })
    }
    const user = {
      id: `user-${account.mobile}`,
      name: account.name,
      mobile: account.mobile,
      role: account.role,
      email: `${account.name.toLowerCase().replace(/\s/g, '.')}@routesales.com`,
    }
    return HttpResponse.json({
      success: true,
      data: { token: `jwt-${account.role}-${Date.now()}`, user },
    })
  }),

  http.get('/api/v1/shops', async () => {
    await delay(200)
    return HttpResponse.json({ success: true, data: shops })
  }),

  http.get('/api/v1/products', async () => {
    await delay(200)
    return HttpResponse.json({ success: true, data: products })
  }),

  http.get('/api/v1/users', async () => {
    await delay(200)
    return HttpResponse.json({ success: true, data: staff.map((s) => ({ ...s, department: 'Field', status: 'active' })) })
  }),

  http.get('/api/v1/orders', async () => {
    await delay(250)
    seedOrdersIfEmpty()
    return HttpResponse.json({ success: true, data: orders })
  }),

  http.post('/api/v1/orders', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as Record<string, unknown>
    orderCounter += 1
    const order = {
      id: String(orderCounter),
      code: `ORD-${orderCounter}`,
      status: 'pending',
      date: today,
      createdAt: new Date().toISOString(),
      ...body,
    }
    orders.unshift(order)
    return HttpResponse.json({ success: true, data: order })
  }),

  http.patch('/api/v1/orders/:id/status', async ({ params, request }) => {
    await delay(200)
    const body = (await request.json()) as { status: string }
    const idx = orders.findIndex((o) => o.id === params.id)
    if (idx >= 0) orders[idx] = { ...orders[idx], status: body.status }
    return HttpResponse.json({ success: true, data: orders[idx] })
  }),

  http.get('/api/v1/returns', async () => {
    await delay(250)
    return HttpResponse.json({ success: true, data: salesReturns })
  }),

  http.post('/api/v1/returns', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as Record<string, unknown>
    returnCounter += 1
    const items = (body.items as { qty: number; price: number }[]) ?? []
    const amount = items.reduce((s, i) => s + i.qty * i.price, 0)
    const record = {
      id: String(returnCounter),
      code: `RET-${returnCounter}`,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      amount,
      customer: body.shopName,
      salesman: 'Field Staff',
      ...body,
    }
    salesReturns.unshift(record)
    return HttpResponse.json({ success: true, data: record })
  }),

  http.patch('/api/v1/returns/:id', async ({ params, request }) => {
    await delay(250)
    const body = (await request.json()) as { status: string; notes?: string }
    const idx = salesReturns.findIndex((r) => r.id === params.id)
    if (idx >= 0) {
      salesReturns[idx] = {
        ...salesReturns[idx],
        status: body.status,
        reviewedAt: new Date().toISOString(),
        reviewNotes: body.notes,
      }
    }
    return HttpResponse.json({ success: true, data: salesReturns[idx] })
  }),

  http.get('/api/v1/route-assignments', async () => {
    await delay(250)
    return HttpResponse.json({ success: true, data: routeAssignments })
  }),

  http.post('/api/v1/route-assignments', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as Record<string, unknown>
    const userIds = (body.userIds as string[]) ?? [body.userId as string]
    const created = userIds.map((uid, i) => {
      const user = staff.find((s) => s.id === uid)
      const record = {
        id: `ra-${Date.now()}-${i}`,
        routeName: body.routeName,
        date: body.date ?? today,
        userId: uid,
        userName: user?.name ?? 'Staff',
        shopIds: body.shopIds,
        shopNames: shops.filter((s) => (body.shopIds as string[]).includes(s.id)).map((s) => s.name),
        status: 'pending',
        visited: 0,
        outlets: (body.shopIds as string[])?.length ?? 0,
      }
      routeAssignments.unshift(record)
      return record
    })
    return HttpResponse.json({ success: true, data: created })
  }),

  http.get('/api/v1/routes/today', async () => {
    await delay(250)
    const routeShops = shops.map((s, i) => ({
      shopId: s.id,
      shopName: s.name,
      visitStatus: i < 2 ? 'Visited' : i === 2 ? 'Skipped' : 'Pending',
      order: i + 1,
    }))
    return HttpResponse.json({ success: true, data: { shops: routeShops, assignment: routeAssignments[0] } })
  }),

  http.patch('/api/v1/routes/shops/:shopId/visit', async ({ params, request }) => {
    await delay(200)
    const body = (await request.json()) as { status: string }
    return HttpResponse.json({ success: true, data: { shopId: params.shopId, visitStatus: body.status } })
  }),

  http.get('/api/v1/routes/weekly-schedule', async () => {
    await delay(250)
    return HttpResponse.json({ success: true, data: weeklySchedules })
  }),

  http.post('/api/v1/routes/weekly-schedule', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as Record<string, unknown>
    const record = { id: `ws-${Date.now()}`, isActive: true, ...body }
    weeklySchedules.push(record)
    return HttpResponse.json({ success: true, data: record })
  }),

  http.delete('/api/v1/routes/weekly-schedule/:id', async ({ params }) => {
    await delay(200)
    const idx = weeklySchedules.findIndex((s) => s.id === params.id)
    if (idx >= 0) weeklySchedules.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  http.post('/api/v1/routes/weekly-schedule/generate-today', async () => {
    await delay(400)
    const dayOfWeek = new Date().getDay() || 7
    const template = weeklySchedules.find((s) => s.dayOfWeek === dayOfWeek)
    if (!template) return HttpResponse.json({ success: false, error: { message: 'No schedule for today' } })
    const userIds = template.userIds as string[]
    userIds.forEach((uid) => {
      const user = staff.find((s) => s.id === uid)
      routeAssignments.unshift({
        id: `ra-gen-${Date.now()}-${uid}`,
        routeName: template.routeName,
        date: today,
        userId: uid,
        userName: user?.name,
        shopIds: template.shopIds,
        status: 'pending',
        visited: 0,
        outlets: (template.shopIds as string[])?.length ?? 0,
      })
    })
    return HttpResponse.json({ success: true, data: { generated: userIds.length } })
  }),

  http.get('/api/v1/shop-requests', async () => {
    await delay(250)
    return HttpResponse.json({ success: true, data: shopRequests })
  }),

  http.post('/api/v1/shop-requests', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as Record<string, unknown>
    const record = { id: `sr-${Date.now()}`, status: 'pending', submittedAt: new Date().toISOString(), ...body }
    shopRequests.unshift(record)
    return HttpResponse.json({ success: true, data: record })
  }),

  http.patch('/api/v1/shop-requests/:id', async ({ params, request }) => {
    await delay(250)
    const body = (await request.json()) as { status: string; notes?: string }
    const idx = shopRequests.findIndex((r) => r.id === params.id)
    if (idx >= 0) shopRequests[idx] = { ...shopRequests[idx], ...body, reviewedAt: new Date().toISOString() }
    return HttpResponse.json({ success: true, data: shopRequests[idx] })
  }),

  http.get('/api/v1/attendance/today', async () => {
    await delay(200)
    return HttpResponse.json({ success: true, data: Object.fromEntries(attendanceToday) })
  }),

  http.post('/api/v1/attendance/check-in', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as Record<string, unknown>
    const record = { checkIn: new Date().toISOString(), status: 'present', onBreak: false, ...body }
    attendanceToday.set('current', record)
    return HttpResponse.json({ success: true, data: record })
  }),

  http.post('/api/v1/attendance/check-out', async () => {
    await delay(300)
    const current = attendanceToday.get('current')
    if (current) {
      current.checkOut = new Date().toISOString()
      current.status = 'completed'
    }
    return HttpResponse.json({ success: true, data: current })
  }),

  http.post('/api/v1/attendance/break', async ({ request }) => {
    await delay(200)
    const body = (await request.json()) as { minutes: number }
    const current = attendanceToday.get('current') ?? {}
    current.breakMinutes = (Number(current.breakMinutes) || 0) + body.minutes
    current.onBreak = false
    attendanceToday.set('current', current)
    return HttpResponse.json({ success: true, data: current })
  }),

  http.get('/api/v1/leave', async () => {
    await delay(250)
    return HttpResponse.json({ success: true, data: leaveRequests })
  }),

  http.post('/api/v1/leave', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as Record<string, unknown>
    const record = { id: `lv-${Date.now()}`, status: 'pending', appliedOn: today, ...body }
    leaveRequests.unshift(record)
    return HttpResponse.json({ success: true, data: record })
  }),

  http.patch('/api/v1/leave/:id', async ({ params, request }) => {
    await delay(250)
    const body = (await request.json()) as { status: string }
    const idx = leaveRequests.findIndex((l) => l.id === params.id)
    if (idx >= 0) leaveRequests[idx] = { ...leaveRequests[idx], status: body.status }
    return HttpResponse.json({ success: true, data: leaveRequests[idx] })
  }),

  http.get('/api/v1/payroll/payslips', async () => {
    await delay(250)
    const payslips = staff.map((s, i) => ({
      id: `ps-${i + 1}`,
      employeeId: s.id,
      employeeName: s.name,
      month: 'July 2026',
      basic: 25000,
      hra: 8000,
      incentives: 3500 + i * 500,
      deductions: 2100,
      netPay: 34400 + i * 500,
      status: 'processed',
    }))
    return HttpResponse.json({ success: true, data: payslips })
  }),

  http.get('/api/v1/admin/permissions', async () => {
    await delay(200)
    return HttpResponse.json({ success: true, data: rolePermissions })
  }),

  http.put('/api/v1/admin/permissions/:role', async ({ params, request }) => {
    await delay(250)
    const modules = (await request.json()) as string[]
    rolePermissions[params.role as string] = modules
    return HttpResponse.json({ success: true, data: rolePermissions })
  }),

  http.get('/api/v1/users/me/performance', async () => {
    await delay(300)
    return HttpResponse.json({
      success: true,
      data: {
        teamSales: 2450000,
        totalOrders: 342,
        targetAchievement: 87,
        attendanceRate: 94,
        leaderboard: staff.map((s, i) => ({
          name: s.name,
          sales: 400000 - i * 35000,
          visits: 45 - i * 5,
          orders: 80 - i * 10,
          rank: i + 1,
        })),
        chart: {
          categories: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
          series: [{ name: 'Sales', data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50000) + 20000) }],
        },
      },
    })
  }),

  http.get('/api/v1/stock/allocations', async () => {
    await delay(250)
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'sa1', agent: 'Amit Delivery', product: 'Sunflower Oil 5L', qty: 50, status: 'pending', orderRef: 'ORD-1045' },
        { id: 'sa2', agent: 'Vikram Singh', product: 'Basmati Rice 10kg', qty: 30, status: 'received', orderRef: 'ORD-1042' },
      ],
    })
  }),

  http.post('/api/v1/stock/allocations', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({ success: true, data: { id: `sa-${Date.now()}`, status: 'pending', ...body } })
  }),

  http.patch('/api/v1/stock/allocations/:id/delivery', async ({ params }) => {
    await delay(200)
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'received' } })
  }),

  http.get('/api/v1/stock/overview', async () => {
    await delay(250)
    return HttpResponse.json({
      success: true,
      data: {
        totalSkus: products.length,
        warehouseValue: 2450000,
        lowStockCount: 2,
        periodIn: 12500,
        periodOut: 9800,
        netMovement: 2700,
        movements: [
          { id: 'm1', type: 'in', product: 'Basmati Rice', qty: 500, date: today, ref: 'PO-234' },
          { id: 'm2', type: 'out', product: 'Sunflower Oil', qty: 120, date: today, ref: 'SA-101' },
        ],
      },
    })
  }),

  http.post('/api/v1/stock/movements', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({ success: true, data: { id: `m-${Date.now()}`, ...body } })
  }),

  http.get('/api/v1/tracking/:userId/live', async () => {
    await delay(300)
    return HttpResponse.json({
      success: true,
      data: {
        lat: 28.6139,
        lng: 77.209,
        speed: 25,
        lastUpdate: new Date().toISOString(),
        trail: Array.from({ length: 10 }, (_, i) => ({ lat: 28.61 + i * 0.002, lng: 77.20 + i * 0.003 })),
      },
    })
  }),
]

export { leaveTypes, days }
