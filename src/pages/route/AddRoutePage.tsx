import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Paper,
  Divider,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import StorefrontIcon from '@mui/icons-material/Storefront'
import RouteIcon from '@mui/icons-material/Route'
import PersonIcon from '@mui/icons-material/Person'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { useRouteState } from './routeState'

export function AddRoutePage() {
  const navigate = useNavigate()
  const { routes, shops, staff, addRoute, addShop } = useRouteState()

  // Form Fields State
  const [routeName, setRouteName] = useState('')
  const [selectedShop, setSelectedShop] = useState('')
  const [selectedSalesman, setSelectedSalesman] = useState('')
  const [selectedDeliveryAgent, setSelectedDeliveryAgent] = useState('')
  const [totalOutlets, setTotalOutlets] = useState('10')
  const [routeDate, setRouteDate] = useState(new Date().toISOString().split('T')[0])

  // Dialog States
  const [shopDialogOpen, setShopDialogOpen] = useState(false)
  const [routeDialogOpen, setRouteDialogOpen] = useState(false)

  // Dialog Form State - New Shop
  const [newShopName, setNewShopName] = useState('')
  const [newShopOwner, setNewShopOwner] = useState('')
  const [newShopPhone, setNewShopPhone] = useState('')

  // Dialog Form State - New Route Name
  const [newRouteName, setNewRouteName] = useState('')

  // Unique list of routes for selection
  const routeNames = Array.from(new Set([...routes.map((r) => r.name)]))

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!routeName || !selectedSalesman || !selectedDeliveryAgent) return

    addRoute({
      name: routeName,
      salesman: selectedSalesman,
      deliveryAgent: selectedDeliveryAgent,
      outlets: Number(totalOutlets) || 10,
      status: 'pending',
      date: routeDate,
    })

    // Navigate back to Route Dashboard
    navigate('/route-sales/dashboard')
  }

  const handleAddNewShop = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newShopName) return

    const newShop = addShop({
      name: newShopName,
      route: routeName || 'General Route',
      owner: newShopOwner,
      phone: newShopPhone,
    })

    setSelectedShop(newShop.name)
    setShopDialogOpen(false)

    // Clear dialog state
    setNewShopName('')
    setNewShopOwner('')
    setNewShopPhone('')
  }

  const handleAddNewRoute = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRouteName) return

    setRouteName(newRouteName)
    setRouteDialogOpen(false)
    setNewRouteName('')
  }

  return (
    <PageShell
      title="Add Route"
      subtitle="Create a new route assignment and configure shop locations inline"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Route Management', path: '/route-sales/dashboard' },
        { label: 'Add Route' },
      ]}
      actions={
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/route-sales/dashboard')}
          sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
        >
          Back to Dashboard
        </Button>
      }
    >
      <Paper sx={{ p: 4, ...whiteCardSx, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Route Configuration Form</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Fill in the details to assign salesmen, delivery agents, and routes to today's active routes.
        </Typography>

        <form onSubmit={handleCreateAssignment}>
          <Grid container spacing={3}>
            {/* Route Selection / Creation */}
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                select
                label="Route Selection"
                fullWidth
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <RouteIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              >
                {routeNames.map((name) => (
                  <MenuItem key={name} value={name}>{name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => setRouteDialogOpen(true)}
                sx={{ height: '54px', borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
              >
                Create Route
              </Button>
            </Grid>

            {/* Shop Selection / Creation */}
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                select
                label="Shop Selection"
                fullWidth
                value={selectedShop}
                onChange={(e) => setSelectedShop(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <StorefrontIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              >
                {shops.map((s) => (
                  <MenuItem key={s.id} value={s.name}>{s.name} ({s.route})</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => setShopDialogOpen(true)}
                sx={{ height: '54px', borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
              >
                Add Shop
              </Button>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Salesman Selection */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Salesman"
                fullWidth
                value={selectedSalesman}
                onChange={(e) => setSelectedSalesman(e.target.value)}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              >
                {staff.filter((st) => st.role === 'Salesman').map((st) => (
                  <MenuItem key={st.id} value={st.name}>{st.name}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Delivery Agent Selection */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Delivery Agent"
                fullWidth
                value={selectedDeliveryAgent}
                onChange={(e) => setSelectedDeliveryAgent(e.target.value)}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalShippingIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              >
                {staff.filter((st) => st.role === 'Delivery Agent').map((st) => (
                  <MenuItem key={st.id} value={st.name}>{st.name}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Outlets Count */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Shops/Outlets Count"
                type="number"
                fullWidth
                value={totalOutlets}
                onChange={(e) => setTotalOutlets(e.target.value)}
                required
              />
            </Grid>

            {/* Route Date */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Date of Assignment"
                type="date"
                fullWidth
                value={routeDate}
                onChange={(e) => setRouteDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                required
              />
            </Grid>

            {/* Form Actions */}
            <Grid size={{ xs: 12 }} sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="text"
                color="secondary"
                onClick={() => navigate('/route-sales/dashboard')}
                sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, px: 3 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                sx={primaryButtonSx}
              >
                Create Assignment
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Add Shop Inline Dialog */}
      <Dialog open={shopDialogOpen} onClose={() => setShopDialogOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleAddNewShop}>
          <DialogTitle sx={{ fontWeight: 700 }}>Add New Shop</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
            <TextField
              label="Shop Name"
              fullWidth
              value={newShopName}
              onChange={(e) => setNewShopName(e.target.value)}
              required
            />
            <TextField
              label="Owner Name"
              fullWidth
              value={newShopOwner}
              onChange={(e) => setNewShopOwner(e.target.value)}
            />
            <TextField
              label="Phone Number"
              fullWidth
              value={newShopPhone}
              onChange={(e) => setNewShopPhone(e.target.value)}
            />
            {routeName && (
              <Typography variant="caption" color="text.secondary">
                This shop will automatically be assigned to route: <strong>{routeName}</strong>
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setShopDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" sx={primaryButtonSx}>Save Shop</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Route Inline Dialog */}
      <Dialog open={routeDialogOpen} onClose={() => setRouteDialogOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleAddNewRoute}>
          <DialogTitle sx={{ fontWeight: 700 }}>Create New Route</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
            <TextField
              label="Route Name"
              placeholder="e.g. Route G - Southwest"
              fullWidth
              value={newRouteName}
              onChange={(e) => setNewRouteName(e.target.value)}
              required
              autoFocus
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setRouteDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" sx={primaryButtonSx}>Save Route</Button>
          </DialogActions>
        </form>
      </Dialog>
    </PageShell>
  )
}
