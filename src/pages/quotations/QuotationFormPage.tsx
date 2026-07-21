import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Grid,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiCall } from '@/api/flowClient'
import { createItem } from '@/api/client'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/utils/export'
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

interface Product {
  id: string
  name: string
  category: string
  price: number
  gstRate: number
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
  const [paymentTerms, setPaymentTerms] = useState('Cash')
  const [status, setStatus] = useState('draft')
  const [productSearch, setProductSearch] = useState('')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [error, setError] = useState('')

  const { data: shops = [], isLoading: shopsLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: () => apiCall<Shop[]>('/shops'),
  })

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiCall<Product[]>('/products'),
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

  useEffect(() => {
    if (user?.name) setSalesman(user.name)
  }, [user?.name])

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

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q),
    )
  }, [products, productSearch])

  const lineItems = useMemo(
    () => products.filter((p) => (quantities[p.id] ?? 0) > 0),
    [products, quantities],
  )

  const quotationTotal = useMemo(
    () => lineItems.reduce((sum, p) => sum + p.price * (quantities[p.id] ?? 0), 0),
    [lineItems, quantities],
  )

  const setQty = (productId: string, qty: number) => {
    setQuantities((prev) => {
      const next = { ...prev }
      if (qty <= 0) delete next[productId]
      else next[productId] = qty
      return next
    })
  }

  const toggleProduct = (productId: string, checked: boolean) => {
    setQty(productId, checked ? 1 : 0)
  }

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
        amount: quotationTotal,
        items: lineItems.map((p) => ({
          productId: p.id,
          name: p.name,
          qty: quantities[p.id],
          price: p.price,
          gstRate: p.gstRate,
        })),
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
    if (lineItems.length === 0) {
      setError('Please add at least one product to the quotation.')
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

      <Box sx={{ ...whiteCardSx, mb: 2.5 }}>
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

      <Box sx={whiteCardSx}>
        <Typography sx={{ fontWeight: 700, mb: 0.5, color: v.textPrimary }}>
          Products
        </Typography>
        <Typography variant="body2" sx={{ color: v.textSecondary, mb: 2 }}>
          Add products directly while creating this quotation.
        </Typography>

        <TextField
          fullWidth
          size="small"
          label="Search products"
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          sx={{ ...fieldSx, mb: 2, maxWidth: 420 }}
        />

        <Box sx={{ overflowX: 'auto', border: `1px solid ${v.border}`, borderRadius: '12px' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: mix.surface(8) }}>
                <TableCell padding="checkbox" />
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: v.textSecondary }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: v.textSecondary }}>Category</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', color: v.textSecondary }}>Price</TableCell>
                <TableCell align="center" width={140} sx={{ fontWeight: 700, fontSize: '0.75rem', color: v.textSecondary }}>Qty</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', color: v.textSecondary }}>Line Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productsLoading && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography variant="body2" color="text.secondary">Loading products…</Typography>
                  </TableCell>
                </TableRow>
              )}
              {!productsLoading && filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography variant="body2" color="text.secondary">No products found.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {filteredProducts.map((product) => {
                const qty = quantities[product.id] ?? 0
                const selected = qty > 0
                return (
                  <TableRow key={product.id} hover selected={selected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={selected}
                        onChange={(e) => toggleProduct(product.id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{product.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{product.category}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{formatCurrency(product.price)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          disabled={!selected}
                          onClick={() => setQty(product.id, Math.max(0, qty - 1))}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" sx={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>
                          {selected ? qty : 0}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => setQty(product.id, qty + 1)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selected ? formatCurrency(product.price * qty) : '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Box>

        <Box
          sx={{
            mt: 2.5,
            p: 2,
            borderRadius: '12px',
            bgcolor: mix.primary(6),
            border: `1px solid ${mix.primary(14)}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: v.textSecondary }}>
            {lineItems.length} product{lineItems.length === 1 ? '' : 's'} selected
          </Typography>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: v.textMuted, fontWeight: 600 }}>
              Quotation Total
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: v.primary }}>
              {formatCurrency(quotationTotal)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </PageShell>
  )
}
