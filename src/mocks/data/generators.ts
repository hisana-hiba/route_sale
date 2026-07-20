import type { RecordStatus } from '@/types/module'

const customers = [
  'Ahmad Traders', 'Green Valley Store', 'City Mart', 'Sunrise Distributors',
  'Metro Wholesale', 'Prime Retail', 'Golden Foods', 'Royal Enterprises',
  'Swift Logistics', 'Nova Supplies', 'Elite Commerce', 'Harmony Traders',
  'Lakshmi Stores', 'Bharat Distributors', 'National Mart',
]

const suppliers = [
  'Hindustan Foods Ltd', 'Amul Dairy Co-op', 'Britannia Industries', 'ITC Limited',
  'Parle Products', 'Nestle India', 'HUL Distributors', 'PepsiCo India',
]

const products = [
  'Mineral Water 1L', 'Potato Chips 50g', 'Milk 500ml', 'Biscuit Pack',
  'Soft Drink 750ml', 'Bread Loaf', 'Cooking Oil 1L', 'Rice 5kg',
  'Detergent 1kg', 'Toothpaste 100g', 'Tea Powder 250g', 'Sugar 1kg',
]

const salesmen = [
  'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Reddy', 'Vikram Singh',
  'Anita Desai', 'Rajesh Gupta', 'Kavita Nair',
]

const routes = ['Route A - North', 'Route B - South', 'Route C - East', 'Route D - West', 'Route E - Central']

const employees = [
  { name: 'Rahul Sharma', dept: 'Sales', role: 'Sales Executive' },
  { name: 'Priya Patel', dept: 'Sales', role: 'Senior Salesman' },
  { name: 'Amit Kumar', dept: 'Accounts', role: 'Accountant' },
  { name: 'Sneha Reddy', dept: 'HR', role: 'HR Manager' },
  { name: 'Vikram Singh', dept: 'Logistics', role: 'Driver' },
  { name: 'Anita Desai', dept: 'Inventory', role: 'Store Keeper' },
]

const vehicles = ['MH-12-AB-4521', 'MH-14-CD-7832', 'MH-01-EF-9012', 'MH-04-GH-3456']

const accounts = [
  'Cash Account', 'Bank - HDFC', 'Bank - SBI', 'Sales Account', 'Purchase Account',
  'GST Payable', 'GST Receivable', 'Salary Expense', 'Rent Expense', 'Sundry Debtors',
]

const warehouses = ['Main Warehouse', 'Cold Storage', 'Depot North', 'Depot South']

const categories = ['Beverages', 'Snacks', 'Dairy', 'Grocery', 'Personal Care', 'Household']
const brands = ['Amul', 'Britannia', 'Parle', 'Nestle', 'ITC', 'HUL']
const units = ['Pcs', 'Box', 'Kg', 'Ltr', 'Pkt', 'Ctn']

const statuses = {
  sales: ['pending', 'completed', 'cancelled', 'draft'] as RecordStatus[],
  invoice: ['pending', 'completed', 'overdue', 'draft'] as RecordStatus[],
  purchase: ['pending', 'approved', 'completed', 'cancelled'] as RecordStatus[],
  inventory: ['active', 'low_stock', 'active', 'active'] as RecordStatus[],
  route: ['active', 'completed', 'pending', 'in_transit'] as RecordStatus[],
  hr: ['active', 'pending', 'approved', 'rejected'] as RecordStatus[],
  logistics: ['pending', 'in_transit', 'delivered', 'cancelled'] as RecordStatus[],
}

let idSeq = 1
const nextId = () => String(idSeq++)

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function amount(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min))
}

function date(daysAgo = 0) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

function seededRandom(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i)
  return () => {
    h = (h * 1103515245 + 12345) & 0x7fffffff
    return h / 0x7fffffff
  }
}

export function generateChartData(slug: string, points = 12, seriesCount = 2) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  if (slug === 'dashboard-collection') {
    return {
      categories: months.slice(0, points),
      series: [
        { name: 'Collection', data: [1650000, 1000000, 1100000, 1300000, 1400000, 1300000, 800000, 1300000, 1000000, 1500000, 600000, 500000].slice(0, points) },
        { name: 'Sales', data: [900000, 800000, 1000000, 1200000, 600000, 1100000, 1400000, 1200000, 1100000, 1300000, 800000, 500000].slice(0, points) }
      ]
    }
  }

  const rand = seededRandom(slug)
  const names = slug.includes('expense') ? ['Expenses', 'Budget']
    : slug.includes('purchase') ? ['Purchases', 'Returns']
    : slug.includes('collection') ? ['Collection', 'Target']
    : slug.includes('route') ? ['Visits', 'Sales']
    : slug.includes('inventory') ? ['Stock In', 'Stock Out']
    : ['Sales', 'Returns']

  return {
    categories: months.slice(0, points),
    series: Array.from({ length: seriesCount }, (_, i) => ({
      name: names[i] ?? `Series ${i + 1}`,
      data: months.slice(0, points).map(() => amount(
        slug.includes('collection') ? 300000 : 30000,
        slug.includes('collection') ? 1800000 : 500000
      )),
    })).map((s, i) => ({
      ...s,
      data: s.data.map((v) => Math.round(v * (0.7 + rand() * 0.6) * (slug.includes('collection') ? 1 : (i === 0 ? 1 : 0.6)))),
    })),
  }
}

export function generateOrdersChart(records: Record<string, unknown>[]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const totalByMonth = Array(12).fill(0) as number[]
  const fallbackK = [45, 52, 38, 65, 48, 55, 72, 68, 51, 85, 42, 60]
  const refSum = fallbackK.reduce((a, b) => a + b, 0)

  for (const record of records) {
    const dateStr = String(record.date ?? '')
    if (!dateStr) continue
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) continue
    totalByMonth[d.getMonth()] += Number(record.amount) || 0
  }

  const monthsWithData = totalByMonth.filter((v) => v > 0).length
  const orderTotal = totalByMonth.reduce((a, b) => a + b, 0)

  // Sparse date ranges: scale the reference monthly shape by total order value
  const data = monthsWithData >= 4
    ? totalByMonth
    : fallbackK.map((k) => Math.round((k / refSum) * (orderTotal || refSum * 1000)))

  return {
    categories: months,
    series: [{ name: 'Order Value', data }],
  }
}

export function computeColumnTotals(records: Record<string, unknown>[], fields: string[]) {
  const totals: Record<string, number> = {}
  for (const field of fields) {
    totals[field] = records.reduce((sum, r) => sum + (Number(r[field]) || 0), 0)
  }
  return totals
}

export function computeStats(records: Record<string, unknown>[], statKeys: string[]) {
  const stats: Record<string, number> = {}
  for (const key of statKeys) {
    if (key === 'total') stats.total = records.length
    else if (key === 'totalAmount') stats.totalAmount = records.reduce((s, r) => s + (Number(r.amount) || Number(r.total) || Number(r.debit) || 0), 0)
    else if (key === 'pending') stats.pending = records.filter((r) => r.status === 'pending').length
    else if (key === 'completed') stats.completed = records.filter((r) => r.status === 'completed' || r.status === 'delivered' || r.status === 'approved').length
    else if (key === 'overdue') stats.overdue = records.filter((r) => r.status === 'overdue').length
    else if (key === 'lowStock') stats.lowStock = records.filter((r) => r.status === 'low_stock').length
    else if (key === 'inTransit') stats.inTransit = records.filter((r) => r.status === 'in_transit').length
    else if (key === 'active') stats.active = records.filter((r) => r.status === 'active').length
    else if (key === 'totalStock') stats.totalStock = records.reduce((s, r) => s + (Number(r.stock) || 0), 0)
    else if (key === 'totalCredit') stats.totalCredit = records.reduce((s, r) => s + (Number(r.creditLimit) || 0), 0)
    else if (key === 'totalOutstanding') stats.totalOutstanding = records.reduce((s, r) => s + (Number(r.outstanding) || 0), 0)
    else if (key === 'totalDebit') stats.totalDebit = records.reduce((s, r) => s + (Number(r.debit) || 0), 0)
    else if (key === 'totalCreditBal') stats.totalCreditBal = records.reduce((s, r) => s + (Number(r.credit) || 0), 0)
    else if (key === 'totalRevenue') {
      stats.totalRevenue = records.reduce((s, r) => s + (Number(r.total) || Number(r.amount) || 0), 0)
    }
    else if (key === 'totalExpense') {
      stats.totalExpense = records.reduce((s, r) => {
        const tax = Number(r.tax)
        if (!Number.isNaN(tax) && tax > 0) return s + tax
        const base = Number(r.amount) || Number(r.total) || 0
        return s + Math.round(base * 0.18)
      }, 0)
    }
    else if (key === 'totalOrders') stats.totalOrders = records.length
    else if (key === 'totalIncentiveEarned') stats.totalIncentiveEarned = records.reduce((s, r) => s + (Number(r.incentiveEarned) || 0), 0)
    else if (key === 'avgAchievement') {
      stats.avgAchievement = records.length
        ? Math.round(records.reduce((s, r) => s + (Number(r.achievementPercent) || 0), 0) / records.length)
        : 0
    }
    else if (key === 'targetMet') stats.targetMet = records.filter((r) => Number(r.achievementPercent) >= 100).length
    else if (key === 'rejected') stats.rejected = records.filter((r) => r.status === 'rejected').length
    else stats[key] = amount(10, 500)
  }
  return stats
}

// ─── Domain generators ───────────────────────────────────────────────

function salesOrder(slug: string, i: number) {
  const qty = amount(5, 200)
  const rate = amount(20, 500)
  return {
    id: nextId(), code: `ORD-${String(i + 1).padStart(5, '0')}`,
    customer: pick(customers), salesman: pick(salesmen), route: pick(routes),
    date: date(Math.floor(Math.random() * 60)), items: amount(1, 15),
    quantity: qty, amount: qty * rate, status: pick(statuses.sales),
    paymentMode: pick(['Cash', 'Credit', 'UPI', 'Cheque']),
    deliveryDate: date(-amount(1, 5)), createdAt: new Date().toISOString(),
  }
}

function invoice(slug: string, i: number) {
  const amt = amount(5000, 250000)
  return {
    id: nextId(), code: `INV-${String(i + 1).padStart(5, '0')}`,
    customer: pick(customers), date: date(Math.floor(Math.random() * 90)),
    dueDate: date(-amount(5, 30)), amount: amt, tax: Math.round(amt * 0.18),
    total: Math.round(amt * 1.18), status: pick(statuses.invoice),
    paymentTerms: pick(['Net 15', 'Net 30', 'COD', 'Net 7']),
    salesman: pick(salesmen), createdAt: new Date().toISOString(),
  }
}

function purchaseReturnRecord(_slug: string, i: number) {
  const product = products[i % products.length]
  const quantity = amount(1, 80)
  const unitPrice = amount(25, 450)
  const amt = quantity * unitPrice
  const returnReasons = ['Damaged Goods', 'Expired Batch', 'Wrong Item Supplied', 'Quality Issue', 'Excess Stock']
  return {
    id: nextId(),
    code: `PR-${String(i + 1).padStart(5, '0')}`,
    supplier: pick(suppliers),
    product,
    invoice: `PI-${String(amount(1000, 9999))}`,
    quantity,
    amount: amt,
    reason: pick(returnReasons),
    date: date(Math.floor(Math.random() * 45)),
    status: pick(statuses.purchase),
    warehouse: pick(warehouses),
    createdAt: new Date().toISOString(),
  }
}

function purchaseRecord(_slug: string, i: number) {
  const itemCount = amount(2, 6)
  const selectedProducts = Array.from({ length: itemCount }, (_, j) => products[(i + j) % products.length])
  const quantities = selectedProducts.map(() => amount(10, 200))
  const totalQuantity = quantities.reduce((sum, q) => sum + q, 0)
  const unitPrices = selectedProducts.map(() => amount(20, 500))
  const amt = quantities.reduce((sum, q, idx) => sum + q * unitPrices[idx], 0)
  const credit = Math.round(amt * (amount(15, 75) / 100))
  return {
    id: nextId(), code: `PO-${String(i + 1).padStart(5, '0')}`,
    supplier: pick(suppliers), date: date(Math.floor(Math.random() * 60)),
    productList: selectedProducts.join(', '),
    totalQuantity,
    amount: amt,
    credit,
    items: itemCount,
    status: pick(statuses.purchase),
    warehouse: pick(warehouses), expectedDate: date(-amount(3, 14)),
    createdAt: new Date().toISOString(),
  }
}

function productRecord(slug: string, i: number) {
  const stock = amount(0, 500)
  const min = amount(50, 150)
  const batchNo = `B${amount(1000, 9999)}`
  const batchDate = date(amount(10, 120))
  const expiryDate = date(-amount(30, 365))
  const expiryMs = new Date(expiryDate).getTime()
  const daysRemaining = Math.max(0, Math.ceil((expiryMs - Date.now()) / 86400000))
  return {
    id: nextId(), code: `PRD-${String(i + 1).padStart(5, '0')}`,
    name: products[i % products.length], category: pick(categories),
    brand: pick(brands), unit: pick(units), mrp: amount(20, 500),
    stock, minStock: min, warehouse: pick(warehouses),
    status: stock < min ? 'low_stock' : daysRemaining < 30 ? 'overdue' : 'active',
    batch: batchNo, batchDate, batchStockCount: stock,
    expiry: expiryDate, daysRemaining,
    location: pick(['Pune', 'Mumbai', 'Nashik', 'Nagpur']),
    stockRooms: amount(2, 8),
    image: `/images/products/product-${(i % 6) + 1}.jpg`,
    amount: amount(20, 500) * stock, createdAt: new Date().toISOString(),
  }
}

function routeRecord(slug: string, i: number) {
  const outlets = amount(8, 25)
  const visited = amount(0, outlets)
  return {
    id: nextId(), code: `RT-${String(i + 1).padStart(4, '0')}`,
    name: routes[i % routes.length], salesman: pick(salesmen),
    date: date(Math.floor(Math.random() * 14)), outlets, visited,
    distance: `${amount(15, 80)} km`, collections: amount(10000, 150000),
    sales: amount(20000, 300000), status: pick(statuses.route),
    startTime: '08:30 AM', endTime: visited === outlets ? '05:45 PM' : '-',
    createdAt: new Date().toISOString(),
  }
}

const INCENTIVE_ROLES = ['Salesman', 'Delivery Agent', 'Driver', 'Manager'] as const
const INCENTIVE_ROLE_BASE: Record<string, number> = {
  Salesman: 15000,
  'Delivery Agent': 8000,
  Driver: 6000,
  Manager: 20000,
}

export function calculateIncentive(role: string, target: number, achieved: number) {
  const safeTarget = Math.max(target, 1)
  const achievementPercent = Math.round((achieved / safeTarget) * 100)
  const base = INCENTIVE_ROLE_BASE[role] ?? 10000
  let incentiveEarned = 0
  if (achievementPercent >= 100) {
    incentiveEarned = Math.round(base * (1 + (achievementPercent - 100) / 200))
  } else if (achievementPercent >= 70) {
    incentiveEarned = Math.round(base * (achievementPercent / 100))
  }
  return { achievementPercent, incentiveEarned }
}

function incentiveRecord(_slug: string, i: number) {
  const roleProfiles = [
    { name: 'Rahul Sharma', role: 'Salesman', employeeId: 'EMP-0001' },
    { name: 'Priya Patel', role: 'Salesman', employeeId: 'EMP-0002' },
    { name: 'Vikram Singh', role: 'Delivery Agent', employeeId: 'EMP-0005' },
    { name: 'Anita Desai', role: 'Driver', employeeId: 'EMP-0006' },
    { name: 'Rajesh Gupta', role: 'Manager', employeeId: 'EMP-0007' },
    { name: 'Kavita Nair', role: 'Salesman', employeeId: 'EMP-0008' },
  ]
  const profile = roleProfiles[i % roleProfiles.length]
  const months = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026']
  const target = roleProfiles[i % roleProfiles.length].role === 'Manager'
    ? amount(800000, 1500000)
    : roleProfiles[i % roleProfiles.length].role === 'Salesman'
      ? amount(200000, 600000)
      : roleProfiles[i % roleProfiles.length].role === 'Delivery Agent'
        ? amount(80, 200)
        : amount(40, 120)
  const variance = amount(65, 135) / 100
  const achieved = Math.round(target * variance)
  const { achievementPercent, incentiveEarned } = calculateIncentive(profile.role, target, achieved)
  return {
    id: nextId(),
    code: `INC-${String(i + 1).padStart(5, '0')}`,
    employeeId: profile.employeeId,
    name: profile.name,
    role: profile.role,
    period: months[i % months.length],
    target,
    achieved,
    achievementPercent,
    incentiveEarned,
    status: pick(['pending', 'approved', 'completed'] as RecordStatus[]),
    createdAt: new Date().toISOString(),
  }
}

export function calculateAchievementPercent(targetValue: number, achievedValue: number) {
  const safeTarget = Math.max(targetValue, 1)
  return Math.round((achievedValue / safeTarget) * 100)
}

function salesTargetRecord(_slug: string, i: number) {
  const targetTypes = ['Sales', 'Delivery', 'Collection', 'Performance', 'Route Coverage']
  const targetNames = [
    'Monthly Sales Target',
    'Route Collection Goal',
    'Delivery Completion Target',
    'New Outlet Acquisition',
    'Team Performance Goal',
  ]
  const teams = [
    'Rahul Sharma',
    'Priya Patel',
    'North Route Team',
    'South Route Team',
    'Logistics Team A',
  ]
  const targetType = targetTypes[i % targetTypes.length]
  const targetValue = targetType === 'Sales' || targetType === 'Collection'
    ? amount(200000, 800000)
    : targetType === 'Delivery'
      ? amount(80, 200)
      : amount(50, 150)
  const achievedValue = Math.round(targetValue * (amount(55, 130) / 100))
  const startOffset = amount(30, 90)
  const startDate = date(startOffset)
  const endDateObj = new Date(startDate)
  endDateObj.setDate(endDateObj.getDate() + amount(28, 31))
  const endDate = endDateObj.toISOString().split('T')[0]
  return {
    id: nextId(),
    code: `TGT-${String(i + 1).padStart(5, '0')}`,
    targetName: targetNames[i % targetNames.length],
    assignee: teams[i % teams.length],
    targetType,
    targetValue,
    achievedValue,
    achievementPercent: calculateAchievementPercent(targetValue, achievedValue),
    startDate,
    endDate,
    status: pick(['active', 'pending', 'completed'] as RecordStatus[]),
    createdAt: new Date().toISOString(),
  }
}

function leaveRecord(_slug: string, i: number) {
  const emp = employees[i % employees.length]
  const leaveTypes = ['Casual', 'Sick', 'Earned', 'Unpaid']
  const managers = ['Rajesh Gupta', 'Sneha Reddy', 'Anita Desai', 'Priya Patel']
  const fromOffset = amount(1, 30)
  const duration = amount(1, 5)
  const fromDate = date(fromOffset)
  const toDateObj = new Date(fromDate)
  toDateObj.setDate(toDateObj.getDate() + duration - 1)
  const toDate = toDateObj.toISOString().split('T')[0]
  const totalDays = duration
  return {
    id: nextId(),
    code: `LR-${String(i + 1).padStart(5, '0')}`,
    employeeId: `EMP-${String((i % employees.length) + 1).padStart(4, '0')}`,
    name: emp.name,
    leaveType: leaveTypes[i % leaveTypes.length],
    fromDate,
    toDate,
    totalDays,
    appliedDate: date(fromOffset + amount(1, 5)),
    reportingManager: pick(managers),
    status: pick(['pending', 'approved', 'rejected'] as RecordStatus[]),
    createdAt: new Date().toISOString(),
  }
}

function roleRecord(_slug: string, i: number) {
  const roles = [
    { name: 'Admin', description: 'Full system access and configuration' },
    { name: 'Manager', description: 'Team oversight, reports, and approvals' },
    { name: 'Salesman', description: 'Sales orders, collections, and route visits' },
    { name: 'Delivery Agent', description: 'Deliveries, dispatch, and stock allocation' },
    { name: 'Accountant', description: 'Accounting, ledger, and financial reports' },
  ]
  const role = roles[i % roles.length]
  return {
    id: nextId(),
    code: `ROL-${String(i + 1).padStart(3, '0')}`,
    name: role.name,
    description: role.description,
    usersCount: amount(1, 25),
    status: pick(['active', 'pending'] as RecordStatus[]),
    createdAt: new Date().toISOString(),
  }
}

function userRecord(_slug: string, i: number) {
  const emp = employees[i % employees.length]
  const roleKeys = ['admin', 'manager', 'salesman', 'deliveryAgent', 'accountant']
  const role = roleKeys[i % roleKeys.length]
  return {
    id: nextId(),
    code: `USR-${String(i + 1).padStart(4, '0')}`,
    name: emp.name,
    email: `${emp.name.toLowerCase().replace(/\s+/g, '.')}@routesale.com`,
    phone: `+91 ${amount(7000000000, 9999999999)}`,
    role,
    department: emp.dept,
    status: pick(['active', 'pending'] as RecordStatus[]),
    createdAt: new Date().toISOString(),
  }
}

function payrollRecord(_slug: string, i: number) {
  const emp = employees[i % employees.length]
  const months = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026']
  const monthlyBase = amount(18000, 55000)
  const pendingSalary = amount(0, 15000)
  const gross = monthlyBase + pendingSalary
  const deductions = amount(1000, 8000)
  return {
    id: nextId(),
    code: `PAY-${String(i + 1).padStart(5, '0')}`,
    employeeId: `EMP-${String((i % employees.length) + 1).padStart(4, '0')}`,
    name: emp.name,
    department: emp.dept,
    payrollMonth: months[i % months.length],
    monthlyBase,
    pendingSalary,
    grossSalary: gross,
    totalDeductions: deductions,
    netSalary: Math.max(0, gross - deductions),
    status: pick(['pending', 'approved', 'completed', 'rejected'] as RecordStatus[]),
    createdAt: new Date().toISOString(),
  }
}

function employeeRecord(slug: string, i: number) {
  const emp = employees[i % employees.length]
  const districts = ['Pune', 'Mumbai', 'Nashik', 'Nagpur', 'Kolhapur', 'Thane']
  return {
    id: nextId(), code: `EMP-${String(i + 1).padStart(4, '0')}`,
    name: emp.name, department: emp.dept, role: emp.role,
    phone: `+91 ${amount(7000000000, 9999999999)}`,
    emergencyContact: `+91 ${amount(7000000000, 9999999999)}`,
    address: `${amount(1, 999)} ${pick(['MG Road', 'Station Road', 'Market Yard'])}, ${pick(districts)}`,
    district: pick(districts),
    proof: '',
    category: pick(['Permanent', 'Contract', 'Temporary', 'Intern']),
    admin: pick(['Yes', 'No']),
    email: `${emp.name.toLowerCase().replace(' ', '.')}@routesale.com`,
    joinDate: date(amount(100, 1000)), salary: amount(18000, 65000),
    status: pick(statuses.hr), attendance: `${amount(18, 26)}/26`,
    target: amount(200000, 500000), achieved: amount(100000, 550000),
    createdAt: new Date().toISOString(),
  }
}

function customerRecord(slug: string, i: number) {
  const outstanding = amount(0, 200000)
  const limit = amount(50000, 300000)
  return {
    id: nextId(), code: `CUS-${String(i + 1).padStart(5, '0')}`,
    name: customers[i % customers.length], route: pick(routes),
    phone: `+91 ${amount(7000000000, 9999999999)}`,
    address: `${amount(1, 999)} Market Road, City`,
    shopCategory: pick(['traditional', 'supermarket', 'hypermarket', 'convenience', 'kirana', 'wholesale']),
    creditLimit: limit, outstanding, available: limit - outstanding,
    lastVisit: date(Math.floor(Math.random() * 30)),
    totalPurchases: amount(50000, 2000000), status: outstanding > limit * 0.8 ? 'overdue' : 'active',
    visits: amount(1, 50), createdAt: new Date().toISOString(),
  }
}

function supplierRecord(_slug: string, i: number) {
  const outstanding = amount(0, 150000)
  const limit = amount(100000, 500000)
  const name = suppliers[i % suppliers.length]
  const locations = ['Pune', 'Mumbai', 'Nashik', 'Nagpur', 'Kolhapur', 'Bengaluru']
  const location = pick(locations)
  return {
    id: nextId(),
    code: `SUP-${String(i + 1).padStart(5, '0')}`,
    name,
    phone: `+91 ${amount(7000000000, 9999999999)}`,
    gst: `${amount(10, 35)}ABCDE${amount(1000, 9999)}F${amount(1, 9)}Z${amount(1, 9)}`,
    address: `${amount(1, 999)} ${pick(['MG Road', 'Station Road', 'Market Yard', 'Industrial Area'])}, ${location}`,
    location,
    creditLimit: limit,
    outstanding,
    lastOrder: date(Math.floor(Math.random() * 60)),
    totalPurchases: amount(100000, 3000000),
    status: outstanding > limit * 0.85 ? 'overdue' : 'active',
    createdAt: new Date().toISOString(),
  }
}

function ledgerRecord(slug: string, i: number) {
  const debit = amount(0, 1) > 0.5 ? amount(1000, 100000) : 0
  const credit = debit === 0 ? amount(1000, 100000) : 0
  const narrations = [
    'Payment received against invoice', 'Fuel expense for route delivery',
    'Salary disbursement', 'Office rent payment', 'GST remittance',
    'Customer collection — cash', 'Supplier payment — cheque',
  ]
  return {
    id: nextId(), code: `JV-${String(i + 1).padStart(5, '0')}`,
    date: date(Math.floor(Math.random() * 90)), account: pick(accounts),
    particulars: pick(['Sales', 'Purchase', 'Salary', 'Rent', 'Collection', 'Payment', 'GST']),
    narration: pick(narrations),
    debit, credit, balance: amount(-50000, 500000),
    reference: `REF-${amount(1000, 9999)}`, voucherType: pick(['Receipt', 'Payment', 'Journal', 'Contra']),
    status: pick(['completed', 'pending', 'draft'] as RecordStatus[]),
    createdAt: new Date().toISOString(),
  }
}

function ledgerAccountRecord(slug: string, i: number) {
  const titles = ['Cash Account', 'Bank - HDFC', 'Sales Account', 'Purchase Account', 'Sundry Debtors', 'Sundry Creditors']
  const subGroups = ['Current Assets', 'Fixed Assets', 'Current Liabilities', 'Income', 'Expenses']
  const heads = ['Assets', 'Liabilities', 'Income', 'Expenses', 'Equity']
  const title = titles[i % titles.length]
  return {
    id: nextId(), code: `LDG-${String(i + 1).padStart(4, '0')}`,
    ledgerTitle: title, subGroup: pick(subGroups), accountHead: pick(heads),
    description: `${title} ledger for operational tracking`,
    balance: amount(-100000, 500000), date: date(Math.floor(Math.random() * 90)),
    status: 'active' as RecordStatus, createdAt: new Date().toISOString(),
  }
}

function routePerformanceOrder(slug: string, i: number) {
  const orderAmt = amount(5000, 150000)
  return {
    id: nextId(), orderNo: `ORD-${String(i + 1).padStart(5, '0')}`,
    code: `ORD-${String(i + 1).padStart(5, '0')}`,
    customer: pick(customers), salesman: pick(salesmen), route: pick(routes),
    amount: orderAmt, date: date(Math.floor(Math.random() * 30)),
    items: amount(1, 12), deliveryStatus: pick(['delivered', 'in_transit', 'pending', 'completed']),
    status: pick(statuses.route), createdAt: new Date().toISOString(),
  }
}

function expenseRecord(slug: string, i: number) {
  const amt = amount(500, 25000)
  return {
    id: nextId(), code: `EXP-${String(i + 1).padStart(5, '0')}`,
    date: date(Math.floor(Math.random() * 60)),
    account: pick(['Fuel', 'Travel', 'Meals', 'Maintenance', 'Miscellaneous']),
    narration: pick([
      'Fuel for Route A delivery vehicle', 'Client meeting travel allowance',
      'Field staff lunch reimbursement', 'Vehicle maintenance — oil change',
      'Miscellaneous route expenses',
    ]),
    debit: amt, credit: 0, balance: amt,
    salesman: pick(salesmen), route: pick(routes),
    status: pick(['completed', 'pending', 'draft'] as RecordStatus[]),
    createdAt: new Date().toISOString(),
  }
}

function vehicleRecord(_slug: string, i: number) {
  const vehicleTypes = ['Mini Truck', 'Truck', 'Van', 'Tempo', 'Pickup', 'Three Wheeler']
  const vehicleNames = ['Tata Ace', 'Mahindra Bolero Pickup', 'Ashok Leyland Dost', 'Eicher Pro 2049', 'Maruti Super Carry', 'Piaggio Ape']
  const type = vehicleTypes[i % vehicleTypes.length]
  return {
    id: nextId(),
    code: `VEH-${String(i + 1).padStart(4, '0')}`,
    vehicleNumber: vehicles[i % vehicles.length],
    vehicleName: vehicleNames[i % vehicleNames.length],
    vehicleType: type,
    driver: pick(salesmen),
    route: pick(routes),
    warehouse: pick(warehouses),
    loadCapacity: `${amount(500, 5000)} kg`,
    lastServiceDate: date(amount(10, 120)),
    status: pick(['active', 'in_transit', 'pending'] as RecordStatus[]),
    createdAt: new Date().toISOString(),
  }
}

function driverRecord(_slug: string, i: number) {
  const emp = employees[i % employees.length]
  return {
    id: nextId(),
    code: `DRV-${String(i + 1).padStart(4, '0')}`,
    name: emp.name,
    phone: `+91 ${amount(7000000000, 9999999999)}`,
    licenseNumber: `LIC-${amount(100000, 999999)}`,
    assignedVehicle: vehicles[i % vehicles.length],
    assignedRoute: pick(routes),
    warehouse: pick(warehouses),
    status: pick(['active', 'pending', 'in_transit'] as RecordStatus[]),
    licenseExpiryDate: date(-amount(30, 720)),
    createdAt: new Date().toISOString(),
  }
}

function logisticsRecord(slug: string, i: number) {
  const qty = amount(5, 200)
  return {
    id: nextId(), code: `DLV-${String(i + 1).padStart(5, '0')}`,
    vehicle: pick(vehicles), driver: pick(salesmen),
    route: pick(routes), customer: pick(customers),
    deliverySchedule: `DS-${String(amount(1, 500)).padStart(4, '0')}`,
    totalQuantity: qty,
    date: date(Math.floor(Math.random() * 14)), items: amount(1, 20),
    weight: `${amount(50, 500)} kg`, distance: `${amount(10, 120)} km`,
    status: pick(statuses.logistics), ewayBill: `EWB-${amount(100000, 999999)}`,
    amount: amount(5000, 150000), createdAt: new Date().toISOString(),
  }
}

function ewayBillRecord(_slug: string, i: number) {
  const transporters = ['ABC Logistics', 'Swift Transport', 'Malabar Freight', 'Express Cargo', 'Reliable Movers']
  return {
    id: nextId(),
    code: `EWB-REF-${String(i + 1).padStart(4, '0')}`,
    ewayBill: `EWB${Date.now().toString().slice(-8)}${String(i).padStart(2, '0')}`,
    invoiceNo: `INV-${amount(1000, 9999)}`,
    customer: pick(customers),
    vehicle: pick(vehicles),
    transporter: pick(transporters),
    distance: `${amount(10, 500)}`,
    validTill: date(-amount(1, 14)),
    date: date(Math.floor(Math.random() * 14)),
    status: pick(statuses.logistics),
    amount: amount(5000, 150000),
    createdAt: new Date().toISOString(),
  }
}

function gstRecord(slug: string, i: number) {
  const taxable = amount(10000, 500000)
  return {
    id: nextId(), code: `GST-${String(i + 1).padStart(4, '0')}`,
    period: pick(['Jan 2026', 'Feb 2026', 'Mar 2026', 'Q4 2025']),
    invoiceNo: `INV-${amount(1000, 9999)}`, party: pick([...customers, ...suppliers]),
    taxable, cgst: Math.round(taxable * 0.09), sgst: Math.round(taxable * 0.09),
    igst: 0, total: Math.round(taxable * 1.18), type: pick(['Sales', 'Purchase']),
    status: pick(['completed', 'pending', 'draft'] as RecordStatus[]),
    date: date(Math.floor(Math.random() * 90)), createdAt: new Date().toISOString(),
  }
}

function currentStockRecord(slug: string, i: number) {
  const stock = amount(0, 800)
  const min = amount(50, 200)
  return {
    id: nextId(), code: `PRD-${String(i + 1).padStart(5, '0')}`,
    name: products[i % products.length],
    category: pick(categories),
    brand: pick(brands),
    unit: pick(units),
    warehouse: pick(warehouses),
    stock, minStock: min,
    mrp: amount(20, 500),
    amount: amount(20, 500) * stock,
    status: stock === 0 ? 'overdue' as RecordStatus : stock < min ? 'low_stock' as RecordStatus : 'active' as RecordStatus,
    createdAt: new Date().toISOString(),
  }
}

function stockAdjustmentRecord(slug: string, i: number) {
  const adjustmentTypes = ['Addition', 'Removal', 'Correction', 'Damage', 'Return']
  const reasons = ['Physical Count', 'Damaged Goods', 'Theft / Loss', 'Supplier Return', 'System Error', 'Other']
  const adjStatuses = ['pending', 'approved', 'completed', 'cancelled'] as RecordStatus[]
  const qty = amount(1, 200)
  return {
    id: nextId(), code: `ADJ-${String(i + 1).padStart(5, '0')}`,
    date: date(Math.floor(Math.random() * 60)),
    name: products[i % products.length],
    warehouse: pick(warehouses),
    adjustmentType: pick(adjustmentTypes),
    quantity: qty,
    stock: qty,
    reason: pick(reasons),
    adjustedBy: pick(salesmen),
    status: pick(adjStatuses),
    createdAt: new Date().toISOString(),
  }
}

function reportRecord(_slug: string, i: number) {
  const debit = amount(0, 1) > 0.5 ? amount(5000, 250000) : 0
  const credit = debit === 0 ? amount(5000, 250000) : 0
  const descriptions = [
    'Sales revenue — route collections', 'Purchase of raw materials', 'Salary expense',
    'Rent — warehouse facility', 'GST output liability', 'Customer receipt — UPI',
    'Supplier payment — cheque', 'Fuel & logistics expense', 'Marketing spend',
    'Interest income', 'Depreciation charge', 'Opening balance adjustment',
  ]
  return {
    id: nextId(),
    code: `RPT-${String(i + 1).padStart(5, '0')}`,
    particulars: descriptions[i % descriptions.length],
    description: descriptions[i % descriptions.length],
    date: date(Math.floor(Math.random() * 120)),
    debit, credit,
    account: pick(accounts),
    status: pick(['completed', 'pending', 'draft'] as RecordStatus[]),
    createdAt: new Date().toISOString(),
  }
}

function purchaseReportRecord(_slug: string, i: number) {
  const amt = amount(10000, 500000)
  const supplier = pick(suppliers)
  return {
    id: nextId(),
    code: `POR-${String(i + 1).padStart(5, '0')}`,
    particulars: `Purchase from ${supplier}`,
    supplier,
    date: date(Math.floor(Math.random() * 90)),
    debit: amt,
    credit: 0,
    amount: amt,
    items: amount(3, 25),
    status: pick(statuses.purchase),
    createdAt: new Date().toISOString(),
  }
}

function collectionReportRecord(_slug: string, i: number) {
  const amt = amount(5000, 150000)
  const customer = pick(customers)
  return {
    id: nextId(),
    code: `COL-${String(i + 1).padStart(5, '0')}`,
    particulars: `Collection from ${customer}`,
    customer,
    date: date(Math.floor(Math.random() * 60)),
    credit: amt,
    debit: 0,
    amount: amt,
    route: pick(routes),
    status: pick(['completed', 'pending'] as RecordStatus[]),
    createdAt: new Date().toISOString(),
  }
}

function routeReportRecord(_slug: string, i: number) {
  const collections = amount(10000, 150000)
  const sales = amount(20000, 300000)
  const routeName = routes[i % routes.length]
  return {
    id: nextId(),
    code: `RTR-${String(i + 1).padStart(4, '0')}`,
    particulars: routeName,
    name: routeName,
    salesman: pick(salesmen),
    date: date(Math.floor(Math.random() * 30)),
    outlets: amount(8, 25),
    visited: amount(5, 20),
    collections,
    sales,
    debit: sales,
    credit: collections,
    status: pick(statuses.route),
    createdAt: new Date().toISOString(),
  }
}

function productReportRecord(_slug: string, i: number) {
  const stock = amount(50, 800)
  const unitPrice = amount(20, 500)
  const amt = unitPrice * stock
  const productName = products[i % products.length]
  return {
    id: nextId(),
    code: `PRD-${String(i + 1).padStart(5, '0')}`,
    name: productName,
    particulars: `${productName} — ${pick(categories)}`,
    category: pick(categories),
    brand: pick(brands),
    date: date(Math.floor(Math.random() * 90)),
    stock,
    quantity: stock,
    debit: amt,
    credit: 0,
    amount: amt,
    status: pick(statuses.inventory),
    createdAt: new Date().toISOString(),
  }
}

function outstandingReportRecord(_slug: string, i: number) {
  const outstanding = amount(10000, 200000)
  const customer = customers[i % customers.length]
  return {
    id: nextId(),
    code: `OUT-${String(i + 1).padStart(5, '0')}`,
    particulars: customer,
    customer,
    name: customer,
    date: date(Math.floor(Math.random() * 90)),
    debit: outstanding,
    credit: 0,
    outstanding,
    creditLimit: amount(50000, 300000),
    status: (outstanding > 150000 ? 'overdue' : 'pending') as RecordStatus,
    createdAt: new Date().toISOString(),
  }
}

function stockTransferRecord(slug: string, i: number) {
  const transferStatuses = ['pending', 'approved', 'in_transit', 'completed', 'cancelled'] as RecordStatus[]
  const st = pick(transferStatuses)
  const approvedStatuses: RecordStatus[] = ['approved', 'in_transit', 'completed']
  return {
    id: nextId(), code: `TRF-${String(i + 1).padStart(5, '0')}`,
    date: date(Math.floor(Math.random() * 60)),
    sourceWarehouse: pick(warehouses),
    destinationWarehouse: pick(warehouses),
    productCount: amount(1, 20),
    totalQuantity: amount(10, 500),
    requestedBy: pick(salesmen),
    approvedBy: approvedStatuses.includes(st) ? pick(salesmen) : '—',
    notes: pick(['Routine stock transfer', 'Emergency restocking', 'Branch replenishment', 'End-of-season transfer', 'Return to main warehouse']),
    status: st,
    createdAt: new Date().toISOString(),
  }
}

function lowStockRecord(slug: string, i: number) {
  const available = amount(0, 70)
  const reorderLevel = amount(80, 250)
  const st: RecordStatus = available === 0 ? 'overdue' : 'low_stock'
  return {
    id: nextId(), code: `PRD-${String(i + 1).padStart(5, '0')}`,
    name: products[i % products.length],
    category: pick(categories),
    brand: pick(brands),
    warehouse: pick(warehouses),
    stock: available,
    minStock: reorderLevel,
    status: st,
    createdAt: new Date().toISOString(),
  }
}

function expiryRecord(slug: string, i: number) {
  const scenarios: { daysFromNow: number; status: RecordStatus }[] = [
    { daysFromNow: -amount(1, 90), status: 'overdue' },   // already expired
    { daysFromNow: amount(1, 7), status: 'low_stock' },    // expiring ≤ 7 days
    { daysFromNow: amount(8, 30), status: 'pending' },     // expiring ≤ 30 days
    { daysFromNow: amount(31, 365), status: 'active' },    // safe
  ]
  const scenario = pick(scenarios)
  const daysRemaining = Math.max(0, scenario.daysFromNow)
  const view = i % 2 === 0 ? 'shop_owner' : 'admin_warehouse'
  return {
    id: nextId(), code: `PRD-${String(i + 1).padStart(5, '0')}`,
    name: products[i % products.length],
    batch: `B${amount(1000, 9999)}`,
    warehouse: pick(warehouses),
    shop: customers[i % customers.length],
    category: pick(categories),
    batchStockCount: amount(10, 500),
    batchDate: date(amount(90, 365)),
    expiry: date(-scenario.daysFromNow),
    daysRemaining,
    view,
    status: scenario.status,
    createdAt: new Date().toISOString(),
  }
}

function warehouseRecord(slug: string, i: number) {
  const warehouseNames = ['Main Warehouse', 'Cold Storage', 'Depot North', 'Depot South', 'Central Hub', 'Branch Store A', 'Branch Store B']
  const totalStock = amount(200, 2000)
  return {
    id: nextId(), code: `WH-${String(i + 1).padStart(3, '0')}`,
    name: warehouseNames[i % warehouseNames.length],
    manager: pick(salesmen),
    phone: `+91 ${amount(70000000, 99999999) + 9000000000}`,
    location: pick(['Pune', 'Mumbai', 'Nashik', 'Nagpur', 'Kolhapur']),
    stockRooms: amount(5, 30),
    stock: totalStock,
    amount: amount(50000, 2000000),
    capacity: amount(2000, 10000),
    status: 'active' as RecordStatus,
    createdAt: new Date().toISOString(),
  }
}

function notificationRecord(_slug: string, i: number) {
  const templates = [
    { title: 'New order received', message: 'Order #ORD-1257 from Metro Wholesale', type: 'info' },
    { title: 'Payment received', message: '₹45,200 from Shree Enterprises', type: 'success' },
    { title: 'Low stock alert', message: 'Premium Banana Chips below minimum level', type: 'warning' },
    { title: 'Route completed', message: 'Route R-12 completed by Rahul Sharma', type: 'info' },
    { title: 'Invoice overdue', message: '5 invoices past due date', type: 'error' },
    { title: 'Delivery dispatched', message: 'Dispatch DSP-1042 left warehouse for Kochi route', type: 'info' },
    { title: 'Collection recorded', message: '₹12,800 collected from Green Valley Store', type: 'success' },
    { title: 'Leave request', message: 'Anil Kumar requested 2 days casual leave', type: 'warning' },
    { title: 'Purchase approved', message: 'PO-8834 approved by warehouse manager', type: 'success' },
    { title: 'GPS offline', message: 'Driver Suresh Nair GPS signal lost for 15 min', type: 'error' },
  ]
  const tpl = templates[i % templates.length]
  const mins = amount(1, 180)
  const time = mins < 60 ? `${mins} min ago` : `${Math.floor(mins / 60)} hr ago`

  return {
    id: nextId(),
    code: `NTF-${String(i + 1).padStart(4, '0')}`,
    title: tpl.title,
    message: tpl.message,
    type: tpl.type,
    time,
    status: pick(['active', 'pending'] as RecordStatus[]),
    date: date(Math.floor(Math.random() * 7)),
    createdAt: new Date().toISOString(),
  }
}

function settingsRecord(slug: string, i: number) {
  return {
    id: nextId(), code: `CFG-${String(i + 1).padStart(3, '0')}`,
    name: pick(['Company Name', 'GST Number', 'Invoice Prefix', 'Tax Rate', 'Currency', 'Timezone']),
    value: pick(['RouteSale Pvt Ltd', '27AABCR1234F1Z5', 'INV-', '18%', 'INR', 'Asia/Kolkata']),
    category: pick(['General', 'Billing', 'Tax', 'System']), status: 'active' as RecordStatus,
    updatedBy: pick(salesmen), date: date(Math.floor(Math.random() * 30)),
    createdAt: new Date().toISOString(),
  }
}

function trackingRecord(slug: string, i: number) {
  return {
    id: nextId(), code: `GPS-${String(i + 1).padStart(4, '0')}`,
    salesman: pick(salesmen), route: pick(routes),
    latitude: (18.5 + Math.random() * 2).toFixed(6),
    longitude: (73.8 + Math.random() * 2).toFixed(6),
    speed: `${amount(0, 60)} km/h`, battery: `${amount(20, 100)}%`,
    lastUpdate: `${amount(1, 30)} min ago`, status: pick(['active', 'idle', 'offline'] as RecordStatus[]),
    outlet: pick(customers), visitStatus: pick(['checked_in', 'checked_out', 'en_route']),
    date: date(0), createdAt: new Date().toISOString(),
  }
}

const generatorMap: Record<string, (slug: string, i: number) => Record<string, unknown>> = {
  // Sales
  'sales-orders': salesOrder, 'sales-invoices': invoice, 'sales-sales-return': invoice,
  'sales-credit-notes': invoice, 'sales-quotations': salesOrder, 'sales-billing': invoice,
  'sales-route-sales': routeRecord, 'sales-sales-report': salesOrder,
  'sales-customer-ledger': ledgerRecord, 'sales-collection-report': collectionReportRecord,
  // Accounting
  'accounting-transactions': ledgerRecord, 'accounting-day-book': ledgerRecord,
  'accounting-cash-book': ledgerRecord, 'accounting-bank-book': ledgerRecord,
  'accounting-journal-entries': ledgerRecord, 'accounting-ledger': ledgerAccountRecord,
  'accounting-trial-balance': reportRecord, 'accounting-profit-loss': reportRecord,
  'accounting-balance-sheet': reportRecord, 'accounting-receipt-voucher': ledgerRecord,
  'accounting-payment-voucher': ledgerRecord, 'accounting-contra-voucher': ledgerRecord,
  'accounting-purchase-report': purchaseReportRecord, 'accounting-sales-report': salesOrder,
  'accounting-supplier-settlement': purchaseRecord, 'accounting-customer-settlement': customerRecord,
  'accounting-outstanding-report': outstandingReportRecord, 'accounting-gst-report': gstRecord,
  'accounting-tax-summary': reportRecord,
  // Purchase
  'purchase-purchase-orders': purchaseRecord, 'purchase-purchases': purchaseRecord,
  'purchase-supplier-management': supplierRecord, 'purchase-supplier-settlement': purchaseRecord,
  'purchase-purchase-return': purchaseReturnRecord, 'purchase-purchase-report': purchaseReportRecord,
  // Inventory
  'inventory-product-catalog': productRecord, 'inventory-categories': productRecord,
  'inventory-brands': productRecord, 'inventory-units': productRecord,
  'inventory-warehouse': productRecord, 'inventory-stock-allocation': productRecord,
  'inventory-stock-transfer': stockTransferRecord, 'inventory-stock-adjustment': productRecord,
  'inventory-stock-movement': productRecord, 'inventory-low-stock': lowStockRecord,
  'inventory-batch-management': productRecord, 'inventory-expiry-report': expiryRecord,
  // Stock Management (top-level module)
  'stock-management-current-stock': currentStockRecord,
  'stock-management-stock-adjustment': stockAdjustmentRecord,
  'stock-management-stock-transfer': stockTransferRecord,
  'stock-management-low-stock': lowStockRecord,
  'stock-management-batch-management': productRecord,
  'stock-management-expiry-report': expiryRecord,
  'stock-management-warehouse': warehouseRecord,
  // Route Sales
  'route-sales-dashboard': routeRecord, 'route-sales-route-assignment': routeRecord,
  'route-sales-todays-routes': routeRecord, 'route-sales-weekly-schedule': routeRecord,
  'route-sales-outlet-registration': customerRecord, 'route-sales-visit-history': routeRecord,
  'route-sales-route-tracking': trackingRecord, 'route-sales-route-performance': routePerformanceOrder,
  'route-sales-attendance': employeeRecord, 'route-sales-customer-visits': routeRecord,
  'route-sales-gps-tracking': trackingRecord, 'route-sales-collections': ledgerRecord,
  'route-sales-expenses': expenseRecord, 'route-sales-route-sales-report': routeReportRecord,
  // Customers
  'customers-customer-list': customerRecord, 'customers-customer-profile': customerRecord,
  'customers-outstanding': customerRecord, 'customers-credit-limit': customerRecord,
  'customers-customer-ledger': ledgerRecord, 'customers-visit-history': routeRecord,
  'customers-customer-location': trackingRecord,
  // HR
  'hr-employees': employeeRecord, 'hr-attendance': employeeRecord,
  'hr-payroll': payrollRecord, 'hr-incentives': incentiveRecord,
  'hr-sales-targets': salesTargetRecord, 'hr-performance': employeeRecord,
  'hr-leave-management': leaveRecord, 'hr-roles-permissions': employeeRecord,
  // Logistics
  'logistics-delivery-schedule': logisticsRecord, 'logistics-dispatch': logisticsRecord,
  'logistics-vehicle-management': vehicleRecord, 'logistics-driver-management': driverRecord,
  'logistics-live-tracking': trackingRecord, 'logistics-e-way-bills': ewayBillRecord,
  // Reports
  'reports-sales-report': salesOrder, 'reports-purchase-report': purchaseReportRecord,
  'reports-collection-report': collectionReportRecord, 'reports-expense-report': expenseRecord,
  'reports-route-report': routeReportRecord, 'reports-product-report': productReportRecord,
  'reports-employee-report': employeeRecord, 'reports-profit-loss': reportRecord,
  'reports-balance-sheet': reportRecord, 'reports-cash-flow': reportRecord,
  'reports-gst-report': gstRecord, 'reports-inventory-report': productReportRecord,
  // User Management
  'user-management-users': userRecord, 'user-management-roles': roleRecord,
  // Admin
  'admin-users': userRecord, 'admin-roles': roleRecord,
  'admin-permissions': settingsRecord, 'admin-notifications': notificationRecord,
  'admin-ai-assistant-logs': settingsRecord, 'admin-system-settings': settingsRecord,
  'admin-company-settings': settingsRecord, 'admin-backup-restore': settingsRecord,
  'admin-audit-logs': settingsRecord,
}

export function isReportSlug(slug: string) {
  return slug.includes('report')
    || slug.includes('profit-loss')
    || slug.includes('balance-sheet')
    || slug.includes('trial-balance')
    || slug.includes('tax-summary')
    || slug.includes('cash-flow')
}

export function generateModuleRecords(slug: string, count = 60): Record<string, unknown>[] {
  idSeq = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 1000)
  const gen = generatorMap[slug] ?? salesOrder
  const recordCount = isReportSlug(slug) ? Math.max(count, 75) : count
  return Array.from({ length: recordCount }, (_, i) => gen(slug, i))
}

export function generateDashboardStats() {
  return {
    todaySales: 245700,
    todayCollection: 185400,
    outstandingAmount: 125300,
    pendingOrders: 124,
    deliveredOrders: 46,
    pendingInvoices: 14,
    totalCustomers: 9781,
    totalEmployees: 86,
    totalProducts: 320,
    warehouseStock: 15680,
    todayExpenses: 42500,
    monthlyProfit: 875200,
    monthlySales: 1245709,
    revenueOverview: 1245709,
    orderSummary: 1892,
    collectionSummary: 28,
    activeRoutes: 24,
    employeesWorkingToday: 42,
  }
}
