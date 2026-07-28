import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiCall } from '@/api/flowClient'
import { createItem, fetchList } from '@/api/client'
import { ImageUploadField } from '@/components/module/ImageUploadField'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { v } from '@/theme/cssVars'

const EXPENSE_TYPES = ['Fuel', 'Travel', 'Food', 'Maintenance', 'Miscellaneous'] as const
type ExpenseType = (typeof EXPENSE_TYPES)[number]

interface StaffUser {
  id: string
  name: string
  role: string
}

interface VehicleRow {
  id: string
  vehicleNumber: string
  vehicleName: string
  vehicleType?: string
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    bgcolor: v.surface,
    fontSize: '0.875rem',
  },
} as const

const RECEIPT_LABELS: Record<ExpenseType, string> = {
  Fuel: 'Fuel bill / receipt',
  Travel: 'Travel receipt',
  Food: 'Food bill / receipt',
  Maintenance: 'Maintenance invoice / receipt',
  Miscellaneous: 'Supporting receipt / image',
}

export function ExpenseFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [expenseType, setExpenseType] = useState<ExpenseType | ''>('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [employeeId, setEmployeeId] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [amount, setAmount] = useState(0)
  const [fuelLiters, setFuelLiters] = useState(0)
  const [narration, setNarration] = useState('')
  const [receipt, setReceipt] = useState('')
  const [error, setError] = useState('')

  const { data: staff = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiCall<StaffUser[]>('/users'),
  })

  const fieldStaff = useMemo(
    () => staff.filter((s) => s.role === 'salesman' || s.role === 'deliveryAgent'),
    [staff],
  )

  const { data: vehicles = [] } = useQuery({
    queryKey: ['module', 'logistics-vehicle-management', 'picker'],
    queryFn: async () => {
      const res = await fetchList('/logistics-vehicle-management', { page: 1, pageSize: 200 })
      return (res.data ?? []) as VehicleRow[]
    },
  })

  const employee = fieldStaff.find((s) => s.id === employeeId)
  const vehicle = vehicles.find((v) => v.id === vehicleId)
  const needsVehicle = expenseType === 'Fuel' || expenseType === 'Maintenance'

  useEffect(() => {
    setFuelLiters(0)
    if (expenseType !== 'Fuel' && expenseType !== 'Maintenance') setVehicleId('')
  }, [expenseType])

  const createExpense = useMutation({
    mutationFn: () => {
      const vehicleLabel = vehicle
        ? `${vehicle.vehicleNumber} — ${vehicle.vehicleName}`
        : ''
      return createItem('/route-sales-expenses', {
        account: expenseType,
        debit: amount,
        credit: 0,
        balance: amount,
        amount,
        date,
        narration: narration || `${expenseType} expense`,
        salesman: employee?.name ?? '',
        employeeId,
        employeeRole: employee?.role ?? '',
        vehicleId: vehicle?.id ?? '',
        vehicleNumber: vehicle?.vehicleNumber ?? '',
        vehicle: vehicleLabel,
        fuelLiters: expenseType === 'Fuel' ? fuelLiters : undefined,
        fuelCost: expenseType === 'Fuel' ? amount : undefined,
        receipt,
        hasReceipt: Boolean(receipt),
        status: 'completed',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', 'route-sales-expenses'] })
      navigate('/route-sales/expenses')
    },
    onError: () => setError('Failed to save expense. Please try again.'),
  })

  const handleSave = () => {
    setError('')
    if (!expenseType) {
      setError('Please select an expense type.')
      return
    }
    if (!date) {
      setError('Please select a date.')
      return
    }
    if (!employeeId) {
      setError('Please select the salesman or delivery agent.')
      return
    }
    if (amount <= 0) {
      setError('Please enter an expense amount greater than zero.')
      return
    }
    if (expenseType === 'Fuel' && fuelLiters <= 0) {
      setError('Please enter fuel quantity in liters.')
      return
    }
    if (needsVehicle && !vehicleId) {
      setError('Please select the vehicle used for this expense.')
      return
    }
    if (!receipt) {
      setError(`Please upload the ${RECEIPT_LABELS[expenseType].toLowerCase()}.`)
      return
    }
    createExpense.mutate()
  }

  return (
    <PageShell
      title="Add Expense"
      subtitle="Record field expenses with bill/receipt images — vehicles may change per day"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Expenses', path: '/route-sales/expenses' },
        { label: 'Add Expense' },
      ]}
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/route-sales/expenses')}
            sx={{ borderRadius: '12px', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={primaryButtonSx}
            onClick={handleSave}
            disabled={createExpense.isPending}
          >
            {createExpense.isPending ? 'Saving…' : 'Save Expense'}
          </Button>
        </Box>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ ...whiteCardSx, p: { xs: 2, md: 3 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Expense details
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              required
              label="Expense type"
              value={expenseType}
              onChange={(e) => setExpenseType(e.target.value as ExpenseType)}
              sx={fieldSx}
            >
              {EXPENSE_TYPES.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              required
              type="date"
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Autocomplete
              options={fieldStaff}
              getOptionLabel={(o) => `${o.name} (${o.role === 'deliveryAgent' ? 'Delivery Agent' : 'Salesman'})`}
              value={fieldStaff.find((s) => s.id === employeeId) ?? null}
              onChange={(_, val) => setEmployeeId(val?.id ?? '')}
              renderInput={(params) => (
                <TextField {...params} label="Salesman / Delivery agent" required sx={fieldSx} />
              )}
            />
          </Grid>

          {needsVehicle && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                options={vehicles}
                getOptionLabel={(o) => `${o.vehicleNumber} — ${o.vehicleName}`}
                value={vehicles.find((v) => v.id === vehicleId) ?? null}
                onChange={(_, val) => setVehicleId(val?.id ?? '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Vehicle used"
                    required
                    helperText="Staff may use different vehicles on different days"
                    sx={fieldSx}
                  />
                )}
              />
            </Grid>
          )}

          {expenseType === 'Fuel' && (
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                required
                type="number"
                label="Fuel filled (liters)"
                value={fuelLiters || ''}
                onChange={(e) => setFuelLiters(Number(e.target.value) || 0)}
                inputProps={{ min: 0, step: 0.1 }}
                sx={fieldSx}
              />
            </Grid>
          )}

          <Grid size={{ xs: 12, md: expenseType === 'Fuel' ? 3 : 4 }}>
            <TextField
              fullWidth
              required
              type="number"
              label={expenseType === 'Fuel' ? 'Fuel cost (₹)' : 'Expense amount (₹)'}
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              inputProps={{ min: 0, step: 1 }}
              sx={fieldSx}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Narration"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder={
                expenseType === 'Fuel'
                  ? 'e.g. Filled diesel at HP pump on Route A'
                  : expenseType === 'Food'
                    ? 'e.g. Field lunch reimbursement'
                    : 'Describe the expense'
              }
              sx={fieldSx}
            />
          </Grid>

          {expenseType && (
            <Grid size={{ xs: 12 }}>
              <ImageUploadField
                label={RECEIPT_LABELS[expenseType]}
                helperText="Upload a clear photo of the bill or receipt"
                value={receipt}
                onChange={setReceipt}
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </PageShell>
  )
}
