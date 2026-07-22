import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import SearchIcon from '@mui/icons-material/Search'
import RouteIcon from '@mui/icons-material/Route'
import StorefrontIcon from '@mui/icons-material/Storefront'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import WarehouseIcon from '@mui/icons-material/Warehouse'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { StatusChip } from '@/components/ui/StatusChip'
import { RoleGuard } from '@/routes/RoleGuard'
import { useAuthStore } from '@/store/authStore'
import { useManagedRoutes, computeRouteProgress } from './useManagedRoutes'
import { DRIVERS, findVehicle, findWarehouse } from './routeGeoData'
import { formatDistance, formatDuration } from '@/utils/geo'
import { v } from '@/theme/cssVars'

function shiftDate(dateStr: string, days: number): string {
  return new Date(new Date(dateStr).getTime() + days * 86400000).toISOString().split('T')[0]
}

export function MyRoutesPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'salesman', 'deliveryAgent']}>
      <MyRoutesContent />
    </RoleGuard>
  )
}

function MyRoutesContent() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { routes } = useManagedRoutes()

  const isFieldStaff = user?.role === 'salesman' || user?.role === 'deliveryAgent'
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [search, setSearch] = useState('')
  const [driverFilter, setDriverFilter] = useState(isFieldStaff ? (user?.id ?? '') : '')

  const myRoutes = useMemo(() => {
    const q = search.toLowerCase()
    return routes
      .filter((r) => r.deliveryDate === date)
      .filter((r) => (isFieldStaff ? r.driverId === user?.id : !driverFilter || r.driverId === driverFilter))
      .filter((r) => !q || r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q))
      .sort((a, b) => (a.status === 'in_progress' ? -1 : b.status === 'in_progress' ? 1 : 0))
  }, [routes, date, isFieldStaff, driverFilter, user?.id, search])

  return (
    <PageShell
      title={isFieldStaff ? 'My Routes' : "Team's Routes"}
      subtitle="Assigned delivery routes, live progress, and navigation for the selected day"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Route Management' },
        { label: 'My Routes' },
      ]}
    >
      <Paper sx={{ p: 2, mb: 3, ...whiteCardSx, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" onClick={() => setDate((d) => shiftDate(d, -1))}><ChevronLeftIcon /></IconButton>
          <TextField
            type="date"
            size="small"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 170 }}
          />
          <IconButton size="small" onClick={() => setDate((d) => shiftDate(d, 1))}><ChevronRightIcon /></IconButton>
          <Button size="small" onClick={() => setDate(new Date().toISOString().split('T')[0])} sx={{ textTransform: 'none' }}>Today</Button>
        </Box>
        <TextField
          placeholder="Search routes..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: v.textMuted }} /></InputAdornment> } }}
          sx={{ minWidth: 200 }}
        />
        {!isFieldStaff && (
          <TextField select label="Driver" size="small" value={driverFilter} onChange={(e) => setDriverFilter(e.target.value)} sx={{ minWidth: 180 }}>
            <MenuItem value="">All Drivers</MenuItem>
            {DRIVERS.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
          </TextField>
        )}
      </Paper>

      {myRoutes.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', ...whiteCardSx }}>
          <RouteIcon sx={{ fontSize: 40, color: v.textMuted, mb: 1 }} />
          <Typography variant="body1" color="text.secondary">No routes assigned for this date</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {myRoutes.map((route) => {
            const progress = computeRouteProgress(route)
            const vehicle = findVehicle(route.vehicleId)
            const warehouse = findWarehouse(route.warehouseId)
            const nextStop = route.stops.find((s) => s.status === 'pending' || s.status === 'in_progress')

            return (
              <Grid key={route.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  sx={{
                    ...whiteCardSx,
                    p: 2.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: v.shadowMd },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.25 }}>{route.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{route.code} · {route.driverName}</Typography>
                    </Box>
                    <StatusChip status={route.status} />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: v.textSecondary }}>
                      <WarehouseIcon sx={{ fontSize: 15 }} />
                      <Typography variant="caption">{warehouse?.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: v.textSecondary }}>
                      <LocalShippingIcon sx={{ fontSize: 15 }} />
                      <Typography variant="caption">{vehicle?.name} · {vehicle?.plateNumber}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: v.textSecondary }}>
                      <StorefrontIcon sx={{ fontSize: 15 }} />
                      <Typography variant="caption">{progress.totalStops} stops · {formatDistance(route.totalDistanceKm)} · {formatDuration(route.totalDurationMins)}</Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">Progress</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{progress.completed + progress.skipped}/{progress.totalStops} ({progress.progressPct}%)</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={progress.progressPct} sx={{ height: 7, borderRadius: 4 }} />
                  </Box>

                  {nextStop && (
                    <Box sx={{ p: 1.25, borderRadius: '10px', bgcolor: 'action.hover' }}>
                      <Typography variant="caption" color="text.secondary">Next Stop</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>#{nextStop.sequence} {nextStop.name}</Typography>
                    </Box>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate(`/route-sales/my-routes/${route.id}`)}
                    sx={{ ...primaryButtonSx, mt: 'auto' }}
                  >
                    Open Route
                  </Button>
                </Paper>
              </Grid>
            )
          })}
        </Grid>
      )}
    </PageShell>
  )
}
