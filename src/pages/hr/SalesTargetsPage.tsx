import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { createItem, fetchList, updateItem } from '@/api/client'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { StatusChip } from '@/components/ui/StatusChip'
import { formatCurrency } from '@/utils/export'
import { calculateAchievementPercent } from '@/utils/hrCalc'
import { v, mix } from '@/theme/cssVars'
import { colors } from '@/theme/palette'
import { HrWorkflowStrip } from './HrWorkflowStrip'

const SALESMEN = [
  'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Reddy',
  'Vikram Singh', 'Anita Desai', 'Rajesh Gupta', 'Kavita Nair',
]
const TARGET_TYPES = ['Sales', 'Collection', 'Delivery', 'Performance', 'Route Coverage'] as const
const PERIODS = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026']

interface TargetRow {
  id: string
  code: string
  targetName: string
  assignee: string
  targetType: string
  targetValue: number
  achievedValue: number
  achievementPercent: number
  startDate: string
  endDate: string
  status: string
  period?: string
}

const emptyForm = {
  targetName: '',
  assignee: '',
  targetType: 'Sales',
  targetValue: 300000,
  achievedValue: 0,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  period: 'Jul 2026',
  status: 'active',
}

const fieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: v.surface, fontSize: '0.875rem' },
} as const

export function SalesTargetsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [achieveId, setAchieveId] = useState<string | null>(null)
  const [achieveValue, setAchieveValue] = useState(0)
  const [form, setForm] = useState(emptyForm)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['module', 'hr-sales-targets'],
    queryFn: () => fetchList<TargetRow>('/hr-sales-targets', { page: 1, pageSize: 100 }),
  })

  const rows = (data?.data ?? []) as TargetRow[]

  const kpis = useMemo(() => {
    const active = rows.filter((r) => r.status === 'active').length
    const avg = rows.length
      ? Math.round(rows.reduce((s, r) => s + (Number(r.achievementPercent) || 0), 0) / rows.length)
      : 0
    const met = rows.filter((r) => (Number(r.achievementPercent) || 0) >= 100).length
    return { total: rows.length, active, avg, met }
  }, [rows])

  const create = useMutation({
    mutationFn: () => {
      const end = form.endDate || (() => {
        const d = new Date(form.startDate)
        d.setDate(d.getDate() + 30)
        return d.toISOString().split('T')[0]
      })()
      return createItem('/hr-sales-targets', {
        ...form,
        endDate: end,
        achievedValue: Number(form.achievedValue) || 0,
        targetValue: Number(form.targetValue) || 0,
      })
    },
    onSuccess: () => {
      setMsg('Target created and assigned to salesman')
      setOpen(false)
      setForm(emptyForm)
      refetch()
      queryClient.invalidateQueries({ queryKey: ['module', 'hr-sales-targets'] })
    },
    onError: () => setError('Failed to create target'),
  })

  const updateAchievement = useMutation({
    mutationFn: () => {
      const row = rows.find((r) => r.id === achieveId)
      if (!row) throw new Error('Target not found')
      return updateItem('/hr-sales-targets', row.id, {
        ...row,
        achievedValue: achieveValue,
        status: calculateAchievementPercent(Number(row.targetValue), achieveValue) >= 100 ? 'completed' : row.status,
      })
    },
    onSuccess: () => {
      setMsg('Achievement updated from orders / collections')
      setAchieveId(null)
      refetch()
      queryClient.invalidateQueries({ queryKey: ['module', 'hr-sales-targets'] })
    },
  })

  const generateIncentive = useMutation({
    mutationFn: async (row: TargetRow) => {
      const role = row.targetType === 'Delivery' ? 'Delivery Agent' : 'Salesman'
      return createItem('/hr-incentives', {
        employeeId: `EMP-${String(SALESMEN.indexOf(row.assignee) + 1 || 1).padStart(4, '0')}`,
        name: row.assignee,
        role,
        period: row.period || PERIODS[PERIODS.length - 1],
        target: Number(row.targetValue),
        achieved: Number(row.achievedValue),
        status: 'pending',
        targetRef: row.code,
      })
    },
    onSuccess: () => {
      setMsg('Incentive generated from target achievement — open Incentives to review')
      queryClient.invalidateQueries({ queryKey: ['module', 'hr-incentives'] })
    },
    onError: () => setError('Failed to generate incentive'),
  })

  const handleCreate = () => {
    setError('')
    if (!form.targetName.trim() || !form.assignee || !form.targetValue) {
      setError('Target name, salesman, and target value are required')
      return
    }
    create.mutate()
  }

  return (
    <PageShell
      title="Sales Targets"
      subtitle="Admin creates targets, assigns to salesmen, and tracks achievement from route sales"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'HR', path: '/hr/employees' },
        { label: 'Sales Targets' },
      ]}
      actions={
        <Button variant="contained" color="primary" startIcon={<AddIcon />} sx={primaryButtonSx} onClick={() => setOpen(true)}>
          Create Target
        </Button>
      }
    >
      <HrWorkflowStrip activeStep={0} />

      {msg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg('')}>{msg}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {[
          { label: 'Total Targets', val: kpis.total },
          { label: 'Active', val: kpis.active },
          { label: 'Avg Achievement', val: `${kpis.avg}%` },
          { label: 'Targets Met', val: kpis.met },
        ].map((k) => (
          <Grid key={k.label} size={{ xs: 6, md: 3 }}>
            <Box sx={{ ...whiteCardSx, p: 2 }}>
              <Typography variant="caption" sx={{ color: v.textMuted, fontWeight: 600 }}>{k.label}</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.35rem' }}>{isLoading ? '—' : k.val}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ ...whiteCardSx, p: 0, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${v.border}` }}>
          <Typography sx={{ fontWeight: 700 }}>Assigned Targets</Typography>
          <Typography variant="caption" sx={{ color: v.textMuted }}>
            After route visits → orders → invoices → collections, update achievement and generate incentive
          </Typography>
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: mix.surface(8) }}>
                {['Target No.', 'Name', 'Salesman', 'Type', 'Target', 'Achieved', 'Achievement %', 'Status', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: v.textSecondary, whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.code}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.targetName}</TableCell>
                  <TableCell>{row.assignee}</TableCell>
                  <TableCell>{row.targetType}</TableCell>
                  <TableCell>{row.targetType === 'Sales' || row.targetType === 'Collection' ? formatCurrency(Number(row.targetValue)) : row.targetValue}</TableCell>
                  <TableCell>{row.targetType === 'Sales' || row.targetType === 'Collection' ? formatCurrency(Number(row.achievedValue)) : row.achievedValue}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ color: Number(row.achievementPercent) >= 100 ? colors.success : Number(row.achievementPercent) >= 70 ? colors.warning : colors.error }}
                    >
                      {Number(row.achievementPercent) || 0}%
                    </Typography>
                  </TableCell>
                  <TableCell><StatusChip status={String(row.status)} /></TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Button size="small" startIcon={<TrendingUpIcon />} onClick={() => { setAchieveId(row.id); setAchieveValue(Number(row.achievedValue) || 0) }}>
                      Update Achievement
                    </Button>
                    <Button
                      size="small"
                      disabled={!row.achievedValue}
                      onClick={() => generateIncentive.mutate(row)}
                    >
                      Generate Incentive
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4, color: v.textMuted }}>
                    No targets yet. Create one to assign to a salesman.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button variant="outlined" onClick={() => navigate('/hr/incentives')} sx={{ borderRadius: '12px', textTransform: 'none' }}>
          Go to Incentives →
        </Button>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create & Assign Target</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Target Name" value={form.targetName} onChange={(e) => setForm((p) => ({ ...p, targetName: e.target.value }))} required sx={fieldSx} />
          <TextField select label="Assign to Salesman" value={form.assignee} onChange={(e) => setForm((p) => ({ ...p, assignee: e.target.value }))} required sx={fieldSx}>
            {SALESMEN.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField select label="Target Type" value={form.targetType} onChange={(e) => setForm((p) => ({ ...p, targetType: e.target.value }))} sx={fieldSx}>
            {TARGET_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <TextField select label="Period" value={form.period} onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))} sx={fieldSx}>
            {PERIODS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </TextField>
          <TextField label="Target Value" type="number" value={form.targetValue} onChange={(e) => setForm((p) => ({ ...p, targetValue: Number(e.target.value) }))} required sx={fieldSx} helperText="Sales/Collection in ₹, others as count" />
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField fullWidth label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} sx={fieldSx} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="End Date" type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} sx={fieldSx} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" sx={primaryButtonSx} disabled={create.isPending} onClick={handleCreate}>
            {create.isPending ? 'Saving…' : 'Create & Assign'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!achieveId} onClose={() => setAchieveId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Achievement</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, color: v.textSecondary }}>
            Enter value from invoices / collections received on the salesman’s route.
          </Typography>
          <TextField fullWidth label="Achieved Value" type="number" value={achieveValue} onChange={(e) => setAchieveValue(Number(e.target.value))} sx={fieldSx} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAchieveId(null)}>Cancel</Button>
          <Button variant="contained" color="primary" sx={primaryButtonSx} onClick={() => updateAchievement.mutate()}>
            Save Achievement
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  )
}
