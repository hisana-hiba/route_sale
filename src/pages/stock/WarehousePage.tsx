import { useMemo, useState } from 'react'
import {
  Box, Button, Grid, Typography, TablePagination,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, ICellRendererParams } from 'ag-grid-community'
import { useForm } from 'react-hook-form'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import { PageShell, primaryButtonSx } from '@/components/ui/PageShell'
import { DashboardKpiCard } from '@/components/dashboard/DashboardKpiCard'
import { DataPanel } from '@/components/ui/DataPanel'
import { StatusChip } from '@/components/ui/StatusChip'
import { FilterBar } from '@/components/ui/FilterBar'
import { FormFieldRenderer } from '@/components/module/FormFieldRenderer'
import { getModuleConfig } from '@/config/modules'
import { useModuleData, formatStatValue } from '@/hooks/useModuleData'
import type { ColumnDef } from '@/types/module'
import { exportToExcel, exportToPdf, printTable, formatCurrency } from '@/utils/export'
import { useAppStore } from '@/store/appStore'
import { dashboardGridSpacing } from '@/components/ui/cardStyles'
import { v } from '@/theme/cssVars'

const WAREHOUSE_CONFIG_PATH = '/stock-management/warehouse'
const STOCK_CONFIG_PATH = '/stock-management/current-stock'

const warehouseKpiIcons = [WarehouseOutlinedIcon, Inventory2OutlinedIcon, CurrencyRupeeIcon, CheckCircleOutlinedIcon]
const kpiTrends = [4.2, 6.8, 9.1, 2.6]

function cellValue(row: Record<string, unknown>, col: ColumnDef) {
  const raw = row[col.field]
  if (col.type === 'currency') return formatCurrency(Number(raw) || 0)
  if (col.type === 'status') return null
  return raw ?? '—'
}

type TabId = 'list' | 'stock'

/** Tab 1 — standard warehouse records list (Add / Edit / View / Delete) */
function WarehouseListTab() {
  const themeMode = useAppStore((s) => s.themeMode)
  const themeVersion = useAppStore((s) => s.themeVersion)
  const config = useMemo(() => getModuleConfig(WAREHOUSE_CONFIG_PATH), [])

  const {
    data, isLoading, isFetching, refetch,
    page, setPage, pageSize, setPageSize,
    search, setSearch, statusFilter, setStatusFilter,
    dateFrom, setDateFrom, dateTo, setDateTo,
    createMutation, updateMutation, deleteMutation,
  } = useModuleData(config)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const { control, handleSubmit, reset } = useForm({ defaultValues: {} as Record<string, string> })

  const openCreateDialog = () => {
    setIsEdit(false); setSelected(null)
    const defaults: Record<string, string> = {}
    config.formFields.forEach((f) => { defaults[f.name] = '' })
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
    if (isEdit && selected) updateMutation.mutate({ id: String(selected.id), payload }, { onSuccess: () => setDialogOpen(false) })
    else createMutation.mutate(payload, { onSuccess: () => setDialogOpen(false) })
  }

  const ActionCell = (params: ICellRendererParams) => (
    <Box sx={{ display: 'flex', gap: 0.25 }}>
      <Tooltip title="View"><IconButton size="small" onClick={() => { setSelected(params.data); setViewOpen(true) }}><VisibilityIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
      <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(params.data)}><EditIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { setSelected(params.data); setDeleteOpen(true) }}><DeleteIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
    </Box>
  )

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
    { headerName: '', width: 120, pinned: 'right' as const, sortable: false, filter: false, cellRenderer: ActionCell },
  ], [config.columns]) // eslint-disable-line react-hooks/exhaustive-deps

  const rows = data?.data ?? []
  const exportCols = config.columns.map((c) => ({ key: c.field, header: c.header }))

  return (
    <Box>
      <Grid container spacing={dashboardGridSpacing} sx={{ mb: dashboardGridSpacing }}>
        {config.stats.map((stat, i) => {
          const Icon = warehouseKpiIcons[i % warehouseKpiIcons.length]
          return (
            <Grid key={stat.key} size={{ xs: 12, sm: 6, md: 3 }}>
              <DashboardKpiCard
                label={stat.label}
                value={isLoading ? '—' : formatStatValue(data?.stats?.[stat.key], stat.format)}
                trend={kpiTrends[i % kpiTrends.length]}
                trendLabel="vs last month"
                icon={<Icon />}
                iconIndex={i}
              />
            </Grid>
          )
        })}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={openCreateDialog} sx={primaryButtonSx}>
          Add {config.entityName}
        </Button>
      </Box>

      <DataPanel title="Warehouse Records" subtitle={`${data?.total ?? 0} total records`} noPadding>
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
          sx={{ overflowX: 'auto', '& .MuiTablePagination-toolbar': { flexWrap: 'wrap', gap: 1, px: { xs: 1, md: 2 } } }}
        />
      </DataPanel>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, px: 3, pt: 2.75, pb: 2, borderBottom: `1px solid ${v.border}` }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: v.textPrimary }}>
                {isEdit ? `Edit ${config.entityName}` : `Add ${config.entityName}`}
              </Typography>
              <Typography variant="body2" sx={{ color: v.textSecondary, mt: 0.5 }}>
                {isEdit ? 'Update warehouse details below.' : 'Fill in the details to create a new warehouse.'}
              </Typography>
            </Box>
            <IconButton aria-label="Close" onClick={() => setDialogOpen(false)} size="small">
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
          <DialogContent sx={{ px: 3, py: 3 }}>
            <Grid container spacing={2.25}>
              {config.formFields.map((f) => (
                <Grid key={f.name} size={{ xs: 12, sm: f.type === 'textarea' ? 12 : 6 }}>
                  <FormFieldRenderer field={f} control={control} />
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2.25, gap: 1.25, borderTop: `1px solid ${v.border}` }}>
            <Button onClick={() => setDialogOpen(false)} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, color: v.textSecondary }}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" sx={{ ...primaryButtonSx, px: 3, minWidth: 140 }}>
              {isEdit ? 'Save Changes' : `Add ${config.entityName}`}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
    </Box>
  )
}

/** Tab 2 — read-only product stock list across all warehouses */
function WarehouseStockTab() {
  const themeMode = useAppStore((s) => s.themeMode)
  const themeVersion = useAppStore((s) => s.themeVersion)
  const config = useMemo(() => getModuleConfig(STOCK_CONFIG_PATH), [])

  const {
    data, isLoading, isFetching, refetch,
    page, setPage, pageSize, setPageSize,
    search, setSearch, statusFilter, setStatusFilter,
    dateFrom, setDateFrom, dateTo, setDateTo,
  } = useModuleData(config)

  const [viewOpen, setViewOpen] = useState(false)
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null)

  const ActionCell = (params: ICellRendererParams) => (
    <Tooltip title="View">
      <IconButton size="small" onClick={() => { setSelected(params.data); setViewOpen(true) }}>
        <VisibilityIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Tooltip>
  )

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
    { headerName: '', width: 70, pinned: 'right' as const, sortable: false, filter: false, cellRenderer: ActionCell },
  ], [config.columns]) // eslint-disable-line react-hooks/exhaustive-deps

  const rows = data?.data ?? []
  const exportCols = config.columns.map((c) => ({ key: c.field, header: c.header }))

  return (
    <Box>
      <DataPanel title="Warehouse Stock" subtitle={`${data?.total ?? 0} products across all warehouses`} noPadding>
        <Box sx={{ px: { xs: 1.5, md: 2.5 }, pt: 2 }}>
          <FilterBar
            search={search} onSearchChange={setSearch}
            status={statusFilter} onStatusChange={setStatusFilter}
            statuses={config.statuses}
            dateFrom={dateFrom} dateTo={dateTo}
            onDateFromChange={setDateFrom} onDateToChange={setDateTo}
            onExportExcel={() => exportToExcel(rows, 'warehouse-stock', exportCols)}
            onExportPdf={() => exportToPdf(rows, 'warehouse-stock', 'Warehouse Stock', exportCols)}
            onPrint={() => printTable('Warehouse Stock')}
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
          sx={{ overflowX: 'auto', '& .MuiTablePagination-toolbar': { flexWrap: 'wrap', gap: 1, px: { xs: 1, md: 2 } } }}
        />
      </DataPanel>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Product Stock Details</DialogTitle>
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
    </Box>
  )
}

export function WarehousePage() {
  const config = useMemo(() => getModuleConfig(WAREHOUSE_CONFIG_PATH), [])
  const [activeTab, setActiveTab] = useState<TabId>('list')

  const TABS: { id: TabId; label: string }[] = [
    { id: 'list', label: 'Warehouse List' },
    { id: 'stock', label: 'Warehouse Stock' },
  ]

  return (
    <PageShell
      title={config.title}
      subtitle={config.subtitle}
      breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Stock Management' }, { label: config.title }]}
    >
      <Box sx={{ display: 'flex', gap: 0, mb: 3, borderBottom: `1px solid ${v.border}`, overflowX: 'auto' }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <Box
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              sx={{
                px: 2.5, py: 1.5, cursor: 'pointer', position: 'relative', whiteSpace: 'nowrap',
                fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif',
                fontSize: '0.875rem', fontWeight: isActive ? 700 : 500,
                color: isActive ? v.primary : v.textSecondary,
                transition: 'color 0.18s',
                '&:hover': { color: isActive ? v.primary : v.textPrimary },
                '&::after': {
                  content: '""', position: 'absolute', bottom: -1, left: 0, right: 0, height: 2,
                  borderRadius: '2px 2px 0 0',
                  background: isActive ? `linear-gradient(90deg, ${v.primary}, ${v.secondary})` : 'transparent',
                  transition: 'background 0.18s',
                },
              }}
            >
              {tab.label}
            </Box>
          )
        })}
      </Box>

      {activeTab === 'list' && <WarehouseListTab />}
      {activeTab === 'stock' && <WarehouseStockTab />}
    </PageShell>
  )
}
