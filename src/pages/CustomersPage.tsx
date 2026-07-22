import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Skeleton,
  TablePagination, IconButton, Tooltip, Typography,
} from '@mui/material'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, ICellRendererParams } from 'ag-grid-community'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { motion } from 'framer-motion'
import { PageShell, primaryButtonSx } from '@/components/ui/PageShell'
import { DashboardKpiCard } from '@/components/dashboard/DashboardKpiCard'
import { TopSalesShopsSection } from '@/components/customers/TopSalesShopsSection'
import { AddCustomerForm } from '@/components/flows/AddCustomerForm'
import { DataPanel } from '@/components/ui/DataPanel'
import { FilterBar } from '@/components/ui/FilterBar'
import { StatusChip } from '@/components/ui/StatusChip'
import { useCustomerFilters } from '@/hooks/useCustomerFilters'
import { useModuleData, formatStatValue } from '@/hooks/useModuleData'
import { getModuleConfig } from '@/config/modules'
import { dashboardGridSpacing } from '@/components/ui/cardStyles'
import { exportToExcel, exportToPdf, printTable, formatCurrency } from '@/utils/export'
import type { ColumnDef } from '@/types/module'
import { useAppStore } from '@/store/appStore'

const config = getModuleConfig('/customers/customer-list')

const KPI_TRENDS = [15.8, -3.2, 8.5, -6.3]
const KPI_ICONS = [PeopleOutlinedIcon, AccountBalanceWalletIcon, CreditCardOutlinedIcon, WarningAmberOutlinedIcon]

function cellValue(row: Record<string, unknown>, col: ColumnDef) {
  const v = row[col.field]
  if (col.type === 'currency') return formatCurrency(Number(v) || 0)
  if (col.type === 'status') return null
  return v ?? '—'
}

export function CustomersPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const themeMode = useAppStore((s) => s.themeMode)
  const themeVersion = useAppStore((s) => s.themeVersion)

  const {
    customFrom, customTo, applied,
    setCustomFrom, setCustomTo,
  } = useCustomerFilters('custom')

  const {
    data, isLoading, isFetching, refetch,
    page, setPage, pageSize, setPageSize,
    search, setSearch, statusFilter, setStatusFilter,
    deleteMutation,
  } = useModuleData(config, undefined, applied)

  const [addOpen, setAddOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    if ((location.state as { openCreate?: boolean })?.openCreate) {
      setAddOpen(true)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, location.pathname, navigate])

  const handleAddSuccess = () => {
    setAddOpen(false)
    queryClient.invalidateQueries({ queryKey: ['module', config.slug] })
    queryClient.invalidateQueries({ queryKey: ['top-sales-shops'] })
  }

  const ActionCell = useCallback((params: ICellRendererParams) => (
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
    { headerName: '', width: 80, pinned: 'right' as const, cellRenderer: ActionCell, sortable: false, filter: false },
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
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setAddOpen(true)}
          sx={primaryButtonSx}
        >
          Add Customer
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
              const Icon = KPI_ICONS[i % KPI_ICONS.length]
              return (
                <Grid key={stat.key} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <DashboardKpiCard
                      label={stat.label}
                      value={formatStatValue(data?.stats?.[stat.key], stat.format)}
                      trend={KPI_TRENDS[i % KPI_TRENDS.length]}
                      trendLabel="vs last period"
                      icon={<Icon />}
                      iconIndex={i}
                    />
                  </motion.div>
                </Grid>
              )
            })}
      </Grid>

      <TopSalesShopsSection filters={applied} />

      <DataPanel title="Customer Records" subtitle={`${data?.total ?? 0} total records`} noPadding>
        <Box sx={{ px: { xs: 1.5, md: 2.5 }, pt: 2 }}>
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            status={statusFilter}
            onStatusChange={setStatusFilter}
            statuses={config.statuses}
            dateFrom={customFrom}
            dateTo={customTo}
            onDateFromChange={setCustomFrom}
            onDateToChange={setCustomTo}
            onExportExcel={() => exportToExcel(rows, config.slug, exportCols)}
            onExportPdf={() => exportToPdf(rows, config.slug, config.title, exportCols)}
            onPrint={() => printTable(config.title)}
            onRefresh={() => refetch()}
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

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>New Customer</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <AddCustomerForm onSuccess={handleAddSuccess} onCancel={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Customer Details</DialogTitle>
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
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Delete this customer? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => selected && deleteMutation.mutate(String(selected.id), { onSuccess: () => setDeleteOpen(false) })}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  )
}
