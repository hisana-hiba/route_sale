import { useState, useMemo } from 'react'
import {
  Box,
  Button,
  Grid,
  Typography,
  TextField,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonIcon from '@mui/icons-material/Person'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import StorefrontIcon from '@mui/icons-material/Storefront'
import SearchIcon from '@mui/icons-material/Search'
import RouteIcon from '@mui/icons-material/Route'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { useRouteState } from './routeState'
import { StatusChip } from '@/components/ui/StatusChip'
import { formatCurrency } from '@/utils/export'
import { v } from '@/theme/cssVars'

export function TodayRoutePage() {
  const { routes, staff, addRoute, removeRoute } = useRouteState()
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'yesterday' | 'week' | 'month'>('today')
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  // Dialog form state
  const [selectedRouteName, setSelectedRouteName] = useState('')
  const [selectedSalesman, setSelectedSalesman] = useState('')
  const [selectedDeliveryAgent, setSelectedDeliveryAgent] = useState('')
  const [outletsCount, setOutletsCount] = useState('15')

  // Available unique route names from store configuration
  const uniqueRouteNames = Array.from(new Set(routes.map((r) => r.name)))

  const filteredRoutes = useMemo(() => {
    let result = [...routes]
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    // Period filter
    if (filterPeriod === 'today') {
      result = result.filter((r) => r.date === today)
    } else if (filterPeriod === 'yesterday') {
      result = result.filter((r) => r.date === yesterday)
    } else if (filterPeriod === 'week') {
      const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
      result = result.filter((r) => r.date >= oneWeekAgo)
    } else if (filterPeriod === 'month') {
      const oneMonthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
      result = result.filter((r) => r.date >= oneMonthAgo)
    }

    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.salesman.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q),
      )
    }

    return result
  }, [routes, filterPeriod, searchTerm])

  const handleOpenAddRoute = () => {
    if (uniqueRouteNames.length > 0) setSelectedRouteName(uniqueRouteNames[0])
    const salesmen = staff.filter((s) => s.role === 'Salesman')
    if (salesmen.length > 0) setSelectedSalesman(salesmen[0].name)
    const delivery = staff.filter((s) => s.role === 'Delivery Agent')
    if (delivery.length > 0) setSelectedDeliveryAgent(delivery[0].name)
    setOutletsCount('15')
    setDialogOpen(true)
  }

  const handleAddRouteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRouteName || !selectedSalesman || !selectedDeliveryAgent) return

    addRoute({
      name: selectedRouteName,
      salesman: selectedSalesman,
      deliveryAgent: selectedDeliveryAgent,
      outlets: Number(outletsCount) || 15,
      status: 'pending',
      date: filterPeriod === 'yesterday'
        ? new Date(Date.now() - 86400000).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0], // generate for today or selected tab
    })

    setDialogOpen(false)
  }

  return (
    <PageShell
      title="Today's Routes"
      subtitle="Monitor and allocate routes for active field operations"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Route Management' },
        { label: "Today's Routes" },
      ]}
      actions={
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddRoute}
          sx={primaryButtonSx}
        >
          Add Today Route
        </Button>
      }
    >
      {/* Search and Period Filters */}
      <Paper sx={{ p: 2.5, mb: 4, ...whiteCardSx, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2.5, justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {(['today', 'yesterday', 'week', 'month'] as const).map((period) => (
            <Chip
              key={period}
              label={period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : period.charAt(0).toUpperCase() + period.slice(1)}
              clickable
              color={filterPeriod === period ? 'primary' : 'default'}
              onClick={() => setFilterPeriod(period)}
              sx={{ fontWeight: 600, py: 2, px: 1.5, fontSize: '13px' }}
            />
          ))}
        </Box>
        <TextField
          placeholder="Search active routes..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
          sx={{ width: { xs: '100%', md: 320 } }}
        />
      </Paper>

      {/* Grid of Route Cards */}
      <Grid container spacing={3}>
        {filteredRoutes.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ p: 5, textAlign: 'center', bgcolor: 'action.hover', borderRadius: '16px' }}>
              <Typography variant="body1" color="text.secondary">
                No active routes found for the selected filter period.
              </Typography>
            </Box>
          </Grid>
        ) : (
          filteredRoutes.map((route) => {
            const progress = (route.visited / route.outlets) * 100 || 0

            return (
              <Grid item xs={12} sm={6} md={4} key={route.id}>
                <Paper
                  sx={{
                    p: 3,
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: v.shadowSm,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: v.shadowMd,
                    },
                    borderRadius: '20px',
                    border: `1px solid color-mix(in srgb, ${v.borderStrong} 40%, transparent)`,
                  }}
                >
                  {/* Remove Button top-right */}
                  <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                    <Tooltip title="Remove Route">
                      <IconButton color="error" size="small" onClick={() => removeRoute(route.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box>
                    {/* Header */}
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1, pr: 4 }}>
                      <RouteIcon sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {route.name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      Route Code: <strong>{route.code}</strong> | Date: {route.date}
                    </Typography>

                    {/* Staff details */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Salesman: {route.salesman}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalShippingIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Delivery Agent: {route.deliveryAgent}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Visited Progress */}
                    <Box sx={{ mb: 3.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StorefrontIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">Shop Visit Progress</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {route.visited} / {route.outlets} visited
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Footer Collection & Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Collection</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {formatCurrency(route.collections)}
                      </Typography>
                    </Box>
                    <StatusChip status={route.status} />
                  </Box>
                </Paper>
              </Grid>
            )
          })
        )}
      </Grid>

      {/* Add Today Route Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleAddRouteSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>Allocate Active Route</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
            <TextField
              select
              label="Select Route Map"
              fullWidth
              value={selectedRouteName}
              onChange={(e) => setSelectedRouteName(e.target.value)}
              required
            >
              {uniqueRouteNames.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Select Salesman"
              fullWidth
              value={selectedSalesman}
              onChange={(e) => setSelectedSalesman(e.target.value)}
              required
            >
              {staff.filter((s) => s.role === 'Salesman').map((s) => (
                <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Select Delivery Agent"
              fullWidth
              value={selectedDeliveryAgent}
              onChange={(e) => setSelectedDeliveryAgent(e.target.value)}
              required
            >
              {staff.filter((s) => s.role === 'Delivery Agent').map((s) => (
                <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Number of Outlets"
              type="number"
              fullWidth
              value={outletsCount}
              onChange={(e) => setOutletsCount(e.target.value)}
              required
            />
            
            <Typography variant="caption" color="text.secondary">
              This route will be added to the list for: <strong>{filterPeriod === 'yesterday' ? 'Yesterday' : 'Today'}</strong>
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" sx={primaryButtonSx}>Allocate Route</Button>
          </DialogActions>
        </form>
      </Dialog>
    </PageShell>
  )
}
