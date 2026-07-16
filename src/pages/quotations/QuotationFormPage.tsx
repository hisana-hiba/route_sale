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
import { createItem } from '@/api/client'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { useAuthStore } from '@/store/authStore'
import { v, mix } from '@/theme/cssVars'

interface Shop {
  id: string
  name: string
  owner: string
  category: string
  mobile: string
  address?: string
}

interface RouteAssignment {
  id: string
  routeName: string
  userId: string
  userName: string
  status: string
}

const PAYMENT_TERMS = ['Cash', 'Credit'] as const
const QUOTATION_STATUSES = ['draft', 'pending', 'approved', 'rejected', 'expired'] as const

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

function nextQuotationNumber() {
  const d = new Date()
  const yy = String(d.getFullYear()).slice(-2)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const seq = String(Math.floor(Math.random() * 900) + 100)
  return `QT-${yy}${mm}${dd}-${seq}`
}

function daysFromNow(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function QuotationFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const [quotationNo] = useState(nextQuotationNumber)
  const [quotationDate, setQuotationDate] = useState(() => new Date().toISOString().split('T')[0])
  const [validUntil, setValidUntil] = useState(() => daysFromNow(15))
  const [salesman, setSalesman] = useState(user?.name ?? '')
  const [route, setRoute] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [shopName, setShopName] = useState('')
  const [customerMobile, setCustomerMobile] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('Net 15')
  const [status, setStatus] = useState('draft')
  const [error, setError] = useState('')

  const { data: shops = [], isLoading: shopsLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: () => apiCall<Shop[]>('/shops'),
  })

  const { data: assignments = [] } = useQuery({
    queryKey: ['route-assignments'],
    queryFn: async () => {
      try {
        return await apiCall<RouteAssignment[]>('/route-assignments')
      } catch {
        return [] as RouteAssignment[]
      }
    },
  })

  // Auto-select salesman from logged-in user
  useEffect(() => {
    if (user?.name) setSalesman(user.name)
  }, [user?.name])

  // Auto-select route from today's assignment for this user (fallback to first active)
  useEffect(() => {
    if (route || assignments.length === 0) return
    const mine = assignments.find(
      (a) =>
        a.userId === user?.id ||
        a.userName === user?.name ||
        a.status === 'active',
    )
    setRoute(mine?.routeName ?? assignments[0]?.routeName ?? 'Route A - North')
  }, [assignments, user, route])

  const selectedShop = useMemo(
    () => shops.find((s) => s.id === customerId),
    [shops, customerId],
  )

  useEffect(() => {
    if (!selectedShop) return
    setShopName(selectedShop.name)
    setCustomerMobile(selectedShop.mobile)
  }, [selectedShop])

  const createQuotation = useMutation({
    mutationFn: () =>
      createItem('/sales-quotations', {
        code: quotationNo,
        customer: shopName || selectedShop?.name || '',
        salesman,
        route,
        date: quotationDate,
        validUntil,
        paymentTerms,
        status,
        shopName,
        mobile: customerMobile,
        amount: 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', 'sales-quotations'] })
      navigate('/sales/quotations')
    },
    onError: () => setError('Failed to save quotation. Please try again.'),
  })

  const handleSave = () => {
    setError('')
    if (!customerId && !shopName) {
      setError('Please select a customer.')
      return
    }
    if (!quotationDate) {
      setError('Please enter quotation date.')
      return
    }
    if (!validUntil) {
      setError('Please enter valid until date.')
      return
    }
    if (validUntil < quotationDate) {
      setError('Valid until date must be on or after quotation date.')
      return
    }
    if (!paymentTerms) {
      setError('Please select payment terms.')
      return
    }
    createQuotation.mutate()
  }

  return (
    <PageShell
      title="Quotation Form"
      subtitle="Create a sales quotation for a customer / shop"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Quotations', path: '/sales/quotations' },
        { label: 'Quotation Form' },
      ]}
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/sales/quotations')}
            sx={{ borderRadius: '12px', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={primaryButtonSx}
            onClick={handleSave}
            disabled={createQuotation.isPending}
          >
            {createQuotation.isPending ? 'Saving…' : 'Save Quotation'}
          </Button>
        </Box>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={whiteCardSx}>
        <Typography sx={{ fontWeight: 700, mb: 2, color: v.textPrimary }}>
          Quotation Details
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label="Quotation Number"
              value={quotationNo}
              fullWidth
              size="small"
              slotProps={{ input: { readOnly: true } }}
              sx={readonlySx}
              helperText="Auto generated"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label="Quotation Date"
              type="date"
              value={quotationDate}
              onChange={(e) => setQuotationDate(e.target.value)}
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={fieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label="Valid Until Date"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={fieldSx}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label="Salesman"
              value={salesman}
              fullWidth
              size="small"
              slotProps={{ input: { readOnly: true } }}
              sx={readonlySx}
              helperText="Auto selected from logged-in user"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label="Route"
              value={route || '—'}
              fullWidth
              size="small"
              slotProps={{ input: { readOnly: true } }}
              sx={readonlySx}
              helperText="Auto selected from route assignment"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              label="Quotation Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
              size="small"
              sx={fieldSx}
            >
              {QUOTATION_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              options={shops}
              loading={shopsLoading}
              value={shops.find((s) => s.id === customerId) ?? null}
              onChange={(_, value) => setCustomerId(value?.id ?? '')}
              inputValue={customerSearch}
              onInputChange={(_, value) => setCustomerSearch(value)}
              getOptionLabel={(option) => `${option.name} — ${option.owner}`}
              filterOptions={(options, { inputValue }) => {
                const q = inputValue.trim().toLowerCase()
                if (!q) return options
                return options.filter(
                  (s) =>
                    s.name.toLowerCase().includes(q) ||
                    s.owner.toLowerCase().includes(q) ||
                    s.mobile.includes(q) ||
                    s.category.toLowerCase().includes(q),
                )
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Customer"
                  placeholder="Search customer / shop"
                  size="small"
                  sx={fieldSx}
                />
              )}
              isOptionEqualToValue={(a, b) => a.id === b.id}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Shop Name"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              fullWidth
              size="small"
              sx={fieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Customer Mobile Number"
              value={customerMobile}
              onChange={(e) => setCustomerMobile(e.target.value)}
              fullWidth
              size="small"
              sx={fieldSx}
              slotProps={{ htmlInput: { inputMode: 'numeric' } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              label="Payment Terms"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              fullWidth
              size="small"
              sx={fieldSx}
            >
              {PAYMENT_TERMS.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Box>
    </PageShell>
  )
}
