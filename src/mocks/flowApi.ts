import {
  demoAccounts, shops, products, staff, defaultPermissions, leaveTypes, salesSchemes,
  returnPricingRules as seedReturnPricingRules,
} from './flowData'

const orders: Record<string, unknown>[] = []
const salesReturns: Record<string, unknown>[] = []
const routeAssignments: Record<string, unknown>[] = []
const weeklySchedules: Record<string, unknown>[] = []
const shopRequests: Record<string, unknown>[] = []
const leaveRequests: Record<string, unknown>[] = []
const returnPricingRules = [...seedReturnPricingRules]
const attendanceToday = new Map<string, Record<string, unknown>>()
const rolePermissions: Record<string, string[]> = { ...defaultPermissions }
let orderCounter = 1000
let returnCounter = 2000
let pricingRuleCounter = seedReturnPricingRules.length

function seedOrdersIfEmpty() {
  if (orders.length > 0) return
  const todayDate = new Date().toISOString().split('T')[0]
  shops.forEach((shop, i) => {
    orderCounter += 1
    orders.push({
      id: String(orderCounter),
      code: `ORD-${orderCounter}`,
      shopId: shop.id,
      shopName: shop.name,
      status: i % 2 === 0 ? 'delivered' : 'completed',
      amount: 45000 + i * 12000,
      date: todayDate,
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

type Params = Record<string, string>
type Handler = (params: Params, body: unknown) => unknown | Promise<unknown>

interface Route {
  method: string
  segments: string[]
  handler: Handler
}

const routes: Route[] = []

function addRoute(method: string, pattern: string, handler: Handler) {
  const segments = pattern.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
  routes.push({ method: method.toUpperCase(), segments, handler })
}

addRoute('POST', '/auth/login', (_params, body) => {
  const b = body as { mobile: string; password: string }
  const account = demoAccounts.find((a) => a.mobile === b.mobile && a.password === b.password)
  if (!account) {
    throw new Error('Invalid mobile or password')
  }
  const user = {
    id: `user-${account.mobile}`,
    name: account.name,
    mobile: account.mobile,
    role: account.role,
    email: `${account.name.toLowerCase().replace(/\s/g, '.')}@routesales.com`,
  }
  return { token: `jwt-${account.role}-${Date.now()}`, user }
})

addRoute('GET', '/shops', () => shops)

addRoute('GET', '/products', () => products)

addRoute('POST', '/products', (_params, body) => {
  const b = (body ?? {}) as Partial<(typeof products)[number]>
  const price = Number(b.price) || 0
  const product = {
    id: `p-${Date.now()}`,
    name: b.name ?? 'New Product',
    category: b.category ?? 'General',
    price,
    gstRate: Number(b.gstRate) || 5,
    hsn: b.hsn ?? '',
    unit: b.unit ?? 'pkt',
    stockQty: Number(b.stockQty) || 0,
    barcode: b.barcode || `8901${String(Date.now()).slice(-9)}`,
    mrp: Number(b.mrp) || Math.round(price * 1.15),
    mop: Number(b.mop) || Math.round(price * 1.05),
    batch: b.batch || `B-NEW-${new Date().toISOString().slice(2, 7).replace('-', '')}`,
    image: b.image ?? '',
    qtyValue: Number(b.qtyValue) || 1,
    qtyUnit: b.qtyUnit ?? 'kg',
    packSize: b.packSize || `${Number(b.qtyValue) || 1} ${b.qtyUnit ?? 'kg'}`,
  }
  products.push(product)
  return product
})

addRoute('PUT', '/products/:id', (params, body) => {
  const b = (body ?? {}) as Partial<(typeof products)[number]>
  const idx = products.findIndex((p) => p.id === params.id)
  if (idx === -1) {
    throw new Error('Product not found')
  }
  const existing = products[idx]
  const price = b.price != null ? Number(b.price) || 0 : existing.price
  const updated = {
    ...existing,
    name: b.name ?? existing.name,
    category: b.category ?? existing.category,
    price,
    gstRate: b.gstRate != null ? Number(b.gstRate) || 0 : existing.gstRate,
    hsn: b.hsn ?? existing.hsn,
    unit: b.unit ?? existing.unit,
    stockQty: b.stockQty != null ? Number(b.stockQty) || 0 : existing.stockQty,
    mrp: b.mrp != null ? Number(b.mrp) || 0 : existing.mrp,
    mop: b.mop != null ? Number(b.mop) || 0 : existing.mop,
    image: b.image !== undefined ? b.image : existing.image,
    qtyValue: b.qtyValue != null ? Number(b.qtyValue) || 0 : existing.qtyValue,
    qtyUnit: b.qtyUnit ?? existing.qtyUnit,
    packSize: b.packSize || (b.qtyValue != null || b.qtyUnit != null
      ? `${b.qtyValue ?? existing.qtyValue} ${b.qtyUnit ?? existing.qtyUnit}`
      : existing.packSize),
  }
  products[idx] = updated
  return updated
})

addRoute('GET', '/sales-schemes', () => salesSchemes.filter((s) => s.active))

addRoute('GET', '/users', () => staff.map((s) => ({ ...s, department: 'Field', status: 'active' })))

addRoute('GET', '/orders', () => {
  seedOrdersIfEmpty()
  return orders
})

addRoute('POST', '/orders', (_params, body) => {
  const b = (body ?? {}) as Record<string, unknown>
  orderCounter += 1
  const order = {
    id: String(orderCounter),
    code: `ORD-${orderCounter}`,
    status: 'pending',
    date: today,
    createdAt: new Date().toISOString(),
    ...b,
  }
  orders.unshift(order)
  return order
})

addRoute('PATCH', '/orders/:id/status', (params, body) => {
  const b = body as { status: string }
  const idx = orders.findIndex((o) => o.id === params.id)
  if (idx >= 0) orders[idx] = { ...orders[idx], status: b.status }
  return orders[idx]
})

addRoute('GET', '/returns', () => salesReturns)

addRoute('POST', '/returns', (_params, body) => {
  const b = (body ?? {}) as Record<string, unknown>
  returnCounter += 1
  const items = (b.items as { qty: number; price: number }[]) ?? []
  const amount = items.reduce((s, i) => s + i.qty * i.price, 0)
  const record = {
    id: String(returnCounter),
    code: `RET-${returnCounter}`,
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    amount,
    customer: b.shopName,
    salesman: 'Field Staff',
    ...b,
  }
  salesReturns.unshift(record)
  return record
})

addRoute('PATCH', '/returns/:id', (params, body) => {
  const b = body as { status: string; notes?: string }
  const idx = salesReturns.findIndex((r) => r.id === params.id)
  if (idx >= 0) {
    salesReturns[idx] = {
      ...salesReturns[idx],
      status: b.status,
      reviewedAt: new Date().toISOString(),
      reviewNotes: b.notes,
    }
  }
  return salesReturns[idx]
})

addRoute('GET', '/return-pricing-rules', () => returnPricingRules)

addRoute('POST', '/return-pricing-rules', (_params, body) => {
  const b = (body ?? {}) as Record<string, unknown>
  pricingRuleCounter += 1
  const rule = {
    id: `rpr-${pricingRuleCounter}`,
    shopId: String(b.shopId ?? ''),
    productId: String(b.productId ?? ''),
    amount: Number(b.amount) || 0,
    enabled: b.enabled !== false,
    variantSupport: Boolean(b.variantSupport),
    attributeSupport: Boolean(b.attributeSupport),
  }
  returnPricingRules.unshift(rule)
  return rule
})

addRoute('PUT', '/return-pricing-rules/:id', (params, body) => {
  const b = (body ?? {}) as Record<string, unknown>
  const idx = returnPricingRules.findIndex((r) => r.id === params.id)
  if (idx < 0) {
    throw new Error('Rule not found')
  }
  returnPricingRules[idx] = {
    ...returnPricingRules[idx],
    shopId: String(b.shopId ?? returnPricingRules[idx].shopId),
    productId: String(b.productId ?? returnPricingRules[idx].productId),
    amount: Number(b.amount ?? returnPricingRules[idx].amount),
    enabled: b.enabled !== undefined ? Boolean(b.enabled) : returnPricingRules[idx].enabled,
    variantSupport: b.variantSupport !== undefined
      ? Boolean(b.variantSupport)
      : returnPricingRules[idx].variantSupport,
    attributeSupport: b.attributeSupport !== undefined
      ? Boolean(b.attributeSupport)
      : returnPricingRules[idx].attributeSupport,
  }
  return returnPricingRules[idx]
})

addRoute('DELETE', '/return-pricing-rules/:id', (params) => {
  const idx = returnPricingRules.findIndex((r) => r.id === params.id)
  if (idx >= 0) returnPricingRules.splice(idx, 1)
  return { id: params.id }
})

addRoute('GET', '/route-assignments', () => routeAssignments)

addRoute('POST', '/route-assignments', (_params, body) => {
  const b = (body ?? {}) as Record<string, unknown>
  const userIds = (b.userIds as string[]) ?? [b.userId as string]
  const created = userIds.map((uid, i) => {
    const user = staff.find((s) => s.id === uid)
    const record = {
      id: `ra-${Date.now()}-${i}`,
      routeName: b.routeName,
      date: b.date ?? today,
      userId: uid,
      userName: user?.name ?? 'Staff',
      shopIds: b.shopIds,
      shopNames: shops.filter((s) => (b.shopIds as string[]).includes(s.id)).map((s) => s.name),
      status: 'pending',
      visited: 0,
      outlets: (b.shopIds as string[])?.length ?? 0,
    }
    routeAssignments.unshift(record)
    return record
  })
  return created
})

addRoute('GET', '/routes/today', () => {
  const routeShops = shops.map((s, i) => ({
    shopId: s.id,
    shopName: s.name,
    visitStatus: i < 2 ? 'Visited' : i === 2 ? 'Skipped' : 'Pending',
    order: i + 1,
  }))
  return { shops: routeShops, assignment: routeAssignments[0] }
})

addRoute('PATCH', '/routes/shops/:shopId/visit', (params, body) => {
  const b = body as { status: string }
  return { shopId: params.shopId, visitStatus: b.status }
})

addRoute('GET', '/routes/weekly-schedule', () => weeklySchedules)

addRoute('POST', '/routes/weekly-schedule', (_params, body) => {
  const b = (body ?? {}) as Record<string, unknown>
  const record = { id: `ws-${Date.now()}`, isActive: true, ...b }
  weeklySchedules.push(record)
  return record
})

addRoute('DELETE', '/routes/weekly-schedule/:id', (params) => {
  const idx = weeklySchedules.findIndex((s) => s.id === params.id)
  if (idx >= 0) weeklySchedules.splice(idx, 1)
  return undefined
})

addRoute('POST', '/routes/weekly-schedule/generate-today', () => {
  const dayOfWeek = new Date().getDay() || 7
  const template = weeklySchedules.find((s) => s.dayOfWeek === dayOfWeek)
  if (!template) {
    throw new Error('No schedule for today')
  }
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
  return { generated: userIds.length }
})

addRoute('GET', '/shop-requests', () => shopRequests)

addRoute('POST', '/shop-requests', (_params, body) => {
  const b = (body ?? {}) as Record<string, unknown>
  const record = { id: `sr-${Date.now()}`, status: 'pending', submittedAt: new Date().toISOString(), ...b }
  shopRequests.unshift(record)
  return record
})

addRoute('PATCH', '/shop-requests/:id', (params, body) => {
  const b = body as { status: string; notes?: string }
  const idx = shopRequests.findIndex((r) => r.id === params.id)
  if (idx >= 0) shopRequests[idx] = { ...shopRequests[idx], ...b, reviewedAt: new Date().toISOString() }
  return shopRequests[idx]
})

addRoute('GET', '/attendance/today', () => Object.fromEntries(attendanceToday))

addRoute('POST', '/attendance/check-in', (_params, body) => {
  const b = (body ?? {}) as Record<string, unknown>
  const record = { checkIn: new Date().toISOString(), status: 'present', onBreak: false, ...b }
  attendanceToday.set('current', record)
  return record
})

addRoute('POST', '/attendance/check-out', () => {
  const current = attendanceToday.get('current')
  if (current) {
    current.checkOut = new Date().toISOString()
    current.status = 'completed'
  }
  return current
})

addRoute('POST', '/attendance/break', (_params, body) => {
  const b = body as { minutes: number }
  const current = attendanceToday.get('current') ?? {}
  current.breakMinutes = (Number(current.breakMinutes) || 0) + b.minutes
  current.onBreak = false
  attendanceToday.set('current', current)
  return current
})

addRoute('GET', '/leave', () => leaveRequests)

addRoute('POST', '/leave', (_params, body) => {
  const b = (body ?? {}) as Record<string, unknown>
  const record = { id: `lv-${Date.now()}`, status: 'pending', appliedOn: today, ...b }
  leaveRequests.unshift(record)
  return record
})

addRoute('PATCH', '/leave/:id', (params, body) => {
  const b = body as { status: string }
  const idx = leaveRequests.findIndex((l) => l.id === params.id)
  if (idx >= 0) leaveRequests[idx] = { ...leaveRequests[idx], status: b.status }
  return leaveRequests[idx]
})

addRoute('GET', '/payroll/payslips', () => {
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
  return payslips
})

addRoute('GET', '/admin/permissions', () => rolePermissions)

addRoute('PUT', '/admin/permissions/:role', (params, body) => {
  const modules = body as string[]
  rolePermissions[params.role] = modules
  return rolePermissions
})

addRoute('GET', '/users/me/performance', () => ({
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
}))

addRoute('GET', '/stock/allocations', () => [
  { id: 'sa1', agent: 'Amit Delivery', product: 'Sunflower Oil 5L', qty: 50, status: 'pending', orderRef: 'ORD-1045' },
  { id: 'sa2', agent: 'Vikram Singh', product: 'Basmati Rice 10kg', qty: 30, status: 'received', orderRef: 'ORD-1042' },
])

addRoute('POST', '/stock/allocations', (_params, body) => {
  const b = (body ?? {}) as Record<string, unknown>
  return { id: `sa-${Date.now()}`, status: 'pending', ...b }
})

addRoute('PATCH', '/stock/allocations/:id/delivery', (params) => ({ id: params.id, status: 'received' }))

addRoute('GET', '/stock/overview', () => ({
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
}))

addRoute('POST', '/stock/movements', (_params, body) => {
  const b = (body ?? {}) as Record<string, unknown>
  return { id: `m-${Date.now()}`, ...b }
})

addRoute('GET', '/tracking/:userId/live', () => ({
  lat: 28.6139,
  lng: 77.209,
  speed: 25,
  lastUpdate: new Date().toISOString(),
  trail: Array.from({ length: 10 }, (_, i) => ({ lat: 28.61 + i * 0.002, lng: 77.20 + i * 0.003 })),
}))

export async function handleFlowRequest<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const normalizedMethod = method.toUpperCase()
  const segments = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)

  for (const r of routes) {
    if (r.method !== normalizedMethod) continue
    if (r.segments.length !== segments.length) continue

    const params: Params = {}
    let matched = true
    for (let i = 0; i < r.segments.length; i += 1) {
      const routeSegment = r.segments[i]
      const pathSegment = segments[i]
      if (routeSegment.startsWith(':')) {
        params[routeSegment.slice(1)] = pathSegment
      } else if (routeSegment !== pathSegment) {
        matched = false
        break
      }
    }
    if (!matched) continue

    const result = await r.handler(params, body)
    return result as T
  }

  throw new Error(`No mock handler for ${normalizedMethod} /${segments.join('/')}`)
}

export { leaveTypes, days }
