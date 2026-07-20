import { useMemo, useState } from 'react'
import {
  Box, Button, Grid, Typography, TablePagination,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Tabs, Tab,
} from '@mui/material'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, ICellRendererParams } from 'ag-grid-community'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import { PageShell, primaryButtonSx } from '@/components/ui/PageShell'
import { DashboardKpiCard } from '@/components/dashboard/DashboardKpiCard'
import { DataPanel } from '@/components/ui/DataPanel'
import { StatusChip } from '@/components/ui/StatusChip'
import { FilterBar } from '@/components/ui/FilterBar'
import { getModuleConfig } from '@/config/modules'
import { useModuleData, formatStatValue } from '@/hooks/useModuleData'
import type { ColumnDef } from '@/types/module'
import { exportToExcel, exportToPdf, printTable, formatCurrency } from '@/utils/export'
import { useAppStore } from '@/store/appStore'
import { dashboardGridSpacing } from '@/components/ui/cardStyles'
import { v, mix } from '@/theme/cssVars'

const CONFIG_PATH = '/stock-management/expiry-report'

type ExpiryView = 'shop_owner' | 'admin_warehouse'

const EXPIRY_TABS: { id: ExpiryView; label: string; icon: typeof StorefrontOutlinedIcon }[] = [
  { id: 'shop_owner', label: 'Shop Owner', icon: StorefrontOutlinedIcon },
  { id: 'admin_warehouse', label: 'Admin Warehouse', icon: WarehouseOutlinedIcon },
]

const SHOP_OWNER_COLUMNS: ColumnDef[] = [
  { field: 'name', header: 'Product', flex: 1 },
  { field: 'batch', header: 'Batch Number', width: 130 },
  { field: 'shop', header: 'Shop', width: 160 },
  { field: 'batchStockCount', header: 'Quantity', type: 'number', width: 90 },
  { field: 'batchDate', header: 'Mfg Date', type: 'date', width: 110 },
  { field: 'expiry', header: 'Expiry Date', type: 'date', width: 110 },
  { field: 'daysRemaining', header: 'Days Left', type: 'number', width: 90 },
  { field: 'status', header: 'Status', type: 'status', width: 110 },
]

const ADMIN_WAREHOUSE_COLUMNS: ColumnDef[] = [
  { field: 'name', header: 'Product', flex: 1 },
  { field: 'batch', header: 'Batch Number', width: 130 },
  { field: 'warehouse', header: 'Warehouse', width: 140 },
  { field: 'batchStockCount', header: 'Quantity', type: 'number', width: 90 },
  { field: 'batchDate', header: 'Mfg Date', type: 'date', width: 110 },
  { field: 'expiry', header: 'Expiry Date', type: 'date', width: 110 },
  { field: 'daysRemaining', header: 'Days Left', type: 'number', width: 90 },
  { field: 'status', header: 'Status', type: 'status', width: 110 },
]

function cellValue(row: Record<string, unknown>, col: ColumnDef) {
  const raw = row[col.field]
  if (col.type === 'currency') return formatCurrency(Number(raw) || 0)
  if (col.type === 'status') return null
  return raw ?? '—'
}

export function ExpiryReportPage() {
  const config = useMemo(() => getModuleConfig(CONFIG_PATH), [])
  const themeMode = useAppStore((s) => s.themeMode)
  const themeVersion = useAppStore((s) => s.themeVersion)

  const [view, setView] = useState<ExpiryView>('shop_owner')
  const [viewOpen, setViewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null)

  const {
    data, isLoading, isFetching, refetch,
    page, setPage, pageSize, setPageSize,
    search, setSearch, statusFilter, setStatusFilter,
    dateFrom, setDateFrom, dateTo, setDateTo,
    deleteMutation,
  } = useModuleData(config, undefined, { view })

  const columns = view === 'shop_owner' ? SHOP_OWNER_COLUMNS : ADMIN_WAREHOUSE_COLUMNS
  const tabIndex = EXPIRY_TABS.findIndex((t) => t.id === view)

  const kpiMeta = [
    { icon: Inventory2OutlinedIcon, trend: 2.4 },
    { icon: EventBusyOutlinedIcon, trend: -4.1 },
    { icon: WarningAmberOutlinedIcon, trend: -1.8 },
    { icon: ScheduleOutlinedIcon, trend: 3.2 },
  ] as const

  const columnDefs = useMemo<ColDef[]>(() => [
    ...columns.map((col) => ({
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
  ], [columns])

  const rows = data?.data ?? []
  const exportCols = columns.map((c) => ({ key: c.field, header: c.header }))
  const activeTab = EXPIRY_TABS[tabIndex] ?? EXPIRY_TABS[0]

  const handleTabChange = (_: unknown, next: number) => {
    const nextView = EXPIRY_TABS[next]?.id
    if (!nextView || nextView === view) return
    setView(nextView)
    setPage(0)
  }

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
      <Box
        sx={{
          mb: 2.5,
          borderBottom: `1px solid ${v.border}`,
          bgcolor: v.surface,
          borderRadius: '12px 12px 0 0',
          px: { xs: 0.5, sm: 1 },
        }}
      >
        <Tabs
          value={tabIndex < 0 ? 0 : tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Expiry report views"
          sx={{
            minHeight: 44,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              bgcolor: v.primary,
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              minHeight: 44,
              color: v.textSecondary,
              px: { xs: 1.5, sm: 2.5 },
              '&.Mui-selected': {
                color: v.primary,
                fontWeight: 700,
              },
              '&:hover': {
                color: v.primary,
                bgcolor: mix.primary(4),
              },
            },
          }}
        >
          {EXPIRY_TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <Tab
                key={tab.id}
                label={tab.label}
                icon={<Icon sx={{ fontSize: 18 }} />}
                iconPosition="start"
                disableRipple
              />
            )
          })}
        </Tabs>
      </Box>

      <Grid container spacing={dashboardGridSpacing} sx={{ mb: dashboardGridSpacing }}>
        {config.stats.map((stat, i) => {
          const meta = kpiMeta[i % kpiMeta.length]
          const Icon = meta.icon
          return (
            <Grid key={`${view}-${stat.key}`} size={{ xs: 12, sm: 6, md: 3 }}>
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

      <DataPanel
        title={`${activeTab.label} Expiry Records`}
        subtitle={`${data?.total ?? 0} products · ${activeTab.label} view`}
        noPadding
      >
        <Box sx={{ px: { xs: 1.5, md: 2.5 }, pt: 2 }}>
          <FilterBar
            search={search} onSearchChange={setSearch}
            status={statusFilter} onStatusChange={setStatusFilter}
            statuses={config.statuses}
            dateFrom={dateFrom} dateTo={dateTo}
            onDateFromChange={setDateFrom} onDateToChange={setDateTo}
            onExportExcel={() => exportToExcel(rows, `${config.slug}-${view}`, exportCols)}
            onExportPdf={() => exportToPdf(rows, `${config.slug}-${view}`, `${config.title} — ${activeTab.label}`, exportCols)}
            onPrint={() => printTable(`${config.title} — ${activeTab.label}`)}
            onRefresh={() => refetch()}
            showDateFilter={false}
          />
        </Box>
        <Box
          key={`${themeVersion}-${view}`}
          className={`route-sale-grid ${themeMode === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'}`}
          sx={{ width: '100%', px: { xs: 0.5, md: 1 } }}
        >
          <AgGridReact
            key={`grid-${themeVersion}-${view}`}
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
        <DialogTitle sx={{ fontWeight: 700 }}>{activeTab.label} — Product Details</DialogTitle>
        <DialogContent>
          {selected && columns.map((col) => (
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
          <Typography>Delete this product from the expiry report? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => selected && deleteMutation.mutate(String(selected.id), { onSuccess: () => setDeleteOpen(false) })}>Delete</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  )
}
