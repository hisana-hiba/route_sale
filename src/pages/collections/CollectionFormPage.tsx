import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiCall } from '@/api/flowClient'
import { createItem } from '@/api/client'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { formatCurrency } from '@/utils/export'
import { v, mix } from '@/theme/cssVars'
import { colors } from '@/theme/palette'

interface PendingInvoice {
  id: string
  code: string
  date: string
  amount: number
  paid: number
  balance: number
}

interface Shop {
  id: string
  name: string
  owner: string
  category: string
  mobile: string
  outstanding?: number
  creditLimit?: number
  pendingInvoices?: PendingInvoice[]
}

const PAYMENT_METHODS = ['Cash', 'Cheque', 'UPI', 'Bank Transfer', 'Card'] as const

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

/** Allocate collection oldest-invoice-first across selected invoices */
function allocateCollection(amount: number, invoices: PendingInvoice[]): Record<string, number> {
  let remaining = Math.max(0, amount)
  const sorted = [...invoices].sort((a, b) => a.date.localeCompare(b.date))
  const result: Record<string, number> = {}
  for (const inv of sorted) {
    const pay = Math.min(inv.balance, remaining)
    result[inv.id] = pay
    remaining -= pay
  }
  return result
}

export function CollectionFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [shopId, setShopId] = useState('')
  const [shopSearch, setShopSearch] = useState('')
  const [collectionAmount, setCollectionAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [allocations, setAllocations] = useState<Record<string, number>>({})
  const [error, setError] = useState('')

  const { data: shops = [], isLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: () => apiCall<Shop[]>('/shops'),
  })

  const shop = shops.find((s) => s.id === shopId)
  const pendingInvoices = useMemo(
    () => [...(shop?.pendingInvoices ?? [])].sort((a, b) => a.date.localeCompare(b.date)),
    [shop],
  )

  const totalCreditLimit = shop?.creditLimit ?? 0
  const creditLimitExceeded = Boolean(shopId) && collectionAmount > totalCreditLimit && totalCreditLimit > 0

  const selectedInvoices = useMemo(
    () => pendingInvoices.filter((inv) => selectedIds.includes(inv.id)),
    [pendingInvoices, selectedIds],
  )

  const selectedOutstanding = useMemo(
    () => selectedInvoices.reduce((sum, inv) => sum + inv.balance, 0),
    [selectedInvoices],
  )

  // Reset selection when shop changes
  useEffect(() => {
    setSelectedIds([])
    setCollectionAmount(0)
    setAllocations({})
    setPaymentMethod('')
    setError('')
  }, [shopId])

  // Auto-allocate whenever amount or selection changes
  useEffect(() => {
    const selected = pendingInvoices.filter((inv) => selectedIds.includes(inv.id))
    if (selected.length === 0) {
      setAllocations({})
      return
    }
    setAllocations(allocateCollection(collectionAmount, selected))
  }, [collectionAmount, selectedIds, pendingInvoices])

  const totalCollected = useMemo(
    () => Object.values(allocations).reduce((sum, n) => sum + n, 0),
    [allocations],
  )

  const unallocated = Math.max(0, collectionAmount - totalCollected)

  const toggleInvoice = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? pendingInvoices.map((inv) => inv.id) : [])
  }

  const setManualAllocation = (id: string, value: number) => {
    const inv = pendingInvoices.find((i) => i.id === id)
    if (!inv) return
    const capped = Math.max(0, Math.min(inv.balance, value))
    setAllocations((prev) => ({ ...prev, [id]: capped }))
  }

  const createCollection = useMutation({
    mutationFn: () => {
      const lines = selectedInvoices.map((inv) => ({
        invoiceId: inv.id,
        invoiceCode: inv.code,
        invoiceAmount: inv.amount,
        previousBalance: inv.balance,
        allocated: allocations[inv.id] ?? 0,
        remainingBalance: Math.max(0, inv.balance - (allocations[inv.id] ?? 0)),
      }))

      return createItem('/route-sales-collections', {
        account: shop?.name ?? '',
        particulars: `Collection — ${paymentMethod}`,
        narration: `Collection from ${shop?.name}`,
        customer: shop?.name,
        shopId,
        credit: totalCollected,
        amount: totalCollected,
        balance: Math.max(0, (shop?.outstanding ?? selectedOutstanding) - totalCollected),
        date: new Date().toISOString().split('T')[0],
        paymentMethod,
        collectionAmount,
        totalCreditedAmount: collectionAmount,
        totalCreditLimit,
        invoices: lines,
        status: 'completed',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', 'route-sales-collections'] })
      navigate('/route-sales/collections')
    },
    onError: () => setError('Failed to save collection. Please try again.'),
  })

  const handleSave = () => {
    setError('')
    if (!shopId) {
      setError('Please select a shop.')
      return
    }
    if (selectedIds.length === 0) {
      setError('Please select at least one invoice.')
      return
    }
    if (collectionAmount <= 0) {
      setError('Please enter a total credited amount greater than zero.')
      return
    }
    if (creditLimitExceeded) {
      setError('Total Credited Amount exceeds the shop Total Credit Limit.')
      return
    }
    if (!paymentMethod) {
      setError('Please select a payment method.')
      return
    }
    if (totalCollected <= 0) {
      setError('Allocated amount must be greater than zero.')
      return
    }
    createCollection.mutate()
  }

  return (
    <PageShell
      title="Collection Form"
      subtitle="Select a shop, choose pending invoices, and allocate the collected amount"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Collections', path: '/route-sales/collections' },
        { label: 'Collection Form' },
      ]}
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate('/route-sales/collections')} sx={{ borderRadius: '12px', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={primaryButtonSx}
            onClick={handleSave}
            disabled={createCollection.isPending}
          >
            {createCollection.isPending ? 'Saving…' : 'Save Collection'}
          </Button>
        </Box>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ ...whiteCardSx, mb: 2.5 }}>
        <Typography sx={{ fontWeight: 700, mb: 2, color: v.textPrimary }}>Collection Details</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              options={shops}
              loading={isLoading}
              value={shops.find((s) => s.id === shopId) ?? null}
              onChange={(_, value) => setShopId(value?.id ?? '')}
              inputValue={shopSearch}
              onInputChange={(_, value) => setShopSearch(value)}
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
                  label="Shop Selection"
                  placeholder="Search shop by name, owner, or mobile"
                  size="small"
                  sx={fieldSx}
                />
              )}
              isOptionEqualToValue={(a, b) => a.id === b.id}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Total Credit Limit"
              value={shopId ? formatCurrency(totalCreditLimit) : '—'}
              fullWidth
              size="small"
              slotProps={{ input: { readOnly: true } }}
              sx={{
                ...readonlySx,
                ...(creditLimitExceeded
                  ? {
                      '& .MuiOutlinedInput-root': {
                        ...readonlySx['& .MuiOutlinedInput-root'],
                        color: colors.error,
                        fontWeight: 700,
                        '& fieldset': { borderColor: colors.error },
                      },
                      '& .MuiInputLabel-root': { color: colors.error },
                      '& .MuiFormHelperText-root': { color: colors.error },
                    }
                  : {}),
              }}
              helperText={
                creditLimitExceeded
                  ? 'Credit limit exceeded'
                  : 'Shop credit limit'
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label="Total Credited Amount"
              type="number"
              value={collectionAmount || ''}
              onChange={(e) => setCollectionAmount(Math.max(0, Number(e.target.value)))}
              fullWidth
              size="small"
              disabled={!shopId}
              sx={{
                ...fieldSx,
                ...(creditLimitExceeded
                  ? {
                      '& .MuiOutlinedInput-root': {
                        ...fieldSx['& .MuiOutlinedInput-root'],
                        '& fieldset': { borderColor: colors.error },
                      },
                      '& .MuiInputLabel-root': { color: colors.error },
                      '& .MuiFormHelperText-root': { color: colors.error },
                    }
                  : {}),
              }}
              helperText={
                creditLimitExceeded
                  ? `Exceeds limit of ${formatCurrency(totalCreditLimit)}`
                  : selectedOutstanding > 0
                    ? `Selected outstanding: ${formatCurrency(selectedOutstanding)}`
                    : 'Amount collected from the customer'
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              fullWidth
              size="small"
              disabled={!shopId}
              sx={fieldSx}
            >
              <MenuItem value="">Select Payment Method</MenuItem>
              {PAYMENT_METHODS.map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label="Shop Outstanding"
              value={shopId ? formatCurrency(shop?.outstanding ?? selectedOutstanding) : '—'}
              fullWidth
              size="small"
              slotProps={{ input: { readOnly: true } }}
              sx={readonlySx}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={whiteCardSx}>
        <Typography sx={{ fontWeight: 700, mb: 0.5, color: v.textPrimary }}>
          Pending Invoices
        </Typography>
        <Typography variant="body2" sx={{ color: v.textSecondary, mb: 2 }}>
          Select invoices to pay. Total credited amount is allocated oldest-first; remaining balance is calculated automatically.
        </Typography>

        {!shopId && (
          <Alert severity="info" sx={{ borderRadius: '10px' }}>
            Select a shop to view pending invoices.
          </Alert>
        )}

        {shopId && pendingInvoices.length === 0 && (
          <Alert severity="success" sx={{ borderRadius: '10px' }}>
            No pending invoices for this shop.
          </Alert>
        )}

        {shopId && pendingInvoices.length > 0 && (
          <Box sx={{ overflowX: 'auto', border: `1px solid ${v.border}`, borderRadius: '12px' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: mix.surface(8) }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={selectedIds.length === pendingInvoices.length && pendingInvoices.length > 0}
                      indeterminate={selectedIds.length > 0 && selectedIds.length < pendingInvoices.length}
                      onChange={(e) => toggleAll(e.target.checked)}
                    />
                  </TableCell>
                  {['Invoice', 'Date', 'Invoice Amount', 'Already Paid', 'Balance', 'Allocate', 'Remaining'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', color: v.textSecondary, whiteSpace: 'nowrap' }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingInvoices.map((inv) => {
                  const checked = selectedIds.includes(inv.id)
                  const allocated = checked ? (allocations[inv.id] ?? 0) : 0
                  const remaining = Math.max(0, inv.balance - allocated)
                  return (
                    <TableRow key={inv.id} hover selected={checked}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small"
                          checked={checked}
                          onChange={() => toggleInvoice(inv.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{inv.code}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{inv.date}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatCurrency(inv.amount)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: v.textSecondary }}>
                          {formatCurrency(inv.paid)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(inv.balance)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          disabled={!checked}
                          value={checked ? allocated : ''}
                          onChange={(e) => setManualAllocation(inv.id, Number(e.target.value))}
                          sx={{ ...fieldSx, width: 120 }}
                          slotProps={{ htmlInput: { min: 0, max: inv.balance } }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: remaining === 0 && checked ? colors.success : v.textPrimary,
                          }}
                        >
                          {checked ? formatCurrency(remaining) : '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Box>
        )}

        {shopId && (
          <Box
            sx={{
              mt: 2.5,
              p: 2,
              borderRadius: '12px',
              bgcolor: mix.primary(6),
              border: `1px solid ${mix.primary(14)}`,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: v.textMuted, fontWeight: 600 }}>
                Selected Outstanding
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{formatCurrency(selectedOutstanding)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: v.textMuted, fontWeight: 600 }}>
                Total Credited Amount
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{formatCurrency(collectionAmount)}</Typography>
            </Box>
            {unallocated > 0 && (
              <Box>
                <Typography variant="caption" sx={{ color: colors.warning, fontWeight: 600 }}>
                  Unallocated Excess
                </Typography>
                <Typography sx={{ fontWeight: 700, color: colors.warning }}>
                  {formatCurrency(unallocated)}
                </Typography>
              </Box>
            )}
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, ml: { sm: 'auto' }, minWidth: 180 }}>
              <Typography variant="caption" sx={{ color: v.textMuted, fontWeight: 600, display: 'block', mb: 0.5 }}>
                Total Collected Amount
              </Typography>
              <TextField
                size="small"
                type="number"
                placeholder="Enter amount"
                value={collectionAmount || ''}
                onChange={(e) => setCollectionAmount(Math.max(0, Number(e.target.value)))}
                disabled={!shopId || selectedIds.length === 0}
                sx={{
                  ...fieldSx,
                  '& .MuiOutlinedInput-root': {
                    ...fieldSx['& .MuiOutlinedInput-root'],
                    fontWeight: 700,
                    color: v.primary,
                    bgcolor: v.surface,
                  },
                }}
                slotProps={{ htmlInput: { min: 0, step: 'any' } }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </PageShell>
  )
}
