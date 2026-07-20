import { useMemo, useState } from 'react'
import {
  Box, Button, Grid, Typography, TablePagination, LinearProgress,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, ICellRendererParams } from 'ag-grid-community'
import { useQuery } from '@tanstack/react-query'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import RemoveShoppingCartOutlinedIcon from '@mui/icons-material/RemoveShoppingCartOutlined'
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import { PageShell, primaryButtonSx } from '@/components/ui/PageShell'
import { DashboardKpiCard } from '@/components/dashboard/DashboardKpiCard'
import { DataPanel } from '@/components/ui/DataPanel'
import { ApexChart } from '@/components/charts/ApexChart'
import { StatusChip } from '@/components/ui/StatusChip'
import { FilterBar } from '@/components/ui/FilterBar'
import { getModuleConfig } from '@/config/modules'
import { useModuleData, formatStatValue } from '@/hooks/useModuleData'
import { fetchList } from '@/api/client'
import type { ModuleListResponse, ColumnDef, ChartData } from '@/types/module'
import { exportToExcel, exportToPdf, printTable, formatCurrency } from '@/utils/export'
import { useAppStore } from '@/store/appStore'
import { dashboardGridSpacing } from '@/components/ui/cardStyles'
import { overviewIconThemes } from '@/components/dashboard/dashboardTokens'
import { statusStyles } from '@/components/ui/statusStyles'
import { v } from '@/theme/cssVars'

const CONFIG_PATH = '/stock-management/low-stock'

function cellValue(row: Record<string, unknown>, col: ColumnDef) {
  const raw = row[col.field]
  if (col.type === 'currency') return formatCurrency(Number(raw) || 0)
  if (col.type === 'status') return null
  return raw ?? '—'
}

export function LowStockPage() {
  const config = useMemo(() => getModuleConfig(CONFIG_PATH), [])
  const themeMode = useAppStore((s) => s.themeMode)
  const themeVersion = useAppStore((s) => s.themeVersion)

  const {
    data, isLoading, isFetching, refetch,
    page, setPage, pageSize, setPageSize,
    search, setSearch, statusFilter, setStatusFilter,
    dateFrom, setDateFrom, dateTo, setDateTo,
    deleteMutation,
  } = useModuleData(config)

  const { data: analytics } = useQuery({
    queryKey: ['module', config.slug, 'analytics'],
    queryFn: () => fetchList(`/${config.slug}`, { page: 1, pageSize: 500 }) as Promise<ModuleListResponse>,
  })
  const allRows = analytics?.data ?? []

  const [viewOpen, setViewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null)

  const criticalItems = useMemo(
    () => [...allRows]
      .filter((r) => r.status === 'low_stock' || r.status === 'overdue')
      .sort((a, b) => {
        const ra = (Number(a.stock) || 0) / Math.max(Number(a.minStock) || 1, 1)
        const rb = (Number(b.stock) || 0) / Math.max(Number(b.minStock) || 1, 1)
        return ra - rb
      })
      .slice(0, 5),
    [allRows],
  )

  const warehouseRisk = useMemo(() => {
    const map = new Map<string, { low: number; out: number; shortfall: number }>()
    allRows.forEach((r) => {
      const w = String(r.warehouse ?? 'Unknown')
      const entry = map.get(w) ?? { low: 0, out: 0, shortfall: 0 }
      const stock = Number(r.stock) || 0
      const min = Number(r.minStock) || 0
      if (r.status === 'overdue' || stock === 0) entry.out += 1
      else if (r.status === 'low_stock' || stock < min) entry.low += 1
      entry.shortfall += Math.max(0, min - stock)
      map.set(w, entry)
    })
    return [...map.entries()]
      .map(([name, stats]) => ({ name, ...stats, total: stats.low + stats.out }))
      .filter((w) => w.total > 0)
      .sort((a, b) => b.shortfall - a.shortfall)
      .slice(0, 5)
  }, [allRows])

  const stockOverviewChart = useMemo<ChartData>(() => {
    const byWarehouse = new Map<string, { available: number; reorder: number }>()
    allRows.forEach((r) => {
      const w = String(r.warehouse ?? 'Unknown')
      const entry = byWarehouse.get(w) ?? { available: 0, reorder: 0 }
      entry.available += Number(r.stock) || 0
      entry.reorder += Number(r.minStock) || 0
      byWarehouse.set(w, entry)
    })
    const entries = [...byWarehouse.entries()].sort((a, b) => b[1].reorder - a[1].reorder).slice(0, 6)
    if (entries.length === 0) {
      return data?.chart ?? { categories: [], series: [] }
    }
    return {
      categories: entries.map(([name]) => name.replace(' Warehouse', '').replace('Depot ', '')),
      series: [
        { name: 'Available', data: entries.map(([, s]) => s.available) },
        { name: 'Reorder Level', data: entries.map(([, s]) => s.reorder) },
      ],
    }
  }, [allRows, data?.chart])

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    allRows.forEach((r) => {
      if (r.status !== 'low_stock' && r.status !== 'overdue') return
      const c = String(r.category ?? 'Other')
      map.set(c, (map.get(c) ?? 0) + 1)
    })
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
  }, [allRows])

  const kpiMeta = [
    { icon: Inventory2OutlinedIcon, trend: 3.1 },
    { icon: WarningAmberOutlinedIcon, trend: -5.4 },
    { icon: RemoveShoppingCartOutlinedIcon, trend: -2.8 },
    { icon: LayersOutlinedIcon, trend: 1.6 },
  ] as const

  const columnDefs = useMemo<ColDef[]>(() => [
    ...config.columns.map((col) => ({
      field: col.field,
      headerName: col.header,
      flex: col.flex,
      minWidth: col.width ?? 100,
      cellRenderer: col.type === 'status'
        ? (p: ICellRendererParams) => (p.value ? <StatusChip status={String(p.value)} /> : null)
        : undefined,
      valueFormatter: col.type === 'currency' ? (p: { value: number }) => formatCurrency(p.value ?? 0) : undefined,
    })),
    {
      headerName: '',
      width: 90,
      pinned: 'right' as const,
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams) => (
        <Box sx={{ display: 'flex', gap: 0.25 }}>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => { setSelected(params.data); setViewOpen(true) }}>
              <VisibilityIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => { setSelected(params.data); setDeleteOpen(true) }}>
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], [config.columns])

  const rows = data?.data ?? []
  const exportCols = config.columns.map((c) => ({ key: c.field, header: c.header }))
  const alertCount = (data?.stats?.lowStock ?? 0) + (data?.stats?.overdue ?? 0)

  return (
    <PageShell
      title={config.title}
      subtitle={config.subtitle}
      breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Stock Management' }, { label: config.title }]}
      actions={
        <Button variant="contained" color="primary" startIcon={<RefreshIcon />} sx={primaryButtonSx} onClick={() => refetch()}>
          Refresh
        </Button>
      }
    >
      {/* Row 1 — Summary KPIs */}
      <Grid container spacing={dashboardGridSpacing} sx={{ mb: dashboardGridSpacing }}>
        {config.stats.map((stat, i) => {
          const meta = kpiMeta[i % kpiMeta.length]
          const Icon = meta.icon
          return (
            <Grid key={stat.key} size={{ xs: 12, sm: 6, lg: 3 }}>
              <DashboardKpiCard
                label={stat.label}
                value={isLoading ? '—' : formatStatValue(data?.stats?.[stat.key], stat.format)}
                trend={meta.trend}
                trendLabel="vs last month"
                icon={<Icon />}
                iconIndex={i}
              />
            </Grid>
          )
        })}
      </Grid>

      {/* Row 2 — Two info cards (left) + Stock Overview chart (right) */}
      <Grid container spacing={dashboardGridSpacing} sx={{ mb: dashboardGridSpacing }} alignItems="stretch">
        <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', flexDirection: 'column', gap: dashboardGridSpacing }}>
          {/* Critical alerts */}
          <DataPanel
            title="Critical Alerts"
            subtitle="Items furthest below reorder level"
            fillHeight
            sx={{ flex: 1, minHeight: { xs: 260, md: 0 } }}
            actions={
              alertCount > 0 ? (
                <Box
                  sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.75,
                    px: 1.25, py: 0.5, borderRadius: '999px',
                    bgcolor: statusStyles.low_stock.bg, color: statusStyles.low_stock.color,
                    border: `1px solid ${statusStyles.low_stock.border}`,
                    fontSize: 12, fontWeight: 700,
                  }}
                >
                  <WarningAmberOutlinedIcon sx={{ fontSize: 15 }} />
                  {alertCount} alerts
                </Box>
              ) : undefined
            }
          >
            {criticalItems.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No critical stock shortages.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {criticalItems.map((r) => {
                  const stock = Number(r.stock) || 0
                  const min = Number(r.minStock) || 1
                  const ratio = Math.min(Math.round((stock / min) * 100), 100)
                  const isOut = r.status === 'overdue' || stock === 0
                  const tone = isOut ? statusStyles.overdue : statusStyles.low_stock
                  return (
                    <Box key={String(r.id)}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5, gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: v.textPrimary }} noWrap>
                          {String(r.name)}
                        </Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: tone.color, flexShrink: 0 }}>
                          {stock} / {min}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={ratio}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'color-mix(in srgb, var(--rs-border-strong) 28%, transparent)',
                          '& .MuiLinearProgress-bar': { bgcolor: tone.dot, borderRadius: 3 },
                        }}
                      />
                      <Typography sx={{ fontSize: 11, color: v.textMuted, mt: 0.4 }}>
                        {String(r.warehouse)} · {isOut ? 'Out of stock' : `${ratio}% of reorder level`}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            )}
          </DataPanel>

          {/* Warehouse / category info */}
          <DataPanel
            title="Warehouse Risk"
            subtitle="Locations needing restock attention"
            fillHeight
            sx={{ flex: 1, minHeight: { xs: 240, md: 0 } }}
          >
            {warehouseRisk.length === 0 ? (
              <Typography variant="body2" color="text.secondary">All warehouses are healthy.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {warehouseRisk.map((w, i) => {
                  const theme = overviewIconThemes[i % overviewIconThemes.length]
                  return (
                    <Box
                      key={w.name}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        px: 1.5, py: 1.25, borderRadius: '12px',
                        border: `1px solid color-mix(in srgb, var(--rs-border-strong) 40%, transparent)`,
                        bgcolor: 'color-mix(in srgb, var(--rs-background) 55%, transparent)',
                      }}
                    >
                      <Box
                        sx={{
                          width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                          bgcolor: theme.bg, color: theme.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <WarehouseOutlinedIcon sx={{ fontSize: 18 }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: v.textPrimary }} noWrap>
                          {w.name}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: v.textMuted }}>
                          {w.low} low · {w.out} out · shortfall {new Intl.NumberFormat('en-IN').format(w.shortfall)}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: 16, fontWeight: 800, color: v.textPrimary }}>
                        {w.total}
                      </Typography>
                    </Box>
                  )
                })}

                {categoryBreakdown.length > 0 && (
                  <Box sx={{ mt: 0.5, pt: 1.5, borderTop: `1px solid color-mix(in srgb, var(--rs-border-strong) 35%, transparent)` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                      <CategoryOutlinedIcon sx={{ fontSize: 15, color: v.textMuted }} />
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: v.textSecondary }}>
                        Top categories at risk
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {categoryBreakdown.map((c) => (
                        <Box
                          key={c.name}
                          sx={{
                            px: 1.25, py: 0.5, borderRadius: '20px',
                            bgcolor: statusStyles.low_stock.bg,
                            border: `1px solid ${statusStyles.low_stock.border}`,
                            fontSize: 11, fontWeight: 600, color: statusStyles.low_stock.color,
                          }}
                        >
                          {c.name} · {c.count}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </DataPanel>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }} sx={{ display: 'flex' }}>
          <DataPanel
            title="Stock Overview"
            subtitle="Available quantity vs reorder level by warehouse"
            fillHeight
            sx={{ width: '100%', minHeight: { xs: 360, md: '100%' } }}
          >
            {stockOverviewChart.categories.length > 0 ? (
              <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <ApexChart data={stockOverviewChart} type="bar" height={340} yAxisFormat="number" />
              </Box>
            ) : (
              <Box sx={{ height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">No stock data to chart.</Typography>
              </Box>
            )}
          </DataPanel>
        </Grid>
      </Grid>

      {/* Records */}
      <DataPanel title="Low Stock Records" subtitle={`${data?.total ?? 0} products monitored`} noPadding>
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
            showDateFilter={false}
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
      </DataPanel>

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
