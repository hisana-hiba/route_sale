import type { SvgIconComponent } from '@mui/icons-material'

export type RecordStatus =
  | 'active' | 'pending' | 'completed' | 'cancelled' | 'draft'
  | 'overdue' | 'low_stock' | 'in_transit' | 'delivered' | 'approved' | 'rejected'

export type LayoutType =
  | 'transaction' | 'report' | 'ledger' | 'inventory' | 'route'
  | 'hr' | 'customer' | 'logistics' | 'settings' | 'tracking'

export type ChartType = 'line' | 'bar' | 'area' | 'donut'

export type ModuleFeature =
  | 'reportTotals'
  | 'chartTypeSwitch'
  | 'routeOrderPerformance'
  | 'warehouseTransfer'
  | 'stockBatchAllocation'

export interface ColumnDef {
  field: string
  header: string
  type?: 'text' | 'currency' | 'number' | 'status' | 'date' | 'percent' | 'badge'
  width?: number
  flex?: number
}

export interface StatDef {
  key: string
  label: string
  format?: 'currency' | 'number' | 'percent'
  icon?: string
  color?: string
}

export interface FormFieldDef {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'image' | 'readonly'
  options?: { value: string; label: string }[]
  required?: boolean
  helperText?: string
}

export type DocumentedFlow =
  | 'new-order'
  | 'sales-return'
  | 'e-way-bill'
  | 'multi-assign-route'
  | 'live-route'
  | 'weekly-schedule'
  | 'register-outlet'
  | 'employee-directory'
  | 'attendance'
  | 'leave-registry'
  | 'payroll'
  | 'roles-access'
  | 'performance'
  | 'product-catalog'
  | 'stock-allocation'
  | 'stock-management'
  | 'theme-settings'

export interface ModuleConfig {
  slug: string
  title: string
  subtitle: string
  layout: LayoutType
  domain: string
  entityName: string
  columns: ColumnDef[]
  stats: StatDef[]
  formFields: FormFieldDef[]
  chartType?: ChartType
  chartTitle?: string
  showChart?: boolean
  accentColor?: string
  statuses?: RecordStatus[]
  features?: ModuleFeature[]
  sumFields?: string[]
  documentedFlow?: DocumentedFlow
}

export interface ChartData {
  categories: string[]
  series: { name: string; data: number[] }[]
}

export interface ModuleListResponse {
  data: Record<string, unknown>[]
  total: number
  page: number
  pageSize: number
  stats?: Record<string, number>
  chart?: ChartData
  totals?: Record<string, number>
}

export interface DashboardData {
  stats: Record<string, number>
  dailySales: ChartData
  monthlySales: ChartData
  salesVsCollection: ChartData
  productPerformance: ChartData
  routePerformance: ChartData
  expenseAnalysis: ChartData
  profitTrend: ChartData
  purchaseTrend: ChartData
  topSalesmen: { name: string; sales: number; target: number }[]
  bestSellingProducts: { name: string; quantity: number; revenue: number; growth?: number; image?: string }[]
  lowStockAlerts: { product: string; current: number; minimum: number }[]
  notifications: { id: string; title: string; message: string; type: string; time: string }[]
  recentOrders: { orderNo: string; customer: string; amount: number; status: string; date?: string; time?: string }[]
}

export interface Breadcrumb {
  label: string
  path?: string
}

export interface PageShellProps {
  config: ModuleConfig
  breadcrumbs: Breadcrumb[]
}
