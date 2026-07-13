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
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AssessmentIcon from '@mui/icons-material/Assessment'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { ModuleStatCard } from '@/components/ui/ModuleStatCard'
import { FilterBar } from '@/components/ui/FilterBar'
import { DataPanel } from '@/components/ui/DataPanel'
import { StatusChip } from '@/components/ui/StatusChip'
import { ApexChart } from '@/components/charts/ApexChart'
import { ReportTotalsBar } from '@/components/module/ReportTotalsBar'
import { ChartTypeSelector } from '@/components/module/ChartTypeSelector'
import { RouteOrderPerformance } from '@/components/module/RouteOrderPerformance'
import { WarehouseTransferPanel } from '@/components/module/WarehouseTransferPanel'
import { FormFieldRenderer } from '@/components/module/FormFieldRenderer'
import { DocumentedFlowPanel } from '@/components/flows/DocumentedFlowPanel'
import { useModuleData, formatStatValue } from '@/hooks/useModuleData'
import { exportToExcel, exportToPdf, printTable, formatCurrency } from '@/utils/export'
import type { ModuleConfig, ColumnDef, ChartType } from '@/types/module'
import { v, mix } from '@/theme/cssVars'
import { useAppStore } from '@/store/appStore'

interface ModuleLayoutProps {
  config: ModuleConfig
}

function cellValue(row: Record<string, unknown>, col: ColumnDef) {
  const v = row[col.field]
  if (col.type === 'currency') return formatCurrency(Number(v) || 0)
  if (col.type === 'status') return null
  return v ?? '—'
}

export function ModuleLayout({ config }: ModuleLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const themeMode = useAppStore((s) => s.themeMode)
  const themeVersion = useAppStore((s) => s.themeVersion)
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
    const payload = { ...formData, amount: Number(formData.amount) || 0 }
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
      valueFormatter: col.type === 'currency' ? (p: { value: number }) => formatCurrency(p.value ?? 0) : undefined,
    })),
    { headerName: '', width: config.formFields.length > 0 ? 120 : 60, pinned: 'right' as const, cellRenderer: ActionCell, sortable: false, filter: false },
  ], [config, ActionCell])

  const exportCols = config.columns.map((c) => ({ key: c.field, header: c.header }))
  const rows = data?.data ?? []

  const layoutVariant = config.layout
  const features = config.features ?? []
  const sumFields = config.sumFields
    ?? (features.includes('reportTotals')
      ? config.columns.filter((c) => c.type === 'currency' || c.type === 'number').map((c) => c.field)
      : [])

  const statIcons = [AssessmentIcon, TrendingUpIcon, Inventory2OutlinedIcon, GroupsOutlinedIcon]
  const sparkSets = [[40, 55, 45, 70, 60], [30, 50, 40, 65, 55], [80, 75, 70, 72, 68], [35, 45, 50, 55, 60]]

  return (
    <PageShell
      title={config.title}
      subtitle={config.subtitle}
      breadcrumbs={[{ label: 'Home', path: '/' }, { label: config.title }]}
      actions={
        config.formFields.length > 0 || config.documentedFlow === 'new-order' || config.documentedFlow === 'sales-return' || config.documentedFlow === 'stock-transfer' || config.documentedFlow === 'purchase-order' ? (
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={openCreateDialog} sx={primaryButtonSx}>
            {config.documentedFlow === 'new-order' ? 'New Order' : config.documentedFlow === 'sales-return' ? 'New Return' : config.documentedFlow === 'stock-transfer' ? 'New Transfer' : config.documentedFlow === 'purchase-order' ? 'New Purchase Order' : `Add ${config.entityName}`}
          </Button>
        ) : undefined
      }
    >
      {config.documentedFlow && config.documentedFlow !== 'new-order' && config.documentedFlow !== 'stock-transfer' && config.documentedFlow !== 'purchase-order' && (
        <DocumentedFlowPanel flow={config.documentedFlow} />
      )}

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {config.stats.map((stat, i) => {
            const Icon = statIcons[i % statIcons.length]
            return (
              <Grid key={stat.key} size={{ xs: 6, sm: 6, md: 3 }}>
                <ModuleStatCard
                  label={stat.label}
                  value={formatStatValue(data?.stats?.[stat.key], stat.format)}
                  format={stat.format as 'currency' | 'number'}
                  loading={isLoading}
                  trend={[12, -3, 8, 5][i % 4]}
                  icon={<Icon sx={{ fontSize: 20 }} />}
                  iconIndex={i}
                  sparkData={sparkSets[i % sparkSets.length]}
                  variant={(['warm', 'gold', 'rose', 'sage'] as const)[i % 4]}
                />
              </Grid>
            )
          })}
        </Grid>

        {features.includes('routeOrderPerformance') && (
          <RouteOrderPerformance orders={rows as Parameters<typeof RouteOrderPerformance>[0]['orders']} />
        )}

        {features.includes('warehouseTransfer') && <WarehouseTransferPanel />}

        {layoutVariant === 'report' && data?.chart && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <DataPanel title={config.chartTitle ?? 'Analysis'}>
                {features.includes('chartTypeSwitch') && (
                  <ChartTypeSelector value={chartType} onChange={setChartType} />
                )}
                <ApexChart data={data.chart} type={chartType} height={280} />
              </DataPanel>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <DataPanel title="Summary">
                {config.stats.map((s) => (
                  <Box key={s.key} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: `1px solid color-mix(in srgb, var(--rs-border-strong) 40%, transparent)` }}>
                    <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                    <Typography variant="body2" fontWeight={700}>{formatStatValue(data?.stats?.[s.key], s.format)}</Typography>
                  </Box>
                ))}
              </DataPanel>
            </Grid>
          </Grid>
        )}

        {layoutVariant === 'tracking' && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <DataPanel title="Live Map" subtitle="GPS positions of field staff">
                <Box sx={{ height: 260, borderRadius: 3, bgcolor: 'color-mix(in srgb, var(--rs-surface) 40%, transparent)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${v.borderStrong}`, position: 'relative', overflow: 'hidden' }}>
                  <Box sx={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 30% 40%, ${mix.secondary(15)} 0%, transparent 50%), radial-gradient(circle at 70% 60%, ${mix.primary(10)} 0%, transparent 40%)` }} />
                  {rows.slice(0, 5).map((r, i) => (
                    <Box key={String(r.id)} sx={{ position: 'absolute', left: `${15 + i * 18}%`, top: `${20 + (i % 3) * 25}%`, width: 12, height: 12, borderRadius: '50%', bgcolor: v.secondary, boxShadow: `0 0 0 4px ${mix.secondary(30)}`, animation: 'pulse 2s infinite' }} />
                  ))}
                  <Typography variant="body2" color="text.secondary" sx={{ zIndex: 1 }}>Interactive map view — {rows.length} agents tracked</Typography>
                </Box>
              </DataPanel>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <DataPanel title="Agent Status">
                {rows.slice(0, 6).map((r) => (
                  <Box key={String(r.id)} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, borderBottom: `1px solid color-mix(in srgb, var(--rs-border-strong) 40%, transparent)` }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: r.status === 'active' ? v.success : v.warning }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{String(r.salesman ?? r.driver ?? '')}</Typography>
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
                    <Typography variant="subtitle2" fontWeight={700}>{String(r.name ?? r.code)}</Typography>
                    <StatusChip status={String(r.status)} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block">{String(r.salesman)}</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">Outlets visited</Typography>
                      <Typography variant="caption" fontWeight={700}>{String(r.visited)}/{String(r.outlets)}</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={(Number(r.visited) / Number(r.outlets)) * 100 || 0} sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">Collection</Typography>
                    <Typography variant="body2" fontWeight={700}>{formatCurrency(Number(r.collections) || 0)}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {layoutVariant === 'inventory' && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <DataPanel title="Stock Overview">
                {rows.filter((r) => r.status === 'low_stock').slice(0, 4).map((r) => (
                  <Box key={String(r.id)} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" fontWeight={600}>{String(r.name)}</Typography>
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

        {layoutVariant === 'hr' && data?.chart && (
          <Box sx={{ mb: 2 }}>
            <DataPanel title="Workforce Analytics">
              <ApexChart data={data.chart} type="donut" height={220} />
            </DataPanel>
          </Box>
        )}

        {layoutVariant === 'customer' && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {rows.slice(0, 4).map((r) => (
              <Grid key={String(r.id)} size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ p: 2, ...whiteCardSx }}>
                  <Typography variant="subtitle2" fontWeight={700} noWrap>{String(r.name)}</Typography>
                  <Typography variant="caption" color="text.secondary">{String(r.route)}</Typography>
                  <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Outstanding</Typography>
                      <Typography variant="body2" fontWeight={700} color="warning.main">{formatCurrency(Number(r.outstanding) || 0)}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary">Limit</Typography>
                      <Typography variant="body2" fontWeight={600}>{formatCurrency(Number(r.creditLimit) || 0)}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {layoutVariant === 'ledger' && (
          <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 200, p: 2, borderRadius: '16px', bgcolor: 'color-mix(in srgb, var(--rs-success-soft) 50%, transparent)', border: `1px solid ${mix.success(20)}`, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
              <Typography variant="caption" color="text.secondary">Total Debit</Typography>
              <Typography variant="h6" fontWeight={800} color="success.main">{formatStatValue(data?.stats?.totalDebit, 'currency')}</Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 200, p: 2, borderRadius: '16px', bgcolor: 'color-mix(in srgb, var(--rs-error-soft) 50%, transparent)', border: `1px solid ${mix.error(15)}`, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
              <Typography variant="caption" color="text.secondary">Total Credit</Typography>
              <Typography variant="h6" fontWeight={800} color="error.main">{formatStatValue(data?.stats?.totalCreditBal, 'currency')}</Typography>
            </Box>
          </Box>
        )}

        {layoutVariant === 'logistics' && data?.chart && (
          <Box sx={{ mb: 2 }}>
            <DataPanel title="Delivery Volume">
              <ApexChart data={data.chart} type="area" height={200} />
            </DataPanel>
          </Box>
        )}

        {(layoutVariant === 'transaction' || layoutVariant === 'settings') && data?.chart && config.showChart && (
          <Box sx={{ mb: 2 }}>
            <DataPanel title={config.chartTitle ?? 'Trend'}>
              <ApexChart data={data.chart} type={config.chartType ?? 'area'} height={240} />
            </DataPanel>
          </Box>
        )}

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
            showDateFilter={layoutVariant !== 'settings'}
            showStatusFilter={layoutVariant !== 'settings'}
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

      {/* Dialogs */}
      {config.formFields.length > 0 && (
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogTitle sx={{ fontWeight: 700 }}>{isEdit ? `Edit ${config.entityName}` : `New ${config.entityName}`}</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
              {config.formFields.map((f) => (
                <FormFieldRenderer key={f.name} field={f} control={control} setValue={setValue} />
              ))}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" sx={primaryButtonSx}>{isEdit ? 'Save Changes' : 'Create'}</Button>
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
              <Typography variant="body2" fontWeight={500} component="div">
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
