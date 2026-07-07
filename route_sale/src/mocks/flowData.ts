/** Seed data aligned with Route Sales Complete Flow Documentation */

export const demoAccounts = [
  { mobile: '9876543210', password: 'password123', role: 'salesman' as const, name: 'Rahul Sharma' },
  { mobile: '9876543211', password: 'password123', role: 'deliveryAgent' as const, name: 'Amit Delivery' },
  { mobile: '9876543212', password: 'password123', role: 'manager' as const, name: 'Priya Manager' },
  { mobile: '9876543213', password: 'admin123', role: 'admin' as const, name: 'Admin User' },
]

export const shops = [
  { id: 'shop-1', name: 'Shree Enterprises', owner: 'Rajesh Kumar', category: 'Wholesale', mobile: '9811000001' },
  { id: 'shop-2', name: 'Metro Wholesale', owner: 'Suresh Patel', category: 'Retail', mobile: '9811000002' },
  { id: 'shop-3', name: 'Green Valley Store', owner: 'Anita Devi', category: 'Grocery', mobile: '9811000003' },
  { id: 'shop-4', name: 'City Mart', owner: 'Vikram Singh', category: 'Supermarket', mobile: '9811000004' },
]

export const products = [
  { id: 'p1', name: 'Premium Basmati Rice 10kg', category: 'Rice', price: 850, gstRate: 5, hsn: '1006', unit: 'pkt', stockQty: 240 },
  { id: 'p2', name: 'Sunflower Oil 5L', category: 'Oil', price: 620, gstRate: 5, hsn: '1512', unit: 'can', stockQty: 180 },
  { id: 'p3', name: 'Mineral Water 1L Case', category: 'Beverages', price: 120, gstRate: 12, hsn: '2201', unit: 'case', stockQty: 320 },
  { id: 'p4', name: 'Potato Chips 50g Pack', category: 'Snacks', price: 20, gstRate: 12, hsn: '1905', unit: 'pkt', stockQty: 500 },
]

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
