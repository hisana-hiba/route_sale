import type { SvgIconComponent } from '@mui/icons-material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import InventoryIcon from '@mui/icons-material/Inventory'
import RouteIcon from '@mui/icons-material/Route'
import PeopleIcon from '@mui/icons-material/People'
import SettingsIcon from '@mui/icons-material/Settings'
import AssessmentIcon from '@mui/icons-material/Assessment'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle'
import StorageIcon from '@mui/icons-material/Storage'

export interface NavItem {
  id: string
  label: string
  path?: string
  icon?: SvgIconComponent
  children?: NavItem[]
}

/** Sidebar structure aligned with the Route Sales mockup UI */
export const navigation: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: DashboardIcon,
  },
  {
    id: 'sales-ops',
    label: 'Sales & Operations',
    icon: ShoppingCartIcon,
    children: [
      { id: 'customers', label: 'Customers', path: '/customers/customer-list' },
      { id: 'orders', label: 'Orders', path: '/sales/orders' },
      { id: 'sales-list', label: 'Sales List', path: '/sales/list' },
      { id: 'sales-entry', label: 'Sales Entry', path: '/sales/entry' },
      { id: 'sales-return', label: 'Sales Return', path: '/sales/sales-return' },
      { id: 'sale-price-entry', label: 'Sale Price Entry', path: '/sales/sale-price-entry' },
      { id: 'collections', label: 'Collections', path: '/route-sales/collections' },
      { id: 'quotations', label: 'Quotations', path: '/sales/quotations' },
      //{ id: 'credit-notes', label: 'Credit Notes', path: '/sales/credit-notes' },
      //{ id: 'sales-report', label: 'Sales Report', path: '/sales/sales-report' },
    ],
  },
  {
    id: 'route-mgmt',
    label: 'Route Management',
    icon: RouteIcon,
    children: [
      { id: 'rs-dashboard', label: 'Dashboard', path: '/route-sales/dashboard' },
      { id: 'route-assignment', label: 'Route Assignment', path: '/route-sales/route-assignment' },
      { id: 'todays-routes', label: "Today's Routes", path: '/route-sales/todays-routes' },
      { id: 'weekly-schedule', label: 'Weekly Schedule', path: '/route-sales/weekly-schedule' },
      { id: 'outlet-registration', label: 'Outlet Registration', path: '/route-sales/outlet-registration' },
      //{ id: 'visit-history', label: 'Visit History', path: '/route-sales/visit-history' },
      { id: 'route-tracking', label: 'Route Tracking', path: '/route-sales/route-tracking' },
      //{ id: 'gps-tracking', label: 'GPS Tracking', path: '/route-sales/gps-tracking' },
      { id: 'route-performance', label: 'Route Performance', path: '/route-sales/route-performance' },
      { id: 'expenses', label: 'Expenses', path: '/route-sales/expenses' },
    ],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    icon: AccountBalanceIcon,
    children: [
      { id: 'transactions', label: 'Transactions', path: '/accounting/transactions' },
      { id: 'day-book', label: 'Day Book', path: '/accounting/day-book' },
      { id: 'cash-book', label: 'Cash Book', path: '/accounting/cash-book' },
      { id: 'bank-book', label: 'Bank Book', path: '/accounting/bank-book' },
      { id: 'journal-entries', label: 'Journal Entries', path: '/accounting/journal-entries' },
      { id: 'ledger', label: 'Ledger', path: '/accounting/ledger' },
      { id: 'trial-balance', label: 'Trial Balance', path: '/accounting/trial-balance' },
      { id: 'profit-loss', label: 'Profit & Loss', path: '/accounting/profit-loss' },
      { id: 'balance-sheet', label: 'Balance Sheet', path: '/accounting/balance-sheet' },
      { id: 'receipt-voucher', label: 'Receipt Voucher', path: '/accounting/receipt-voucher' },
      { id: 'payment-voucher', label: 'Payment Voucher', path: '/accounting/payment-voucher' },
      { id: 'gst-report', label: 'GST Report', path: '/accounting/gst-report' },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: InventoryIcon,
    children: [
      { id: 'products', label: 'Products', path: '/inventory/product-catalog' },
      { id: 'categories', label: 'Categories', path: '/inventory/categories' },
      { id: 'brands', label: 'Brands', path: '/inventory/brands' },
    ],
  },
  {
    id: 'stock-management',
    label: 'Stock Management',
    icon: StorageIcon,
    children: [
      { id: 'sm-current-stock', label: 'Current Stock', path: '/stock-management/current-stock' },
      { id: 'sm-stock-transfer', label: 'Stock Transfer', path: '/stock-management/stock-transfer' },
      { id: 'sm-stock-adjustment', label: 'Stock Adjustment', path: '/stock-management/stock-adjustment' },
      { id: 'sm-low-stock', label: 'Low Stock', path: '/stock-management/low-stock' },
      { id: 'sm-batch-management', label: 'Batch Management', path: '/stock-management/batch-management' },
      { id: 'sm-expiry-report', label: 'Expiry Report', path: '/stock-management/expiry-report' },
      { id: 'sm-warehouse', label: 'Warehouse', path: '/stock-management/warehouse' },
    ],
  },
  {
    id: 'purchase',
    label: 'Purchase',
    icon: LocalShippingIcon,
    children: [
      { id: 'purchase-orders', label: 'Purchase Orders', path: '/purchase/purchase-orders' },
      { id: 'purchases', label: 'Purchases', path: '/purchase/purchases' },
      { id: 'suppliers', label: 'Suppliers', path: '/purchase/supplier-management' },
      { id: 'purchase-return', label: 'Purchase Return', path: '/purchase/purchase-return' },
    ],
  },
  {
    id: 'logistics',
    label: 'Logistics',
    icon: AirportShuttleIcon,
    children: [
      { id: 'delivery-schedule', label: 'Delivery Schedule', path: '/logistics/delivery-schedule' },
      { id: 'dispatch', label: 'Dispatch', path: '/logistics/dispatch' },
      { id: 'vehicles', label: 'Vehicles', path: '/logistics/vehicle-management' },
      { id: 'drivers', label: 'Drivers', path: '/logistics/driver-management' },
      { id: 'live-tracking', label: 'Live Tracking', path: '/logistics/live-tracking' },
      { id: 'e-way-bills', label: 'E-Way Bills (EWB)', path: '/logistics/e-way-bills' },
    ],
  },
  {
    id: 'hr',
    label: 'HR & Payroll',
    icon: PeopleIcon,
    children: [
      { id: 'employees', label: 'Employees', path: '/hr/employees' },
      { id: 'attendance', label: 'Attendance', path: '/hr/attendance' },
      { id: 'payroll', label: 'Payroll', path: '/hr/payroll' },
      { id: 'incentives', label: 'Incentives', path: '/hr/incentives' },
      { id: 'leave-management', label: 'Leave Management', path: '/hr/leave-management' },
      { id: 'sales-targets', label: 'Sales Targets', path: '/hr/sales-targets' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: AssessmentIcon,
    children: [
      { id: 'rep-sales', label: 'Sales Report', path: '/reports/sales-report' },
      { id: 'rep-collection', label: 'Collection Report', path: '/reports/collection-report' },
      { id: 'rep-route', label: 'Route Report', path: '/reports/route-report' },
      { id: 'rep-inventory', label: 'Inventory Report', path: '/reports/inventory-report' },
      { id: 'rep-profit-loss', label: 'Profit & Loss', path: '/reports/profit-loss' },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: SettingsIcon,
    children: [
      { id: 'system-settings', label: 'Settings', path: '/admin/system-settings' },
      { id: 'users', label: 'Users & Roles', path: '/admin/users' },
      { id: 'permissions', label: 'Permissions', path: '/admin/permissions' },
      { id: 'notifications', label: 'Notifications', path: '/admin/notifications' },
      { id: 'company-settings', label: 'Company Settings', path: '/admin/company-settings' },
      { id: 'ewb', label: 'E-Way Bills (EWB)', path: '/logistics/e-way-bills' },
      { id: 'audit-logs', label: 'Audit Logs', path: '/admin/audit-logs' },
    ],
  },
]

export function flattenNav(items: NavItem[] = navigation): NavItem[] {
  return items.flatMap((item) =>
    item.path ? [item] : item.children ? flattenNav(item.children) : [],
  )
}

export function findNavByPath(path: string): NavItem | undefined {
  return flattenNav().find((item) => item.path === path)
}

/** All routes for router — deduped, includes pages not in condensed sidebar */
const _allPaths = flattenNav([
  ...navigation,
  {
    id: 'extra',
    label: 'More',
    children: [
      { id: 'logistics', label: 'Logistics', path: '/logistics/delivery-schedule' },
      { id: 'cust-profile', label: 'Customer Profile', path: '/customers/customer-profile' },
      { id: 'outstanding', label: 'Outstanding', path: '/customers/outstanding' },
      { id: 'credit-limit', label: 'Credit Limit', path: '/customers/credit-limit' },
      { id: 'route-sales', label: 'Route Sales', path: '/sales/route-sales' },
      { id: 'customer-ledger', label: 'Customer Ledger', path: '/sales/customer-ledger' },
      { id: 'collection-report', label: 'Collection Report', path: '/sales/collection-report' },
      { id: 'billing', label: 'Billing', path: '/sales/billing' },
      { id: 'invoices-legacy', label: 'Invoices', path: '/sales/invoices' },
      { id: 'contra-voucher', label: 'Contra Voucher', path: '/accounting/contra-voucher' },
      { id: 'acc-purchase-report', label: 'Purchase Report', path: '/accounting/purchase-report' },
      { id: 'acc-sales-report', label: 'Sales Report', path: '/accounting/sales-report' },
      { id: 'supplier-settlement', label: 'Supplier Settlement', path: '/accounting/supplier-settlement' },
      { id: 'customer-settlement', label: 'Customer Settlement', path: '/accounting/customer-settlement' },
      { id: 'outstanding-report', label: 'Outstanding Report', path: '/accounting/outstanding-report' },
      { id: 'tax-summary', label: 'Tax Summary', path: '/accounting/tax-summary' },
      { id: 'units', label: 'Units', path: '/inventory/units' },
      { id: 'stock-allocation', label: 'Stock Allocation', path: '/inventory/stock-allocation' },
      { id: 'stock-adjustment', label: 'Stock Adjustment', path: '/inventory/stock-adjustment' },
      { id: 'stock-movement', label: 'Stock Movement', path: '/inventory/stock-movement' },
      { id: 'inv-warehouse', label: 'Warehouses', path: '/inventory/warehouse' },
      { id: 'inv-stock-transfer', label: 'Stock Transfer (Legacy)', path: '/inventory/stock-transfer' },
      { id: 'inv-low-stock', label: 'Low Stock (Legacy)', path: '/inventory/low-stock' },
      { id: 'inv-batch-management', label: 'Batch Management (Legacy)', path: '/inventory/batch-management' },
      { id: 'inv-expiry-report', label: 'Expiry Report (Legacy)', path: '/inventory/expiry-report' },
      { id: 'pur-settlement', label: 'Supplier Settlement', path: '/purchase/supplier-settlement' },
      { id: 'pur-report', label: 'Purchase Report', path: '/purchase/purchase-report' },
      { id: 'rs-attendance', label: 'Attendance', path: '/route-sales/attendance' },
      { id: 'rs-visits', label: 'Customer Visits', path: '/route-sales/customer-visits' },
      { id: 'rs-report', label: 'Route Sales Report', path: '/route-sales/route-sales-report' },
      { id: 'cust-ledger', label: 'Customer Ledger', path: '/customers/customer-ledger' },
      { id: 'cust-visits', label: 'Visit History', path: '/customers/visit-history' },
      { id: 'cust-location', label: 'Customer Location', path: '/customers/customer-location' },
      { id: 'hr-performance', label: 'Performance', path: '/hr/performance' },
      { id: 'hr-roles', label: 'Roles & Permissions', path: '/hr/roles-permissions' },
      { id: 'log-dispatch', label: 'Dispatch', path: '/logistics/dispatch' },
      { id: 'log-vehicles', label: 'Vehicles', path: '/logistics/vehicle-management' },
      { id: 'log-drivers', label: 'Drivers', path: '/logistics/driver-management' },
      { id: 'log-tracking', label: 'Live Tracking', path: '/logistics/live-tracking' },
      { id: 'log-eway', label: 'E-Way Bills', path: '/logistics/e-way-bills' },
      { id: 'rep-purchase', label: 'Purchase Report', path: '/reports/purchase-report' },
      { id: 'rep-expense', label: 'Expense Report', path: '/reports/expense-report' },
      { id: 'rep-product', label: 'Product Report', path: '/reports/product-report' },
      { id: 'rep-employee', label: 'Employee Report', path: '/reports/employee-report' },
      { id: 'rep-balance', label: 'Balance Sheet', path: '/reports/balance-sheet' },
      { id: 'rep-cashflow', label: 'Cash Flow', path: '/reports/cash-flow' },
      { id: 'rep-gst', label: 'GST Report', path: '/reports/gst-report' },
      { id: 'admin-roles', label: 'Roles', path: '/admin/roles' },
      { id: 'admin-ai', label: 'AI Assistant Logs', path: '/admin/ai-assistant-logs' },
      { id: 'admin-backup', label: 'Backup & Restore', path: '/admin/backup-restore' },
    ],
  },
])

export const allRoutes: NavItem[] = Array.from(
  new Map(_allPaths.filter((r) => r.path).map((r) => [r.path!, r])).values(),
)
