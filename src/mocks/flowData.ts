/** Seed data aligned with Route Sales Complete Flow Documentation */

export const demoAccounts = [
  { mobile: '9876543210', password: 'password123', role: 'salesman' as const, name: 'Rahul Sharma' },
  { mobile: '9876543211', password: 'password123', role: 'deliveryAgent' as const, name: 'Amit Delivery' },
  { mobile: '9876543212', password: 'password123', role: 'manager' as const, name: 'Priya Manager' },
  { mobile: '9876543213', password: 'admin123', role: 'admin' as const, name: 'Admin User' },
]

export const shops = [
  {
    id: 'shop-1', name: 'Shree Enterprises', owner: 'Rajesh Kumar', category: 'Wholesale',
    mobile: '9811000001', address: '12 Market Road, Pune', gstin: '27AABCU9603R1ZM',
    creditLimit: 250000, outstanding: 185000, taxNumber: '27AABCU9603R1ZM',
    purchaseHistory: [
      { invoice: 'INV-260701', date: '2026-07-01', amount: 42000 },
      { invoice: 'INV-260615', date: '2026-06-15', amount: 38500 },
      { invoice: 'INV-260528', date: '2026-05-28', amount: 51200 },
    ],
    pendingInvoices: [
      { id: 'inv-s1-1', code: 'INV-260701', date: '2026-07-01', amount: 42000, paid: 12000, balance: 30000 },
      { id: 'inv-s1-2', code: 'INV-260615', date: '2026-06-15', amount: 38500, paid: 8500, balance: 30000 },
      { id: 'inv-s1-3', code: 'INV-260528', date: '2026-05-28', amount: 51200, paid: 0, balance: 51200 },
      { id: 'inv-s1-4', code: 'INV-260480', date: '2026-04-28', amount: 28000, paid: 5000, balance: 23000 },
    ],
    frequentProductIds: ['p1', 'p2', 'p4'],
  },
  {
    id: 'shop-2', name: 'Metro Wholesale', owner: 'Suresh Patel', category: 'Retail',
    mobile: '9811000002', address: '88 Ring Road, Mumbai', gstin: '27AADCM1234P1Z5',
    creditLimit: 150000, outstanding: 42000, taxNumber: '27AADCM1234P1Z5',
    purchaseHistory: [
      { invoice: 'INV-260710', date: '2026-07-10', amount: 18500 },
      { invoice: 'INV-260620', date: '2026-06-20', amount: 22000 },
    ],
    pendingInvoices: [
      { id: 'inv-s2-1', code: 'INV-260710', date: '2026-07-10', amount: 18500, paid: 0, balance: 18500 },
      { id: 'inv-s2-2', code: 'INV-260620', date: '2026-06-20', amount: 22000, paid: 5000, balance: 17000 },
      { id: 'inv-s2-3', code: 'INV-260510', date: '2026-05-10', amount: 15000, paid: 8500, balance: 6500 },
    ],
    frequentProductIds: ['p3', 'p4'],
  },
  {
    id: 'shop-3', name: 'Green Valley Store', owner: 'Anita Devi', category: 'Grocery',
    mobile: '9811000003', address: '5 Green Lane, Nashik', gstin: '27AAECG7788Q1Z2',
    creditLimit: 80000, outstanding: 76000, taxNumber: '27AAECG7788Q1Z2',
    purchaseHistory: [
      { invoice: 'INV-260705', date: '2026-07-05', amount: 9800 },
    ],
    pendingInvoices: [
      { id: 'inv-s3-1', code: 'INV-260705', date: '2026-07-05', amount: 9800, paid: 0, balance: 9800 },
      { id: 'inv-s3-2', code: 'INV-260612', date: '2026-06-12', amount: 24500, paid: 4500, balance: 20000 },
      { id: 'inv-s3-3', code: 'INV-260501', date: '2026-05-01', amount: 32000, paid: 0, balance: 32000 },
    ],
    frequentProductIds: ['p1', 'p3'],
  },
  {
    id: 'shop-4', name: 'City Mart', owner: 'Vikram Singh', category: 'Supermarket',
    mobile: '9811000004', address: '101 Main Street, Nagpur', gstin: '27AACCITY99R1Z8',
    creditLimit: 300000, outstanding: 95000, taxNumber: '27AACCITY99R1Z8',
    purchaseHistory: [
      { invoice: 'INV-260712', date: '2026-07-12', amount: 67000 },
      { invoice: 'INV-260630', date: '2026-06-30', amount: 54000 },
      { invoice: 'INV-260601', date: '2026-06-01', amount: 71000 },
    ],
    pendingInvoices: [
      { id: 'inv-s4-1', code: 'INV-260712', date: '2026-07-12', amount: 67000, paid: 20000, balance: 47000 },
      { id: 'inv-s4-2', code: 'INV-260630', date: '2026-06-30', amount: 54000, paid: 14000, balance: 40000 },
      { id: 'inv-s4-3', code: 'INV-260601', date: '2026-06-01', amount: 71000, paid: 63000, balance: 8000 },
    ],
    frequentProductIds: ['p1', 'p2', 'p3', 'p4'],
  },
]

export const products = [
  {
    id: 'p1', name: 'Premium Basmati Rice 10kg', category: 'Rice', price: 850, gstRate: 5,
    hsn: '1006', unit: 'pkt', stockQty: 240, barcode: '8901001001001', mrp: 950, mop: 880, batch: 'B-RIC-0626',
  },
  {
    id: 'p2', name: 'Sunflower Oil 5L', category: 'Oil', price: 620, gstRate: 5,
    hsn: '1512', unit: 'can', stockQty: 180, barcode: '8901002002002', mrp: 699, mop: 640, batch: 'B-OIL-0526',
  },
  {
    id: 'p3', name: 'Mineral Water 1L Case', category: 'Beverages', price: 120, gstRate: 12,
    hsn: '2201', unit: 'case', stockQty: 320, barcode: '8901003003003', mrp: 144, mop: 125, batch: 'B-WAT-0726',
  },
  {
    id: 'p4', name: 'Potato Chips 50g Pack', category: 'Snacks', price: 20, gstRate: 12,
    hsn: '1905', unit: 'pkt', stockQty: 500, barcode: '8901004004004', mrp: 25, mop: 22, batch: 'B-SNP-0426',
  },
  {
    id: 'p5', name: 'Toor Dal 1kg', category: 'Pulses', price: 145, gstRate: 5,
    hsn: '0713', unit: 'pkt', stockQty: 210, barcode: '8901005005005', mrp: 165, mop: 150, batch: 'B-DAL-0626',
  },
  {
    id: 'p6', name: 'Wheat Flour 5kg', category: 'Flour', price: 280, gstRate: 5,
    hsn: '1101', unit: 'pkt', stockQty: 95, barcode: '8901006006006', mrp: 320, mop: 290, batch: 'B-FLR-0526',
  },
]

/** Active promotional schemes applied during sales entry */
export const salesSchemes = [
  {
    id: 'sch-1', name: 'Festival Flat 5%', type: 'invoice_percent' as const, value: 5,
    minInvoice: 5000, active: true,
  },
  {
    id: 'sch-2', name: 'Rice Bundle — ₹50 off', type: 'product_flat' as const, value: 50,
    productId: 'p1', minQty: 5, active: true,
  },
  {
    id: 'sch-3', name: 'Snacks Buy 10 Get 1%', type: 'product_percent' as const, value: 1,
    productId: 'p4', minQty: 10, active: true,
  },
]

export const recommendedProductIds = ['p5', 'p6', 'p2']

export const staff = [
  { id: 'u1', name: 'Rahul Sharma', role: 'salesman' },
  { id: 'u2', name: 'Amit Delivery', role: 'deliveryAgent' },
  { id: 'u3', name: 'Sneha Reddy', role: 'salesman' },
  { id: 'u4', name: 'Vikram Singh', role: 'deliveryAgent' },
]

export const appModules = [
  'dashboard', 'attendance', 'tracking', 'payroll', 'incentive', 'orders', 'invoices',
  'returns', 'route', 'routeMap', 'products', 'manageRoutes', 'stockAllocation',
  'manageStock', 'payments', 'manageRoles', 'purchases', 'billing',
]

export const defaultPermissions: Record<string, string[]> = {
  salesman: ['dashboard', 'attendance', 'tracking', 'orders', 'invoices', 'returns', 'route', 'routeMap', 'products'],
  deliveryAgent: ['dashboard', 'attendance', 'tracking', 'route', 'routeMap', 'stockAllocation'],
  manager: ['dashboard', 'orders', 'invoices', 'returns', 'route', 'routeMap', 'products', 'manageRoutes', 'stockAllocation', 'purchases', 'billing'],
  admin: [...appModules],
  shopOwner: ['dashboard', 'orders', 'invoices', 'payments'],
}

export const leaveTypes = ['Casual', 'Sick', 'Earned', 'Unpaid']

export const returnReasons = ['Unsold', 'Damaged', 'Expired', 'Wrong Product', 'Quality Issue', 'Customer Request']

export const returnConditions = ['Good', 'Damaged', 'Expired', 'Opened']
