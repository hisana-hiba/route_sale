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
  Switch,
  FormControlLabel,
  IconButton,
  Collapse,
  Divider,
  Checkbox,
  FormGroup,
  Tooltip,
  MenuItem,
} from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import GroupIcon from '@mui/icons-material/Group'
import StorefrontIcon from '@mui/icons-material/Storefront'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import FlashOnIcon from '@mui/icons-material/FlashOn'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { useRouteState, type WeeklySchedule } from './routeState'
import { v } from '@/theme/cssVars'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function WeeklySchedulePage() {
  const {
    schedules,
    routes,
    addSchedule,
    updateSchedule,
    removeSchedule,
    generateRoutesFromSchedules,
  } = useRouteState()

  const [searchTerm, setSearchTerm] = useState('')
  
  // Expanded card state
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  
  // Generate Dialog State
  const [generateOpen, setGenerateOpen] = useState(false)
  const [generateDate, setGenerateDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Wednesday', 'Friday'])
  const [generatedMessage, setGeneratedMessage] = useState('')

  // Edit/Add Schedule Dialog state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState('')
  const [schRouteName, setSchRouteName] = useState('')
  const [schSalesmanCount, setSchSalesmanCount] = useState('1')
  const [schAgentCount, setSchAgentCount] = useState('1')
  const [schShopsCount, setSchShopsCount] = useState('10')
  const [schDays, setSchDays] = useState<string[]>([])
  const [schIsActive, setSchIsActive] = useState(true)

  // Get unique list of route names
  const uniqueRouteNames = useMemo(() => {
    return Array.from(new Set(routes.map((r) => r.name)))
  }, [routes])

  const filteredSchedules = useMemo(() => {
    const q = searchTerm.toLowerCase()
    return schedules.filter(
      (s) =>
        s.routeName.toLowerCase().includes(q) ||
        s.days.some((d) => d.toLowerCase().includes(q)),
    )
  }, [schedules, searchTerm])

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  // Handle Generate Route action
  const handleOpenGenerate = () => {
    // Prefill days based on current day of week
    const weekday = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    setSelectedDays([weekday])
    setGenerateDate(new Date().toISOString().split('T')[0])
    setGeneratedMessage('')
    setGenerateOpen(true)
  }

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const count = generateRoutesFromSchedules(selectedDays, generateDate)
    setGeneratedMessage(`Successfully generated ${count} routes for date: ${generateDate}!`)
  }

  const handleToggleActive = (sch: WeeklySchedule) => {
    updateSchedule({
      ...sch,
      isActive: !sch.isActive,
    })
  }

  // Edit/Add Handlers
  const handleOpenAddSchedule = () => {
    setIsEdit(false)
    setSchRouteName(uniqueRouteNames[0] || 'Route A - North')
    setSchSalesmanCount('1')
    setSchAgentCount('1')
    setSchShopsCount('10')
    setSchDays(['Monday'])
    setSchIsActive(true)
    setScheduleDialogOpen(true)
  }

  const handleOpenEditSchedule = (sch: WeeklySchedule) => {
    setIsEdit(true)
    setEditId(sch.id)
    setSchRouteName(sch.routeName)
    setSchSalesmanCount(String(sch.salesmanCount))
    setSchAgentCount(String(sch.deliveryAgentCount))
    setSchShopsCount(String(sch.shopsCount))
    setSchDays([...sch.days])
    setSchIsActive(sch.isActive)
    setScheduleDialogOpen(true)
  }

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!schRouteName || schDays.length === 0) return

    const scheduleData = {
      routeName: schRouteName,
      salesmanCount: Number(schSalesmanCount) || 1,
      deliveryAgentCount: Number(schAgentCount) || 1,
      shopsCount: Number(schShopsCount) || 10,
      isActive: schIsActive,
      days: schDays,
    }

    if (isEdit) {
      updateSchedule({
        id: editId,
        ...scheduleData,
      })
    } else {
      addSchedule(scheduleData)
    }

    setScheduleDialogOpen(false)
  }

  const handleToggleDay = (day: string) => {
    setSchDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    )
  }

  const handleToggleGenerateDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    )
  }

  return (
    <PageShell
      title="Weekly Schedule"
      subtitle="Configure recurring weekly routes and execute automation runs"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Route Management' },
        { label: 'Weekly Schedule' },
      ]}
      actions={
        <Button
          variant="contained"
          color="primary"
          startIcon={<FlashOnIcon />}
          onClick={handleOpenGenerate}
          sx={primaryButtonSx}
        >
          Generate Route
        </Button>
      }
    >
      {/* Search and Section actions */}
      <Paper sx={{ p: 2.5, mb: 4, ...whiteCardSx, display: 'flex', flexWrap: 'wrap', gap: 2.5, justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          placeholder="Search weekly schedule by route name or day..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            },
          }}
          sx={{ width: { xs: '100%', sm: 350 } }}
        />
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddSchedule}
          sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
        >
          Add Schedule
        </Button>
      </Paper>

      {/* List of Schedules */}
      <Grid container spacing={3}>
        {filteredSchedules.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ p: 5, textAlign: 'center', bgcolor: 'action.hover', borderRadius: '16px' }}>
              <Typography variant="body1" color="text.secondary">
                No schedules configured or matching search term
              </Typography>
            </Box>
          </Grid>
        ) : (
          filteredSchedules.map((sch) => {
            const isExpanded = expandedIds.includes(sch.id)
            return (
              <Grid size={{ xs: 12 }} key={sch.id}>
                <Paper
                  sx={{
                    p: 2.5,
                    ...whiteCardSx,
                    borderLeft: `5px solid ${sch.isActive ? v.primary : '#D1D5DB'}`,
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: v.shadowMd },
                  }}
                >
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    {/* Header info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 200 }}>
                      <Box sx={{ p: 1, bgcolor: sch.isActive ? 'primary.light' : 'action.selected', borderRadius: '10px', display: 'flex' }}>
                        <CalendarMonthIcon sx={{ color: sch.isActive ? 'primary.contrastText' : 'text.disabled' }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {sch.routeName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                          {sch.days.map((day) => (
                            <Chip key={day} label={day.substring(0, 3)} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    </Box>

                    {/* Counts inside card */}
                    <Box sx={{ display: 'flex', gap: 3.5, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Salesmen</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{sch.salesmanCount}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalShippingIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Delivery Agents</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{sch.deliveryAgentCount}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StorefrontIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Shops</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{sch.shopsCount}</Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Quick switch and Edit/Remove Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={sch.isActive}
                            onChange={() => handleToggleActive(sch)}
                            color="primary"
                            size="small"
                          />
                        }
                        label={sch.isActive ? 'Active' : 'Paused'}
                        sx={{ m: 0, mr: 1, '& .MuiFormControlLabel-label': { fontSize: '12px', fontWeight: 600 } }}
                      />
                      
                      {/* Toggle Details inside Card */}
                      <Tooltip title={isExpanded ? 'Collapse Details' : 'Expand Details'}>
                        <IconButton size="small" onClick={() => handleToggleExpand(sch.id)}>
                          {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Edit Schedule">
                        <IconButton color="primary" size="small" onClick={() => handleOpenEditSchedule(sch)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Remove Schedule">
                        <IconButton color="error" size="small" onClick={() => removeSchedule(sch.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Toggle Collapsed panel with details */}
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                        Schedule Configuration & Specific Assignments
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Recurring Days</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Runs on: {sch.days.join(', ')}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Target Coverage</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {sch.shopsCount} outlets mapped to this schedule
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Status</Typography>
                          <Chip
                            label={sch.isActive ? 'Automated generation active' : 'Automation paused'}
                            color={sch.isActive ? 'success' : 'default'}
                            size="small"
                            sx={{ fontWeight: 500, mt: 0.5 }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Collapse>
                </Paper>
              </Grid>
            )
          })
        )}
      </Grid>

      {/* Generate Route Dialog */}
      <Dialog open={generateOpen} onClose={() => setGenerateOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleGenerateSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>Generate Routes from Schedule</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
            {generatedMessage ? (
              <Box sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText', borderRadius: '8px' }}>
                <Typography variant="body2">{generatedMessage}</Typography>
              </Box>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary">
                  Automate today's active route assignments using active schedules configured above.
                </Typography>

                <TextField
                  label="Execution Target Date"
                  type="date"
                  fullWidth
                  value={generateDate}
                  onChange={(e) => setGenerateDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  required
                />

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
                  Filter Schedules by Days
                </Typography>
                <FormGroup sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1.5 }}>
                  {DAYS_OF_WEEK.map((day) => {
                    const isChecked = selectedDays.includes(day)
                    return (
                      <FormControlLabel
                        key={day}
                        control={
                          <Checkbox
                            checked={isChecked}
                            onChange={() => handleToggleGenerateDay(day)}
                            name={day}
                          />
                        }
                        label={day}
                      />
                    )
                  })}
                </FormGroup>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setGenerateOpen(false)}>Close</Button>
            {!generatedMessage && (
              <Button type="submit" variant="contained" color="primary" sx={primaryButtonSx}>
                Generate Now
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit/Add Weekly Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleScheduleSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {isEdit ? 'Edit Weekly Schedule' : 'Configure Weekly Schedule'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
            <TextField
              select
              label="Select Route Map"
              fullWidth
              value={schRouteName}
              onChange={(e) => setSchRouteName(e.target.value)}
              required
            >
              {uniqueRouteNames.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </TextField>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Salesmen Count"
                  type="number"
                  fullWidth
                  value={schSalesmanCount}
                  onChange={(e) => setSchSalesmanCount(e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Delivery Agents"
                  type="number"
                  fullWidth
                  value={schAgentCount}
                  onChange={(e) => setSchAgentCount(e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Shops Coverage"
                  type="number"
                  fullWidth
                  value={schShopsCount}
                  onChange={(e) => setSchShopsCount(e.target.value)}
                  required
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
              Select Days to run route
            </Typography>
            <FormGroup sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1.5 }}>
              {DAYS_OF_WEEK.map((day) => {
                const isChecked = schDays.includes(day)
                return (
                  <FormControlLabel
                    key={day}
                    control={
                      <Checkbox
                        checked={isChecked}
                        onChange={() => handleToggleDay(day)}
                        name={day}
                      />
                    }
                    label={day}
                  />
                )
              })}
            </FormGroup>

            <FormControlLabel
              control={
                <Switch
                  checked={schIsActive}
                  onChange={(e) => setSchIsActive(e.target.checked)}
                  color="primary"
                />
              }
              label="Enable schedule generation"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" sx={primaryButtonSx}>
              {isEdit ? 'Save Changes' : 'Create Schedule'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </PageShell>
  )
}
