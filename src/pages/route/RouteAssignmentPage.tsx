import { useState, useMemo } from 'react'
import {
  Box,
  Button,
  Grid,
  Typography,
  Tabs,
  Tab,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  ListItemText,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { useRouteState, type StaffItem } from './routeState'
import { StatusChip } from '@/components/ui/StatusChip'
import { DataPanel } from '@/components/ui/DataPanel'

export function RouteAssignmentPage() {
  const { staff, routes, updateSchedule } = useRouteState()
  const [tabIndex, setTabIndex] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'Salesman' | 'Delivery Agent'>('Salesman')

  // Assignment Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentStaff, setCurrentStaff] = useState<StaffItem | null>(null)
  const [tempAssignedRoutes, setTempAssignedRoutes] = useState<string[]>([])

  const uniqueRouteNames = useMemo(() => {
    return Array.from(new Set(routes.map((r) => r.name)))
  }, [routes])

  // Filtered staff list for Tab 2
  const filteredStaff = useMemo(() => {
    const q = searchTerm.toLowerCase()
    return staff.filter(
      (st) =>
        st.name.toLowerCase().includes(q) ||
        st.role.toLowerCase().includes(q) ||
        st.routesAssigned.some((r) => r.toLowerCase().includes(q)),
    )
  }, [staff, searchTerm])

  // Filtered staff list for Tab 1 (Multi Assignment)
  const categoryStaff = useMemo(() => {
    return staff.filter((st) => st.role === selectedCategory)
  }, [staff, selectedCategory])

  const handleOpenAssign = (st: StaffItem) => {
    setCurrentStaff(st)
    setTempAssignedRoutes([...st.routesAssigned])
    setDialogOpen(true)
  }

  const handleSaveAssignments = () => {
    if (!currentStaff) return

    // Update the local staff array routes
    currentStaff.routesAssigned = tempAssignedRoutes
    
    // We update local storage triggers by modifying the local state via a fake edit or trigger reload
    // In our state hook, it saves whenever the `staff` variable changes (which is by reference in our simple JS array here)
    // To ensure React re-renders correctly, we update a schedule or we can force reload.
    // Let's call updateSchedule with a fake or dummy to trigger the hook save
    updateSchedule({ id: 'dummy-trigger', routeName: '', salesmanCount: 0, deliveryAgentCount: 0, shopsCount: 0, isActive: false, days: [] })

    setDialogOpen(false)
  }

  const handleToggleRoute = (routeName: string) => {
    setTempAssignedRoutes((prev) =>
      prev.includes(routeName)
        ? prev.filter((r) => r !== routeName)
        : [...prev, routeName],
    )
  }

  return (
    <PageShell
      title="Route Assignment"
      subtitle="Manage salesperson and delivery agent route maps"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Route Management' },
        { label: 'Route Assignment' },
      ]}
    >
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabIndex} onChange={(_, idx) => setTabIndex(idx)} aria-label="Route Assignment Tabs">
          <Tab
            icon={<AssignmentIndIcon fontSize="small" />}
            iconPosition="start"
            label="Multi Route Assignment"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            icon={<PeopleAltIcon fontSize="small" />}
            iconPosition="start"
            label="Staff Directory"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      {tabIndex === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Category selection */}
          <Paper sx={{ p: 2, ...whiteCardSx, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body1" sx={{ fontWeight: 600, mr: 1 }}>Filter by category:</Typography>
            <Chip
              label="Salesmen"
              clickable
              color={selectedCategory === 'Salesman' ? 'primary' : 'default'}
              onClick={() => setSelectedCategory('Salesman')}
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label="Delivery Agents"
              clickable
              color={selectedCategory === 'Delivery Agent' ? 'primary' : 'default'}
              onClick={() => setSelectedCategory('Delivery Agent')}
              sx={{ fontWeight: 600 }}
            />
          </Paper>

          {/* Assignment List */}
          <DataPanel title={`${selectedCategory} Assignment Mapping`} subtitle={`Active route assignments for all ${selectedCategory.toLowerCase()}s`}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Staff Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Assigned Routes</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total Assigned</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoryStaff.map((st) => (
                    <TableRow key={st.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{st.name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {st.routesAssigned.length === 0 ? (
                            <Typography variant="caption" color="text.secondary">No routes assigned</Typography>
                          ) : (
                            st.routesAssigned.map((r) => (
                              <Chip key={r} label={r} size="small" variant="outlined" color="primary" />
                            ))
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{st.routesAssigned.length} routes</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<AssignmentIndIcon />}
                          onClick={() => handleOpenAssign(st)}
                          sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}
                        >
                          Edit Routes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DataPanel>
        </Box>
      )}

      {tabIndex === 1 && (
        <Box>
          <DataPanel title="All Staff List" subtitle="Comprehensive list of field staff, roles, and status">
            <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                placeholder="Search staff directory by name, role or assigned route..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                sx={{ flex: 1 }}
              />
            </Box>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Assigned Routes</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStaff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">No staff members found matching your search</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStaff.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{row.id.toUpperCase()}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.role}
                            size="small"
                            color={row.role === 'Salesman' ? 'info' : 'secondary'}
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {row.routesAssigned.length === 0 ? (
                              <Typography variant="caption" color="text.secondary">—</Typography>
                            ) : (
                              row.routesAssigned.map((route) => (
                                <Chip key={route} label={route} size="small" variant="outlined" />
                              ))
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <StatusChip status={row.status} />
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

      {/* Assignment Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Assign Routes to {currentStaff?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: '10px !important' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select the routes this {currentStaff?.role.toLowerCase()} is authorized to handle.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {uniqueRouteNames.map((routeName) => {
              const isChecked = tempAssignedRoutes.includes(routeName)
              return (
                <Box
                  key={routeName}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1,
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: isChecked ? 'primary.light' : 'divider',
                    bgcolor: isChecked ? 'action.hover' : 'transparent',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleToggleRoute(routeName)}
                >
                  <Checkbox checked={isChecked} color="primary" />
                  <ListItemText primary={routeName} />
                </Box>
              )
            })}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSaveAssignments} sx={primaryButtonSx}>
            Save Assignments
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  )
}
