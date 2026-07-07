import type { SvgIconComponent } from '@mui/icons-material'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import RouteIcon from '@mui/icons-material/Route'
import InventoryIcon from '@mui/icons-material/Inventory'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn'

export interface QuickAction {
  id: string
  label: string
  icon: SvgIconComponent
  path: string
  openCreate?: boolean
}

/** Dashboard quick actions — all except New Purchase (moved to sidebar) */
export const dashboardQuickActions: QuickAction[] = [
  { id: 'order', label: 'Create Order', icon: AddShoppingCartIcon, path: '/sales/orders/new' },
  { id: 'return', label: 'Create Return', icon: AssignmentReturnIcon, path: '/sales/sales-return/new' },
  { id: 'invoice', label: 'Create Invoice', icon: ReceiptLongIcon, path: '/sales/invoices', openCreate: true },
  { id: 'customer', label: 'Add Customer', icon: PersonAddIcon, path: '/customers/customer-list', openCreate: true },
  { id: 'route', label: 'Allocate Route', icon: RouteIcon, path: '/route-sales/route-assignment' },
  { id: 'stock', label: 'Assign Stock', icon: InventoryIcon, path: '/inventory/stock-allocation' },
]

/** Single action moved from dashboard to sidebar */
export const sidebarQuickAction: QuickAction = {
  id: 'purchase',
  label: 'New Purchase',
  icon: ShoppingBagIcon,
  path: '/purchase/purchase-orders',
  openCreate: true,
}
