import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import NavigationIcon from '@mui/icons-material/Navigation'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import PhoneIcon from '@mui/icons-material/Phone'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { StatusChip } from '@/components/ui/StatusChip'
import { RoleGuard } from '@/routes/RoleGuard'
import { RouteMap } from '@/components/route/RouteMap'
import { DeliverySummaryCards } from '@/components/route/DeliverySummaryCards'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useSimulatedMovement } from '@/hooks/useSimulatedMovement'
import { buildGoogleMapsNavUrl, formatDistance, formatDuration } from '@/utils/geo'
import { useManagedRoutes, computeRouteProgress } from './useManagedRoutes'
import { findVehicle, findWarehouse } from './routeGeoData'
import { v } from '@/theme/cssVars'
import type { RouteStop } from '@/types/route'

export function RouteExecutionPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'salesman', 'deliveryAgent']} redirectPath="/route-sales/my-routes" redirectLabel="Go to My Routes">
      <RouteExecutionContent />
    </RoleGuard>
  )
}

function RouteExecutionContent() {
  const { routeId } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { routes, updateStopStatus, startRoute } = useManagedRoutes()

  const route = routes.find((r) => r.id === routeId)

  const [gpsEnabled, setGpsEnabled] = useState(false)
  const [simulateEnabled, setSimulateEnabled] = useState(false)
  const [sheetExpanded, setSheetExpanded] = useState(true)
  const [, setNowTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setNowTick((n) => n + 1), 20000)
    return () => clearInterval(id)
  }, [])

  const geo = useGeolocation(gpsEnabled && !simulateEnabled)
  const sim = useSimulatedMovement(route?.polyline ?? [], simulateEnabled, 26)

  const warehouse = route ? findWarehouse(route.warehouseId) : undefined
  const vehicle = route ? findVehicle(route.vehicleId) : undefined

  const currentLocation = simulateEnabled ? sim.position : gpsEnabled ? geo.position : null

  const progress = useMemo(() => (route ? computeRouteProgress(route) : null), [route])

  const nextStop: RouteStop | undefined = route?.stops.find((s) => s.status === 'in_progress') ?? route?.stops.find((s) => s.status === 'pending')

  const elapsedMins = route?.startedAt ? (Date.now() - new Date(route.startedAt).getTime()) / 60000 : 0

  if (!route || !progress) {
    return (
      <PageShell title="Route Not Found" breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'My Routes', path: '/route-sales/my-routes' }]}>
        <Paper sx={{ ...whiteCardSx, p: 4, textAlign: 'center', maxWidth: 480, mx: 'auto' }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>This route could not be found.</Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/route-sales/my-routes')} sx={primaryButtonSx}>Back to My Routes</Button>
        </Paper>
      </PageShell>
    )
  }

  const pendingStops = route.stops.filter((s) => s.status === 'pending' || s.status === 'in_progress').sort((a, b) => a.sequence - b.sequence)
  const navOrigin = currentLocation ?? nextStop ?? warehouse ?? { lat: 11.2588, lng: 75.7804 }
  const navUrl = buildGoogleMapsNavUrl(navOrigin, pendingStops)

  const handleStartNavigation = () => {
    window.open(navUrl, '_blank', 'noopener,noreferrer')
  }

  const sheetContent = (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{route.name}</Typography>
          <Typography variant="caption" color="text.secondary">{route.code} · {vehicle?.name} ({vehicle?.plateNumber})</Typography>
        </Box>
        <StatusChip status={route.status} />
      </Box>

      <DeliverySummaryCards
        distanceKm={progress.distanceCoveredKm}
        elapsedMins={elapsedMins}
        orders={progress.totalOrders}
        sales={progress.totalSales}
        collections={progress.totalCollections}
        mini
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mt: 2, mb: 1 }}>
        <Chip
          icon={<GpsFixedIcon sx={{ fontSize: 15 }} />}
          label="Real GPS"
          size="small"
          color={gpsEnabled && !simulateEnabled ? 'primary' : 'default'}
          onClick={() => { setGpsEnabled((v2) => !v2); if (!gpsEnabled) setSimulateEnabled(false) }}
        />
        <Chip
          icon={<MyLocationIcon sx={{ fontSize: 15 }} />}
          label="Simulate Movement"
          size="small"
          color={simulateEnabled ? 'primary' : 'default'}
          onClick={() => { setSimulateEnabled((v2) => !v2); if (!simulateEnabled) setGpsEnabled(false) }}
        />
        {geo.error && gpsEnabled && !simulateEnabled && (
          <Typography variant="caption" color="error">{geo.error}</Typography>
        )}
      </Box>

      {(route.status === 'draft' || route.status === 'scheduled') && (
        <Button fullWidth variant="contained" color="primary" startIcon={<PlayArrowIcon />} onClick={() => startRoute(route.id)} sx={{ ...primaryButtonSx, mb: 1.5 }}>
          Start Route
        </Button>
      )}

      <Button
        fullWidth
        variant="contained"
        color="secondary"
        startIcon={<NavigationIcon />}
        onClick={handleStartNavigation}
        disabled={pendingStops.length === 0}
        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, py: 1.1, mb: 2 }}
      >
        Start Navigation ({pendingStops.length} stop{pendingStops.length === 1 ? '' : 's'} left)
      </Button>

      {nextStop && (
        <Paper sx={{ p: 1.75, mb: 2, borderRadius: '14px', bgcolor: 'color-mix(in srgb, var(--rs-secondary) 10%, var(--rs-surface))', border: `1px solid ${v.border}` }}>
          <Typography variant="caption" sx={{ color: v.textSecondary, fontWeight: 600 }}>NEXT STOP · #{nextStop.sequence}</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{nextStop.name}</Typography>
          <Typography variant="caption" color="text.secondary">{nextStop.address}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>{formatDistance(nextStop.legDistanceKm)} · ETA {formatDuration(nextStop.plannedEtaMins)}</Typography>
          </Box>
        </Paper>
      )}

      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Delivery Sequence</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: isMobile ? 'none' : 320, overflow: isMobile ? 'visible' : 'auto', pr: 0.5 }}>
        {route.stops.map((stop) => {
          const isCurrent = stop.id === nextStop?.id
          const isDone = stop.status === 'completed' || stop.status === 'skipped'
          return (
            <Paper
              key={stop.id}
              elevation={0}
              sx={{
                p: 1.25,
                borderRadius: '12px',
                border: `1px solid ${isCurrent ? v.primary : v.border}`,
                bgcolor: isCurrent ? 'color-mix(in srgb, var(--rs-primary) 6%, var(--rs-surface))' : v.surface,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: v.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                    {stop.sequence}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{stop.name}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>{stop.address}</Typography>
                  </Box>
                </Box>
                <StatusChip status={stop.status} />
              </Box>
              {!isDone && (
                <Box sx={{ display: 'flex', gap: 0.75, mt: 1 }}>
                  <IconButton size="small" href={`tel:${stop.phone}`} sx={{ border: `1px solid ${v.border}`, borderRadius: '8px' }}>
                    <PhoneIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                    onClick={() => updateStopStatus(route.id, stop.id, 'completed')}
                    sx={{ textTransform: 'none', borderRadius: '8px', flex: 1, fontWeight: 600, fontSize: '0.72rem' }}
                  >
                    Complete
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon sx={{ fontSize: 16 }} />}
                    onClick={() => updateStopStatus(route.id, stop.id, 'skipped')}
                    sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.72rem' }}
                  >
                    Skip
                  </Button>
                </Box>
              )}
            </Paper>
          )
        })}
      </Box>
    </>
  )

  return (
    <PageShell
      title={route.name}
      subtitle={`${route.driverName} · ${route.deliveryDate}`}
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'My Routes', path: '/route-sales/my-routes' },
        { label: route.code },
      ]}
      actions={
        <Button variant="outlined" color="secondary" startIcon={<ArrowBackIcon />} onClick={() => navigate('/route-sales/my-routes')} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}>
          Back
        </Button>
      }
    >
      {isMobile ? (
        <Box sx={{ position: 'relative' }}>
          <RouteMap
            warehouse={warehouse}
            stops={route.stops}
            polyline={route.polyline}
            currentLocation={currentLocation ?? undefined}
            highlightStopId={nextStop?.id}
            height={340}
            fitKey={route.id}
          />

          <motion.div
            initial={false}
            animate={{ height: sheetExpanded ? '70vh' : 220 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'sticky',
              bottom: 0,
              marginTop: -20,
              background: 'var(--rs-surface)',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              boxShadow: '0 -8px 24px rgba(0,0,0,0.12)',
              overflow: 'auto',
              zIndex: 5,
              padding: '8px 16px 20px',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }} onClick={() => setSheetExpanded((s) => !s)}>
              {sheetExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
            </Box>
            {sheetContent}
          </motion.div>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ flex: 1.4 }}>
            <RouteMap
              warehouse={warehouse}
              stops={route.stops}
              polyline={route.polyline}
              currentLocation={currentLocation ?? undefined}
              highlightStopId={nextStop?.id}
              height={620}
              fitKey={route.id}
            />
          </Box>
          <Paper sx={{ ...whiteCardSx, flex: 1, p: 2.5, maxHeight: 620, overflow: 'auto' }}>
            {sheetContent}
          </Paper>
        </Box>
      )}
    </PageShell>
  )
}
