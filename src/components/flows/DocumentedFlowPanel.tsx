import { useState } from 'react'
import {
  Box, Button, Typography, TextField, MenuItem, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, Alert, Tabs, Tab, Checkbox, FormControlLabel,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton, LinearProgress, Tooltip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import SearchIcon from '@mui/icons-material/Search'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiCall } from '@/api/flowClient'
import { createItem, fetchList, updateItem } from '@/api/client'
import { shops, staff, products, appModules, leaveTypes } from '@/mocks/flowData'
import { DataPanel } from '@/components/ui/DataPanel'
import { StatusChip } from '@/components/ui/StatusChip'
import { primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { formatCurrency } from '@/utils/export'
import { colors } from '@/theme/palette'
import type { DocumentedFlow } from '@/types/module'
import { ThemeSettingsPanel } from '@/components/settings/ThemeSettingsPanel'
import { NotificationsListPanel } from '@/components/settings/NotificationsListPanel'
import { productCatalog } from '@/components/dashboard/dashboardTokens'
import { ImageUploadField } from '@/components/module/ImageUploadField'

interface FlowPanelProps {
  flow: DocumentedFlow
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function DocumentedFlowPanel({ flow }: FlowPanelProps) {
  switch (flow) {
    case 'sales-return': return <SalesReturnPanel />
    case 'e-way-bill': return <EWayBillPanel />
    case 'theme-settings': return <ThemeSettingsPanel />
    case 'notifications': return <NotificationsListPanel />
    case 'multi-assign-route': return <MultiAssignRoutePanel />
    case 'live-route': return <LiveRoutePanel />
    case 'weekly-schedule': return <WeeklySchedulePanel />
    case 'register-outlet': return <RegisterOutletPanel />
    case 'employee-directory': return <EmployeeDirectoryPanel />
    case 'attendance': return <AttendancePanel />
    case 'leave-registry': return <LeaveRegistryPanel />
    case 'payroll': return <PayrollPanel />
    case 'roles-access': return <RolesAccessPanel />
    case 'performance': return <PerformancePanel />
    case 'product-catalog': return <ProductCatalogPanel />
    case 'stock-allocation': return <StockAllocationPanel />
    case 'stock-management': return <StockManagementPanel />
    default: return null
  }
}

function EWayBillPanel() {
  const queryClient = useQueryClient()
  const [msg, setMsg] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    vehicle: '', driver: '', customer: '', amount: 50000, distance: '50 km', date: new Date().toISOString().split('T')[0],
  })

  const { data, refetch } = useQuery({
    queryKey: ['module', 'logistics-e-way-bills', 'ewb-panel'],
    queryFn: () => fetchList<Record<string, unknown>>('/logistics-e-way-bills', { page: 1, pageSize: 50 }),
  })

  const bills = data?.data ?? []
  const active = bills.filter((b) => b.status === 'active' || b.status === 'in_transit')
  const expired = bills.filter((b) => b.status === 'expired' || b.status === 'cancelled')

  const generate = useMutation({
    mutationFn: () => createItem('/logistics-e-way-bills', {
      ...form,
      ewayBill: `EWB${Date.now().toString().slice(-12)}`,
      status: 'active',
    }),
    onSuccess: () => {
      setMsg('E-Way Bill generated successfully')
      setOpen(false)
      refetch()
      queryClient.invalidateQueries({ queryKey: ['module', 'logistics-e-way-bills'] })
    },
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateItem('/logistics-e-way-bills', id, { status }),
    onSuccess: (_, v) => { setMsg(`EWB ${v.status}`); refetch(); queryClient.invalidateQueries({ queryKey: ['module', 'logistics-e-way-bills'] }) },
  })

  return (
    <Box sx={{ mb: 2 }}>
      <DataPanel title="E-Way Bills (EWB)" subtitle="Generate, extend, and cancel GST E-Way Bills for deliveries"
        actions={
          <Button size="small" variant="contained" color="primary" startIcon={<AddIcon />} sx={primaryButtonSx} onClick={() => setOpen(true)}>
            Generate EWB
          </Button>
        }
      >
        {msg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg('')}>{msg}</Alert>}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          {[
            { label: 'Total EWBs', val: bills.length },
            { label: 'Active', val: active.length },
            { label: 'Expired / Cancelled', val: expired.length },
            { label: 'Total Value', val: formatCurrency(bills.reduce((s, b) => s + (Number(b.amount) || 0), 0)) },
          ].map((k) => (
            <Box key={k.label} sx={{ ...whiteCardSx, px: 2.5, py: 1.5, minWidth: 120 }}>
              <Typography variant="caption" color="text.secondary">{k.label}</Typography>
              <Typography sx={{ fontWeight: 800 }}>{k.val}</Typography>
            </Box>
          ))}
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>EWB Number</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Consignee</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bills.slice(0, 8).map((b) => (
              <TableRow key={String(b.id)}>
                <TableCell>{String(b.ewayBill ?? b.code)}</TableCell>
                <TableCell>{String(b.vehicle)}</TableCell>
                <TableCell>{String(b.customer)}</TableCell>
                <TableCell>{formatCurrency(Number(b.amount) || 0)}</TableCell>
                <TableCell><StatusChip status={String(b.status)} /></TableCell>
                <TableCell align="right">
                  {b.status === 'active' && (
                    <>
                      <Button size="small" onClick={() => updateStatus.mutate({ id: String(b.id), status: 'in_transit' })}>Extend</Button>
                      <Button size="small" color="error" onClick={() => updateStatus.mutate({ id: String(b.id), status: 'cancelled' })}>Cancel</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataPanel>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate E-Way Bill</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Vehicle No." value={form.vehicle} onChange={(e) => setForm((p) => ({ ...p, vehicle: e.target.value }))} required />
          <TextField label="Driver" value={form.driver} onChange={(e) => setForm((p) => ({ ...p, driver: e.target.value }))} required />
          <TextField label="Consignee" value={form.customer} onChange={(e) => setForm((p) => ({ ...p, customer: e.target.value }))} required />
          <TextField label="Invoice Value (₹)" type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))} />
          <TextField label="Distance" value={form.distance} onChange={(e) => setForm((p) => ({ ...p, distance: e.target.value }))} />
          <TextField label="Valid From" type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" sx={primaryButtonSx} disabled={!form.vehicle || !form.driver || !form.customer} onClick={() => generate.mutate()}>
            Generate EWB
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function SalesReturnPanel() {
  const [msg, setMsg] = useState('')

  const { data: returns = [], refetch } = useQuery({
    queryKey: ['returns'],
    queryFn: () => apiCall<Record<string, unknown>[]>('/returns'),
  })

  const review = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiCall(`/returns/${id}`, { method: 'PATCH', body: { status } }),
    onSuccess: (_, v) => { setMsg(`Return ${v.status}`); refetch() },
  })

  const pending = returns.filter((r) => r.status === 'pending')
  const approved = returns.filter((r) => r.status === 'approved' || r.status === 'credited')

  return (
    <Box sx={{ mb: 2 }}>
      <DataPanel title="Sales Returns" subtitle="Create & approve customer returns — sales/returns flow">
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          {[
            { label: 'Total', val: returns.length },
            { label: 'Pending', val: pending.length },
            { label: 'Approved', val: approved.length },
            { label: 'Rejected', val: returns.filter((r) => r.status === 'rejected').length },
          ].map((t) => (
            <Box key={t.label} sx={{ ...whiteCardSx, px: 2, py: 1, minWidth: 90, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">{t.label}</Typography>
              <Typography sx={{ fontWeight: 800 }}>{t.val}</Typography>
            </Box>
          ))}
        </Box>
        {msg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg('')}>{msg}</Alert>}
        {returns.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No returns yet. Click &quot;New Return&quot; to create one.</Typography>
        ) : returns.map((r) => (
          <Box key={String(r.id)} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderBottom: `1px solid ${colors.border}` }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 600 }}>{String(r.code)} — {String(r.customer)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {String(r.orderRef ?? 'No order link')} · {formatCurrency(Number(r.amount))}
                {r.returnType ? ` · ${String(r.returnType).replace(/_/g, ' ')}` : ''}
              </Typography>
            </Box>
            <StatusChip status={String(r.status)} />
            {r.status === 'pending' && (
              <>
                <Button size="small" color="success" onClick={() => review.mutate({ id: String(r.id), status: 'approved' })}>Approve</Button>
                <Button size="small" color="error" onClick={() => review.mutate({ id: String(r.id), status: 'rejected' })}>Reject</Button>
              </>
            )}
            {r.status === 'approved' && (
              <Button size="small" variant="outlined" onClick={() => review.mutate({ id: String(r.id), status: 'credited' })}>Mark Credited</Button>
            )}
          </Box>
        ))}
      </DataPanel>
    </Box>
  )
}

function MultiAssignRoutePanel() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [routeName, setRouteName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedStaff, setSelectedStaff] = useState<string[]>([])
  const [selectedShops, setSelectedShops] = useState<string[]>([])
  const [msg, setMsg] = useState('')

  const { data: assignments = [], refetch } = useQuery({
    queryKey: ['route-assignments'],
    queryFn: () => apiCall<Record<string, unknown>[]>('/route-assignments'),
  })

  const save = useMutation({
    mutationFn: () => apiCall('/route-assignments', {
      method: 'POST',
      body: { routeName, date, userIds: selectedStaff, shopIds: selectedShops },
    }),
    onSuccess: () => {
      setMsg(`Created ${selectedStaff.length} assignment(s) for ${routeName}`)
      setOpen(false)
      refetch()
      qc.invalidateQueries({ queryKey: ['module'] })
    },
  })

  const toggle = (id: string, list: string[], set: (v: string[]) => void) => {
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  }

  return (
    <Box sx={{ mb: 2 }}>
    <DataPanel title="Multi-Assign Route" subtitle="Assign one route to multiple staff — Flow 3.2">
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', val: assignments.length },
          { label: 'Active', val: assignments.filter((a) => a.status === 'active').length },
          { label: 'Pending', val: assignments.filter((a) => a.status === 'pending').length },
          { label: 'Done', val: assignments.filter((a) => a.status === 'completed').length },
        ].map((t) => (
          <Box key={t.label} sx={{ ...whiteCardSx, px: 2, py: 1, minWidth: 90, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">{t.label}</Typography>
            <Typography sx={{ fontWeight: 800 }}>{t.val}</Typography>
          </Box>
        ))}
        <Button variant="contained" color="primary" startIcon={<AddIcon />} sx={primaryButtonSx} onClick={() => setOpen(true)}>
          Multi-Assign
        </Button>
      </Box>
      {msg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg('')}>{msg}</Alert>}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Multi-Assign Route</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Route Name" value={routeName} onChange={(e) => setRouteName(e.target.value)} required />
          <TextField label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <Typography variant="subtitle2">Select Staff (multiple)</Typography>
          {staff.map((s) => (
            <FormControlLabel key={s.id} control={<Checkbox checked={selectedStaff.includes(s.id)} onChange={() => toggle(s.id, selectedStaff, setSelectedStaff)} />} label={`${s.name} (${s.role})`} />
          ))}
          <Typography variant="subtitle2">Select Outlets (multiple)</Typography>
          {shops.map((s) => (
            <FormControlLabel key={s.id} control={<Checkbox checked={selectedShops.includes(s.id)} onChange={() => toggle(s.id, selectedShops, setSelectedShops)} />} label={s.name} />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" sx={primaryButtonSx} disabled={!routeName || !selectedStaff.length || !selectedShops.length} onClick={() => save.mutate()}>Save Assignments</Button>
        </DialogActions>
      </Dialog>
    </DataPanel>
    </Box>
  )
}

function LiveRoutePanel() {
  const [filter, setFilter] = useState('all')
  const [msg, setMsg] = useState('')

  const { data, refetch } = useQuery({
    queryKey: ['routes-today'],
    queryFn: () => apiCall<{ shops: { shopId: string; shopName: string; visitStatus: string; order: number }[] }>('/routes/today'),
  })

  const markVisit = useMutation({
    mutationFn: ({ shopId, status }: { shopId: string; status: string }) =>
      apiCall(`/routes/shops/${shopId}/visit`, { method: 'PATCH', body: { status } }),
    onSuccess: (_, v) => { setMsg(`Marked ${v.status}`); refetch() },
  })

  const shopsList = (data?.shops ?? []).filter((s) =>
    filter === 'all' || s.visitStatus.toLowerCase() === filter)

  return (
    <Box sx={{ mb: 2 }}>
    <DataPanel title="Today's Route" subtitle="Mark visits — Flow 3.3">
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {['all', 'visited', 'pending', 'skipped'].map((f) => (
          <Chip key={f} label={f} onClick={() => setFilter(f)} color={filter === f ? 'primary' : 'default'} variant={filter === f ? 'filled' : 'outlined'} sx={{ textTransform: 'capitalize' }} />
        ))}
      </Box>
      {msg && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setMsg('')}>{msg}</Alert>}
      {shopsList.map((s) => (
        <Box key={s.shopId} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderBottom: `1px solid ${colors.border}` }}>
          <Typography variant="body2" sx={{ width: 24 }}>{s.order}</Typography>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 600 }}>{s.shopName}</Typography>
            <StatusChip status={s.visitStatus.toLowerCase()} />
          </Box>
          {s.visitStatus === 'Pending' && (
            <>
              <Button size="small" variant="outlined" color="success" startIcon={<CheckIcon />} onClick={() => markVisit.mutate({ shopId: s.shopId, status: 'Visited' })}>Visited</Button>
              <Button size="small" variant="outlined" color="warning" onClick={() => markVisit.mutate({ shopId: s.shopId, status: 'Skipped' })}>Skip</Button>
            </>
          )}
        </Box>
      ))}
    </DataPanel>
    </Box>
  )
}

function WeeklySchedulePanel() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [dayOfWeek, setDayOfWeek] = useState(1)
  const [routeName, setRouteName] = useState('')
  const [selectedStaff, setSelectedStaff] = useState<string[]>([])
  const [selectedShops, setSelectedShops] = useState<string[]>([])
  const [msg, setMsg] = useState('')

  const { data: schedules = [], refetch } = useQuery({
    queryKey: ['weekly-schedule'],
    queryFn: () => apiCall<Record<string, unknown>[]>('/routes/weekly-schedule'),
  })

  const save = useMutation({
    mutationFn: () => apiCall('/routes/weekly-schedule', {
      method: 'POST',
      body: { dayOfWeek, dayName: days[dayOfWeek - 1], routeName, userIds: selectedStaff, shopIds: selectedShops },
    }),
    onSuccess: () => { setOpen(false); refetch(); setMsg('Schedule saved') },
  })

  const generate = useMutation({
    mutationFn: () => apiCall<{ generated: number }>('/routes/weekly-schedule/generate-today', { method: 'POST' }),
    onSuccess: (d) => { setMsg(`Generated ${d.generated} daily assignment(s) from today's template`); qc.invalidateQueries({ queryKey: ['route-assignments'] }) },
  })

  const remove = useMutation({
    mutationFn: (id: string) => apiCall(`/routes/weekly-schedule/${id}`, { method: 'DELETE' }),
    onSuccess: () => refetch(),
  })

  return (
    <Box sx={{ mb: 2 }}>
    <DataPanel title="Weekly Schedule" subtitle="Mon–Sun route templates — Flow 3.4"
      actions={<Button variant="contained" color="primary" size="small" startIcon={<PlayArrowIcon />} sx={primaryButtonSx} onClick={() => generate.mutate()}>Generate Today</Button>}
    >
      {msg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg('')}>{msg}</Alert>}
      <Grid container spacing={1.5}>
        {days.map((day, i) => {
          const daySchedules = schedules.filter((s) => s.dayOfWeek === i + 1)
          return (
            <Grid key={day} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Box sx={{ ...whiteCardSx, p: 2, minHeight: 120 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{day}</Typography>
                {daySchedules.length === 0 ? (
                  <Button size="small" sx={{ mt: 1 }} onClick={() => { setDayOfWeek(i + 1); setOpen(true) }}>Add Schedule</Button>
                ) : daySchedules.map((s) => (
                  <Box key={String(s.id)} sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(s.routeName)}</Typography>
                    <Typography variant="caption" color="text.secondary">{String((s.userNames as string[])?.join(', '))}</Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <IconButton size="small" onClick={() => { setDayOfWeek(i + 1); setRouteName(String(s.routeName)); setOpen(true) }}><AddIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => remove.mutate(String(s.id))}><CloseIcon fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
          )
        })}
      </Grid>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Schedule — {days[dayOfWeek - 1]}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 2 }}>
          <TextField label="Route Name" value={routeName} onChange={(e) => setRouteName(e.target.value)} />
          {staff.map((s) => (
            <FormControlLabel key={s.id} control={<Checkbox checked={selectedStaff.includes(s.id)} onChange={() => setSelectedStaff((p) => p.includes(s.id) ? p.filter((x) => x !== s.id) : [...p, s.id])} />} label={s.name} />
          ))}
          {shops.map((s) => (
            <FormControlLabel key={s.id} control={<Checkbox checked={selectedShops.includes(s.id)} onChange={() => setSelectedShops((p) => p.includes(s.id) ? p.filter((x) => x !== s.id) : [...p, s.id])} />} label={s.name} />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" sx={primaryButtonSx} onClick={() => save.mutate()}>Save</Button>
        </DialogActions>
      </Dialog>
    </DataPanel>
    </Box>
  )
}

function RegisterOutletPanel() {
  const [tab, setTab] = useState(0)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ shopName: '', ownerName: '', mobile: '', address: '', category: 'Retail', lat: '28.6139', lng: '77.2090', gstin: '', creditLimit: '', notes: '' })

  const { data: requests = [], refetch } = useQuery({
    queryKey: ['shop-requests'],
    queryFn: () => apiCall<Record<string, unknown>[]>('/shop-requests'),
  })

  const submit = useMutation({
    mutationFn: () => apiCall('/shop-requests', { method: 'POST', body: form }),
    onSuccess: () => { setMsg('Outlet registration submitted — pending approval'); setTab(1); refetch() },
  })

  const review = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiCall(`/shop-requests/${id}`, { method: 'PATCH', body: { status } }),
    onSuccess: () => refetch(),
  })

  return (
    <Box sx={{ mb: 2 }}>
    <DataPanel title="Register Outlet" subtitle="Submit & approve shop requests — Flow 3.5">
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Register New" />
        <Tab label={`Pending Requests (${requests.filter((r) => r.status === 'pending').length})`} />
      </Tabs>
      {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}
      {tab === 0 && (
        <Grid container spacing={2}>
          {(['shopName', 'ownerName', 'mobile', 'address', 'category', 'gstin', 'notes'] as const).map((f) => (
            <Grid key={f} size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label={f.replace(/([A-Z])/g, ' $1')} value={form[f]} onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))} required={['shopName', 'ownerName', 'mobile', 'address', 'category'].includes(f)} />
            </Grid>
          ))}
          <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="GPS Lat" value={form.lat} onChange={(e) => setForm((p) => ({ ...p, lat: e.target.value }))} /></Grid>
          <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="GPS Lng" value={form.lng} onChange={(e) => setForm((p) => ({ ...p, lng: e.target.value }))} /></Grid>
          <Grid size={{ xs: 12 }}>
            <Button variant="contained" color="primary" sx={primaryButtonSx} onClick={() => submit.mutate()}>Submit for Approval</Button>
          </Grid>
        </Grid>
      )}
      {tab === 1 && requests.map((r) => (
        <Box key={String(r.id)} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderBottom: `1px solid ${colors.border}` }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 600 }}>{String(r.shopName)}</Typography>
            <Typography variant="caption">{String(r.ownerName)} — {String(r.mobile)}</Typography>
          </Box>
          <StatusChip status={String(r.status)} />
          {r.status === 'pending' && (
            <>
              <Button size="small" color="success" onClick={() => review.mutate({ id: String(r.id), status: 'approved' })}>Approve</Button>
              <Button size="small" color="error" onClick={() => review.mutate({ id: String(r.id), status: 'rejected' })}>Reject</Button>
            </>
          )}
        </Box>
      ))}
    </DataPanel>
    </Box>
  )
}

function EmployeeDirectoryPanel() {
  const { data: employees = [], refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiCall<Record<string, unknown>[]>('/users'),
  })
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    code: '',
    name: '',
    department: 'Sales',
    phone: '',
    emergencyContact: '',
    address: '',
    district: '',
    role: 'salesman',
    proof: '',
    category: 'Permanent',
    admin: 'No',
  })

  const add = () => {
    employees.unshift({ id: `u-${Date.now()}`, ...form, status: 'active' })
    setOpen(false)
    setForm({
      code: '',
      name: '',
      department: 'Sales',
      phone: '',
      emergencyContact: '',
      address: '',
      district: '',
      role: 'salesman',
      proof: '',
      category: 'Permanent',
      admin: 'No',
    })
    refetch()
  }

  return (
    <Box sx={{ mb: 2 }}>
    <DataPanel title="Employee Directory" subtitle="Admin employee management — Flow 3.6"
      actions={<Button size="small" variant="contained" color="primary" startIcon={<AddIcon />} sx={primaryButtonSx} onClick={() => setOpen(true)}>Add Employee</Button>}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Employee ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Admin</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map((e) => (
            <TableRow key={String(e.id)}>
              <TableCell>{String(e.code ?? e.id)}</TableCell>
              <TableCell>{String(e.name)}</TableCell>
              <TableCell>{String(e.department)}</TableCell>
              <TableCell>{String(e.phone ?? '—')}</TableCell>
              <TableCell>{String(e.role)}</TableCell>
              <TableCell>{String(e.category ?? '—')}</TableCell>
              <TableCell>{String(e.admin ?? '—')}</TableCell>
              <TableCell><StatusChip status={String(e.status)} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Employee</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Employee ID" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} required />
          <TextField label="Employee Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <TextField select label="Department" value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} required>
            {['Sales', 'Logistics', 'Accounts', 'HR', 'Inventory', 'Admin'].map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </TextField>
          <TextField label="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} required />
          <TextField label="Emergency Contact No." value={form.emergencyContact} onChange={(e) => setForm((p) => ({ ...p, emergencyContact: e.target.value }))} required />
          <TextField label="Address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} multiline rows={2} required />
          <TextField label="District" value={form.district} onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))} required />
          <TextField select label="Role" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} required>
            {[
              { value: 'salesman', label: 'Salesman' },
              { value: 'deliveryAgent', label: 'Delivery Agent' },
              { value: 'manager', label: 'Manager' },
              { value: 'admin', label: 'Admin' },
              { value: 'accountant', label: 'Accountant' },
              { value: 'storeKeeper', label: 'Store Keeper' },
            ].map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
          </TextField>
          <TextField
            label="Proof"
            type="file"
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { accept: 'image/*,.pdf' } }}
            onChange={(e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              setForm((p) => ({ ...p, proof: file ? file.name : '' }))
            }}
            helperText={form.proof ? `Selected: ${form.proof}` : 'Upload ID / document proof'}
          />
          <TextField select label="Category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
            {['Permanent', 'Contract', 'Temporary', 'Intern'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
          <TextField select label="Admin" value={form.admin} onChange={(e) => setForm((p) => ({ ...p, admin: e.target.value }))}>
            {['Yes', 'No'].map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" color="primary" sx={primaryButtonSx} onClick={add}>Save</Button></DialogActions>
      </Dialog>
    </DataPanel>
    </Box>
  )
}

function AttendancePanel() {
  const [msg, setMsg] = useState('')
  const { data: today, refetch } = useQuery({
    queryKey: ['attendance-today'],
    queryFn: () => apiCall<Record<string, Record<string, unknown>>>('/attendance/today'),
  })
  const current = today?.current

  const checkIn = useMutation({
    mutationFn: () => apiCall('/attendance/check-in', { method: 'POST', body: { lat: 28.6139, lng: 77.209, address: 'Field HQ' } }),
    onSuccess: () => { setMsg('Checked in — GPS tracking started'); refetch() },
  })
  const checkOut = useMutation({
    mutationFn: () => apiCall('/attendance/check-out', { method: 'POST' }),
    onSuccess: () => { setMsg('Checked out — tracking stopped'); refetch() },
  })
  const recordBreak = useMutation({
    mutationFn: () => apiCall('/attendance/break', { method: 'POST', body: { minutes: 15 } }),
    onSuccess: () => { setMsg('Break recorded (15 min)'); refetch() },
  })

  return (
    <Box sx={{ mb: 2 }}>
    <DataPanel title="Daily Attendance" subtitle="Check in/out with GPS — Flow 3.7">
      {msg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg('')}>{msg}</Alert>}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {!current?.checkIn ? (
          <Button variant="contained" color="success" onClick={() => checkIn.mutate()}>Check In + GPS</Button>
        ) : !current?.checkOut ? (
          <>
            <Chip label={`Checked in: ${new Date(String(current.checkIn)).toLocaleTimeString()}`} color="success" />
            <Button variant="outlined" onClick={() => recordBreak.mutate()}>Record Break</Button>
            <Button variant="contained" color="error" onClick={() => checkOut.mutate()}>Check Out</Button>
          </>
        ) : (
          <Chip label="Day completed" color="default" />
        )}
      </Box>
    </DataPanel>
    </Box>
  )
}

function LeaveRegistryPanel() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ type: 'Casual', fromDate: '', toDate: '', reason: '' })
  const { data: leaves = [], refetch } = useQuery({ queryKey: ['leave'], queryFn: () => apiCall<Record<string, unknown>[]>('/leave') })

  const apply = useMutation({
    mutationFn: () => apiCall('/leave', { method: 'POST', body: form }),
    onSuccess: () => { setOpen(false); refetch() },
  })
  const review = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiCall(`/leave/${id}`, { method: 'PATCH', body: { status } }),
    onSuccess: () => refetch(),
  })

  return (
    <Box sx={{ mb: 2 }}>
    <DataPanel title="Leave Registry" subtitle="Apply & approve leave — Flow 3.8"
      actions={<Button size="small" variant="contained" color="primary" sx={primaryButtonSx} onClick={() => setOpen(true)}>Apply Leave</Button>}
    >
      {leaves.map((l) => (
        <Box key={String(l.id)} sx={{ display: 'flex', gap: 2, py: 1.5, borderBottom: `1px solid ${colors.border}`, alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 600 }}>{String(l.type)} — {String(l.fromDate)} to {String(l.toDate)}</Typography>
            <Typography variant="caption">{String(l.reason)}</Typography>
          </Box>
          <StatusChip status={String(l.status)} />
          {l.status === 'pending' && (
            <>
              <Button size="small" color="success" onClick={() => review.mutate({ id: String(l.id), status: 'approved' })}>Approve</Button>
              <Button size="small" color="error" onClick={() => review.mutate({ id: String(l.id), status: 'rejected' })}>Reject</Button>
            </>
          )}
        </Box>
      ))}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Apply Leave</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField select label="Type" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
            {leaveTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <TextField label="From" type="date" value={form.fromDate} onChange={(e) => setForm((p) => ({ ...p, fromDate: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="To" type="date" value={form.toDate} onChange={(e) => setForm((p) => ({ ...p, toDate: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Reason" multiline rows={2} value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" color="primary" sx={primaryButtonSx} onClick={() => apply.mutate()}>Submit</Button></DialogActions>
      </Dialog>
    </DataPanel>
    </Box>
  )
}

function PayrollPanel() {
  const { data: payslips = [] } = useQuery({ queryKey: ['payslips'], queryFn: () => apiCall<Record<string, unknown>[]>('/payroll/payslips') })
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null)

  return (
    <Box sx={{ mb: 2 }}>
    <DataPanel title="Payroll Management" subtitle="View payslips — Flow 3.9">
      <Table size="small">
        <TableHead><TableRow><TableCell>Employee</TableCell><TableCell>Month</TableCell><TableCell align="right">Net Pay</TableCell><TableCell>Action</TableCell></TableRow></TableHead>
        <TableBody>
          {payslips.map((p) => (
            <TableRow key={String(p.id)}>
              <TableCell>{String(p.employeeName)}</TableCell>
              <TableCell>{String(p.month)}</TableCell>
              <TableCell align="right">{formatCurrency(Number(p.netPay))}</TableCell>
              <TableCell><Button size="small" onClick={() => setSelected(p)}>View</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Payslip — {String(selected?.employeeName)}</DialogTitle>
        <DialogContent>
          {selected && ['basic', 'hra', 'incentives', 'deductions', 'netPay'].map((k) => (
            <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{k}</Typography>
              <Typography sx={{ fontWeight: 600 }}>{formatCurrency(Number(selected[k]))}</Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions><Button onClick={() => setSelected(null)}>Close</Button><Button variant="outlined" onClick={() => window.print()}>Download PDF</Button></DialogActions>
      </Dialog>
    </DataPanel>
    </Box>
  )
}

function RolesAccessPanel() {
  const [role, setRole] = useState('salesman')
  const [msg, setMsg] = useState('')
  const { data: permissions = {}, refetch } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => apiCall<Record<string, string[]>>('/admin/permissions'),
  })
  const [selected, setSelected] = useState<string[]>(permissions[role] ?? [])

  const save = useMutation({
    mutationFn: () => apiCall(`/admin/permissions/${role}`, { method: 'PUT', body: selected }),
    onSuccess: () => { setMsg('Permissions saved'); refetch() },
  })

  return (
    <Box sx={{ mb: 2 }}>
    <DataPanel title="Roles & Access Controller" subtitle="Toggle module permissions — Flow 3.10">
      {msg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg('')}>{msg}</Alert>}
      <TextField select size="small" value={role} onChange={(e) => { setRole(e.target.value); setSelected(permissions[e.target.value] ?? []) }} sx={{ mb: 2, minWidth: 180 }}>
        {Object.keys(permissions).map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
      </TextField>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {appModules.map((m) => (
          <Chip key={m} label={m} color={selected.includes(m) ? 'primary' : 'default'} variant={selected.includes(m) ? 'filled' : 'outlined'}
            onClick={() => setSelected((p) => p.includes(m) ? p.filter((x) => x !== m) : [...p, m])} />
        ))}
      </Box>
      <Button variant="contained" color="primary" sx={{ ...primaryButtonSx, mt: 2 }} onClick={() => save.mutate()}>Save Permissions</Button>
    </DataPanel>
    </Box>
  )
}

function PerformancePanel() {
  const [period, setPeriod] = useState('month')
  const { data } = useQuery({ queryKey: ['performance'], queryFn: () => apiCall<Record<string, unknown>>('/users/me/performance') })

  if (!data) return null
  const leaderboard = (data.leaderboard as { name: string; sales: number; visits: number; orders: number; rank: number }[]) ?? []

  return (
    <Box sx={{ mb: 2 }}>
    <DataPanel title="Performance Indicators" subtitle="Team KPIs & leaderboard — Flow 3.11">
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {['week', 'month', 'quarter'].map((p) => (
          <Chip key={p} label={`This ${p}`} onClick={() => setPeriod(p)} color={period === p ? 'primary' : 'default'} sx={{ textTransform: 'capitalize' }} />
        ))}
      </Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { label: 'Team Sales', val: formatCurrency(Number(data.teamSales)) },
          { label: 'Total Orders', val: String(data.totalOrders) },
          { label: 'Target %', val: `${data.targetAchievement}%` },
          { label: 'Attendance', val: `${data.attendanceRate}%` },
        ].map((k) => (
          <Grid key={k.label} size={{ xs: 6, md: 3 }}>
            <Box sx={{ ...whiteCardSx, p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">{k.label}</Typography>
              <Typography sx={{ fontWeight: 800 }}>{k.val}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Typography variant="subtitle2" gutterBottom>Leaderboard</Typography>
      {leaderboard.map((e) => (
        <Box key={e.name} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1, borderBottom: `1px solid ${colors.border}` }}>
          <Chip label={`#${e.rank}`} size="small" color="primary" />
          <Typography sx={{ flex: 1, fontWeight: 600 }}>{e.name}</Typography>
          <Typography variant="body2">{formatCurrency(e.sales)}</Typography>
          <Typography variant="caption" color="text.secondary">{e.orders} orders</Typography>
        </Box>
      ))}
    </DataPanel>
    </Box>
  )
}

const EMPTY_PRODUCT_FORM = { name: '', category: '', price: 0, gstRate: 5, hsn: '', unit: 'pkt', stockQty: 0, image: '', qtyValue: 1, qtyUnit: 'kg' }

const QTY_UNITS = ['gm', 'kg', 'ml', 'L', 'pcs', 'dozen', 'box']

function ProductCatalogPanel() {
  const queryClient = useQueryClient()
  const { data: catalog = [] } = useQuery({ queryKey: ['products'], queryFn: () => apiCall<typeof products>('/products') })
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_PRODUCT_FORM)
  const categories = ['All', ...Array.from(new Set(catalog.map((product) => product.category)))]
  const visibleProducts = catalog.filter((product) => {
    const query = search.trim().toLowerCase()
    return (category === 'All' || product.category === category)
      && (!query || [product.name, product.category, product.hsn].some((value) => value.toLowerCase().includes(query)))
  })
  const selectedProduct = visibleProducts.find((p) => p.id === selectedId) ?? visibleProducts[0] ?? null

  const openAddDialog = () => {
    setEditingId(null)
    setForm(EMPTY_PRODUCT_FORM)
    setOpen(true)
  }

  const openEditDialog = (product: (typeof products)[number]) => {
    setEditingId(product.id)
    setForm({
      name: product.name, category: product.category, price: product.price, gstRate: product.gstRate,
      hsn: product.hsn, unit: product.unit, stockQty: product.stockQty, image: product.image ?? '',
      qtyValue: product.qtyValue ?? 1, qtyUnit: product.qtyUnit ?? 'kg',
    })
    setOpen(true)
  }

  const save = useMutation({
    mutationFn: () =>
      editingId
        ? apiCall(`/products/${editingId}`, {
          method: 'PUT',
          body: { ...form, packSize: `${form.qtyValue} ${form.qtyUnit}` },
        })
        : apiCall('/products', {
          method: 'POST',
          body: {
            ...form,
            packSize: `${form.qtyValue} ${form.qtyUnit}`,
            barcode: `8901${String(Date.now()).slice(-9)}`,
            mrp: Math.round(form.price * 1.15),
            mop: Math.round(form.price * 1.05),
            batch: `B-NEW-${new Date().toISOString().slice(5, 7)}${new Date().toISOString().slice(2, 4)}`,
          },
        }),
    onSuccess: () => {
      setOpen(false)
      setEditingId(null)
      setForm(EMPTY_PRODUCT_FORM)
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  return (
    <Box sx={{ mb: 2.5 }}>
    <DataPanel title="All products" subtitle={`${catalog.length} products`}
      actions={<Button size="small" variant="contained" color="primary" startIcon={<AddIcon />} sx={primaryButtonSx} onClick={openAddDialog}>Add Product</Button>}
    >
      <Box sx={{
        mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap',
      }}>
        <TextField
          size="small"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products"
          slotProps={{ input: { startAdornment: <SearchIcon sx={{ mr: 1, fontSize: 20, color: productCatalog.muted }} /> } }}
          sx={{
            flex: '1 1 240px',
            '& .MuiOutlinedInput-root': { bgcolor: productCatalog.cardBg, borderRadius: '10px' },
          }}
        />
        <TextField
          select
          size="small"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
        >
          {categories.map((item) => <MenuItem key={item} value={item}>{item === 'All' ? 'All categories' : item}</MenuItem>)}
        </TextField>
      </Box>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Box
            sx={{
              border: `1px solid ${productCatalog.cardBorder}`,
              borderRadius: productCatalog.cardRadius,
              bgcolor: productCatalog.cardBg,
              maxHeight: { xs: 420, md: 560 },
              overflowY: 'auto',
            }}
          >
            {visibleProducts.map((p) => {
              const active = selectedProduct?.id === p.id
              return (
                <Box
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    alignItems: 'center',
                    px: 1.75,
                    py: 1.5,
                    cursor: 'pointer',
                    borderBottom: `1px solid ${productCatalog.cardBorder}`,
                    bgcolor: active ? 'color-mix(in srgb, var(--rs-primary) 8%, white)' : 'transparent',
                    borderLeft: active ? `3px solid ${colors.primary}` : '3px solid transparent',
                    transition: 'background-color 140ms ease',
                    '&:hover': { bgcolor: active ? 'color-mix(in srgb, var(--rs-primary) 10%, white)' : productCatalog.imageBg },
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Box sx={{
                    width: 44, height: 44, flexShrink: 0, borderRadius: '10px',
                    bgcolor: productCatalog.imageBg, display: 'grid', overflow: 'hidden',
                    placeItems: 'center', color: productCatalog.categoryColor,
                  }}>
                    {p.image ? (
                      <Box component="img" src={p.image} alt={p.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 800 }}>{p.name.charAt(0)}</Typography>
                    )}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography noWrap sx={{ color: colors.textPrimary, fontWeight: 700, fontSize: '0.88rem' }}>
                      {p.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: productCatalog.muted }}>
                      {p.category} · {formatCurrency(p.price)}
                    </Typography>
                  </Box>
                  <Box sx={{
                    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                    bgcolor: p.stockQty < 120 ? productCatalog.stockLow : productCatalog.stockHealthy,
                  }} />
                </Box>
              )
            })}
            {visibleProducts.length === 0 && (
              <Box sx={{ py: 6, textAlign: 'center', px: 2 }}>
                <Inventory2OutlinedIcon sx={{ fontSize: 36, color: productCatalog.muted, mb: 1 }} />
                <Typography sx={{ fontWeight: 700, color: colors.textPrimary }}>No products found</Typography>
                <Typography variant="body2" sx={{ color: productCatalog.muted }}>Try another search or category.</Typography>
              </Box>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          {selectedProduct ? (
            <Box
              sx={{
                height: '100%',
                minHeight: { xs: 360, md: 560 },
                p: { xs: 2, md: 2.75 },
                bgcolor: productCatalog.cardBg,
                border: `1px solid ${productCatalog.cardBorder}`,
                borderRadius: productCatalog.cardRadius,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: colors.textPrimary }}>
                    Product Preview
                  </Typography>
                  <Typography variant="body2" sx={{ color: productCatalog.muted }}>
                    Updates when you select a product from the list
                  </Typography>
                </Box>
                <Tooltip title="Edit product">
                  <IconButton
                    size="small"
                    onClick={() => openEditDialog(selectedProduct)}
                    sx={{ color: productCatalog.muted, bgcolor: productCatalog.imageBg, '&:hover': { color: colors.primary } }}
                  >
                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  borderRadius: '16px',
                  bgcolor: productCatalog.imageBg,
                  border: `1px solid ${productCatalog.cardBorder}`,
                  display: 'grid',
                  placeItems: 'center',
                  overflow: 'hidden',
                  minHeight: 220,
                  mb: 2.5,
                }}
              >
                {selectedProduct.image ? (
                  <Box
                    component="img"
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    sx={{ width: '100%', height: '100%', maxHeight: 280, objectFit: 'contain', p: 2 }}
                  />
                ) : (
                  <Typography sx={{ fontSize: '4rem', fontWeight: 800, color: productCatalog.categoryColor }}>
                    {selectedProduct.name.charAt(0)}
                  </Typography>
                )}
              </Box>

              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: colors.textPrimary, mb: 0.5 }}>
                {selectedProduct.name}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                <Chip label={selectedProduct.category} size="small" sx={{ fontWeight: 600 }} />
                {selectedProduct.packSize && (
                  <Chip
                    label={selectedProduct.packSize}
                    size="small"
                    sx={{ fontWeight: 700, bgcolor: productCatalog.imageBg, color: productCatalog.categoryColor }}
                  />
                )}
                <Chip label={`HSN ${selectedProduct.hsn}`} size="small" variant="outlined" />
              </Box>

              <Grid container spacing={1.5}>
                {[
                  { label: 'Price', value: formatCurrency(selectedProduct.price) },
                  { label: 'GST', value: `${selectedProduct.gstRate}%` },
                  { label: 'MRP', value: formatCurrency(selectedProduct.mrp) },
                  { label: 'MOP', value: formatCurrency(selectedProduct.mop) },
                  { label: 'Stock', value: `${selectedProduct.stockQty} ${selectedProduct.unit}` },
                  { label: 'Batch', value: selectedProduct.batch || '—' },
                  { label: 'Barcode', value: selectedProduct.barcode || '—' },
                  { label: 'Unit', value: selectedProduct.unit || '—' },
                ].map((item) => (
                  <Grid key={item.label} size={{ xs: 6, sm: 3 }}>
                    <Box
                      sx={{
                        p: 1.25,
                        borderRadius: '12px',
                        bgcolor: productCatalog.imageBg,
                        border: `1px solid ${productCatalog.cardBorder}`,
                        height: '100%',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: productCatalog.muted, fontWeight: 600 }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: colors.textPrimary }}>
                        {item.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <Box
              sx={{
                height: '100%',
                minHeight: 360,
                display: 'grid',
                placeItems: 'center',
                border: `1px dashed ${productCatalog.cardBorder}`,
                borderRadius: productCatalog.cardRadius,
                bgcolor: productCatalog.cardBg,
                p: 3,
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Inventory2OutlinedIcon sx={{ fontSize: 48, color: productCatalog.muted, mb: 1 }} />
                <Typography sx={{ fontWeight: 700 }}>Select a product</Typography>
                <Typography variant="body2" sx={{ color: productCatalog.muted }}>
                  Choose an item from the list to preview details
                </Typography>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '20px', p: 0.5 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 0.5 }}>{editingId ? 'Edit product' : 'Add a new product'}</DialogTitle>
        <Typography variant="body2" sx={{ px: 3, color: productCatalog.muted }}>
          {editingId ? 'Update the product, tax and stock details.' : 'Enter the product, tax and opening stock details.'}
        </Typography>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '20px !important' }}>
          <ImageUploadField
            label="Product image"
            helperText="Upload a product photo (JPG, PNG)"
            value={form.image}
            onChange={(value) => setForm((p) => ({ ...p, image: value }))}
          />
          <TextField size="small" label="Product name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <TextField size="small" label="Category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 7 }}>
              <TextField
                fullWidth size="small" label="Quantity" type="number" value={form.qtyValue}
                onChange={(e) => setForm((p) => ({ ...p, qtyValue: Number(e.target.value) }))}
              />
            </Grid>
            <Grid size={{ xs: 5 }}>
              <TextField
                select fullWidth size="small" label="Unit" value={form.qtyUnit}
                onChange={(e) => setForm((p) => ({ ...p, qtyUnit: e.target.value }))}
              >
                {QTY_UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 7 }}>
              <TextField fullWidth size="small" label="Price" type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} />
            </Grid>
            <Grid size={{ xs: 5 }}>
              <TextField fullWidth size="small" label="GST %" type="number" value={form.gstRate} onChange={(e) => setForm((p) => ({ ...p, gstRate: Number(e.target.value) }))} />
            </Grid>
          </Grid>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6 }}>
              <TextField fullWidth size="small" label="HSN code" value={form.hsn} onChange={(e) => setForm((p) => ({ ...p, hsn: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField fullWidth size="small" label="Stock qty" type="number" value={form.stockQty} onChange={(e) => setForm((p) => ({ ...p, stockQty: Number(e.target.value) }))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" color="primary" sx={primaryButtonSx} onClick={() => save.mutate()} disabled={!form.name || save.isPending}>
            {save.isPending ? 'Saving…' : editingId ? 'Save changes' : 'Save product'}
          </Button>
        </DialogActions>
      </Dialog>
    </DataPanel>
    </Box>
  )
}

function StockAllocationPanel() {
  const { data: allocations = [], refetch } = useQuery({ queryKey: ['stock-allocations'], queryFn: () => apiCall<Record<string, unknown>[]>('/stock/allocations') })
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ agent: staff[1].name, product: products[1].name, qty: 50, orderRef: 'ORD-1045' })

  const create = useMutation({
    mutationFn: () => apiCall('/stock/allocations', { method: 'POST', body: form }),
    onSuccess: () => { setOpen(false); refetch() },
  })
  const receive = useMutation({
    mutationFn: (id: string) => apiCall(`/stock/allocations/${id}/delivery`, { method: 'PATCH' }),
    onSuccess: () => refetch(),
  })

  return (
    <Box sx={{ mb: 2 }}>
    <DataPanel title="Stock Allocation" subtitle="Allocate from confirmed orders — Flow 3.13"
      actions={<Button size="small" variant="contained" color="primary" sx={primaryButtonSx} onClick={() => setOpen(true)}>Allocate Stock</Button>}
    >
      {allocations.map((a) => (
        <Box key={String(a.id)} sx={{ display: 'flex', gap: 2, py: 1.5, borderBottom: `1px solid ${colors.border}`, alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 600 }}>{String(a.product)} → {String(a.agent)}</Typography>
            <Typography variant="caption">Qty: {String(a.qty)} · Ref: {String(a.orderRef)}</Typography>
          </Box>
          <StatusChip status={String(a.status)} />
          {a.status === 'pending' && <Button size="small" color="success" onClick={() => receive.mutate(String(a.id))}>Mark Received</Button>}
        </Box>
      ))}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create Allocation</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField select label="Agent" value={form.agent} onChange={(e) => setForm((p) => ({ ...p, agent: e.target.value }))}>
            {staff.map((s) => <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>)}
          </TextField>
          <TextField select label="Product" value={form.product} onChange={(e) => setForm((p) => ({ ...p, product: e.target.value }))}>
            {products.map((p) => <MenuItem key={p.id} value={p.name}>{p.name}</MenuItem>)}
          </TextField>
          <TextField label="Quantity" type="number" value={form.qty} onChange={(e) => setForm((p) => ({ ...p, qty: Number(e.target.value) }))} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" color="primary" sx={primaryButtonSx} onClick={() => create.mutate()}>Allocate</Button></DialogActions>
      </Dialog>
    </DataPanel>
    </Box>
  )
}

function StockManagementPanel() {
  const [msg, setMsg] = useState('')
  const { data, refetch } = useQuery({ queryKey: ['stock-overview'], queryFn: () => apiCall<Record<string, unknown>>('/stock/overview') })
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ type: 'in', product: products[0].name, qty: 100, ref: '' })

  const record = useMutation({
    mutationFn: () => apiCall('/stock/movements', { method: 'POST', body: form }),
    onSuccess: () => { setOpen(false); setMsg('Stock movement recorded'); refetch() },
  })

  if (!data) return null
  const movements = (data.movements as Record<string, unknown>[]) ?? []

  return (
    <Box sx={{ mb: 2 }}>
    <DataPanel title="Stock Management" subtitle="Warehouse overview & movements — Flow 3.14"
      actions={<Button size="small" variant="contained" color="primary" sx={primaryButtonSx} onClick={() => setOpen(true)}>Record Movement</Button>}
    >
      {msg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg('')}>{msg}</Alert>}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { label: 'Total SKUs', val: String(data.totalSkus ?? '—') },
          { label: 'Warehouse Value', val: formatCurrency(Number(data.warehouseValue)) },
          { label: 'Low Stock', val: String(data.lowStockCount ?? '—') },
          { label: 'Net Movement', val: String(data.netMovement ?? '—') },
        ].map((k) => (
          <Grid key={k.label} size={{ xs: 6, md: 3 }}>
            <Box sx={{ ...whiteCardSx, p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">{k.label}</Typography>
              <Typography sx={{ fontWeight: 800 }}>{k.val}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Typography variant="subtitle2" gutterBottom>Recent Movements</Typography>
      {movements.map((m) => (
        <Box key={String(m.id)} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${colors.border}` }}>
          <Typography variant="body2">{String(m.type).toUpperCase()} — {String(m.product)}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(m.qty)} units</Typography>
        </Box>
      ))}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Record Stock Movement</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField select label="Type" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
            <MenuItem value="in">Stock In</MenuItem>
            <MenuItem value="out">Stock Out</MenuItem>
          </TextField>
          <TextField select label="Product" value={form.product} onChange={(e) => setForm((p) => ({ ...p, product: e.target.value }))}>
            {products.map((p) => <MenuItem key={p.id} value={p.name}>{p.name}</MenuItem>)}
          </TextField>
          <TextField label="Quantity" type="number" value={form.qty} onChange={(e) => setForm((p) => ({ ...p, qty: Number(e.target.value) }))} />
          <TextField label="Reference" value={form.ref} onChange={(e) => setForm((p) => ({ ...p, ref: e.target.value }))} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" color="primary" sx={primaryButtonSx} onClick={() => record.mutate()}>Save</Button></DialogActions>
      </Dialog>
    </DataPanel>
    </Box>
  )
}
