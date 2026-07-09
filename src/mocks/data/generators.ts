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
  const rand = seededRandom(slug)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
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

function purchaseRecord(slug: string, i: number) {
  const amt = amount(10000, 500000)
  return {
    id: nextId(), code: `PO-${String(i + 1).padStart(5, '0')}`,
    supplier: pick(suppliers), date: date(Math.floor(Math.random() * 60)),
    amount: amt, items: amount(3, 25), status: pick(statuses.purchase),
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

function employeeRecord(slug: string, i: number) {
  const emp = employees[i % employees.length]
  return {
    id: nextId(), code: `EMP-${String(i + 1).padStart(4, '0')}`,
    name: emp.name, department: emp.dept, role: emp.role,
    phone: `+91 ${amount(7000000000, 9999999999)}`,
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
    creditLimit: limit, outstanding, available: limit - outstanding,
    lastVisit: date(Math.floor(Math.random() * 30)),
    totalPurchases: amount(50000, 2000000), status: outstanding > limit * 0.8 ? 'overdue' : 'active',
    visits: amount(1, 50), createdAt: new Date().toISOString(),
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

function logisticsRecord(slug: string, i: number) {
  return {
    id: nextId(), code: `DLV-${String(i + 1).padStart(5, '0')}`,
    vehicle: pick(vehicles), driver: pick(salesmen),
    route: pick(routes), customer: pick(customers),
    date: date(Math.floor(Math.random() * 14)), items: amount(1, 20),
    weight: `${amount(50, 500)} kg`, distance: `${amount(10, 120)} km`,
    status: pick(statuses.logistics), ewayBill: `EWB-${amount(100000, 999999)}`,
    amount: amount(5000, 150000), createdAt: new Date().toISOString(),
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
  'sales-customer-ledger': ledgerRecord, 'sales-collection-report': ledgerRecord,
  // Accounting
  'accounting-transactions': ledgerRecord, 'accounting-day-book': ledgerRecord,
  'accounting-cash-book': ledgerRecord, 'accounting-bank-book': ledgerRecord,
  'accounting-journal-entries': ledgerRecord, 'accounting-ledger': ledgerAccountRecord,
  'accounting-trial-balance': ledgerRecord, 'accounting-profit-loss': ledgerRecord,
  'accounting-balance-sheet': ledgerRecord, 'accounting-receipt-voucher': ledgerRecord,
  'accounting-payment-voucher': ledgerRecord, 'accounting-contra-voucher': ledgerRecord,
  'accounting-purchase-report': purchaseRecord, 'accounting-sales-report': salesOrder,
  'accounting-supplier-settlement': purchaseRecord, 'accounting-customer-settlement': customerRecord,
  'accounting-outstanding-report': customerRecord, 'accounting-gst-report': gstRecord,
  'accounting-tax-summary': gstRecord,
  // Purchase
  'purchase-purchase-orders': purchaseRecord, 'purchase-purchases': purchaseRecord,
  'purchase-supplier-management': purchaseRecord, 'purchase-supplier-settlement': purchaseRecord,
  'purchase-purchase-return': purchaseRecord, 'purchase-purchase-report': purchaseRecord,
  // Inventory
  'inventory-product-catalog': productRecord, 'inventory-categories': productRecord,
  'inventory-brands': productRecord, 'inventory-units': productRecord,
  'inventory-warehouse': productRecord, 'inventory-stock-allocation': productRecord,
  'inventory-stock-transfer': productRecord, 'inventory-stock-adjustment': productRecord,
  'inventory-stock-movement': productRecord, 'inventory-low-stock': productRecord,
  'inventory-batch-management': productRecord, 'inventory-expiry-report': productRecord,
  // Route Sales
  'route-sales-dashboard': routeRecord, 'route-sales-route-assignment': routeRecord,
  'route-sales-todays-routes': routeRecord, 'route-sales-weekly-schedule': routeRecord,
  'route-sales-outlet-registration': customerRecord, 'route-sales-visit-history': routeRecord,
  'route-sales-route-tracking': trackingRecord, 'route-sales-route-performance': routePerformanceOrder,
  'route-sales-attendance': employeeRecord, 'route-sales-customer-visits': routeRecord,
  'route-sales-gps-tracking': trackingRecord, 'route-sales-collections': ledgerRecord,
  'route-sales-expenses': expenseRecord, 'route-sales-route-sales-report': routeRecord,
  // Customers
  'customers-customer-list': customerRecord, 'customers-customer-profile': customerRecord,
  'customers-outstanding': customerRecord, 'customers-credit-limit': customerRecord,
  'customers-customer-ledger': ledgerRecord, 'customers-visit-history': routeRecord,
  'customers-customer-location': trackingRecord,
  // HR
  'hr-employees': employeeRecord, 'hr-attendance': employeeRecord,
  'hr-payroll': employeeRecord, 'hr-incentives': employeeRecord,
  'hr-sales-targets': employeeRecord, 'hr-performance': employeeRecord,
  'hr-leave-management': employeeRecord, 'hr-roles-permissions': employeeRecord,
  // Logistics
  'logistics-delivery-schedule': logisticsRecord, 'logistics-dispatch': logisticsRecord,
  'logistics-vehicle-management': logisticsRecord, 'logistics-driver-management': employeeRecord,
  'logistics-live-tracking': trackingRecord, 'logistics-e-way-bills': logisticsRecord,
  // Reports
  'reports-sales-report': salesOrder, 'reports-purchase-report': purchaseRecord,
  'reports-collection-report': ledgerRecord, 'reports-expense-report': ledgerRecord,
  'reports-route-report': routeRecord, 'reports-product-report': productRecord,
  'reports-employee-report': employeeRecord, 'reports-profit-loss': ledgerRecord,
  'reports-balance-sheet': ledgerRecord, 'reports-cash-flow': ledgerRecord,
  'reports-gst-report': gstRecord, 'reports-inventory-report': productRecord,
  // Admin
  'admin-users': employeeRecord, 'admin-roles': employeeRecord,
  'admin-permissions': settingsRecord, 'admin-notifications': settingsRecord,
  'admin-ai-assistant-logs': settingsRecord, 'admin-system-settings': settingsRecord,
  'admin-company-settings': settingsRecord, 'admin-backup-restore': settingsRecord,
  'admin-audit-logs': settingsRecord,
}

export function generateModuleRecords(slug: string, count = 60): Record<string, unknown>[] {
  idSeq = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 1000)
  const gen = generatorMap[slug] ?? salesOrder
  return Array.from({ length: count }, (_, i) => gen(slug, i))
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
