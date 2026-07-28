import { useMemo, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiCall } from '@/api/flowClient'
import { createItem, fetchList } from '@/api/client'
import { ImageUploadField } from '@/components/module/ImageUploadField'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { formatCurrency } from '@/utils/export'
import { v, mix } from '@/theme/cssVars'

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

const readonlySx = {
  ...fieldSx,
  '& .MuiOutlinedInput-root': {
    ...fieldSx['& .MuiOutlinedInput-root'],
    bgcolor: mix.surface(6),
  },
} as const

export function VehicleLogFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [vehicleId, setVehicleId] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [openingOdometer, setOpeningOdometer] = useState(0)
  const [closingOdometer, setClosingOdometer] = useState(0)
  const [fuelLiters, setFuelLiters] = useState(0)
  const [fuelCost, setFuelCost] = useState(0)
  const [remarks, setRemarks] = useState('')
  const [fuelReceipt, setFuelReceipt] = useState('')
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

  const distanceTraveled = useMemo(() => {
    if (closingOdometer <= 0 || openingOdometer < 0) return 0
    return Math.max(0, closingOdometer - openingOdometer)
  }, [openingOdometer, closingOdometer])

  const createLog = useMutation({
    mutationFn: () => {
      const vehicleLabel = vehicle
        ? `${vehicle.vehicleNumber} — ${vehicle.vehicleName}`
        : ''
      return createItem('/logistics-vehicle-log', {
        date,
        vehicleId: vehicle?.id ?? '',
        vehicleNumber: vehicle?.vehicleNumber ?? '',
        vehicleName: vehicle?.vehicleName ?? '',
        vehicle: vehicleLabel,
        employeeId: employee?.id ?? '',
        employee: employee?.name ?? '',
        employeeRole: employee?.role ?? '',
        roleLabel: employee?.role === 'deliveryAgent' ? 'Delivery Agent' : 'Salesman',
        openingOdometer,
        closingOdometer,
        distance: distanceTraveled,
        fuelLiters,
        fuelCost,
        fuelAmount: fuelCost,
        remarks,
        fuelReceipt,
        hasFuelReceipt: Boolean(fuelReceipt),
        status: 'completed',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', 'logistics-vehicle-log'] })
      navigate('/logistics/vehicle-log')
    },
    onError: () => setError('Failed to save vehicle log. Please try again.'),
  })

  const handleSave = () => {
    setError('')
    if (!date) {
      setError('Please select a date.')
      return
    }
    if (!vehicleId) {
      setError('Please select a vehicle.')
      return
    }
    if (!employeeId) {
      setError('Please select the salesman or delivery agent who used the vehicle.')
      return
    }
    if (openingOdometer < 0) {
      setError('Opening odometer cannot be negative.')
      return
    }
    if (closingOdometer <= openingOdometer) {
      setError('Closing odometer must be greater than opening odometer.')
      return
    }
    if (fuelLiters < 0 || fuelCost < 0) {
      setError('Fuel liters and cost cannot be negative.')
      return
    }
    if (fuelLiters > 0 && fuelCost <= 0) {
      setError('Enter fuel cost when fuel was filled.')
      return
    }
    if (fuelLiters > 0 && !fuelReceipt) {
      setError('Upload the fuel bill/receipt when fuel was filled.')
      return
    }
    createLog.mutate()
  }

  return (
    <PageShell
      title="Vehicle Log"
      subtitle="Track daily vehicle usage across salesmen and delivery agents — odometer, fuel, and distance"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Vehicle Log', path: '/logistics/vehicle-log' },
        { label: 'Add Log Entry' },
      ]}
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/logistics/vehicle-log')}
            sx={{ borderRadius: '12px', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={primaryButtonSx}
            onClick={handleSave}
            disabled={createLog.isPending}
          >
            {createLog.isPending ? 'Saving…' : 'Save Log Entry'}
          </Button>
        </Box>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ ...whiteCardSx, p: { xs: 2, md: 3 }, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Assignment
        </Typography>
        <Grid container spacing={2}>
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
              options={vehicles}
              getOptionLabel={(o) => `${o.vehicleNumber} — ${o.vehicleName}`}
              value={vehicles.find((v) => v.id === vehicleId) ?? null}
              onChange={(_, val) => setVehicleId(val?.id ?? '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Vehicle"
                  required
                  helperText="Same vehicle may be used by different staff on different days"
                  sx={fieldSx}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Autocomplete
              options={fieldStaff}
              getOptionLabel={(o) => `${o.name} (${o.role === 'deliveryAgent' ? 'Delivery Agent' : 'Salesman'})`}
              value={fieldStaff.find((s) => s.id === employeeId) ?? null}
              onChange={(_, val) => setEmployeeId(val?.id ?? '')}
              renderInput={(params) => (
                <TextField {...params} label="Used by" required sx={fieldSx} />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ ...whiteCardSx, p: { xs: 2, md: 3 }, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Odometer & distance
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              required
              type="number"
              label="Opening odometer (km)"
              value={openingOdometer || ''}
              onChange={(e) => setOpeningOdometer(Number(e.target.value) || 0)}
              inputProps={{ min: 0, step: 1 }}
              sx={fieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              required
              type="number"
              label="Closing odometer (km)"
              value={closingOdometer || ''}
              onChange={(e) => setClosingOdometer(Number(e.target.value) || 0)}
              inputProps={{ min: 0, step: 1 }}
              sx={fieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Distance traveled (km)"
              value={distanceTraveled}
              InputProps={{ readOnly: true }}
              helperText="Auto-calculated from odometer readings"
              sx={readonlySx}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ ...whiteCardSx, p: { xs: 2, md: 3 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Fuel filled
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Fuel filled (liters)"
              value={fuelLiters || ''}
              onChange={(e) => setFuelLiters(Number(e.target.value) || 0)}
              inputProps={{ min: 0, step: 0.1 }}
              sx={fieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Fuel cost (₹)"
              value={fuelCost || ''}
              onChange={(e) => setFuelCost(Number(e.target.value) || 0)}
              inputProps={{ min: 0, step: 1 }}
              helperText={fuelCost > 0 ? formatCurrency(fuelCost) : undefined}
              sx={fieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              multiline
              minRows={1}
              label="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional notes for this day's run"
              sx={fieldSx}
            />
          </Grid>
          {fuelLiters > 0 && (
            <Grid size={{ xs: 12 }}>
              <ImageUploadField
                label="Fuel bill / receipt"
                helperText="Required when fuel is filled"
                value={fuelReceipt}
                onChange={setFuelReceipt}
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </PageShell>
  )
}
