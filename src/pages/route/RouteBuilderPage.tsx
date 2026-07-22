import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import SaveIcon from '@mui/icons-material/Save'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import SearchIcon from '@mui/icons-material/Search'
import WarehouseIcon from '@mui/icons-material/Warehouse'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import PersonIcon from '@mui/icons-material/Person'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { RoleGuard } from '@/routes/RoleGuard'
import { RouteMap } from '@/components/route/RouteMap'
import { StopReorderList } from '@/components/route/StopReorderList'
import { RouteSummaryBar } from '@/components/route/RouteSummaryBar'
import { CUSTOMERS, DRIVERS, VEHICLES, WAREHOUSES } from './routeGeoData'
import { useManagedRoutes } from './useManagedRoutes'
import { computeRoute, reorderRoute } from './routeCompute'
import type { RouteStop } from '@/types/route'
import { v } from '@/theme/cssVars'

const STEPS = ['Route Details', 'Select Customers', 'Sequence & Optimize']

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export function RouteBuilderPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'manager']} redirectPath="/route-sales/my-routes" redirectLabel="Go to My Routes">
      <RouteBuilderContent />
    </RoleGuard>
  )
}

function RouteBuilderContent() {
  const navigate = useNavigate()
  const { createRoute } = useManagedRoutes()

  const [activeStep, setActiveStep] = useState(0)
  const [routeName, setRouteName] = useState('')
  const [warehouseId, setWarehouseId] = useState(WAREHOUSES[0].id)
  const [vehicleId, setVehicleId] = useState(VEHICLES[0].id)
  const [driverId, setDriverId] = useState(DRIVERS[0].id)
  const [deliveryDate, setDeliveryDate] = useState(todayStr())

  const [search, setSearch] = useState('')
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([])

  const [stops, setStops] = useState<RouteStop[]>([])
  const [totalDistanceKm, setTotalDistanceKm] = useState(0)
  const [totalDurationMins, setTotalDurationMins] = useState(0)
  const [polyline, setPolyline] = useState<[number, number][]>([])
  const [optimized, setOptimized] = useState(false)
  const [routingSource, setRoutingSource] = useState<'osrm' | 'estimate'>('estimate')
  const [loadingRoute, setLoadingRoute] = useState(false)
  const [selectedStopId, setSelectedStopId] = useState<string | undefined>()

  const warehouse = useMemo(() => WAREHOUSES.find((w) => w.id === warehouseId)!, [warehouseId])
  const driver = useMemo(() => DRIVERS.find((d) => d.id === driverId)!, [driverId])

  const filteredCustomers = useMemo(() => {
    const q = search.toLowerCase()
    return CUSTOMERS.filter((c) => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
  }, [search])

  const toggleCustomer = (id: string) => {
    setSelectedCustomerIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const previewStops: RouteStop[] = useMemo(
    () =>
      selectedCustomerIds.map((id, idx) => {
        const c = CUSTOMERS.find((cust) => cust.id === id)!
        return {
          id: `preview-${id}`,
          customerId: id,
          name: c.name,
          address: c.address,
          phone: c.phone,
          lat: c.lat,
          lng: c.lng,
          sequence: idx + 1,
          status: 'pending',
          plannedEtaMins: 0,
          legDistanceKm: 0,
          orderValue: c.avgOrderValue,
          collectionAmount: 0,
        }
      }),
    [selectedCustomerIds],
  )

  const runCompute = async (optimize: boolean) => {
    const customers = CUSTOMERS.filter((c) => selectedCustomerIds.includes(c.id))
    if (customers.length === 0) return
    setLoadingRoute(true)
    const existingIdByCustomer: Record<string, string> = {}
    stops.forEach((s) => (existingIdByCustomer[s.customerId] = s.id))
    const result = await computeRoute(warehouse, customers, optimize, existingIdByCustomer)
    setStops(result.stops)
    setTotalDistanceKm(result.totalDistanceKm)
    setTotalDurationMins(result.totalDurationMins)
    setPolyline(result.polyline)
    setOptimized(optimize)
    setRoutingSource(result.routingSource)
    setLoadingRoute(false)
  }

  const handleGoToSequence = async () => {
    setActiveStep(2)
    await runCompute(true)
  }

  const handleReorder = async (newOrder: RouteStop[]) => {
    setStops(newOrder.map((s, idx) => ({ ...s, sequence: idx + 1 })))
    setLoadingRoute(true)
    const result = await reorderRoute(warehouse, newOrder)
    setStops(result.stops)
    setTotalDistanceKm(result.totalDistanceKm)
    setTotalDurationMins(result.totalDurationMins)
    setPolyline(result.polyline)
    setOptimized(false)
    setRoutingSource(result.routingSource)
    setLoadingRoute(false)
  }

  const handleRemoveStop = (stopId: string) => {
    const stop = stops.find((s) => s.id === stopId)
    if (!stop) return
    setSelectedCustomerIds((prev) => prev.filter((id) => id !== stop.customerId))
    const remaining = stops.filter((s) => s.id !== stopId)
    if (remaining.length === 0) {
      setStops([])
      setTotalDistanceKm(0)
      setTotalDurationMins(0)
      setPolyline([])
      return
    }
    void handleReorder(remaining)
  }

  const handleSave = () => {
    if (stops.length === 0) return
    createRoute({
      name: routeName || `Route ${warehouse.name.split(' ')[0]} - ${deliveryDate}`,
      warehouseId,
      vehicleId,
      driverId,
      driverName: driver.name,
      driverRole: driver.role,
      deliveryDate,
      stops,
      totalDistanceKm,
      totalDurationMins,
      polyline,
      optimized,
      routingSource,
    })
    navigate('/route-sales/route-planner')
  }

  return (
    <PageShell
      title="Route Builder"
      subtitle="Create an optimized delivery route with warehouse, vehicle, driver and customer stops"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Route Management', path: '/route-sales/route-planner' },
        { label: 'Route Builder' },
      ]}
      actions={
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/route-sales/route-planner')}
          sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
        >
          Back to Route Planner
        </Button>
      }
    >
      <Paper sx={{ ...whiteCardSx, mb: 3, py: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {activeStep === 0 && (
        <Paper sx={{ p: 4, ...whiteCardSx, maxWidth: 760, mx: 'auto' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Route Details</Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField label="Route Name" fullWidth value={routeName} onChange={(e) => setRouteName(e.target.value)} placeholder="e.g. North Kozhikode Morning Route" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Warehouse"
                fullWidth
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><WarehouseIcon color="action" /></InputAdornment> } }}
              >
                {WAREHOUSES.map((w) => (
                  <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Vehicle"
                fullWidth
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><LocalShippingIcon color="action" /></InputAdornment> } }}
              >
                {VEHICLES.map((veh) => (
                  <MenuItem key={veh.id} value={veh.id} disabled={veh.status === 'maintenance'}>
                    {veh.name} ({veh.plateNumber}) {veh.status === 'maintenance' ? '— In Maintenance' : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Driver / Salesman"
                fullWidth
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment> } }}
              >
                {DRIVERS.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.name} ({d.role === 'deliveryAgent' ? 'Driver' : 'Salesman'})</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Delivery Date"
                type="date"
                fullWidth
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button variant="contained" color="primary" endIcon={<ArrowForwardIcon />} onClick={() => setActiveStep(1)} sx={primaryButtonSx}>
                Next: Select Customers
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {activeStep === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ ...whiteCardSx, p: 0, overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: `1px solid ${v.border}` }}>
                <TextField
                  placeholder="Search customers by name, area or category..."
                  fullWidth
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: v.textMuted }} /></InputAdornment> } }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">{selectedCustomerIds.length} customer(s) selected</Typography>
                  <Button size="small" onClick={() => setSelectedCustomerIds(filteredCustomers.map((c) => c.id))} sx={{ textTransform: 'none' }}>Select all</Button>
                </Box>
              </Box>
              <Box sx={{ maxHeight: 460, overflow: 'auto', p: 1 }}>
                {filteredCustomers.map((c) => {
                  const checked = selectedCustomerIds.includes(c.id)
                  return (
                    <Box
                      key={c.id}
                      onClick={() => toggleCustomer(c.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        bgcolor: checked ? 'color-mix(in srgb, var(--rs-primary) 8%, transparent)' : 'transparent',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Checkbox checked={checked} size="small" />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{c.name}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>{c.address}</Typography>
                      </Box>
                      <Chip label={c.category} size="small" variant="outlined" sx={{ fontSize: '10px' }} />
                    </Box>
                  )
                })}
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <RouteMap warehouse={warehouse} stops={previewStops} height={460} fitKey={selectedCustomerIds.length} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button variant="text" color="secondary" startIcon={<ArrowBackIcon />} onClick={() => setActiveStep(0)} sx={{ textTransform: 'none', fontWeight: 600 }}>
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                disabled={selectedCustomerIds.length === 0}
                onClick={handleGoToSequence}
                sx={primaryButtonSx}
              >
                Next: Sequence & Optimize
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}

      {activeStep === 2 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <RouteMap warehouse={warehouse} stops={stops} polyline={polyline} highlightStopId={selectedStopId} onStopClick={(s) => setSelectedStopId(s.id)} height={420} fitKey="sequence" />
            <Box sx={{ mt: 2 }}>
              <RouteSummaryBar stopCount={stops.length} distanceKm={totalDistanceKm} durationMins={totalDurationMins} optimized={optimized} routingSource={routingSource} loading={loadingRoute} />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ ...whiteCardSx, p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Delivery Sequence</Typography>
                <Button size="small" startIcon={<AutoAwesomeIcon />} onClick={() => runCompute(true)} disabled={loadingRoute} sx={{ textTransform: 'none', fontWeight: 600 }}>
                  Optimize Route
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                Drag stops to manually reorder, or let the optimizer find the shortest sequence.
              </Typography>
              <StopReorderList stops={stops} onReorder={handleReorder} onRemove={handleRemoveStop} onSelect={(s) => setSelectedStopId(s.id)} selectedId={selectedStopId} />
            </Paper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button variant="text" color="secondary" startIcon={<ArrowBackIcon />} onClick={() => setActiveStep(1)} sx={{ textTransform: 'none', fontWeight: 600 }}>
                Back
              </Button>
              <Button variant="contained" color="primary" startIcon={<SaveIcon />} disabled={stops.length === 0 || loadingRoute} onClick={handleSave} sx={primaryButtonSx}>
                Save Route
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}
    </PageShell>
  )
}
