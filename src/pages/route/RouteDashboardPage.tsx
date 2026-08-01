import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Grid,
  Typography,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import RouteIcon from '@mui/icons-material/Route'
import StorefrontIcon from '@mui/icons-material/Storefront'
import TodayIcon from '@mui/icons-material/Today'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import HistoryIcon from '@mui/icons-material/History'
import SearchIcon from '@mui/icons-material/Search'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { DashboardKpiCard } from '@/components/dashboard/DashboardKpiCard'
import { StatusChip } from '@/components/ui/StatusChip'
import { DataPanel } from '@/components/ui/DataPanel'
import { ApexChart } from '@/components/charts/ApexChart'
import { useRouteState, type VisitRecord } from './routeState'
import { RouteWorkflowStrip } from './RouteWorkflowStrip'
import { formatCurrency } from '@/utils/export'
import { v } from '@/theme/cssVars'

export function RouteDashboardPage() {
  const navigate = useNavigate()
  const { routes, visits, shops, staff, addVisit, removeVisit, removeRoute } = useRouteState()

  const [tabIndex, setTabIndex] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [historyFilter, setHistoryFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  // Visit Form state
  const [selectedRoute, setSelectedRoute] = useState('')
  const [selectedShop, setSelectedShop] = useState('')
  const [selectedSalesman, setSelectedSalesman] = useState('')
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0])
  const [visitStatus, setVisitStatus] = useState<'completed' | 'failed' | 'pending'>('completed')
  const [collectionAmt, setCollectionAmt] = useState('')
  const [notes, setNotes] = useState('')

  // Derived KPI data
  const totalRoutesCount = useMemo(() => routes.length, [routes])
  const totalShopsCount = useMemo(() => shops.length, [shops])
  const todayRoutesCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return routes.filter((r) => r.date === today).length
  }, [routes])

  const bestRouteInfo = useMemo(() => {
    const sorted = [...routes].sort((a, b) => b.collections - a.collections)
    const best = sorted[0]
    if (best && best.collections > 0) {
      return {
        name: best.name,
        collection: formatCurrency(best.collections),
      }
    }
    return { name: 'Route B - South', collection: '₹1,24,000' }
  }, [routes])

  // Filtered lists
  const filteredRoutes = useMemo(() => {
    const q = searchTerm.toLowerCase()
    return routes.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.salesman.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q),
    )
  }, [routes, searchTerm])

  const filteredVisits = useMemo(() => {
    let result = [...visits]
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    // Time filter
    if (historyFilter === 'today') {
      result = result.filter((v) => v.date === today)
    } else if (historyFilter === 'yesterday') {
      result = result.filter((v) => v.date === yesterday)
    } else if (historyFilter === 'week') {
      const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
      result = result.filter((v) => v.date >= oneWeekAgo)
    } else if (historyFilter === 'month') {
      const oneMonthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
      result = result.filter((v) => v.date >= oneMonthAgo)
    }

    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      result = result.filter(
        (v) =>
          v.routeName.toLowerCase().includes(q) ||
          v.shopName.toLowerCase().includes(q) ||
          v.salesman.toLowerCase().includes(q),
      )
    }

    return result
  }, [visits, historyFilter, searchTerm])

  // Chart data for route completion rates
  const chartData = useMemo(() => {
    const recentRoutes = routes.slice(0, 6)
    return {
      categories: recentRoutes.map((r) => r.name.replace('Route ', '')),
      series: [
        {
          name: 'Visited Shops',
          data: recentRoutes.map((r) => r.visited),
        },
        {
          name: 'Total Shops',
          data: recentRoutes.map((r) => r.outlets),
        },
      ],
    }
  }, [routes])

  const handleOpenAddVisit = () => {
    if (routes.length > 0) setSelectedRoute(routes[0].name)
    if (shops.length > 0) setSelectedShop(shops[0].name)
    const salesmenList = staff.filter((s) => s.role === 'Salesman')
    if (salesmenList.length > 0) setSelectedSalesman(salesmenList[0].name)
    setVisitDate(new Date().toISOString().split('T')[0])
    setVisitStatus('completed')
    setCollectionAmt('')
    setNotes('')
    setDialogOpen(true)
  }

  const handleAddVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoute || !selectedShop || !selectedSalesman) return

    addVisit({
      routeName: selectedRoute,
      shopName: selectedShop,
      salesman: selectedSalesman,
      date: visitDate,
      status: visitStatus,
      collectionAmount: Number(collectionAmt) || 0,
      notes: notes || undefined,
    })
    setDialogOpen(false)
  }

  return (
    <PageShell
      title="Route Dashboard"
      subtitle="Overview of route performance, shop metrics, and collection history"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Route Management' },
        { label: 'Dashboard' },
      ]}
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          {tabIndex === 1 && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<HistoryIcon />}
              onClick={handleOpenAddVisit}
              sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
            >
              Add Visit
            </Button>
          )}
          <Button
            variant="outlined"
            color="primary"
            startIcon={<TodayIcon />}
            onClick={() => navigate('/route-sales/field-day')}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
          >
            Field Day
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RouteIcon />}
            onClick={() => navigate('/route-sales/route-history')}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
          >
            Route History
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/route-sales/route-builder')}
            sx={primaryButtonSx}
          >
            Create Route
          </Button>
        </Box>
      }
    >
      <RouteWorkflowStrip activeStep={0} />
      {/* 4 unified design cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardKpiCard
            label="Total Routes"
            value={String(totalRoutesCount)}
            trend={12}
            trendLabel="vs last week"
            icon={<RouteIcon />}
            iconIndex={0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardKpiCard
            label="Total Shops"
            value={String(totalShopsCount)}
            trend={5}
            trendLabel="vs last week"
            icon={<StorefrontIcon />}
            iconIndex={1}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardKpiCard
            label="Today's Routes"
            value={String(todayRoutesCount)}
            trend={25}
            trendLabel="vs yesterday"
            icon={<TodayIcon />}
            iconIndex={2}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardKpiCard
            label="Best Route (Week)"
            value={bestRouteInfo.name}
            trend={18}
            trendLabel={`with ${bestRouteInfo.collection} collected`}
            icon={<EmojiEventsIcon />}
            iconIndex={3}
          />
        </Grid>
      </Grid>

      {/* Tabs Layout */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1, mt: 1 }}>
        <Tabs value={tabIndex} onChange={(_, idx) => setTabIndex(idx)} aria-label="Route Dashboard Tabs">
          <Tab label="Routes Overview" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Visit History" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Box>

      {tabIndex === 0 && (
        <Grid container spacing={2}>
          {/* Performance Chart Top */}
          <Grid size={{ xs: 12 }}>
            <DataPanel title="Route Completion Performance" subtitle="Visited vs total shops for recent routes">
              <Box sx={{ p: 2 }}>
                <ApexChart data={chartData} type="bar" height={250} />
              </Box>
            </DataPanel>
          </Grid>

          {/* Main List Below */}
          <Grid size={{ xs: 12 }}>
            <DataPanel title="Routes List" subtitle="List of active and scheduled routes">
              <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  placeholder="Search routes by name or salesman..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                    }
                  }}
                  sx={{ flex: 1 }}
                />
              </Box>
              <TableContainer component={Paper} elevation={0} sx={{ border: 'none' }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Route Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Salesperson</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Shops</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Collection</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRoutes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">No routes found matching your criteria</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRoutes.map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell sx={{ fontWeight: 500 }}>{row.code}</TableCell>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.salesman}</TableCell>
                          <TableCell>{row.visited} / {row.outlets}</TableCell>
                          <TableCell>{formatCurrency(row.collections)}</TableCell>
                          <TableCell><StatusChip status={row.status} /></TableCell>
                          <TableCell align="right">
                            <Tooltip title="Delete route">
                              <IconButton color="error" size="small" onClick={() => removeRoute(row.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </DataPanel>
          </Grid>
        </Grid>
      )}

      {tabIndex === 1 && (
        <Box>
          <DataPanel title="Visit Logs" subtitle="History of shop visits and collection details">
            {/* Filters */}
            <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {(['all', 'today', 'yesterday', 'week', 'month'] as const).map((filter) => (
                  <Chip
                    key={filter}
                    label={filter.charAt(0).toUpperCase() + filter.slice(1)}
                    clickable
                    color={historyFilter === filter ? 'primary' : 'default'}
                    onClick={() => setHistoryFilter(filter)}
                    sx={{ fontWeight: 500 }}
                  />
                ))}
              </Box>
              <TextField
                placeholder="Search visits by shop, salesperson..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                  }
                }}
                sx={{ width: { xs: '100%', sm: 300 } }}
              />
            </Box>

            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Route</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Shop Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Salesperson</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Collection</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredVisits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">No visit records found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVisits.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{row.routeName}</TableCell>
                        <TableCell>{row.shopName}</TableCell>
                        <TableCell>{row.salesman}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{formatCurrency(row.collectionAmount)}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.status}
                            size="small"
                            color={row.status === 'completed' ? 'success' : row.status === 'failed' ? 'error' : 'warning'}
                            sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Remove Visit">
                            <IconButton color="error" size="small" onClick={() => removeVisit(row.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DataPanel>
        </Box>
      )}

      {/* Add Visit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleAddVisitSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>Record Customer Visit</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
            <TextField
              select
              label="Select Route"
              fullWidth
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              required
            >
              {routes.map((r) => (
                <MenuItem key={r.id} value={r.name}>{r.name} ({r.code})</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Select Shop"
              fullWidth
              value={selectedShop}
              onChange={(e) => setSelectedShop(e.target.value)}
              required
            >
              {shops.map((s) => (
                <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>
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

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Visit Status"
                  fullWidth
                  value={visitStatus}
                  onChange={(e) => setVisitStatus(e.target.value as any)}
                  required
                >
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <TextField
              label="Collection Amount (₹)"
              type="number"
              fullWidth
              value={collectionAmt}
              onChange={(e) => setCollectionAmt(e.target.value)}
              placeholder="0"
              disabled={visitStatus !== 'completed'}
            />

            <TextField
              label="Notes"
              multiline
              rows={3}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Shop closed or payment mode details..."
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" sx={primaryButtonSx}>Record Visit</Button>
          </DialogActions>
        </form>
      </Dialog>
    </PageShell>
  )
}
