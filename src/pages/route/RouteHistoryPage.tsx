import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Tooltip,
  Typography,
  LinearProgress,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import MapIcon from '@mui/icons-material/Map'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { DataPanel } from '@/components/ui/DataPanel'
import { StatusChip } from '@/components/ui/StatusChip'
import { RoleGuard } from '@/routes/RoleGuard'
import { RouteMap } from '@/components/route/RouteMap'
import { formatCurrency } from '@/utils/export'
import { formatDistance, formatDuration } from '@/utils/geo'
import { useManagedRoutes, computeRouteProgress } from './useManagedRoutes'
import { DRIVERS, VEHICLES, WAREHOUSES, findVehicle, findWarehouse } from './routeGeoData'
import type { ManagedRoute, ManagedRouteStatus } from '@/types/route'
import { v } from '@/theme/cssVars'

const STATUS_OPTIONS: ManagedRouteStatus[] = ['draft', 'scheduled', 'in_progress', 'completed', 'cancelled']

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export function RouteHistoryPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'manager']} redirectPath="/route-sales/my-routes" redirectLabel="Go to My Routes">
      <RouteHistoryContent />
    </RoleGuard>
  )
}

function RouteHistoryContent() {
  const navigate = useNavigate()
  const { routes, deleteRoute, assignDriver } = useManagedRoutes()

  const [tabIndex, setTabIndex] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [driverFilter, setDriverFilter] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignDriverId, setAssignDriverId] = useState(DRIVERS[0].id)
  const [mapRoute, setMapRoute] = useState<ManagedRoute | null>(null)

  const isHistory = tabIndex === 1

  const filteredRoutes = useMemo(() => {
    const q = search.toLowerCase()
    return routes
      .filter((r) => (isHistory ? r.deliveryDate < todayStr() || r.status === 'completed' || r.status === 'cancelled' : r.deliveryDate >= todayStr() && r.status !== 'completed' && r.status !== 'cancelled'))
      .filter((r) => !q || r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.driverName.toLowerCase().includes(q))
      .filter((r) => !statusFilter || r.status === statusFilter)
      .filter((r) => !driverFilter || r.driverId === driverFilter)
      .filter((r) => !warehouseFilter || r.warehouseId === warehouseFilter)
      .sort((a, b) => (a.deliveryDate < b.deliveryDate ? 1 : -1))
  }, [routes, isHistory, search, statusFilter, driverFilter, warehouseFilter])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.length === filteredRoutes.length ? [] : filteredRoutes.map((r) => r.id)))
  }

  const handleAssign = () => {
    const driver = DRIVERS.find((d) => d.id === assignDriverId)
    if (!driver || selectedIds.length === 0) return
    assignDriver(selectedIds, driver.id, driver.name, driver.role)
    setAssignOpen(false)
    setSelectedIds([])
  }

  return (
    <PageShell
      title="Route History"
      subtitle="Search, filter, and assign delivery routes to drivers and salesmen"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Route Management' },
        { label: 'Route History' },
      ]}
      actions={
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/route-sales/route-builder')} sx={primaryButtonSx}>
          Create Route
        </Button>
      }
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabIndex} onChange={(_, idx) => { setTabIndex(idx); setSelectedIds([]) }}>
          <Tab label="Active & Upcoming" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Route History" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Box>

      <Paper sx={{ p: 2, mb: 2, ...whiteCardSx, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
        <TextField
          placeholder="Search by route, code or driver..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: v.textMuted }} /></InputAdornment> } }}
          sx={{ minWidth: 240, flex: 1, maxWidth: 320 }}
        />
        <TextField select label="Status" size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="">All Status</MenuItem>
          {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s.replace('_', ' ')}</MenuItem>)}
        </TextField>
        <TextField select label="Driver" size="small" value={driverFilter} onChange={(e) => setDriverFilter(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">All Drivers</MenuItem>
          {DRIVERS.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
        </TextField>
        <TextField select label="Warehouse" size="small" value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="">All Warehouses</MenuItem>
          {WAREHOUSES.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
        </TextField>
        <Box sx={{ flex: 1 }} />
        {selectedIds.length > 0 && (
          <Button variant="contained" color="secondary" startIcon={<AssignmentIndIcon />} onClick={() => setAssignOpen(true)} sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 600 }}>
            Assign {selectedIds.length} Route{selectedIds.length > 1 ? 's' : ''} to Driver
          </Button>
        )}
      </Paper>

      <DataPanel title={isHistory ? 'Route History' : 'Active & Upcoming Routes'} subtitle={`${filteredRoutes.length} route(s) found`} noPadding>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={filteredRoutes.length > 0 && selectedIds.length === filteredRoutes.length}
                    indeterminate={selectedIds.length > 0 && selectedIds.length < filteredRoutes.length}
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Route</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Driver</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Stops</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Distance / ETA</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRoutes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No routes match your filters</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoutes.map((route) => {
                  const progress = computeRouteProgress(route)
                  const vehicle = findVehicle(route.vehicleId)
                  return (
                    <TableRow key={route.id} hover selected={selectedIds.includes(route.id)}>
                      <TableCell padding="checkbox">
                        <Checkbox checked={selectedIds.includes(route.id)} onChange={() => toggleSelect(route.id)} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{route.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{route.code}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{route.driverName}</Typography>
                        <Typography variant="caption" color="text.secondary">{route.driverRole === 'deliveryAgent' ? 'Driver' : 'Salesman'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{vehicle?.name ?? '—'}</Typography>
                        <Typography variant="caption" color="text.secondary">{vehicle?.plateNumber}</Typography>
                      </TableCell>
                      <TableCell>{route.deliveryDate}</TableCell>
                      <TableCell>{progress.completed + progress.skipped}/{progress.totalStops}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDistance(route.totalDistanceKm)}</Typography>
                        <Typography variant="caption" color="text.secondary">{formatDuration(route.totalDurationMins)}</Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 100 }}>
                        <LinearProgress variant="determinate" value={progress.progressPct} sx={{ height: 6, borderRadius: 3, mb: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">{progress.progressPct}%</Typography>
                      </TableCell>
                      <TableCell><StatusChip status={route.status} /></TableCell>
                      <TableCell align="right">
                        <Tooltip title="View on Map">
                          <IconButton size="small" onClick={() => setMapRoute(route)}>
                            <MapIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Route">
                          <IconButton size="small" color="error" onClick={() => deleteRoute(route.id)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DataPanel>

      {/* Bulk Assign Dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Assign Route(s) to Driver</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '10px !important' }}>
          <Typography variant="body2" color="text.secondary">
            {selectedIds.length} route(s) selected will be reassigned to the chosen driver or salesman.
          </Typography>
          <TextField select label="Driver / Salesman" fullWidth value={assignDriverId} onChange={(e) => setAssignDriverId(e.target.value)}>
            {DRIVERS.map((d) => (
              <MenuItem key={d.id} value={d.id}>{d.name} ({d.role === 'deliveryAgent' ? 'Driver' : 'Salesman'})</MenuItem>
            ))}
          </TextField>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selectedIds.map((id) => {
              const r = routes.find((rt) => rt.id === id)
              return r ? <Chip key={id} label={r.code} size="small" /> : null
            })}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleAssign} sx={primaryButtonSx}>Assign</Button>
        </DialogActions>
      </Dialog>

      {/* View on Map Dialog */}
      <Dialog open={!!mapRoute} onClose={() => setMapRoute(null)} maxWidth="md" fullWidth>
        {mapRoute && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{mapRoute.name} — {mapRoute.code}</DialogTitle>
            <DialogContent>
              <RouteMap warehouse={findWarehouse(mapRoute.warehouseId)} stops={mapRoute.stops} polyline={mapRoute.polyline} height={440} fitKey={mapRoute.id} />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setMapRoute(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </PageShell>
  )
}
