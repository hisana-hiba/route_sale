import { useMemo, useState } from 'react'
import {
  Box, Button, Grid, Typography, TablePagination,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, ICellRendererParams } from 'ag-grid-community'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee'
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { PageShell, primaryButtonSx } from '@/components/ui/PageShell'
import { DashboardKpiCard } from '@/components/dashboard/DashboardKpiCard'
import { DataPanel } from '@/components/ui/DataPanel'
import { StatusChip } from '@/components/ui/StatusChip'
import { FilterBar } from '@/components/ui/FilterBar'
import { getModuleConfig } from '@/config/modules'
import { useModuleData, formatStatValue } from '@/hooks/useModuleData'
import { fetchList } from '@/api/client'
import type { ModuleListResponse, ColumnDef } from '@/types/module'
import { exportToExcel, exportToPdf, printTable, formatCurrency } from '@/utils/export'
import { useAppStore } from '@/store/appStore'
import { dashboardGridSpacing } from '@/components/ui/cardStyles'
import { overviewIconThemes } from '@/components/dashboard/dashboardTokens'
import { statusStyles } from '@/components/ui/statusStyles'
import { v } from '@/theme/cssVars'

const CONFIG_PATH = '/stock-management/current-stock'

/** Shared fixed height for the warehouse-distribution and low-stock-alert cards so
 *  neither one stretches to leave empty space — the alerts list scrolls internally instead. */
const SIDE_PANEL_HEIGHT = 360

function cellValue(row: Record<string, unknown>, col: ColumnDef) {
  const raw = row[col.field]
  if (col.type === 'currency') return formatCurrency(Number(raw) || 0)
  if (col.type === 'status') return null
  return raw ?? '—'
}

export function CurrentStockPage() {
  const navigate = useNavigate()
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

  // Full dataset (unpaged) for the analytics widgets
  const { data: analytics } = useQuery({
    queryKey: ['module', config.slug, 'analytics'],
    queryFn: () => fetchList(`/${config.slug}`, { page: 1, pageSize: 500 }) as Promise<ModuleListResponse>,
  })
  const allRows = analytics?.data ?? []

  const [viewOpen, setViewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null)

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { active: 0, low_stock: 0, overdue: 0 }
    allRows.forEach((r) => { const s = String(r.status); if (s in c) c[s] += 1 })
    return c
  }, [allRows])

  const warehouseTotals = useMemo(() => {
    const map = new Map<string, number>()
    allRows.forEach((r) => {
      const w = String(r.warehouse ?? 'Unknown')
      map.set(w, (map.get(w) ?? 0) + (Number(r.stock) || 0))
    })
    return [...map.entries()]
      .map(([name, units]) => ({ name, units }))
      .sort((a, b) => b.units - a.units)
  }, [allRows])
  const totalWarehouseUnits = warehouseTotals.reduce((sum, w) => sum + w.units, 0)

  const lowStockItems = useMemo(
    () => allRows
      .filter((r) => r.status === 'low_stock' || r.status === 'overdue')
      .sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0))
      .slice(0, 12),
    [allRows],
  )
  const lowStockCount = statusCounts.low_stock + statusCounts.overdue

  const kpiMeta = [
    { icon: Inventory2OutlinedIcon, trend: 4.2 },
    { icon: LayersOutlinedIcon, trend: 6.8 },
    { icon: WarningAmberOutlinedIcon, trend: -2.4 },
    { icon: CurrencyRupeeIcon, trend: 9.1 },
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

  return (
    <PageShell
      title={config.title}
      subtitle={config.subtitle}
      breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Stock Management' }, { label: config.title }]}
      actions={
        <Button variant="contained" color="primary" startIcon={<WarehouseOutlinedIcon />} sx={primaryButtonSx} onClick={() => refetch()}>
          Refresh Stock
        </Button>
      }
    >
      {/* KPI summary */}
      <Grid container spacing={dashboardGridSpacing} sx={{ mb: dashboardGridSpacing }}>
        {config.stats.map((stat, i) => {
          const meta = kpiMeta[i % kpiMeta.length]
          const Icon = meta.icon
          return (
            <Grid key={stat.key} size={{ xs: 12, sm: 6, md: 3 }}>
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

      {/* Warehouse distribution + low-stock alerts */}
      <Grid container spacing={dashboardGridSpacing} sx={{ mb: dashboardGridSpacing }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <DataPanel title="Stock by Warehouse" subtitle="Share of total units across locations" fillHeight sx={{ height: SIDE_PANEL_HEIGHT }}>
            {warehouseTotals.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No stock data.</Typography>
            ) : (
              <Box sx={{ overflowY: 'auto', pr: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1.75 }}>
                  <Typography sx={{ fontSize: 30, fontWeight: 800, color: v.textPrimary, lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {new Intl.NumberFormat('en-IN').format(totalWarehouseUnits)}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: v.textMuted }}>units in {warehouseTotals.length} locations</Typography>
                </Box>

                {/* Segmented 100% distribution bar */}
                <Box sx={{ display: 'flex', gap: '3px', height: 26, mb: 2.5 }}>
                  {warehouseTotals.map((w, i) => {
                    const theme = overviewIconThemes[i % overviewIconThemes.length]
                    const share = totalWarehouseUnits > 0 ? (w.units / totalWarehouseUnits) * 100 : 0
                    return (
                      <Tooltip key={w.name} title={`${w.name} — ${Math.round(share)}%`} arrow>
                        <Box
                          sx={{
                            flexGrow: w.units, flexBasis: 0, minWidth: 8,
                            bgcolor: theme.color, borderRadius: '6px',
                            transition: 'flex-grow 0.5s ease',
                            '&:hover': { filter: 'brightness(1.08)' },
                          }}
                        />
                      </Tooltip>
                    )
                  })}
                </Box>

                {/* Legend grid */}
                <Grid container rowSpacing={1.5} columnSpacing={2}>
                  {warehouseTotals.map((w, i) => {
                    const theme = overviewIconThemes[i % overviewIconThemes.length]
                    const share = totalWarehouseUnits > 0 ? Math.round((w.units / totalWarehouseUnits) * 100) : 0
                    return (
                      <Grid key={w.name} size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '4px', bgcolor: theme.color, flexShrink: 0 }} />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: v.textPrimary, lineHeight: 1.2 }} noWrap>{w.name}</Typography>
                            <Typography sx={{ fontSize: 11, color: v.textMuted }}>
                              {new Intl.NumberFormat('en-IN').format(w.units)} · {share}%
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )
                  })}
                </Grid>
              </Box>
            )}
          </DataPanel>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DataPanel
            title="Low Stock Alerts"
            subtitle="Items at or below reorder level"
            fillHeight
            sx={{ height: SIDE_PANEL_HEIGHT }}
            actions={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {lowStockCount > 0 && (
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
                    {lowStockCount} to reorder
                  </Box>
                )}
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                  onClick={() => navigate('/stock-management/low-stock')}
                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12.5, borderRadius: '999px', px: 1.25 }}
                >
                  View All
                </Button>
              </Box>
            }
          >
            {lowStockItems.length === 0 ? (
              <Typography variant="body2" color="text.secondary">All products are sufficiently stocked.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto', pr: 0.5 }}>
                {lowStockItems.map((r) => {
                  const stock = Number(r.stock) || 0
                  const min = Number(r.minStock) || 1
                  const ratio = Math.min(Math.round((stock / min) * 100), 100)
                  const isOut = r.status === 'overdue'
                  const tone = isOut ? statusStyles.overdue : statusStyles.low_stock
                  const shortfall = Math.max(0, min - stock)
                  return (
                    <Box
                      key={String(r.id)}
                      sx={{
                        flexShrink: 0, minHeight: 52,
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        px: 1.5, borderRadius: '12px',
                        border: `1px solid ${tone.border}`,
                        borderLeft: `3px solid ${tone.dot}`,
                        bgcolor: `color-mix(in srgb, ${tone.dot} 6%, transparent)`,
                      }}
                    >
                      <Box
                        sx={{
                          width: 34, height: 34, borderRadius: '10px', flexShrink: 0,
                          bgcolor: tone.bg, color: tone.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          '& .MuiSvgIcon-root': { fontSize: 18 },
                        }}
                      >
                        <WarningAmberOutlinedIcon />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: v.textPrimary, lineHeight: 1.2 }} noWrap>{String(r.name)}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.4 }}>
                          <Typography sx={{ fontSize: 11, color: v.textMuted }} noWrap>{String(r.warehouse)}</Typography>
                          <Box sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: 'color-mix(in srgb, var(--rs-border-strong) 28%, transparent)', overflow: 'hidden', minWidth: 24 }}>
                            <Box sx={{ height: '100%', width: `${ratio}%`, bgcolor: tone.dot, borderRadius: 2 }} />
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 800, color: tone.color, lineHeight: 1 }}>
                          {stock}<Typography component="span" sx={{ fontSize: 11, fontWeight: 600, color: v.textMuted }}> / {min}</Typography>
                        </Typography>
                        <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: tone.color, mt: 0.4 }}>
                          {isOut ? 'Out of stock' : `Reorder +${shortfall}`}
                        </Typography>
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            )}
          </DataPanel>
        </Grid>
      </Grid>

      {/* Records */}
      <DataPanel title="Stock Records" subtitle={`${data?.total ?? 0} total records`} noPadding>
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

      {/* View dialog */}
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

      {/* Delete dialog */}
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
