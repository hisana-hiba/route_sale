import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RuleIcon from '@mui/icons-material/Rule'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { createItem, fetchList, updateItem } from '@/api/client'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { StatusChip } from '@/components/ui/StatusChip'
import { formatCurrency } from '@/utils/export'
import { calculateIncentive } from '@/utils/hrCalc'
import { v, mix } from '@/theme/cssVars'
import { colors } from '@/theme/palette'
import { HrWorkflowStrip } from './HrWorkflowStrip'

const ROLES = ['Salesman', 'Delivery Agent', 'Driver', 'Manager'] as const
const PERIODS = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026']

interface IncentiveRow {
  id: string
  code: string
  employeeId: string
  name: string
  role: string
  period: string
  target: number
  achieved: number
  achievementPercent: number
  incentiveEarned: number
  status: string
}

const emptyForm = {
  employeeId: '',
  name: '',
  role: 'Salesman',
  period: 'Jul 2026',
  target: 300000,
  achieved: 0,
  status: 'pending',
}

const fieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: v.surface, fontSize: '0.875rem' },
} as const

const RULES = [
  { when: '≥ 100% achievement', result: 'Full role base + stretch bonus' },
  { when: '70% – 99%', result: 'Pro-rata incentive on role base' },
  { when: 'Below 70%', result: 'No incentive generated' },
]

export function IncentivesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['module', 'hr-incentives'],
    queryFn: () => fetchList<IncentiveRow>('/hr-incentives', { page: 1, pageSize: 100 }),
  })

  const rows = (data?.data ?? []) as IncentiveRow[]

  const preview = useMemo(
    () => calculateIncentive(form.role, Number(form.target) || 0, Number(form.achieved) || 0),
    [form.role, form.target, form.achieved],
  )

  const kpis = useMemo(() => {
    const totalEarned = rows.reduce((s, r) => s + (Number(r.incentiveEarned) || 0), 0)
    const avg = rows.length
      ? Math.round(rows.reduce((s, r) => s + (Number(r.achievementPercent) || 0), 0) / rows.length)
      : 0
    const approved = rows.filter((r) => r.status === 'approved' || r.status === 'completed').length
    return { total: rows.length, totalEarned, avg, approved }
  }, [rows])

  const create = useMutation({
    mutationFn: () => createItem('/hr-incentives', {
      ...form,
      target: Number(form.target),
      achieved: Number(form.achieved),
    }),
    onSuccess: () => {
      setMsg('Incentive rule applied and incentive generated')
      setOpen(false)
      setForm(emptyForm)
      refetch()
      queryClient.invalidateQueries({ queryKey: ['module', 'hr-incentives'] })
    },
    onError: () => setError('Failed to generate incentive'),
  })

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateItem('/hr-incentives', id, { status }),
    onSuccess: (_, v) => {
      setMsg(v.status === 'approved' ? 'Incentive approved for payroll' : v.status === 'completed' ? 'Incentive marked paid' : 'Status updated')
      refetch()
      queryClient.invalidateQueries({ queryKey: ['module', 'hr-incentives'] })
    },
  })

  const pushToPayroll = useMutation({
    mutationFn: (row: IncentiveRow) =>
      createItem('/hr-payroll', {
        employeeId: row.employeeId,
        name: row.name,
        department: row.role === 'Salesman' || row.role === 'Manager' ? 'Sales' : 'Logistics',
        payrollMonth: row.period,
        monthlyBase: 25000,
        pendingSalary: 0,
        incentiveAmount: Number(row.incentiveEarned) || 0,
        grossSalary: 25000 + (Number(row.incentiveEarned) || 0),
        totalDeductions: 2000,
        netSalary: 23000 + (Number(row.incentiveEarned) || 0),
        status: 'pending',
        incentiveRef: row.code,
      }),
    onSuccess: async (_, row) => {
      await updateItem('/hr-incentives', row.id, { status: 'approved' })
      setMsg('Payroll created from incentive — open Payroll for manager approval')
      refetch()
      queryClient.invalidateQueries({ queryKey: ['module', 'hr-payroll'] })
      queryClient.invalidateQueries({ queryKey: ['module', 'hr-incentives'] })
    },
    onError: () => setError('Failed to create payroll from incentive'),
  })

  const handleCreate = () => {
    setError('')
    if (!form.name.trim() || !form.employeeId.trim() || !form.target) {
      setError('Employee ID, name, and target are required')
      return
    }
    create.mutate()
  }

  return (
    <PageShell
      title="Incentives"
      subtitle="Achievement % drives incentive rules — generate and approve incentives for payroll"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'HR', path: '/hr/employees' },
        { label: 'Incentives' },
      ]}
      actions={
        <Button variant="contained" color="primary" startIcon={<AddIcon />} sx={primaryButtonSx} onClick={() => setOpen(true)}>
          Generate Incentive
        </Button>
      }
    >
      <HrWorkflowStrip activeStep={5} />

      {msg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg('')}>{msg}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {[
          { label: 'Records', val: kpis.total },
          { label: 'Total Incentives', val: formatCurrency(kpis.totalEarned) },
          { label: 'Avg Achievement', val: `${kpis.avg}%` },
          { label: 'Approved / Paid', val: kpis.approved },
        ].map((k) => (
          <Grid key={k.label} size={{ xs: 6, md: 3 }}>
            <Box sx={{ ...whiteCardSx, p: 2 }}>
              <Typography variant="caption" sx={{ color: v.textMuted, fontWeight: 600 }}>{k.label}</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem' }}>{isLoading ? '—' : k.val}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ ...whiteCardSx, mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <RuleIcon sx={{ color: colors.primary, fontSize: 20 }} />
          <Typography sx={{ fontWeight: 700 }}>Incentive Rules</Typography>
        </Box>
        <Grid container spacing={1.5}>
          {RULES.map((r) => (
            <Grid key={r.when} size={{ xs: 12, md: 4 }}>
              <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: mix.primary(5), border: `1px solid ${mix.primary(12)}` }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: colors.primary }}>{r.when}</Typography>
                <Typography variant="body2" sx={{ color: v.textSecondary }}>{r.result}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ ...whiteCardSx, p: 0, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${v.border}` }}>
          <Typography sx={{ fontWeight: 700 }}>Generated Incentives</Typography>
          <Typography variant="caption" sx={{ color: v.textMuted }}>
            Approve incentives, then push into payroll for manager approval and salary payment
          </Typography>
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: mix.surface(8) }}>
                {['Ref', 'Employee', 'Role', 'Period', 'Target', 'Achieved', 'Ach %', 'Incentive', 'Status', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: v.textSecondary, whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.code}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.employeeId}</Typography>
                  </TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>{row.period}</TableCell>
                  <TableCell>{formatCurrency(Number(row.target))}</TableCell>
                  <TableCell>{formatCurrency(Number(row.achieved))}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ color: Number(row.achievementPercent) >= 100 ? colors.success : Number(row.achievementPercent) >= 70 ? colors.warning : colors.error }}
                    >
                      {Number(row.achievementPercent) || 0}%
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(Number(row.incentiveEarned))}</TableCell>
                  <TableCell><StatusChip status={String(row.status)} /></TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {row.status === 'pending' && (
                      <Button size="small" onClick={() => setStatus.mutate({ id: row.id, status: 'approved' })}>Approve</Button>
                    )}
                    {(row.status === 'pending' || row.status === 'approved') && (
                      <Button size="small" onClick={() => pushToPayroll.mutate(row)}>Create Payroll</Button>
                    )}
                    {row.status === 'approved' && (
                      <Button size="small" onClick={() => setStatus.mutate({ id: row.id, status: 'completed' })}>Mark Paid</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4, color: v.textMuted }}>
                    No incentives yet. Generate from a target or create manually.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={() => navigate('/hr/sales-targets')} sx={{ borderRadius: '12px', textTransform: 'none' }}>
          ← Sales Targets
        </Button>
        <Button variant="outlined" onClick={() => navigate('/hr/payroll')} sx={{ borderRadius: '12px', textTransform: 'none' }}>
          Go to Payroll →
        </Button>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Generate Incentive</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Employee ID" value={form.employeeId} onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))} required sx={fieldSx} />
          <TextField label="Employee Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required sx={fieldSx} />
          <TextField select label="Role" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} sx={fieldSx}>
            {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
          <TextField select label="Period" value={form.period} onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))} sx={fieldSx}>
            {PERIODS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </TextField>
          <TextField label="Target" type="number" value={form.target} onChange={(e) => setForm((p) => ({ ...p, target: Number(e.target.value) }))} required sx={fieldSx} />
          <TextField label="Achieved" type="number" value={form.achieved} onChange={(e) => setForm((p) => ({ ...p, achieved: Number(e.target.value) }))} required sx={fieldSx} helperText="From orders / invoices / collections" />
          <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: mix.primary(8), border: `1px solid ${mix.primary(15)}` }}>
            <Typography variant="caption" sx={{ color: v.textMuted, fontWeight: 600 }}>Rule preview</Typography>
            <Typography variant="body2" fontWeight={700}>
              Achievement {preview.achievementPercent}% · Incentive {formatCurrency(preview.incentiveEarned)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" sx={primaryButtonSx} disabled={create.isPending} onClick={handleCreate}>
            {create.isPending ? 'Saving…' : 'Apply Rule & Generate'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  )
}
