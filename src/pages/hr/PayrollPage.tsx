import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import PaymentsIcon from '@mui/icons-material/Payments'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { createItem, fetchList, updateItem } from '@/api/client'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { StatusChip } from '@/components/ui/StatusChip'
import { formatCurrency } from '@/utils/export'
import { v, mix } from '@/theme/cssVars'
import { colors } from '@/theme/palette'
import { HrWorkflowStrip } from './HrWorkflowStrip'

const DEPARTMENTS = ['Sales', 'Logistics', 'Accounts', 'HR', 'Inventory', 'Admin']
const PERIODS = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026']

interface PayrollRow {
  id: string
  code: string
  employeeId: string
  name: string
  department: string
  payrollMonth: string
  monthlyBase: number
  pendingSalary: number
  incentiveAmount?: number
  grossSalary: number
  totalDeductions: number
  netSalary: number
  status: string
  payslipGenerated?: boolean
}

const emptyForm = {
  employeeId: '',
  name: '',
  department: 'Sales',
  payrollMonth: 'Jul 2026',
  monthlyBase: 25000,
  pendingSalary: 0,
  incentiveAmount: 0,
  totalDeductions: 2000,
  status: 'pending',
}

const fieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: v.surface, fontSize: '0.875rem' },
} as const

function computePay(form: typeof emptyForm) {
  const base = Number(form.monthlyBase) || 0
  const pending = Number(form.pendingSalary) || 0
  const incentive = Number(form.incentiveAmount) || 0
  const deductions = Number(form.totalDeductions) || 0
  const gross = base + pending + incentive
  const net = Math.max(0, gross - deductions)
  return { grossSalary: gross, netSalary: net, incentiveAmount: incentive }
}

export function PayrollPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [payslip, setPayslip] = useState<PayrollRow | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [monthFilter, setMonthFilter] = useState('')

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['module', 'hr-payroll', monthFilter],
    queryFn: () => fetchList<PayrollRow>('/hr-payroll', {
      page: 1,
      pageSize: 100,
      ...(monthFilter ? { payrollMonth: monthFilter } : {}),
    }),
  })

  const rows = (data?.data ?? []) as PayrollRow[]
  const preview = computePay(form)

  const kpis = useMemo(() => {
    const pending = rows.filter((r) => r.status === 'pending').length
    const approved = rows.filter((r) => r.status === 'approved').length
    const paid = rows.filter((r) => r.status === 'completed').length
    const netTotal = rows.reduce((s, r) => s + (Number(r.netSalary) || 0), 0)
    return { pending, approved, paid, netTotal }
  }, [rows])

  const create = useMutation({
    mutationFn: () => {
      const pay = computePay(form)
      return createItem('/hr-payroll', {
        ...form,
        ...pay,
        monthlyBase: Number(form.monthlyBase),
        pendingSalary: Number(form.pendingSalary),
        totalDeductions: Number(form.totalDeductions),
        payslipGenerated: false,
      })
    },
    onSuccess: () => {
      setMsg('Payroll created — awaiting manager approval')
      setOpen(false)
      setForm(emptyForm)
      refetch()
      queryClient.invalidateQueries({ queryKey: ['module', 'hr-payroll'] })
    },
    onError: () => setError('Failed to create payroll'),
  })

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateItem('/hr-payroll', id, { status }),
    onSuccess: (_, v) => {
      const labels: Record<string, string> = {
        approved: 'Manager approved — ready for salary payment',
        rejected: 'Payroll rejected',
        completed: 'Salary payment recorded',
      }
      setMsg(labels[v.status] ?? 'Status updated')
      refetch()
      queryClient.invalidateQueries({ queryKey: ['module', 'hr-payroll'] })
    },
  })

  const generatePayslip = useMutation({
    mutationFn: (row: PayrollRow) =>
      updateItem('/hr-payroll', row.id, { ...row, payslipGenerated: true, status: row.status === 'completed' ? 'completed' : row.status }),
    onSuccess: (_, row) => {
      setPayslip({ ...row, payslipGenerated: true })
      setMsg('Payslip generated')
      refetch()
      queryClient.invalidateQueries({ queryKey: ['module', 'hr-payroll'] })
    },
  })

  const handleCreate = () => {
    setError('')
    if (!form.employeeId.trim() || !form.name.trim()) {
      setError('Employee ID and name are required')
      return
    }
    create.mutate()
  }

  return (
    <PageShell
      title="Payroll Management"
      subtitle="Create payroll with incentives → manager approval → salary payment → payslip"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'HR', path: '/hr/employees' },
        { label: 'Payroll' },
      ]}
      actions={
        <Button variant="contained" color="primary" startIcon={<AddIcon />} sx={primaryButtonSx} onClick={() => setOpen(true)}>
          Create Payroll
        </Button>
      }
    >
      <HrWorkflowStrip activeStep={6} />

      {msg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg('')}>{msg}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {[
          { label: 'Pending Approval', val: kpis.pending },
          { label: 'Approved', val: kpis.approved },
          { label: 'Paid', val: kpis.paid },
          { label: 'Net Payroll', val: formatCurrency(kpis.netTotal) },
        ].map((k) => (
          <Grid key={k.label} size={{ xs: 6, md: 3 }}>
            <Box sx={{ ...whiteCardSx, p: 2 }}>
              <Typography variant="caption" sx={{ color: v.textMuted, fontWeight: 600 }}>{k.label}</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem' }}>{isLoading ? '—' : k.val}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mb: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          select
          size="small"
          label="Payroll Month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          sx={{ ...fieldSx, minWidth: 160 }}
        >
          <MenuItem value="">All months</MenuItem>
          {PERIODS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
        </TextField>
        <Button variant="outlined" onClick={() => navigate('/hr/incentives')} sx={{ borderRadius: '12px', textTransform: 'none' }}>
          ← Incentives
        </Button>
      </Box>

      <Box sx={{ ...whiteCardSx, p: 0, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${v.border}` }}>
          <Typography sx={{ fontWeight: 700 }}>Payroll Register</Typography>
          <Typography variant="caption" sx={{ color: v.textMuted }}>
            Workflow: Create → Manager Approval → Salary Payment → Payslip
          </Typography>
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: mix.surface(8) }}>
                {['Payroll No.', 'Employee', 'Month', 'Base', 'Incentive', 'Gross', 'Deductions', 'Net', 'Status', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: v.textSecondary, whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const incentive = Number(row.incentiveAmount) || Math.max(0, Number(row.grossSalary) - Number(row.monthlyBase) - Number(row.pendingSalary || 0))
                return (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.code}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.employeeId} · {row.department}</Typography>
                    </TableCell>
                    <TableCell>{row.payrollMonth}</TableCell>
                    <TableCell>{formatCurrency(Number(row.monthlyBase))}</TableCell>
                    <TableCell sx={{ color: colors.success, fontWeight: 600 }}>{formatCurrency(incentive)}</TableCell>
                    <TableCell>{formatCurrency(Number(row.grossSalary))}</TableCell>
                    <TableCell>{formatCurrency(Number(row.totalDeductions))}</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>{formatCurrency(Number(row.netSalary))}</TableCell>
                    <TableCell><StatusChip status={String(row.status)} /></TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {row.status === 'pending' && (
                        <>
                          <Button size="small" startIcon={<CheckIcon />} onClick={() => setStatus.mutate({ id: row.id, status: 'approved' })}>
                            Approve
                          </Button>
                          <Button size="small" color="error" startIcon={<CloseIcon />} onClick={() => setStatus.mutate({ id: row.id, status: 'rejected' })}>
                            Reject
                          </Button>
                        </>
                      )}
                      {row.status === 'approved' && (
                        <Button size="small" startIcon={<PaymentsIcon />} onClick={() => setStatus.mutate({ id: row.id, status: 'completed' })}>
                          Pay Salary
                        </Button>
                      )}
                      {(row.status === 'approved' || row.status === 'completed') && (
                        <Button size="small" startIcon={<ReceiptLongIcon />} onClick={() => generatePayslip.mutate(row)}>
                          Payslip
                        </Button>
                      )}
                      {row.status === 'pending' && (
                        <Button size="small" onClick={() => setPayslip(row)}>Preview</Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {!isLoading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4, color: v.textMuted }}>
                    No payroll records. Create payroll or push from an approved incentive.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create Payroll</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Employee ID" value={form.employeeId} onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))} required sx={fieldSx} />
          <TextField label="Employee Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required sx={fieldSx} />
          <TextField select label="Department" value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} sx={fieldSx}>
            {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </TextField>
          <TextField select label="Payroll Month" value={form.payrollMonth} onChange={(e) => setForm((p) => ({ ...p, payrollMonth: e.target.value }))} sx={fieldSx}>
            {PERIODS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </TextField>
          <TextField label="Monthly Base" type="number" value={form.monthlyBase} onChange={(e) => setForm((p) => ({ ...p, monthlyBase: Number(e.target.value) }))} sx={fieldSx} />
          <TextField label="Pending Salary" type="number" value={form.pendingSalary} onChange={(e) => setForm((p) => ({ ...p, pendingSalary: Number(e.target.value) }))} sx={fieldSx} />
          <TextField label="Incentive Amount" type="number" value={form.incentiveAmount} onChange={(e) => setForm((p) => ({ ...p, incentiveAmount: Number(e.target.value) }))} sx={fieldSx} helperText="From approved incentive" />
          <TextField label="Total Deductions" type="number" value={form.totalDeductions} onChange={(e) => setForm((p) => ({ ...p, totalDeductions: Number(e.target.value) }))} sx={fieldSx} />
          <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: mix.primary(8) }}>
            <Typography variant="body2">Gross {formatCurrency(preview.grossSalary)} · Net {formatCurrency(preview.netSalary)}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" sx={primaryButtonSx} disabled={create.isPending} onClick={handleCreate}>
            {create.isPending ? 'Saving…' : 'Create Payroll'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!payslip} onClose={() => setPayslip(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Payslip — {payslip?.name}</DialogTitle>
        <DialogContent>
          {payslip && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <PayLine label="Employee ID" value={String(payslip.employeeId)} />
              <PayLine label="Month" value={String(payslip.payrollMonth)} />
              <PayLine label="Department" value={String(payslip.department)} />
              <Box sx={{ borderTop: `1px solid ${v.border}`, my: 1 }} />
              <PayLine label="Basic" value={formatCurrency(Number(payslip.monthlyBase))} />
              <PayLine label="Pending Salary" value={formatCurrency(Number(payslip.pendingSalary) || 0)} />
              <PayLine
                label="Incentives"
                value={formatCurrency(
                  Number(payslip.incentiveAmount)
                    || Math.max(0, Number(payslip.grossSalary) - Number(payslip.monthlyBase) - Number(payslip.pendingSalary || 0)),
                )}
              />
              <PayLine label="Gross" value={formatCurrency(Number(payslip.grossSalary))} />
              <PayLine label="Deductions" value={formatCurrency(Number(payslip.totalDeductions))} />
              <Box sx={{ borderTop: `1px solid ${v.border}`, my: 1 }} />
              <PayLine label="Net Pay" value={formatCurrency(Number(payslip.netSalary))} emphasize />
              <Box sx={{ mt: 1 }}>
                <StatusChip status={String(payslip.status)} />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayslip(null)}>Close</Button>
          <Button variant="outlined" onClick={() => window.print()}>Download PDF</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  )
}

function PayLine({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
      <Typography variant="body2" sx={{ color: v.textSecondary, fontWeight: emphasize ? 700 : 500 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: emphasize ? 800 : 600, fontSize: emphasize ? '1.05rem' : undefined }}>{value}</Typography>
    </Box>
  )
}
