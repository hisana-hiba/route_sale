import { useMemo, useState, useCallback, useEffect } from 'react'
import {
  Alert, Box, Button, Chip, FormControlLabel, Grid, IconButton, InputAdornment, MenuItem,
  Switch,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiCall } from '@/api/flowClient'
import { createItem } from '@/api/client'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { SalesTabs } from '@/components/sales/SalesTabs'
import { formatCurrency } from '@/utils/export'
import { v, mix } from '@/theme/cssVars'
import { colors } from '@/theme/palette'

interface PurchaseHistoryItem {
  invoice: string
  date: string
  amount: number
}

interface Shop {
  id: string
  name: string
  owner: string
  category: string
  mobile: string
  address?: string
  gstin?: string
  creditLimit: number
  outstanding: number
  taxNumber?: string
  purchaseHistory?: PurchaseHistoryItem[]
  frequentProductIds?: string[]
}

interface Product {
  id: string
  name: string
  category: string
  price: number
  gstRate: number
  hsn: string
  unit: string
  stockQty: number
  barcode: string
  mrp: number
  mop: number
  batch: string
}

interface SalesScheme {
  id: string
  name: string
  type: 'invoice_percent' | 'product_flat' | 'product_percent'
  value: number
  minInvoice?: number
  productId?: string
  minQty?: number
  active: boolean
}

interface LineItem {
  key: string
  productId: string
  barcode: string
  name: string
  batch: string
  availQty: number
  quantity: number
  priceInclTax: number
  discountPct: number
  gstRate: number
  mrp: number
  mop: number
}

interface StaffUser {
  id: string
  name: string
  role: string
}

const PAYMENT_MODES = ['Cash', 'Credit', 'UPI', 'Card', 'Cheque'] as const
const INVOICE_STATUSES = ['draft', 'pending', 'completed'] as const

function nextInvoiceNumber() {
  const d = new Date()
  const yy = String(d.getFullYear()).slice(-2)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const seq = String(Math.floor(Math.random() * 900) + 100)
  return `INV-${yy}${mm}${dd}-${seq}`
}

function lineTotals(item: LineItem) {
  const gross = item.priceInclTax * item.quantity
  const disc = (gross * item.discountPct) / 100
  const afterDisc = gross - disc
  const exclTax = afterDisc / (1 + item.gstRate / 100)
  const tax = afterDisc - exclTax
  return { gross, disc, afterDisc, exclTax, tax }
}

function emptyRow(): LineItem {
  return {
    key: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productId: '',
    barcode: '',
    name: '',
    batch: '',
    availQty: 0,
    quantity: 1,
    priceInclTax: 0,
    discountPct: 0,
    gstRate: 0,
    mrp: 0,
    mop: 0,
  }
}

const sectionTitleSx = {
  fontWeight: 700,
  fontSize: '0.95rem',
  color: v.textPrimary,
  mb: 1.5,
} as const

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    bgcolor: v.surface,
    fontSize: '0.875rem',
  },
  '& .MuiInputLabel-root': { fontSize: '0.8125rem' },
} as const

const readonlyFieldSx = {
  ...fieldSx,
  '& .MuiOutlinedInput-root': {
    ...fieldSx['& .MuiOutlinedInput-root'],
    bgcolor: mix.surface(6),
  },
} as const

export function SalesEntryPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [invoiceNo] = useState(nextInvoiceNumber)
  const [invoiceDate] = useState(() => new Date().toISOString().split('T')[0])
  const [paymentMode, setPaymentMode] = useState('')
  const [status, setStatus] = useState<string>('pending')
  const [customerId, setCustomerId] = useState('')
  const [salesPersonId, setSalesPersonId] = useState('')
  const [customerTaxNumber, setCustomerTaxNumber] = useState('')
  const [lines, setLines] = useState<LineItem[]>([emptyRow()])
  const [productSearch, setProductSearch] = useState('')
  const [barcodeSearch, setBarcodeSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [discountType, setDiscountType] = useState<'Flat' | 'Percent'>('Flat')
  const [invoiceDiscount, setInvoiceDiscount] = useState(0)
  const [amountReceived, setAmountReceived] = useState(0)
  const [generateEWayBill, setGenerateEWayBill] = useState(false)
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [transporterName, setTransporterName] = useState('')
  const [ewayDistance, setEwayDistance] = useState('')
  const [error, setError] = useState('')
  const [appliedSchemeNames, setAppliedSchemeNames] = useState<string[]>([])

  const { data: shops = [] } = useQuery({
    queryKey: ['shops'],
    queryFn: () => apiCall<Shop[]>('/shops'),
  })
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiCall<Product[]>('/products'),
  })
  const { data: staff = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiCall<StaffUser[]>('/users'),
  })
  const { data: schemes = [] } = useQuery({
    queryKey: ['sales-schemes'],
    queryFn: async () => {
      try {
        return await apiCall<SalesScheme[]>('/sales-schemes')
      } catch {
        return [] as SalesScheme[]
      }
    },
  })

  const customer = shops.find((s) => s.id === customerId)

  useEffect(() => {
    if (customer?.taxNumber) setCustomerTaxNumber(customer.taxNumber)
    else if (!customerId) setCustomerTaxNumber('')
  }, [customerId, customer?.taxNumber])

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  )

  const filteredCatalog = useMemo(() => {
    const q = productSearch.trim().toLowerCase()
    return products.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    })
  }, [products, productSearch, categoryFilter])

  const fillFromProduct = useCallback((rowKey: string, product: Product) => {
    setLines((prev) =>
      prev.map((row) =>
        row.key === rowKey
          ? {
              ...row,
              productId: product.id,
              barcode: product.barcode,
              name: product.name,
              batch: product.batch,
              availQty: product.stockQty,
              priceInclTax: product.price * (1 + product.gstRate / 100),
              gstRate: product.gstRate,
              mrp: product.mrp,
              mop: product.mop,
              quantity: Math.min(row.quantity || 1, product.stockQty || 1),
            }
          : row,
      ),
    )
  }, [])

  const addProduct = useCallback((product: Product) => {
    setLines((prev) => {
      const existing = prev.find((r) => r.productId === product.id)
      if (existing) {
        return prev.map((r) =>
          r.productId === product.id
            ? { ...r, quantity: Math.min(r.quantity + 1, r.availQty || product.stockQty) }
            : r,
        )
      }
      const blank = prev.find((r) => !r.productId)
      if (blank) {
        return prev.map((r) =>
          r.key === blank.key
            ? {
                ...r,
                productId: product.id,
                barcode: product.barcode,
                name: product.name,
                batch: product.batch,
                availQty: product.stockQty,
                quantity: 1,
                priceInclTax: product.price * (1 + product.gstRate / 100),
                gstRate: product.gstRate,
                mrp: product.mrp,
                mop: product.mop,
              }
            : r,
        )
      }
      return [
        ...prev,
        {
          ...emptyRow(),
          productId: product.id,
          barcode: product.barcode,
          name: product.name,
          batch: product.batch,
          availQty: product.stockQty,
          quantity: 1,
          priceInclTax: product.price * (1 + product.gstRate / 100),
          gstRate: product.gstRate,
          mrp: product.mrp,
          mop: product.mop,
        },
      ]
    })
  }, [])

  const handleBarcodeSearch = () => {
    const code = barcodeSearch.trim()
    if (!code) return
    const product = products.find((p) => p.barcode === code)
    if (!product) {
      setError(`No product found for barcode ${code}`)
      return
    }
    setError('')
    addProduct(product)
    setBarcodeSearch('')
  }

  const updateLine = (key: string, patch: Partial<LineItem>) => {
    setLines((prev) =>
      prev.map((row) => {
        if (row.key !== key) return row
        const next = { ...row, ...patch }
        if (patch.quantity != null && next.availQty > 0) {
          next.quantity = Math.min(Math.max(1, patch.quantity), next.availQty)
        }
        return next
      }),
    )
  }

  const removeLine = (key: string) => {
    setLines((prev) => (prev.length <= 1 ? [emptyRow()] : prev.filter((r) => r.key !== key)))
  }

  const activeLines = lines.filter((l) => l.productId)

  const lineAgg = useMemo(() => {
    return activeLines.reduce(
      (acc, item) => {
        const t = lineTotals(item)
        acc.exclTax += t.exclTax
        acc.tax += t.tax
        acc.lineDisc += t.disc
        acc.inclTax += t.afterDisc
        return acc
      },
      { exclTax: 0, tax: 0, lineDisc: 0, inclTax: 0 },
    )
  }, [activeLines])

  const productSchemeDisc = useMemo(() => {
    let disc = 0
    const names: string[] = []
    for (const scheme of schemes.filter((s) => s.active)) {
      if (scheme.type === 'product_flat' || scheme.type === 'product_percent') {
        const line = activeLines.find((l) => l.productId === scheme.productId)
        if (!line || line.quantity < (scheme.minQty ?? 1)) continue
        const t = lineTotals(line)
        const amount =
          scheme.type === 'product_flat' ? scheme.value : (t.afterDisc * scheme.value) / 100
        disc += amount
        names.push(scheme.name)
      }
    }
    return { disc, names }
  }, [schemes, activeLines])

  const afterLineSchemes = Math.max(0, lineAgg.inclTax - productSchemeDisc.disc)

  const invoiceScheme = useMemo(() => {
    const match = schemes.find(
      (s) =>
        s.active &&
        s.type === 'invoice_percent' &&
        afterLineSchemes >= (s.minInvoice ?? 0),
    )
    if (!match) return { disc: 0, name: '' }
    return { disc: (afterLineSchemes * match.value) / 100, name: match.name }
  }, [schemes, afterLineSchemes])

  useEffect(() => {
    const names = [...productSchemeDisc.names]
    if (invoiceScheme.name) names.push(invoiceScheme.name)
    setAppliedSchemeNames(names)
  }, [productSchemeDisc.names, invoiceScheme.name])

  const manualDiscount =
    discountType === 'Percent'
      ? (afterLineSchemes * invoiceDiscount) / 100
      : invoiceDiscount

  const schemeDiscount = productSchemeDisc.disc + invoiceScheme.disc
  const totalDiscount = lineAgg.lineDisc + schemeDiscount + manualDiscount
  const grandTotal = Math.max(0, afterLineSchemes - invoiceScheme.disc - manualDiscount)
  const dueBalance = Math.max(0, grandTotal - amountReceived)

  const projectedOutstanding = (customer?.outstanding ?? 0) + (paymentMode === 'Credit' ? dueBalance : 0)
  const creditExceeded = customer
    ? projectedOutstanding > customer.creditLimit
    : false
  const availableCredit = customer
    ? customer.creditLimit - customer.outstanding
    : 0

  const frequentProducts = useMemo(() => {
    const ids = customer?.frequentProductIds ?? []
    return products.filter((p) => ids.includes(p.id))
  }, [customer, products])

  const recommendedProducts = useMemo(() => {
    const freq = new Set(customer?.frequentProductIds ?? [])
    return products.filter((p) => !freq.has(p.id)).slice(0, 4)
  }, [customer, products])

  const createInvoice = useMutation({
    mutationFn: async () => {
      const invoice = await createItem('/sales-invoices', {
        code: invoiceNo,
        customer: customer?.name ?? '',
        salesman: staff.find((s) => s.id === salesPersonId)?.name ?? '',
        invoiceDate,
        dueDate: invoiceDate,
        amount: Math.round(lineAgg.exclTax),
        tax: Math.round(lineAgg.tax),
        total: Math.round(grandTotal),
        paymentTerms: paymentMode || 'COD',
        status,
        amountReceived,
        dueBalance,
        discount: totalDiscount,
        items: activeLines.map((l) => ({
          productId: l.productId,
          name: l.name,
          quantity: l.quantity,
          price: l.priceInclTax,
          discountPct: l.discountPct,
          tax: lineTotals(l).tax,
        })),
      })

      if (generateEWayBill) {
        const validTill = new Date(invoiceDate)
        validTill.setDate(validTill.getDate() + 1)
        await createItem('/logistics-e-way-bills', {
          invoiceNo,
          customer: customer?.name ?? '',
          vehicle: vehicleNumber.trim(),
          transporter: transporterName.trim(),
          distance: ewayDistance.trim() || '0',
          validTill: validTill.toISOString().split('T')[0],
          amount: Math.round(grandTotal),
          status: 'active',
        })
      }

      return invoice
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', 'sales-invoices'] })
      queryClient.invalidateQueries({ queryKey: ['module', 'logistics-e-way-bills'] })
      navigate('/sales/list')
    },
    onError: () => setError('Failed to save invoice. Please try again.'),
  })

  const handleSave = () => {
    setError('')
    if (!customerId) {
      setError('Please select a customer.')
      return
    }
    if (!paymentMode) {
      setError('Please select a payment mode.')
      return
    }
    if (activeLines.length === 0) {
      setError('Please add at least one product.')
      return
    }
    const stockIssue = activeLines.find((l) => l.quantity > l.availQty)
    if (stockIssue) {
      setError(`Insufficient stock for ${stockIssue.name}. Available: ${stockIssue.availQty}`)
      return
    }
    if (paymentMode === 'Credit' && creditExceeded) {
      setError('Credit limit exceeded. Adjust payment or reduce invoice amount.')
      return
    }
    if (generateEWayBill && (!vehicleNumber.trim() || !transporterName.trim())) {
      setError('Enter vehicle number and transporter to generate the E-Way Bill.')
      return
    }
    createInvoice.mutate()
  }

  const salesmen = staff.filter((s) => s.role === 'salesman' || s.role === 'admin' || !s.role)

  return (
    <PageShell
      title="Sales Entry"
      subtitle="Create sales invoices with live calculations, schemes, and credit checks"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Sales', path: '/sales/list' },
        { label: 'Sales Entry' },
      ]}
      actions={
        <Button
          variant="contained"
          color="primary"
          sx={primaryButtonSx}
          onClick={handleSave}
          disabled={createInvoice.isPending}
        >
          {createInvoice.isPending ? 'Saving…' : 'Save Invoice'}
        </Button>
      }
    >
      <SalesTabs />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2.5} alignItems="flex-start">
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* Invoice Details */}
          <Box sx={{ ...whiteCardSx, mb: 2.5 }}>
            <Typography sx={sectionTitleSx}>Invoice Details</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Invoice Number"
                  value={invoiceNo}
                  fullWidth
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={readonlyFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Invoice Date"
                  type="date"
                  value={invoiceDate}
                  fullWidth
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                  InputProps={{ readOnly: true }}
                  sx={readonlyFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  select
                  label="Payment Mode"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  fullWidth
                  size="small"
                  sx={fieldSx}
                >
                  <MenuItem value="">Select Payment Mode</MenuItem>
                  {PAYMENT_MODES.map((m) => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  select
                  label="Invoice Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  fullWidth
                  size="small"
                  sx={fieldSx}
                >
                  {INVOICE_STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  label="Customer"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  fullWidth
                  size="small"
                  sx={fieldSx}
                >
                  <MenuItem value="">Select Customer</MenuItem>
                  {shops.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name} — {s.owner}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  select
                  label="Sales Person"
                  value={salesPersonId}
                  onChange={(e) => setSalesPersonId(e.target.value)}
                  fullWidth
                  size="small"
                  sx={fieldSx}
                >
                  <MenuItem value="">Select Salesperson</MenuItem>
                  {salesmen.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Customer Tax Number"
                  value={customerTaxNumber}
                  onChange={(e) => setCustomerTaxNumber(e.target.value)}
                  fullWidth
                  size="small"
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={(
                    <Switch
                      checked={generateEWayBill}
                      onChange={(e) => setGenerateEWayBill(e.target.checked)}
                    />
                  )}
                  label="Generate E-Way Bill with this invoice"
                  sx={{ ml: 0.25 }}
                />
              </Grid>
              {generateEWayBill && (
                <>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Vehicle Number"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      fullWidth
                      size="small"
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Transporter"
                      value={transporterName}
                      onChange={(e) => setTransporterName(e.target.value)}
                      fullWidth
                      size="small"
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Distance (KM)"
                      value={ewayDistance}
                      onChange={(e) => setEwayDistance(e.target.value)}
                      fullWidth
                      size="small"
                      sx={fieldSx}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>

          {/* Customer insights */}
          {customer && (
            <Box sx={{ ...whiteCardSx, mb: 2.5 }}>
              <Typography sx={sectionTitleSx}>Customer Business Details</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 7 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25 }}>
                    <Detail label="Business" value={customer.name} />
                    <Detail label="Owner" value={customer.owner} />
                    <Detail label="Category" value={customer.category} />
                    <Detail label="Mobile" value={customer.mobile} />
                    <Detail label="Address" value={customer.address ?? '—'} />
                    <Detail label="GSTIN" value={customer.gstin ?? '—'} />
                  </Box>
                  {creditExceeded && (
                    <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mt: 2 }}>
                      Credit limit exceeded. Limit {formatCurrency(customer.creditLimit)}, projected
                      outstanding {formatCurrency(projectedOutstanding)}.
                    </Alert>
                  )}
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      bgcolor: mix.primary(5),
                      border: `1px solid ${mix.primary(12)}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <CreditRow label="Credit Limit" value={formatCurrency(customer.creditLimit)} />
                    <CreditRow label="Outstanding" value={formatCurrency(customer.outstanding)} tone="warn" />
                    <CreditRow
                      label="Available Credit"
                      value={formatCurrency(Math.max(0, availableCredit))}
                      tone={availableCredit < 0 ? 'error' : 'ok'}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1.5, mb: 0.75, color: v.textMuted, fontWeight: 600 }}>
                    Recent Purchase History
                  </Typography>
                  {(customer.purchaseHistory ?? []).slice(0, 3).map((h) => (
                    <Box
                      key={h.invoice}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 0.6,
                        borderBottom: `1px solid ${v.border}`,
                      }}
                    >
                      <Typography variant="body2" sx={{ color: v.textSecondary }}>
                        {h.invoice} · {h.date}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(h.amount)}
                      </Typography>
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Product search & quick picks */}
          <Box sx={{ ...whiteCardSx, mb: 2.5 }}>
            <Typography sx={sectionTitleSx}>Products</Typography>
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search products by name or category"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18, color: v.textMuted }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 7, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Scan / enter barcode"
                  value={barcodeSearch}
                  onChange={(e) => setBarcodeSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <QrCodeScannerIcon sx={{ fontSize: 18, color: v.textMuted }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button size="small" onClick={handleBarcodeSearch} sx={{ textTransform: 'none' }}>
                          Add
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5, md: 3 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  sx={fieldSx}
                >
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c === 'all' ? 'All Categories' : c}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {productSearch && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                {filteredCatalog.slice(0, 8).map((p) => (
                  <Chip
                    key={p.id}
                    label={`${p.name} · ${formatCurrency(p.price)}`}
                    onClick={() => addProduct(p)}
                    size="small"
                    sx={{ bgcolor: mix.primary(8), fontWeight: 500 }}
                  />
                ))}
              </Box>
            )}

            {customer && frequentProducts.length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: v.textMuted, fontWeight: 600, mb: 0.75, display: 'block' }}>
                  Frequently Purchased
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {frequentProducts.map((p) => (
                    <Chip
                      key={p.id}
                      label={p.name}
                      onClick={() => addProduct(p)}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: v.textMuted, fontWeight: 600, mb: 0.75, display: 'block' }}>
                Recommended Products
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {recommendedProducts.map((p) => (
                  <Chip
                    key={p.id}
                    label={p.name}
                    onClick={() => addProduct(p)}
                    size="small"
                    sx={{ bgcolor: mix.secondary(12), fontWeight: 500 }}
                  />
                ))}
              </Box>
            </Box>

            {appliedSchemeNames.length > 0 && (
              <Alert
                severity="info"
                icon={<LocalOfferOutlinedIcon />}
                sx={{ mb: 2, borderRadius: '10px' }}
              >
                Active schemes applied: {appliedSchemeNames.join(' · ')}
              </Alert>
            )}

            {/* Line items table */}
            <Box sx={{ overflowX: 'auto', border: `1px solid ${v.border}`, borderRadius: '12px' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: mix.surface(8) }}>
                    {['Barcode', 'Qty', 'Name', 'Batch', 'Avail.', 'Price Incl. Tax', 'Disc %', 'Tax', 'MRP', 'MOP', ''].map(
                      (h) => (
                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', whiteSpace: 'nowrap', color: v.textSecondary }}>
                          {h}
                        </TableCell>
                      ),
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lines.map((row) => {
                    const t = lineTotals(row)
                    const overStock = row.productId && row.quantity > row.availQty
                    return (
                      <TableRow key={row.key} hover>
                        <TableCell sx={{ minWidth: 120 }}>
                          <TextField
                            size="small"
                            value={row.barcode}
                            onChange={(e) => {
                              const code = e.target.value
                              updateLine(row.key, { barcode: code })
                              const match = products.find((p) => p.barcode === code)
                              if (match) fillFromProduct(row.key, match)
                            }}
                            placeholder="Barcode"
                            sx={{ ...fieldSx, width: 110 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={row.quantity}
                            onChange={(e) => updateLine(row.key, { quantity: Number(e.target.value) })}
                            error={Boolean(overStock)}
                            sx={{ ...fieldSx, width: 72 }}
                            inputProps={{ min: 1 }}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 180 }}>
                          <TextField
                            select
                            size="small"
                            value={row.productId}
                            onChange={(e) => {
                              const p = products.find((x) => x.id === e.target.value)
                              if (p) fillFromProduct(row.key, p)
                            }}
                            sx={{ ...fieldSx, minWidth: 170 }}
                          >
                            <MenuItem value="">Select product</MenuItem>
                            {products.map((p) => (
                              <MenuItem key={p.id} value={p.id} disabled={p.stockQty <= 0}>
                                {p.name} {p.stockQty <= 0 ? '(Out of stock)' : ''}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{row.batch || '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ color: overStock ? colors.error : v.textPrimary, fontWeight: overStock ? 700 : 500 }}
                          >
                            {row.productId ? row.availQty : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {row.productId ? formatCurrency(row.priceInclTax) : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={row.discountPct}
                            onChange={(e) =>
                              updateLine(row.key, { discountPct: Math.max(0, Math.min(100, Number(e.target.value))) })
                            }
                            sx={{ ...fieldSx, width: 72 }}
                            inputProps={{ min: 0, max: 100 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {row.productId ? formatCurrency(t.tax) : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{row.productId ? formatCurrency(row.mrp) : '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{row.productId ? formatCurrency(row.mop) : '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Remove row">
                            <IconButton size="small" color="error" onClick={() => removeLine(row.key)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setLines((prev) => [...prev, emptyRow()])}
                sx={{
                  ...primaryButtonSx,
                  bgcolor: colors.success,
                  background: colors.success,
                  '&:hover': { bgcolor: colors.success },
                }}
              >
                Add Row
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Sticky financial summary */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box
            sx={{
              ...whiteCardSx,
              position: { lg: 'sticky' },
              top: { lg: 88 },
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Typography sx={{ ...sectionTitleSx, mb: 0.5 }}>Financial Summary</Typography>

            <SummaryRow label="Subtotal (Excl. Tax)" value={formatCurrency(lineAgg.exclTax)} />
            <SummaryRow label="Total Tax" value={formatCurrency(lineAgg.tax)} />
            <SummaryRow label="Line Discounts" value={`−${formatCurrency(lineAgg.lineDisc)}`} muted />
            <SummaryRow label="Scheme Discounts" value={`−${formatCurrency(schemeDiscount)}`} muted />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                label="Discount"
                type="number"
                size="small"
                value={invoiceDiscount}
                onChange={(e) => setInvoiceDiscount(Math.max(0, Number(e.target.value)))}
                fullWidth
                sx={fieldSx}
              />
              <TextField
                select
                size="small"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'Flat' | 'Percent')}
                sx={{ ...fieldSx, width: 110 }}
              >
                <MenuItem value="Flat">Flat</MenuItem>
                <MenuItem value="Percent">%</MenuItem>
              </TextField>
            </Box>

            <Box
              sx={{
                py: 1.25,
                px: 1.5,
                borderRadius: '10px',
                bgcolor: mix.primary(8),
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" fontWeight={700}>Grand Total</Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: v.primary }}>
                {formatCurrency(grandTotal)}
              </Typography>
            </Box>

            <TextField
              label="Amount Received"
              type="number"
              size="small"
              value={amountReceived}
              onChange={(e) => setAmountReceived(Math.max(0, Number(e.target.value)))}
              fullWidth
              sx={fieldSx}
            />

            <SummaryRow label="Due Balance" value={formatCurrency(dueBalance)} emphasize />

            {customer && (
              <Box
                sx={{
                  mt: 0.5,
                  p: 1.5,
                  borderRadius: '10px',
                  border: `1px dashed ${creditExceeded ? colors.error : v.border}`,
                  bgcolor: creditExceeded ? mix.error(8) : mix.surface(4),
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, color: v.textMuted, display: 'block', mb: 0.75 }}>
                  Credit Details
                </Typography>
                <CreditRow label="Limit" value={formatCurrency(customer.creditLimit)} />
                <CreditRow label="Outstanding" value={formatCurrency(customer.outstanding)} />
                <CreditRow
                  label="After Invoice"
                  value={formatCurrency(projectedOutstanding)}
                  tone={creditExceeded ? 'error' : 'ok'}
                />
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ ...primaryButtonSx, mt: 1, py: 1.25 }}
              onClick={handleSave}
              disabled={createInvoice.isPending}
            >
              {createInvoice.isPending ? 'Saving…' : 'Save'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </PageShell>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: v.textMuted, fontWeight: 600 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
    </Box>
  )
}

function CreditRow({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'ok' | 'warn' | 'error'
}) {
  const color =
    tone === 'error' ? colors.error : tone === 'warn' ? colors.warning : tone === 'ok' ? colors.success : v.textPrimary
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
      <Typography variant="body2" sx={{ color: v.textSecondary }}>{label}</Typography>
      <Typography variant="body2" fontWeight={700} sx={{ color }}>{value}</Typography>
    </Box>
  )
}

function SummaryRow({
  label,
  value,
  muted,
  emphasize,
}: {
  label: string
  value: string
  muted?: boolean
  emphasize?: boolean
}) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
      <Typography
        variant="body2"
        sx={{ color: muted ? v.textMuted : v.textSecondary, fontWeight: emphasize ? 700 : 500 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={emphasize ? 800 : 600}
        sx={{ color: emphasize ? v.textPrimary : v.textPrimary }}
      >
        {value}
      </Typography>
    </Box>
  )
}
