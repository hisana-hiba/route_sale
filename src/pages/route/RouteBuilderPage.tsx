import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Slider,
  TextField,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import TripOriginIcon from '@mui/icons-material/TripOrigin'
import FlagIcon from '@mui/icons-material/Flag'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import PersonIcon from '@mui/icons-material/Person'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { RoleGuard } from '@/routes/RoleGuard'
import { RouteMap } from '@/components/route/RouteMap'
import { RouteSummaryBar } from '@/components/route/RouteSummaryBar'
import { CUSTOMERS, DRIVERS, VEHICLES, WAREHOUSES } from './routeGeoData'
import { useManagedRoutes } from './useManagedRoutes'
import { customersAlongRoute, estimateDurationMins, estimateLegDistanceKm, formatDistance, haversineKm } from '@/utils/geo'
import { fetchDrivingRoute } from '@/utils/osrm'
import type { LatLng, RouteStop, WarehouseRecord } from '@/types/route'
import { v, mix } from '@/theme/cssVars'
import { colors } from '@/theme/palette'

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

/** Named places that can be used as route start / end */
const ROUTE_LOCATIONS: WarehouseRecord[] = [
  ...WAREHOUSES,
  { id: 'loc-elathur', name: 'Elathur Junction', address: 'Elathur, Kozhikode', lat: 11.3129, lng: 75.7659 },
  { id: 'loc-beypore', name: 'Beypore Harbour', address: 'Beypore, Kozhikode', lat: 11.1706, lng: 75.8081 },
  { id: 'loc-thondayad', name: 'Thondayad Junction', address: 'Thondayad, Kozhikode', lat: 11.2739, lng: 75.7965 },
  { id: 'loc-meenchanda', name: 'Meenchanda', address: 'Meenchanda, Kozhikode', lat: 11.2915, lng: 75.7965 },
]

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

  const [routeName, setRouteName] = useState('')
  const [startId, setStartId] = useState(ROUTE_LOCATIONS[0].id)
  const [endId, setEndId] = useState(ROUTE_LOCATIONS[1].id)
  const [corridorKm, setCorridorKm] = useState(3)
  const [vehicleId, setVehicleId] = useState(VEHICLES[0].id)
  const [driverId, setDriverId] = useState(DRIVERS[0].id)
  const [deliveryDate, setDeliveryDate] = useState(todayStr())
  const [excludedIds, setExcludedIds] = useState<string[]>([])

  const [stops, setStops] = useState<RouteStop[]>([])
  const [totalDistanceKm, setTotalDistanceKm] = useState(0)
  const [totalDurationMins, setTotalDurationMins] = useState(0)
  const [polyline, setPolyline] = useState<[number, number][]>([])
  const [routingSource, setRoutingSource] = useState<'osrm' | 'estimate'>('estimate')
  const [loadingRoute, setLoadingRoute] = useState(false)
  const [selectedStopId, setSelectedStopId] = useState<string | undefined>()

  const start = useMemo(() => ROUTE_LOCATIONS.find((l) => l.id === startId)!, [startId])
  const end = useMemo(() => ROUTE_LOCATIONS.find((l) => l.id === endId)!, [endId])
  const driver = useMemo(() => DRIVERS.find((d) => d.id === driverId)!, [driverId])

  const warehouseIdForSave = WAREHOUSES.some((w) => w.id === startId) ? startId : WAREHOUSES[0].id

  const alongRoute = useMemo(() => {
    if (startId === endId) return []
    return customersAlongRoute(start, end, CUSTOMERS, corridorKm).filter((c) => !excludedIds.includes(c.id))
  }, [start, end, startId, endId, corridorKm, excludedIds])

  const corridorSpanKm = useMemo(() => haversineKm(start, end), [start, end])

  // Rebuild ordered stops + path whenever the corridor match set changes
  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (startId === endId || alongRoute.length === 0) {
        setStops([])
        setTotalDistanceKm(corridorSpanKm)
        setTotalDurationMins(estimateDurationMins(corridorSpanKm * 1.35))
        setPolyline([[start.lat, start.lng], [end.lat, end.lng]])
        setRoutingSource('estimate')
        setLoadingRoute(false)
        return
      }

      setLoadingRoute(true)

      let current: LatLng = start
      const prelim: RouteStop[] = alongRoute.map((c, idx) => {
        const legDistanceKm = estimateLegDistanceKm(current, c)
        current = c
        return {
          id: `stop-${c.id}`,
          customerId: c.id,
          name: c.name,
          address: c.address,
          phone: c.phone,
          lat: c.lat,
          lng: c.lng,
          sequence: idx + 1,
          status: 'pending',
          plannedEtaMins: Math.max(1, Math.round(estimateDurationMins(legDistanceKm))),
          legDistanceKm,
          orderValue: c.avgOrderValue,
          collectionAmount: 0,
        }
      })

      const points: LatLng[] = [start, ...alongRoute, end]
      const routing = await fetchDrivingRoute(points)
      if (cancelled) return

      const nextStops = prelim.map((s, idx) => {
        const leg = routing.legs[idx]
        return leg ? { ...s, legDistanceKm: leg.distanceKm, plannedEtaMins: Math.max(1, Math.round(leg.durationMins)) } : s
      })

      setStops(nextStops)
      setTotalDistanceKm(routing.distanceKm)
      setTotalDurationMins(routing.durationMins)
      setPolyline(routing.geometry.length > 1 ? routing.geometry : points.map((p) => [p.lat, p.lng] as [number, number]))
      setRoutingSource(routing.source)
      setLoadingRoute(false)
    }

    void run()
    return () => { cancelled = true }
  }, [alongRoute, start, end, startId, endId, corridorSpanKm])

  const handleExclude = (customerId: string) => {
    setExcludedIds((prev) => [...prev, customerId])
  }

  const handleSave = () => {
    if (stops.length === 0 || startId === endId) return
    const name =
      routeName.trim() ||
      `${start.name.split(' ')[0]} → ${end.name.split(' ')[0]} · ${deliveryDate}`

    createRoute({
      name,
      warehouseId: warehouseIdForSave,
      vehicleId,
      driverId,
      driverName: driver.name,
      driverRole: driver.role,
      deliveryDate,
      stops,
      totalDistanceKm,
      totalDurationMins,
      polyline,
      optimized: true,
      routingSource,
    })
    navigate('/route-sales/route-history')
  }

  const mapWarehouse: WarehouseRecord = {
    ...start,
    name: `Start · ${start.name}`,
  }

  return (
    <PageShell
      title="Route Creation"
      subtitle="Set start and end locations — shops along the path are auto-assigned in travel order"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Route Management', path: '/route-sales/route-history' },
        { label: 'Route Builder' },
      ]}
      actions={
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/route-sales/route-history')}
          sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
        >
          Back to Route History
        </Button>
      }
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ ...whiteCardSx, p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              Route endpoints
            </Typography>

            <TextField
              label="Route Name"
              fullWidth
              size="small"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder="Optional — auto-named from start → end"
              sx={{ mb: 2 }}
            />

            <TextField
              select
              fullWidth
              size="small"
              label="Start Location"
              value={startId}
              onChange={(e) => {
                setStartId(e.target.value)
                setExcludedIds([])
              }}
              sx={{ mb: 2 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <TripOriginIcon sx={{ color: colors.primary, fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
            >
              {ROUTE_LOCATIONS.map((loc) => (
                <MenuItem key={loc.id} value={loc.id} disabled={loc.id === endId}>
                  {loc.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              size="small"
              label="End Location"
              value={endId}
              onChange={(e) => {
                setEndId(e.target.value)
                setExcludedIds([])
              }}
              sx={{ mb: 2 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <FlagIcon sx={{ color: colors.secondary, fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
            >
              {ROUTE_LOCATIONS.map((loc) => (
                <MenuItem key={loc.id} value={loc.id} disabled={loc.id === startId}>
                  {loc.name}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ mb: 2.5, px: 0.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: v.textSecondary }}>
                  Corridor width
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: colors.primary }}>
                  {corridorKm.toFixed(1)} km
                </Typography>
              </Box>
              <Slider
                value={corridorKm}
                onChange={(_, val) => {
                  setCorridorKm(val as number)
                  setExcludedIds([])
                }}
                min={0.5}
                max={8}
                step={0.5}
                marks={[
                  { value: 1, label: '1' },
                  { value: 3, label: '3' },
                  { value: 5, label: '5' },
                  { value: 8, label: '8' },
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v} km`}
              />
              <Typography variant="caption" color="text.secondary">
                Shops within this distance of the start→end line are included ({formatDistance(corridorSpanKm)} straight-line span).
              </Typography>
            </Box>

            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Driver / Salesman"
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ fontSize: 18, color: v.textMuted }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                >
                  {DRIVERS.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Vehicle"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalShippingIcon sx={{ fontSize: 18, color: v.textMuted }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                >
                  {VEHICLES.map((veh) => (
                    <MenuItem key={veh.id} value={veh.id} disabled={veh.status === 'maintenance'}>
                      {veh.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Delivery Date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            </Grid>

            {startId === endId ? (
              <Alert severity="warning" sx={{ borderRadius: '10px' }}>
                Choose different start and end locations.
              </Alert>
            ) : alongRoute.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: '10px' }}>
                No shops fall within {corridorKm} km of this path. Widen the corridor or pick another end point.
              </Alert>
            ) : (
              <Alert severity="success" icon={<StorefrontIcon />} sx={{ borderRadius: '10px' }}>
                {alongRoute.length} shop{alongRoute.length === 1 ? '' : 's'} auto-assigned in travel order from start to end.
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <RouteMap
            warehouse={mapWarehouse}
            stops={stops}
            polyline={polyline}
            highlightStopId={selectedStopId}
            onStopClick={(s) => setSelectedStopId(s.id)}
            height={360}
            fitKey={`${startId}-${endId}-${stops.length}`}
          />
          <Box sx={{ mt: 1.5 }}>
            <RouteSummaryBar
              stopCount={stops.length}
              distanceKm={totalDistanceKm}
              durationMins={totalDurationMins}
              optimized
              routingSource={routingSource}
              loading={loadingRoute}
            />
          </Box>
        </Grid>

        <Grid size={12}>
          <Paper sx={{ ...whiteCardSx, p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Shops along route
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ordered by latitude/longitude progress from <strong>{start.name}</strong> to <strong>{end.name}</strong>
                </Typography>
              </Box>
              <Chip
                size="small"
                label={`${stops.length} assigned`}
                sx={{ bgcolor: mix.primary(10), color: colors.primary, fontWeight: 700 }}
              />
            </Box>

            {stops.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <StorefrontIcon sx={{ fontSize: 36, color: v.textMuted, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Select start and end locations to list matching customers.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {stops.map((stop, idx) => {
                  const match = alongRoute.find((c) => c.id === stop.customerId)
                  const isSelected = selectedStopId === stop.id
                  return (
                    <Box
                      key={stop.id}
                      onClick={() => setSelectedStopId(stop.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.25,
                        borderRadius: '12px',
                        border: `1px solid ${isSelected ? colors.primary : v.border}`,
                        bgcolor: isSelected ? mix.primary(6) : v.surface,
                        cursor: 'pointer',
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          bgcolor: colors.primary,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                          {stop.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {stop.address}
                          {match ? ` · ${formatDistance(match.distanceFromPathKm)} off path` : ''}
                          {' · '}
                          {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                        </Typography>
                      </Box>
                      <Chip label={formatDistance(stop.legDistanceKm)} size="small" variant="outlined" sx={{ fontSize: '10px' }} />
                      <Button
                        size="small"
                        color="inherit"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExclude(stop.customerId)
                        }}
                        sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                      >
                        Remove
                      </Button>
                    </Box>
                  )
                })}
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2.5, gap: 1 }}>
              {excludedIds.length > 0 && (
                <Button size="small" onClick={() => setExcludedIds([])} sx={{ textTransform: 'none' }}>
                  Restore removed ({excludedIds.length})
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={stops.length === 0 || loadingRoute || startId === endId}
                onClick={handleSave}
                sx={primaryButtonSx}
              >
                Save Route ({stops.length} stops)
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </PageShell>
  )
}
