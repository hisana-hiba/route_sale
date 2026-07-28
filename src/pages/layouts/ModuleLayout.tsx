import { useMemo, useCallback, useState, useEffect } from 'react'
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, TablePagination, IconButton, Tooltip, Grid,
  LinearProgress,
} from '@mui/material'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, ICellRendererParams } from 'ag-grid-community'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AssessmentIcon from '@mui/icons-material/Assessment'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { DashboardKpiCard } from '@/components/dashboard/DashboardKpiCard'
import { OverviewColumnChart } from '@/components/dashboard/OverviewColumnChart'
import { OrderRecordCards } from '@/components/orders/OrderRecordCards'
import { FilterBar } from '@/components/ui/FilterBar'
import { DataPanel } from '@/components/ui/DataPanel'
import { StatusChip } from '@/components/ui/StatusChip'
import { ApexChart } from '@/components/charts/ApexChart'
import { ReportTotalsBar } from '@/components/module/ReportTotalsBar'
import { ChartTypeSelector } from '@/components/module/ChartTypeSelector'
import { RouteOrderPerformance } from '@/components/module/RouteOrderPerformance'
import { WarehouseTransferPanel } from '@/components/module/WarehouseTransferPanel'
import { WarehouseStockTabs } from '@/components/module/WarehouseStockTabs'
import { FormFieldRenderer } from '@/components/module/FormFieldRenderer'
import { DocumentedFlowPanel } from '@/components/flows/DocumentedFlowPanel'
import { SalesTabs } from '@/components/sales/SalesTabs'
import { useModuleData, formatStatValue } from '@/hooks/useModuleData'
import { exportToExcel, exportToPdf, printTable, formatCurrency } from '@/utils/export'
import type { ModuleConfig, ColumnDef, ChartType, ChartData } from '@/types/module'
import { v, mix } from '@/theme/cssVars'
import { useAppStore } from '@/store/appStore'
import { dashboardGridSpacing } from '@/components/ui/cardStyles'

interface ModuleLayoutProps {
  config: ModuleConfig
}

function cellValue(row: Record<string, unknown>, col: ColumnDef) {
  const v = row[col.field]
  if (col.type === 'currency') return formatCurrency(Number(v) || 0)
  if (col.type === 'percent') return `${v ?? 0}%`
  if (col.type === 'status') return null
  return v ?? '—'
}

export function ModuleLayout({ config }: ModuleLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const themeMode = useAppStore((s) => s.themeMode)
  const themeVersion = useAppStore((s) => s.themeVersion)

  const isOrdersPage = config.slug === 'sales-orders'
  const isSalesReturnPage = config.slug === 'sales-sales-return'
  const isCollectionsPage = config.slug === 'route-sales-collections'
  const isExpensesPage = config.slug === 'route-sales-expenses'
  const isBatchManagementPage =
    config.slug === 'stock-management-batch-management' ||
    config.slug === 'inventory-batch-management'
  const isPurchasesPage = config.slug === 'purchase-purchases'
  const isSuppliersPage = config.slug === 'purchase-supplier-management'
  const isDriversPage = config.slug === 'logistics-driver-management'
  const isPayrollPage = config.slug === 'hr-payroll'
  const isProductCatalogPage = config.slug === 'inventory-product-catalog'
  const isCategoriesPage = config.slug === 'inventory-categories'
  const isBrandsPage = config.slug === 'inventory-brands'
  const isSimpleCatalogListPage = isCategoriesPage || isBrandsPage
  const isWarehousePage =
    config.slug === 'stock-management-warehouse' ||
    config.slug === 'inventory-warehouse'

  const PAYROLL_MONTH_OPTIONS = [
    'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026',
    'Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026',
  ]
  const [payrollMonthFilter, setPayrollMonthFilter] = useState('')

  const payrollExtraParams = useMemo(
    () => (isPayrollPage && payrollMonthFilter ? { payrollMonth: payrollMonthFilter } : undefined),
    [isPayrollPage, payrollMonthFilter],
  )

  const {
    data, isLoading, isFetching, refetch,
    page, setPage, pageSize, setPageSize,
    search, setSearch, statusFilter, setStatusFilter,
    dateFrom, setDateFrom, dateTo, setDateTo,
    createMutation, updateMutation, deleteMutation,
  } = useModuleData(config, undefined, payrollExtraParams)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const [chartType, setChartType] = useState<ChartType>(config.chartType ?? 'bar')

  const { control, handleSubmit, reset, setValue } = useForm({ defaultValues: {} as Record<string, string> })

  useEffect(() => {
    if ((location.state as { openCreate?: boolean })?.openCreate) {
      openCreateDialog()
      navigate(location.pathname, { replace: true, state: {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  const openCreateDialog = () => {
    if (config.documentedFlow === 'new-order') {
      navigate('/sales/orders/new')
      return
    }
    if (config.documentedFlow === 'sales-return') {
      navigate('/sales/sales-return/new')
      return
    }
    if (config.documentedFlow === 'stock-transfer') {
      navigate('/stock-management/stock-transfer/new')
      return
    }
    if (config.documentedFlow === 'purchase-order') {
      navigate('/purchase/purchase-orders/new')
      return
    }
    if (config.documentedFlow === 'add-collection') {
      navigate('/route-sales/collections/new')
      return
    }
    if (config.documentedFlow === 'add-expense') {
      navigate('/route-sales/expenses/new')
      return
    }
    if (config.documentedFlow === 'add-vehicle-log') {
      navigate('/logistics/vehicle-log/new')
      return
    }
    if (config.documentedFlow === 'add-quotation') {
      navigate('/sales/quotations/new')
      return
    }
    setIsEdit(false); setSelected(null)
    const defaults: Record<string, string> = {}
    config.formFields.forEach((f) => {
      if (f.type === 'date') defaults[f.name] = new Date().toISOString().split('T')[0]
      else if (f.name === 'batch') defaults[f.name] = 'B1001'
      else if (f.name === 'batchStockCount') defaults[f.name] = '240'
      else if (f.name === 'batchDate') defaults[f.name] = '2025-03-15'
      else defaults[f.name] = ''
    })
    reset(defaults); setDialogOpen(true)
  }

  const openEdit = (row: Record<string, unknown>) => {
    setIsEdit(true); setSelected(row)
    const vals: Record<string, string> = {}
    config.formFields.forEach((f) => { vals[f.name] = String(row[f.name] ?? '') })
    reset(vals); setDialogOpen(true)
  }

  const onSubmit = (formData: Record<string, string>) => {
    const payload: Record<string, unknown> = { ...formData }
    config.formFields.forEach((f) => {
      if (f.type === 'number' && formData[f.name] != null && formData[f.name] !== '') {
        payload[f.name] = Number(formData[f.name]) || 0
      }
    })
    if (formData.amount != null && formData.amount !== '') {
      payload.amount = Number(formData.amount) || 0
    }
    if (isEdit && selected) updateMutation.mutate({ id: String(selected.id), payload }, { onSuccess: () => setDialogOpen(false) })
    else createMutation.mutate(payload, { onSuccess: () => setDialogOpen(false) })
  }

  const ActionCell = useCallback((params: ICellRendererParams) => (
    <Box sx={{ display: 'flex', gap: 0.25 }}>
      <Tooltip title="View"><IconButton size="small" onClick={() => { setSelected(params.data); setViewOpen(true) }}><VisibilityIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
      {config.formFields.length > 0 && <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(params.data)}><EditIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>}
      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { setSelected(params.data); setDeleteOpen(true) }}><DeleteIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
    </Box>
  ), [config.formFields.length])

  const columnDefs = useMemo<ColDef[]>(() => [
    ...config.columns.map((col) => ({
      field: col.field,
      headerName: col.header,
      flex: col.flex,
      minWidth: col.width ?? 100,
      cellRenderer: col.type === 'status'
        ? (p: ICellRendererParams) => p.value ? <StatusChip status={String(p.value)} /> : null
        : undefined,
      valueFormatter: col.type === 'currency'
        ? (p: { value: number }) => formatCurrency(p.value ?? 0)
        : col.type === 'percent'
          ? (p: { value: number }) => `${p.value ?? 0}%`
          : undefined,
    })),
    { headerName: '', width: config.formFields.length > 0 ? 120 : 60, pinned: 'right' as const, cellRenderer: ActionCell, sortable: false, filter: false },
  ], [config, ActionCell])

  const exportCols = config.columns.map((c) => ({ key: c.field, header: c.header }))
  const rows = data?.data ?? []

  const layoutVariant = config.layout
  const features = config.features ?? []
  const isReportAnalysisPage = layoutVariant === 'report' && config.showChart !== false && !features.includes('routeOrderPerformance')
  const sumFields = config.sumFields
    ?? (features.includes('reportTotals')
      ? config.columns.filter((c) => c.type === 'currency' || c.type === 'number').map((c) => c.field)
      : [])

  const statIcons = [AssessmentIcon, TrendingUpIcon, Inventory2OutlinedIcon, GroupsOutlinedIcon, ShoppingBagOutlinedIcon, CurrencyRupeeIcon, ScheduleOutlinedIcon, CheckCircleOutlinedIcon]
  const orderStatIcons = [ShoppingBagOutlinedIcon, CurrencyRupeeIcon, ScheduleOutlinedIcon, CheckCircleOutlinedIcon]
  const orderStatTrends = [12.4, 18.6, -6.3, 9.8]
  const orderStatTrendLabels = ['vs last month', 'vs last month', 'vs last month', 'vs last month']
  const defaultStatTrends = [12.4, 18.6, -6.3, 9.8, 7.2, -3.5, 15.1, 5.6]
  const collectionKpiMeta = [
    { icon: CurrencyRupeeIcon, trend: 12.4, iconIndex: 0 },
    { icon: AccountBalanceWalletIcon, trend: 8.6, iconIndex: 1 },
  ] as const

  return (
    <PageShell
      title={config.title}
      subtitle={config.subtitle}
      breadcrumbs={
        isSalesReturnPage
          ? [{ label: 'Home', path: '/' }, { label: 'Sales', path: '/sales/list' }, { label: config.title }]
          : [{ label: 'Home', path: '/' }, { label: config.title }]
      }
      actions={
        !isProductCatalogPage && config.documentedFlow !== 'e-way-bill' && config.documentedFlow !== 'employee-directory' && (config.formFields.length > 0 || config.documentedFlow === 'new-order' || config.documentedFlow === 'sales-return' || config.documentedFlow === 'stock-transfer' || config.documentedFlow === 'purchase-order' || config.documentedFlow === 'add-collection' || config.documentedFlow === 'add-expense' || config.documentedFlow === 'add-vehicle-log' || config.documentedFlow === 'add-quotation') ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isSalesReturnPage && (
              <Button
                variant="outlined"
                startIcon={<SettingsOutlinedIcon />}
                onClick={() => navigate('/sales/sales-return/settings')}
                sx={{ borderRadius: '12px', textTransform: 'none' }}
              >
                Settings
              </Button>
            )}
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={openCreateDialog} sx={primaryButtonSx}>
              {config.documentedFlow === 'new-order' ? 'New Order' : config.documentedFlow === 'sales-return' ? 'New Return' : config.documentedFlow === 'stock-transfer' ? 'New Transfer' : config.documentedFlow === 'purchase-order' ? 'New Purchase Order' : config.documentedFlow === 'add-collection' ? 'Add Collection' : config.documentedFlow === 'add-expense' ? 'Add Expense' : config.documentedFlow === 'add-vehicle-log' ? 'Add Vehicle Log' : config.documentedFlow === 'add-quotation' ? 'Add Quotation' : `Add ${config.entityName}`}
            </Button>
          </Box>
        ) : undefined
      }
    >
      {isSalesReturnPage && <SalesTabs />}

      {config.documentedFlow && config.documentedFlow !== 'new-order' && config.documentedFlow !== 'stock-transfer' && config.documentedFlow !== 'purchase-order' && config.documentedFlow !== 'add-collection' && config.documentedFlow !== 'add-expense' && config.documentedFlow !== 'add-vehicle-log' && config.documentedFlow !== 'add-quotation' && (
        <DocumentedFlowPanel flow={config.documentedFlow} />
      )}

      {!isProductCatalogPage && !isDriversPage && !isReportAnalysisPage && !isSimpleCatalogListPage && config.stats.length > 0 && (isOrdersPage ? (
        <OverviewColumnChart
          kpis={config.stats.map((stat, i) => ({
            label: stat.label,
            value: isLoading ? '—' : formatStatValue(data?.stats?.[stat.key], stat.format),
            trend: orderStatTrends[i % orderStatTrends.length],
            trendLabel: orderStatTrendLabels[i % orderStatTrendLabels.length],
            icon: (() => { const Icon = orderStatIcons[i % orderStatIcons.length]; return <Icon /> })(),
            iconIndex: i,
          }))}
          chartTitle={config.chartTitle ?? 'Orders Trend'}
          chart={data?.chart}
          loading={isLoading}
        />
      ) : isCollectionsPage ? (
        <Grid container spacing={dashboardGridSpacing} sx={{ mb: dashboardGridSpacing }}>
          {config.stats.map((stat, i) => {
            const meta = collectionKpiMeta[i % collectionKpiMeta.length]
            const Icon = meta.icon
            return (
              <Grid key={stat.key} size={{ xs: 12, sm: 6 }}>
                <DashboardKpiCard
                  label={stat.label}
                  value={isLoading ? '—' : formatStatValue(data?.stats?.[stat.key], stat.format)}
                  trend={meta.trend}
                  trendLabel="vs last month"
                  icon={<Icon />}
                  iconIndex={meta.iconIndex}
                />
              </Grid>
            )
          })}
        </Grid>
      ) : isPurchasesPage ? (
        <Grid container spacing={dashboardGridSpacing} sx={{ mb: dashboardGridSpacing }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: dashboardGridSpacing, height: '100%' }}>
              <DashboardKpiCard
                label="Total Credits"
                value={isLoading ? '—' : formatStatValue(data?.stats?.totalCreditBal, 'currency')}
                trend={8.6}
                trendLabel="vs last month"
                icon={<AccountBalanceWalletIcon />}
                iconIndex={0}
              />
              <DashboardKpiCard
                label="Total Value"
                value={isLoading ? '—' : formatStatValue(data?.stats?.totalAmount, 'currency')}
                trend={12.4}
                trendLabel="vs last month"
                icon={<CurrencyRupeeIcon />}
                iconIndex={1}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <DataPanel
              title={config.chartTitle ?? 'Purchase Overview'}
              subtitle="Monthly purchase value trend"
              sx={{ height: '100%', '& > div:last-child': { px: 2, pt: 1.5, pb: 1 } }}
            >
              {data?.chart ? (
                <Box sx={{ width: '100%', lineHeight: 0 }}>
                  <ApexChart data={data.chart} type="bar" height={280} />
                </Box>
              ) : (
                <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No chart data available.</Typography>
                </Box>
              )}
            </DataPanel>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={dashboardGridSpacing} sx={{ mb: dashboardGridSpacing }}>
          {(isExpensesPage ? config.stats.filter(s => s.key !== 'totalDebit' && s.key !== 'totalCreditBal') : config.stats).map((stat, i, arr) => {
            const Icon = statIcons[i % statIcons.length]
            return (
              <Grid key={stat.key} size={{ xs: 12, sm: 6, md: arr.length <= 2 ? 6 : arr.length === 3 ? 4 : 3 }}>
                <DashboardKpiCard
                  label={stat.label}
                  value={isLoading ? '—' : formatStatValue(data?.stats?.[stat.key], stat.format)}
                  trend={defaultStatTrends[i % defaultStatTrends.length]}
                  trendLabel="vs last month"
                  icon={<Icon />}
                  iconIndex={i}
                />
              </Grid>
            )
          })}
        </Grid>
      ))}

      {isOrdersPage && <OrderRecordCards orders={rows} />}

      {features.includes('routeOrderPerformance') && (
        <Box sx={{ mb: 2 }}>
          {data?.chart && (
            <DataPanel title={config.chartTitle ?? 'Order Performance Trend'} sx={{ mb: 2 }}>
              <ApexChart data={data.chart} type="bar" height={220} />
            </DataPanel>
          )}
          <RouteOrderPerformance orders={rows as Parameters<typeof RouteOrderPerformance>[0]['orders']} />
        </Box>
      )}

      {features.includes('warehouseTransfer') && <WarehouseTransferPanel />}

      {isWarehousePage && (
        <Box sx={{ mb: dashboardGridSpacing }}>
          <WarehouseStockTabs />
        </Box>
      )}

      {isReportAnalysisPage && data?.chart && (
        <Grid container spacing={dashboardGridSpacing} sx={{ mb: dashboardGridSpacing, alignItems: 'stretch' }}>
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
            <DataPanel
              title={config.chartTitle ?? 'Sales Report Analysis'}
              fillHeight
              sx={{ flex: 1, width: '100%', minHeight: { xs: 360, md: 380 } }}
            >
              {features.includes('chartTypeSwitch') && (
                <ChartTypeSelector value={chartType} onChange={setChartType} />
              )}
              <Box sx={{ flex: 1, minHeight: { xs: 280, md: 300 }, display: 'flex', flexDirection: 'column' }}>
                <ApexChart data={data.chart} type={chartType} height={300} />
              </Box>
            </DataPanel>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
            <DataPanel title="Summary" fillHeight sx={{ flex: 1, width: '100%', minHeight: { xs: 360, md: 380 } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, minHeight: { xs: 280, md: 300 } }}>
                {config.stats.map((s) => (
                  <Box key={s.key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.75, borderBottom: `1px solid color-mix(in srgb, var(--rs-border-strong) 40%, transparent)` }}>
                    <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatStatValue(data?.stats?.[s.key], s.format)}</Typography>
                  </Box>
                ))}
              </Box>
            </DataPanel>
          </Grid>
        </Grid>
      )}

      {layoutVariant === 'tracking' && (
        <Grid container spacing={2} sx={{ mb: 1, alignItems: 'stretch' }}>
          <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex' }}>
            <DataPanel title="Live Map" subtitle="GPS positions of field staff" fillHeight sx={{ flex: 1, width: '100%' }}>
              <Box sx={{ flex: 1, minHeight: { xs: 280, md: 0 }, borderRadius: 3, bgcolor: 'color-mix(in srgb, var(--rs-surface) 40%, transparent)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${v.borderStrong}`, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 30% 40%, ${mix.secondary(15)} 0%, transparent 50%), radial-gradient(circle at 70% 60%, ${mix.primary(10)} 0%, transparent 40%)` }} />
                {rows.slice(0, 5).map((r, i) => (
                  <Box key={String(r.id)} sx={{ position: 'absolute', left: `${15 + i * 18}%`, top: `${20 + (i % 3) * 25}%`, width: 12, height: 12, borderRadius: '50%', bgcolor: v.secondary, boxShadow: `0 0 0 4px ${mix.secondary(30)}`, animation: 'pulse 2s infinite' }} />
                ))}
                <Typography variant="body2" color="text.secondary" sx={{ zIndex: 1 }}>Interactive map view — {rows.length} agents tracked</Typography>
              </Box>
            </DataPanel>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
            <DataPanel title="Agent Status" fillHeight sx={{ flex: 1, width: '100%' }}>
              {rows.slice(0, 6).map((r) => (
                <Box key={String(r.id)} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, borderBottom: `1px solid color-mix(in srgb, var(--rs-border-strong) 40%, transparent)` }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: r.status === 'active' ? v.success : v.warning }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.salesman ?? r.driver ?? '')}</Typography>
                    <Typography variant="caption" color="text.secondary">{String(r.lastUpdate ?? r.route ?? '')}</Typography>
                  </Box>
                  <StatusChip status={String(r.status)} />
                </Box>
              ))}
            </DataPanel>
          </Grid>
        </Grid>
      )}

      {layoutVariant === 'route' && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {rows.slice(0, 3).map((r) => (
            <Grid key={String(r.id)} size={{ xs: 12, md: 4 }}>
              <Box sx={{ p: 2.5, ...whiteCardSx }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{String(r.name ?? r.code)}</Typography>
                  <StatusChip status={String(r.status)} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{String(r.salesman)}</Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption">Outlets visited</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{String(r.visited)}/{String(r.outlets)}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={(Number(r.visited) / Number(r.outlets)) * 100 || 0} sx={{ height: 6, borderRadius: 3 }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">Collection</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(Number(r.collections) || 0)}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {layoutVariant === 'inventory' && isBatchManagementPage && data?.chart && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12 }}>
            <DataPanel title="Stock Movement">
              <ApexChart data={data.chart} type="bar" height={200} />
            </DataPanel>
          </Grid>
        </Grid>
      )}

      {layoutVariant === 'inventory' && !isBatchManagementPage && !isProductCatalogPage && !isSimpleCatalogListPage && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <DataPanel title="Stock Overview">
              {rows.filter((r) => r.status === 'low_stock').slice(0, 4).map((r) => (
                <Box key={String(r.id)} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(r.name)}</Typography>
                    <Typography variant="caption" color="error.main">{String(r.stock)} / {String(r.minStock)}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={Math.min((Number(r.stock) / Number(r.minStock)) * 100, 100)} color="warning" sx={{ height: 5, borderRadius: 2, mt: 0.5 }} />
                </Box>
              ))}
            </DataPanel>
          </Grid>
          {data?.chart && (
            <Grid size={{ xs: 12, md: 8 }}>
              <DataPanel title="Stock Movement">
                <ApexChart data={data.chart} type="bar" height={200} />
              </DataPanel>
            </Grid>
          )}
        </Grid>
      )}

      {layoutVariant === 'hr' && data?.chart && config.showChart && !isDriversPage && (
        <Box sx={{ mb: 2 }}>
          <DataPanel title="Workforce Analytics">
            <ApexChart data={data.chart} type="donut" height={220} />
          </DataPanel>
        </Box>
      )}

      {layoutVariant === 'customer' && !isSuppliersPage && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {rows.slice(0, 4).map((r) => (
            <Grid key={String(r.id)} size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ p: 2, ...whiteCardSx }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>{String(r.name)}</Typography>
                <Typography variant="caption" color="text.secondary">{String(r.route)}</Typography>
                <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Outstanding</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }} color="warning.main">{formatCurrency(Number(r.outstanding) || 0)}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">Limit</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(Number(r.creditLimit) || 0)}</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {layoutVariant === 'customer' && isSuppliersPage && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {rows.slice(0, 4).map((r) => (
            <Grid key={String(r.id)} size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ p: 2, ...whiteCardSx }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>{String(r.name)}</Typography>
                <Typography variant="caption" color="text.secondary">{String(r.location ?? '')}</Typography>
                <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Payable</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }} color="warning.main">{formatCurrency(Number(r.outstanding) || 0)}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">Credit Limit</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(Number(r.creditLimit) || 0)}</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {layoutVariant === 'ledger' && !isCollectionsPage && !isExpensesPage && (
        <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 200, p: 2, borderRadius: '16px', bgcolor: 'color-mix(in srgb, var(--rs-success-soft) 50%, transparent)', border: `1px solid ${mix.success(20)}`, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
            <Typography variant="caption" color="text.secondary">Total Debit</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }} color="success.main">{formatStatValue(data?.stats?.totalDebit, 'currency')}</Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 200, p: 2, borderRadius: '16px', bgcolor: 'color-mix(in srgb, var(--rs-error-soft) 50%, transparent)', border: `1px solid ${mix.error(15)}`, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
            <Typography variant="caption" color="text.secondary">Total Credit</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }} color="error.main">{formatStatValue(data?.stats?.totalCreditBal, 'currency')}</Typography>
          </Box>
        </Box>
      )}

      {layoutVariant === 'logistics' && data?.chart && config.showChart && (
        <Box sx={{ mb: 2 }}>
          <DataPanel title="Delivery Volume">
            <ApexChart data={data.chart} type="area" height={200} />
          </DataPanel>
        </Box>
      )}

      {(layoutVariant === 'transaction' || layoutVariant === 'settings') && data?.chart && config.showChart && !isOrdersPage && !isPurchasesPage && (
        <Box sx={{ mb: 2 }}>
          <DataPanel title={config.chartTitle ?? 'Trend'}>
            <ApexChart data={data.chart} type={config.chartType ?? 'area'} height={240} />
          </DataPanel>
        </Box>
      )}

      {config.showList !== false && !isProductCatalogPage && (
      <DataPanel
        title="Records"
        subtitle={`${data?.total ?? 0} total records`}
        noPadding
      >
        <Box sx={{ px: { xs: 1.5, md: 2.5 }, pt: 2 }}>
          <FilterBar
            search={search} onSearchChange={setSearch}
            status={statusFilter} onStatusChange={setStatusFilter}
            statuses={config.statuses}
            dateFrom={dateFrom} dateTo={dateTo}
            onDateFromChange={setDateFrom} onDateToChange={setDateTo}
            onExportExcel={() => exportToExcel(rows, config.slug, exportCols)}
            onExportPdf={() => exportToPdf(rows, config.slug, config.title, exportCols)}
            onPrint={() => printTable(config.title)}
            onRefresh={() => refetch()}
            showDateFilter={!isPayrollPage && layoutVariant !== 'settings'}
            showStatusFilter={layoutVariant !== 'settings'}
            monthFilter={isPayrollPage ? payrollMonthFilter : undefined}
            onMonthFilterChange={isPayrollPage ? setPayrollMonthFilter : undefined}
            monthOptions={isPayrollPage ? PAYROLL_MONTH_OPTIONS : undefined}
            monthFilterLabel="Payroll Month"
          />
        </Box>
        <Box
          key={themeVersion}
          className={`route-sale-grid ${themeMode === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'}`}
          sx={{ width: '100%', px: { xs: 0.5, md: 1 } }}
        >
          <AgGridReact
            key={`grid-${themeVersion}`}
            rowData={rows}
            columnDefs={columnDefs}
            loading={isLoading || isFetching}
            suppressCellFocus
            domLayout="autoHeight"
            rowHeight={52}
            headerHeight={48}
          />
        </Box>
        <Box>
          <TablePagination
            component="div"
            count={data?.total ?? 0}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0) }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              overflowX: 'auto',
              '& .MuiTablePagination-toolbar': { flexWrap: 'wrap', gap: 1, px: { xs: 1, md: 2 } },
            }}
          />
          {features.includes('reportTotals') && data?.totals && (
            <ReportTotalsBar columns={config.columns} totals={data.totals} sumFields={sumFields} />
          )}
        </Box>
      </DataPanel>
      )}

      {/* Dialogs */}
      {config.formFields.length > 0 && (
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: '20px',
                bgcolor: v.surface,
                backgroundImage: 'none',
                boxShadow: '0 24px 64px rgba(17, 24, 39, 0.16)',
                border: `1px solid ${v.border}`,
                overflow: 'hidden',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
              },
            },
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 2,
                px: 3,
                pt: 2.75,
                pb: 2,
                borderBottom: `1px solid ${v.border}`,
                background: `linear-gradient(180deg, color-mix(in srgb, ${v.background} 55%, ${v.surface}) 0%, ${v.surface} 100%)`,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: v.textPrimary, letterSpacing: '-0.02em', lineHeight: 1.3 }}
                >
                  {isEdit ? `Edit ${config.entityName}` : `Add ${config.entityName}`}
                </Typography>
                <Typography variant="body2" sx={{ color: v.textSecondary, mt: 0.5 }}>
                  {isEdit
                    ? `Update ${config.entityName.toLowerCase()} details below.`
                    : `Fill in the details to create a new ${config.entityName.toLowerCase()}.`}
                </Typography>
              </Box>
              <IconButton
                aria-label="Close"
                onClick={() => setDialogOpen(false)}
                size="small"
                sx={{
                  mt: -0.25,
                  color: v.textSecondary,
                  bgcolor: v.background,
                  borderRadius: '10px',
                  border: `1px solid ${v.border}`,
                  '&:hover': { bgcolor: mix.primary(6), color: v.textPrimary },
                }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            <DialogContent
              sx={{
                px: 3,
                py: 3,
                bgcolor: v.surface,
                '& .MuiOutlinedInput-root': {
                  bgcolor: v.background,
                  borderRadius: '12px',
                  backdropFilter: 'none',
                  WebkitBackdropFilter: 'none',
                  '&:hover': { bgcolor: `color-mix(in srgb, ${v.background} 70%, ${v.surface})` },
                  '&.Mui-focused': { bgcolor: v.surface },
                },
              }}
            >
              <Grid container spacing={2.25}>
                {config.formFields.map((f) => (
                  <Grid
                    key={f.name}
                    size={{
                      xs: 12,
                      sm: f.type === 'textarea' || f.type === 'image' ? 12 : 6,
                    }}
                  >
                    <FormFieldRenderer field={f} control={control} setValue={setValue} />
                  </Grid>
                ))}
              </Grid>
            </DialogContent>

            <DialogActions
              sx={{
                px: 3,
                py: 2.25,
                gap: 1.25,
                borderTop: `1px solid ${v.border}`,
                bgcolor: `color-mix(in srgb, ${v.background} 45%, ${v.surface})`,
              }}
            >
              <Button
                onClick={() => setDialogOpen(false)}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  color: v.textSecondary,
                  px: 2.5,
                  '&:hover': { bgcolor: mix.primary(6), color: v.textPrimary },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ ...primaryButtonSx, px: 3, minWidth: 140 }}
              >
                {isEdit ? 'Save Changes' : `Add ${config.entityName}`}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{config.entityName} Details</DialogTitle>
        <DialogContent>
          {selected && config.columns.map((col) => (
            <Box key={col.field} sx={{ display: 'flex', py: 1.25, borderBottom: `1px solid color-mix(in srgb, var(--rs-border-strong) 40%, transparent)` }}>
              <Typography variant="body2" color="text.secondary" sx={{ width: 140, flexShrink: 0 }}>{col.header}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }} component="div">
                {col.type === 'status' ? <StatusChip status={String(selected[col.field])} /> : String(cellValue(selected, col))}
              </Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions><Button onClick={() => setViewOpen(false)}>Close</Button></DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Delete this {config.entityName.toLowerCase()}? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => selected && deleteMutation.mutate(String(selected.id), { onSuccess: () => setDeleteOpen(false) })}>Delete</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  )
}
