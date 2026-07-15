import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Skeleton,
  TablePagination, IconButton, Tooltip, Typography,
} from '@mui/material'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, ICellRendererParams } from 'ag-grid-community'
import { motion } from 'framer-motion'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import { PageShell, primaryButtonSx } from '@/components/ui/PageShell'
import { DashboardKpiCard } from '@/components/dashboard/DashboardKpiCard'
import { DataPanel } from '@/components/ui/DataPanel'
import { FilterBar } from '@/components/ui/FilterBar'
import { StatusChip } from '@/components/ui/StatusChip'
import { FormFieldRenderer } from '@/components/module/FormFieldRenderer'
import { useModuleData, formatStatValue } from '@/hooks/useModuleData'
import { getModuleConfig } from '@/config/modules'
import { dashboardGridSpacing } from '@/components/ui/cardStyles'
import { exportToExcel, exportToPdf, printTable, formatCurrency } from '@/utils/export'
import type { ColumnDef } from '@/types/module'
import { useAppStore } from '@/store/appStore'

const config = getModuleConfig('/sales/invoices')

const KPI_META = [
  { key: 'totalRevenue', icon: CurrencyRupeeIcon, trend: 18.6 },
  { key: 'totalExpense', icon: AccountBalanceWalletIcon, trend: -4.2 },
  { key: 'totalOrders', icon: ShoppingBagOutlinedIcon, trend: 12.4 },
  { key: 'pending', icon: ScheduleOutlinedIcon, trend: -6.3 },
] as const

function cellValue(row: Record<string, unknown>, col: ColumnDef) {
  const v = row[col.field]
  if (col.type === 'currency') return formatCurrency(Number(v) || 0)
  if (col.type === 'status') return null
  return v ?? '—'
}

export function InvoicesPage() {
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

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {} as Record<string, string>,
  })

  const openCreate = () => {
    setIsEdit(false)
    setSelected(null)
    const defaults: Record<string, string> = {}
    config.formFields.forEach((f) => {
      if (f.type === 'date') defaults[f.name] = new Date().toISOString().split('T')[0]
      else if (f.name === 'status') defaults[f.name] = 'pending'
      else if (f.name === 'paymentTerms') defaults[f.name] = 'Net 30'
      else defaults[f.name] = ''
    })
    reset(defaults)
    setDialogOpen(true)
  }

  useEffect(() => {
    if ((location.state as { openCreate?: boolean })?.openCreate) {
      openCreate()
      navigate(location.pathname, { replace: true, state: {} })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  const openEdit = (row: Record<string, unknown>) => {
    setIsEdit(true)
    setSelected(row)
    const vals: Record<string, string> = {}
    config.formFields.forEach((f) => {
      vals[f.name] = String(row[f.name] ?? '')
    })
    reset(vals)
    setDialogOpen(true)
  }

  const onSubmit = (formData: Record<string, string>) => {
    const amount = Number(formData.amount) || 0
    const tax = Math.round(amount * 0.18)
    const payload = {
      ...formData,
      amount,
      tax,
      total: amount + tax,
    }

    if (isEdit && selected) {
      updateMutation.mutate(
        { id: String(selected.id), payload },
        { onSuccess: () => setDialogOpen(false) },
      )
    } else {
      createMutation.mutate(payload, { onSuccess: () => setDialogOpen(false) })
    }
  }

  const ActionCell = useCallback((params: ICellRendererParams) => (
    <Box sx={{ display: 'flex', gap: 0.25 }}>
      <Tooltip title="View">
        <IconButton size="small" onClick={() => { setSelected(params.data); setViewOpen(true) }}>
          <VisibilityIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit">
        <IconButton size="small" onClick={() => openEdit(params.data)}>
          <EditIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton size="small" color="error" onClick={() => { setSelected(params.data); setDeleteOpen(true) }}>
          <DeleteIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [])

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
        : undefined,
    })),
    {
      headerName: '',
      width: 120,
      pinned: 'right' as const,
      cellRenderer: ActionCell,
      sortable: false,
      filter: false,
    },
  ], [ActionCell])

  const exportCols = config.columns.map((c) => ({ key: c.field, header: c.header }))
  const rows = data?.data ?? []
  const gridSx = { mb: dashboardGridSpacing }

  return (
    <PageShell
      title={config.title}
      subtitle={config.subtitle}
      breadcrumbs={[{ label: 'Home', path: '/' }, { label: config.title }]}
      actions={
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={openCreate} sx={primaryButtonSx}>
          Add Invoice
        </Button>
      }
    >
      <Grid container spacing={dashboardGridSpacing} sx={gridSx}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Skeleton variant="rounded" height={140} sx={{ borderRadius: '20px' }} />
              </Grid>
            ))
          : config.stats.map((stat, i) => {
              const meta = KPI_META[i % KPI_META.length]
              const Icon = meta.icon
              return (
                <Grid key={stat.key} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <DashboardKpiCard
                      label={stat.label}
                      value={formatStatValue(data?.stats?.[stat.key], stat.format)}
                      trend={meta.trend}
                      trendLabel="vs last month"
                      icon={<Icon />}
                      iconIndex={i}
                    />
                  </motion.div>
                </Grid>
              )
            })}
      </Grid>

      <DataPanel
        title="All Invoices"
        subtitle={`${data?.total ?? 0} total records`}
        noPadding
      >
        <Box sx={{ px: { xs: 1.5, md: 2.5 }, pt: 2 }}>
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            status={statusFilter}
            onStatusChange={setStatusFilter}
            statuses={config.statuses}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onExportExcel={() => exportToExcel(rows, config.slug, exportCols)}
            onExportPdf={() => exportToPdf(rows, config.slug, config.title, exportCols)}
            onPrint={() => printTable(config.title)}
            onRefresh={() => refetch()}
            showDateFilter
            showStatusFilter
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {isEdit ? 'Edit Invoice' : 'New Invoice'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
            {config.formFields.map((f) => (
              <FormFieldRenderer key={f.name} field={f} control={control} setValue={setValue} />
            ))}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" sx={primaryButtonSx}>
              {isEdit ? 'Save Changes' : 'Create Invoice'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Invoice Details</DialogTitle>
        <DialogContent>
          {selected && config.columns.map((col) => (
            <Box
              key={col.field}
              sx={{
                display: 'flex',
                py: 1.25,
                borderBottom: '1px solid color-mix(in srgb, var(--rs-border-strong) 40%, transparent)',
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ width: 140, flexShrink: 0 }}>
                {col.header}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }} component="div">
                {col.type === 'status'
                  ? <StatusChip status={String(selected[col.field])} />
                  : String(cellValue(selected, col))}
              </Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
          {selected && (
            <Button
              variant="contained"
              onClick={() => {
                setViewOpen(false)
                openEdit(selected)
              }}
              sx={primaryButtonSx}
            >
              Edit
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Delete this invoice? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => selected && deleteMutation.mutate(String(selected.id), {
              onSuccess: () => setDeleteOpen(false),
            })}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  )
}
