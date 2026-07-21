import { useMemo, useState } from 'react'
import {
  Box, Button, Stepper, Step, StepLabel, Typography, TextField, MenuItem,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton, Alert, Chip,
  alpha,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiCall } from '@/api/flowClient'
import { returnReasons } from '@/mocks/flowData'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { formatCurrency } from '@/utils/export'
import { colors } from '@/theme/palette'

const steps = ['Select Shop', 'Link Order', 'Return Items', 'Details', 'Confirm']

/** Extra return reason surfaced only once an order has been linked (Link Order step) */
const REPLACEMENT_REASON = 'Replacement'

const SETTLEMENT_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit', label: 'Credit' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'replace', label: 'Product Replacement' },
  { value: 'price_adjustment', label: 'Price Adjustment' },
] as const

type SettlementType = (typeof SETTLEMENT_TYPES)[number]['value']

interface Shop {
  id: string
  name: string
  owner: string
  creditLimit?: number
  outstanding?: number
}

interface Product {
  id: string
  name: string
  category: string
  price: number
  gstRate: number
  stockQty?: number
  barcode?: string
  image?: string
}

interface Order {
  id: string
  code: string
  shopId: string
  shopName: string
  amount: number
  status: string
  items?: { productId: string; name: string; qty: number; price: number }[]
}

interface PricingRule {
  id: string
  shopId: string
  productId: string
  amount: number
  enabled: boolean
  variantSupport: boolean
  attributeSupport: boolean
}

export function SalesReturnWizard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeStep, setActiveStep] = useState(0)
  const [shopId, setShopId] = useState('')
  const [orderId, setOrderId] = useState('')
  const [items, setItems] = useState<Record<string, number>>({})
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const [returnType, setReturnType] = useState<SettlementType>('cash')
  const [notes, setNotes] = useState('')
  const [replacementQty, setReplacementQty] = useState<Record<string, number>>({})
  const [adjustedPrices, setAdjustedPrices] = useState<Record<string, number>>({})
  const [replacementSelections, setReplacementSelections] = useState<Record<string, string>>({})
  const [replacementAdjustments, setReplacementAdjustments] = useState<Record<string, number>>({})
  const [success, setSuccess] = useState(false)

  const { data: shops = [] } = useQuery({ queryKey: ['shops'], queryFn: () => apiCall<Shop[]>('/shops') })
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => apiCall<Product[]>('/products') })
  const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: () => apiCall<Order[]>('/orders') })
  const { data: pricingRules = [] } = useQuery({
    queryKey: ['return-pricing-rules'],
    queryFn: () => apiCall<PricingRule[]>('/return-pricing-rules'),
  })

  const shopOrders = orders.filter((o) =>
    (!shopId || o.shopId === shopId) && ['delivered', 'completed', 'confirmed'].includes(o.status),
  )
  const selectedOrder = shopOrders.find((o) => o.id === orderId)
  const selectedShop = shops.find((s) => s.id === shopId)

  const getProductPrice = (productId: string, catalogPrice: number) => {
    if (!shopId) return catalogPrice
    const rule = pricingRules.find(
      (r) => r.enabled && r.shopId === shopId && r.productId === productId,
    )
    return rule ? rule.amount : catalogPrice
  }

  const lineItems = products.filter((p) => (items[p.id] ?? 0) > 0)
  const total = lineItems.reduce(
    (s, p) => s + getProductPrice(p.id, p.price) * (items[p.id] ?? 0),
    0,
  )

  const availableCredit = selectedShop
    ? Math.max(0, (selectedShop.creditLimit ?? 0) - (selectedShop.outstanding ?? 0))
    : null

  const replacementItems = products.filter((p) => (replacementQty[p.id] ?? 0) > 0)
  const needsProductPicker = returnType === 'transfer' || returnType === 'replace'
  const needsPriceAdjustment = returnType === 'price_adjustment'

  // "Replacement" is always offered as a return reason — linking an order is optional
  const reasonOptions = useMemo(() => [...returnReasons, REPLACEMENT_REASON], [])
  const replacementLineItems = lineItems.filter((p) => reasons[p.id] === REPLACEMENT_REASON)

  const getReplacementProduct = (returnedId: string) =>
    products.find((p) => p.id === replacementSelections[returnedId])

  const getAutoReplacementAdjustment = (returnedId: string) => {
    const returned = products.find((p) => p.id === returnedId)
    const replacement = getReplacementProduct(returnedId)
    if (!returned || !replacement) return 0
    const originalPrice = getProductPrice(returnedId, returned.price)
    const replacementPrice = getProductPrice(replacement.id, replacement.price)
    const qty = items[returnedId] ?? 0
    return (replacementPrice - originalPrice) * qty
  }

  const getReplacementAdjustmentAmount = (returnedId: string) =>
    replacementAdjustments[returnedId] ?? getAutoReplacementAdjustment(returnedId)

  const selectReplacementProduct = (returnedId: string, replacementId: string) => {
    setReplacementSelections((prev) => ({ ...prev, [returnedId]: replacementId }))
    const returned = products.find((p) => p.id === returnedId)
    const replacement = products.find((p) => p.id === replacementId)
    if (returned && replacement) {
      const originalPrice = getProductPrice(returnedId, returned.price)
      const replacementPrice = getProductPrice(replacementId, replacement.price)
      const qty = items[returnedId] ?? 0
      setReplacementAdjustments((prev) => ({ ...prev, [returnedId]: (replacementPrice - originalPrice) * qty }))
    }
  }

  const replacementAdjustmentTotal = useMemo(
    () => replacementLineItems.reduce((sum, p) => sum + getReplacementAdjustmentAmount(p.id), 0),
    [replacementLineItems, replacementAdjustments, replacementSelections, items, shopId, pricingRules],
  )

  const priceAdjustmentTotal = useMemo(() => {
    if (!needsPriceAdjustment) return 0
    return lineItems.reduce((sum, p) => {
      const qty = items[p.id] ?? 0
      const original = getProductPrice(p.id, p.price)
      const adjusted = adjustedPrices[p.id] ?? original
      return sum + (original - adjusted) * qty
    }, 0)
  }, [needsPriceAdjustment, lineItems, items, adjustedPrices, shopId, pricingRules])

  const createReturn = useMutation({
    mutationFn: () => {
      const returnItems = Object.entries(items)
        .filter(([, q]) => q > 0)
        .map(([productId, qty]) => {
          const p = products.find((pr) => pr.id === productId)!
          const price = getProductPrice(productId, p.price)
          const reason = reasons[productId] ?? returnReasons[0]
          const replacement = reason === REPLACEMENT_REASON ? getReplacementProduct(productId) : undefined
          return {
            productId,
            name: p.name,
            qty,
            price,
            returnReason: reason,
            adjustedPrice: needsPriceAdjustment ? (adjustedPrices[productId] ?? price) : undefined,
            replacementProductId: replacement?.id,
            replacementProductName: replacement?.name,
            replacementPriceAdjustment: replacement ? getReplacementAdjustmentAmount(productId) : undefined,
          }
        })

      return apiCall('/returns', {
        method: 'POST',
        body: {
          shopId: shopId || undefined,
          shopName: selectedShop?.name ?? (shopId ? undefined : 'Unlinked return'),
          orderId: orderId || undefined,
          orderRef: selectedOrder?.code,
          returnType,
          notes,
          cashAmount: returnType === 'cash' ? total : undefined,
          availableCredit: returnType === 'credit' ? availableCredit : undefined,
          replacementItems: needsProductPicker
            ? replacementItems.map((p) => ({
                productId: p.id,
                name: p.name,
                qty: replacementQty[p.id],
                price: p.price,
              }))
            : undefined,
          priceAdjustmentTotal: needsPriceAdjustment ? priceAdjustmentTotal : undefined,
          replacementAdjustmentTotal: replacementLineItems.length > 0 ? replacementAdjustmentTotal : undefined,
          items: returnItems,
        },
      })
    },
    onSuccess: () => {
      setSuccess(true)
      queryClient.invalidateQueries({ queryKey: ['returns'] })
      queryClient.invalidateQueries({ queryKey: ['module', 'sales-sales-return'] })
      setTimeout(() => navigate('/sales/sales-return'), 1500)
    },
  })

  const canNext = activeStep === 0 ? true
    : activeStep === 1 ? true
    : activeStep === 2 ? lineItems.length > 0
    : activeStep === 3
      ? (needsProductPicker ? replacementItems.length > 0 : true)
        && replacementLineItems.every((p) => Boolean(replacementSelections[p.id]))
      : true

  const settlementLabel = SETTLEMENT_TYPES.find((s) => s.value === returnType)?.label ?? returnType

  return (
    <PageShell
      title="New Sales Return"
      subtitle="Create a customer return — shop & order linking are optional"
      breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Sales Returns', path: '/sales/sales-return' }, { label: 'New Return' }]}
    >
      <Box sx={{ ...whiteCardSx, p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>

        {activeStep === 0 && (
          <Box>
            <TextField
              select
              fullWidth
              label="Select Shop / Outlet"
              value={shopId}
              onChange={(e) => { setShopId(e.target.value); setOrderId('') }}
              helperText="Optional — skip if the return is not shop-linked"
            >
              <MenuItem value="">No shop selected</MenuItem>
              {shops.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name} — {s.owner}</MenuItem>
              ))}
            </TextField>
            <Alert severity="info" sx={{ mt: 2 }}>
              You can skip shop selection and continue with return items.
            </Alert>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Link to a delivered order (optional — skip if return is not order-linked)
            </Typography>
            <TextField select fullWidth label="Order / Invoice" value={orderId} onChange={(e) => setOrderId(e.target.value)}>
              <MenuItem value="">No order link</MenuItem>
              {shopOrders.map((o) => (
                <MenuItem key={o.id} value={o.id}>{o.code} — {formatCurrency(o.amount)} ({o.status})</MenuItem>
              ))}
            </TextField>
            {shopOrders.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>No delivered orders found. You can continue without linking.</Alert>
            )}
            {orderId && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Order linked.
              </Alert>
            )}
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Set a product's Return Reason to <strong>Replacement</strong> to swap it for a different product in the Details step.
            </Alert>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center" width={120}>Return Qty</TableCell>
                  <TableCell width={180}>Return Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((p) => {
                  const price = getProductPrice(p.id, p.price)
                  return (
                    <TableRow key={p.id}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell align="right">{formatCurrency(price)}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => setItems((prev) => ({ ...prev, [p.id]: Math.max(0, (prev[p.id] ?? 0) - 1) }))}><RemoveIcon fontSize="small" /></IconButton>
                        {items[p.id] ?? 0}
                        <IconButton
                          size="small"
                          onClick={() => {
                            setItems((prev) => ({ ...prev, [p.id]: (prev[p.id] ?? 0) + 1 }))
                            setReasons((prev) => prev[p.id] ? prev : { ...prev, [p.id]: returnReasons[0] })
                            if (adjustedPrices[p.id] == null) {
                              setAdjustedPrices((prev) => ({ ...prev, [p.id]: price }))
                            }
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        {(items[p.id] ?? 0) > 0 && (
                          <TextField
                            select
                            size="small"
                            fullWidth
                            value={reasons[p.id] ?? returnReasons[0]}
                            onChange={(e) => {
                              const value = e.target.value
                              setReasons((prev) => ({ ...prev, [p.id]: value }))
                              if (value !== REPLACEMENT_REASON) {
                                setReplacementSelections((prev) => {
                                  if (!(p.id in prev)) return prev
                                  const next = { ...prev }
                                  delete next[p.id]
                                  return next
                                })
                              }
                            }}
                          >
                            {reasonOptions.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                          </TextField>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Box>
        )}

        {activeStep === 3 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: replacementLineItems.length > 0 ? 1080 : 560 }}>
            <TextField
              select
              label="Settlement Type"
              value={returnType}
              onChange={(e) => setReturnType(e.target.value as SettlementType)}
            >
              {SETTLEMENT_TYPES.map((s) => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </TextField>

            {returnType === 'cash' && (
              <TextField
                label="Cash Amount"
                value={formatCurrency(total)}
                slotProps={{ input: { readOnly: true } }}
                helperText="Automatically calculated from returned items"
              />
            )}

            {returnType === 'credit' && (
              <TextField
                label="Available Credit Amount"
                value={availableCredit == null ? 'Select a shop to view credit' : formatCurrency(availableCredit)}
                slotProps={{ input: { readOnly: true } }}
                helperText={
                  selectedShop
                    ? `Credit limit ${formatCurrency(selectedShop.creditLimit ?? 0)} − outstanding ${formatCurrency(selectedShop.outstanding ?? 0)}`
                    : 'Shop selection was skipped'
                }
              />
            )}

            {needsProductPicker && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                  {returnType === 'replace' ? 'Replacement Products' : 'Transfer Products'}
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="center" width={120}>Qty</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.name}</TableCell>
                        <TableCell align="right">{formatCurrency(p.price)}</TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={() => setReplacementQty((prev) => ({ ...prev, [p.id]: Math.max(0, (prev[p.id] ?? 0) - 1) }))}><RemoveIcon fontSize="small" /></IconButton>
                          {replacementQty[p.id] ?? 0}
                          <IconButton size="small" onClick={() => setReplacementQty((prev) => ({ ...prev, [p.id]: (prev[p.id] ?? 0) + 1 }))}><AddIcon fontSize="small" /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {replacementItems.length === 0 && (
                  <Alert severity="warning" sx={{ mt: 1 }}>Select at least one product for {settlementLabel.toLowerCase()}.</Alert>
                )}
              </Box>
            )}

            {needsPriceAdjustment && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                  Price Adjustment
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Original</TableCell>
                      <TableCell align="right" width={140}>Adjusted Price</TableCell>
                      <TableCell align="right">Difference</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lineItems.map((p) => {
                      const qty = items[p.id] ?? 0
                      const original = getProductPrice(p.id, p.price)
                      const adjusted = adjustedPrices[p.id] ?? original
                      return (
                        <TableRow key={p.id}>
                          <TableCell>{p.name} × {qty}</TableCell>
                          <TableCell align="right">{formatCurrency(original)}</TableCell>
                          <TableCell align="right">
                            <TextField
                              size="small"
                              type="number"
                              value={adjusted}
                              onChange={(e) => setAdjustedPrices((prev) => ({
                                ...prev,
                                [p.id]: Math.max(0, Number(e.target.value) || 0),
                              }))}
                              sx={{ width: 120 }}
                            />
                          </TableCell>
                          <TableCell align="right">{formatCurrency((original - adjusted) * qty)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                  Adjustment total: {formatCurrency(priceAdjustmentTotal)}
                </Typography>
              </Box>
            )}

            {replacementLineItems.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Product Replacement
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pick a replacement for each item marked "Replacement" — price difference &amp; payable/refundable amount update automatically.
                  </Typography>
                </Box>
                {replacementLineItems.map((p) => (
                  <ReplacementPanel
                    key={p.id}
                    returnedProduct={p}
                    qty={items[p.id] ?? 0}
                    originalPrice={getProductPrice(p.id, p.price)}
                    products={products}
                    selectedReplacementId={replacementSelections[p.id]}
                    onSelect={(replacementId) => selectReplacementProduct(p.id, replacementId)}
                    adjustmentAmount={getReplacementAdjustmentAmount(p.id)}
                    onAdjustmentChange={(value) => setReplacementAdjustments((prev) => ({ ...prev, [p.id]: value }))}
                    getProductPrice={getProductPrice}
                  />
                ))}
                <Box sx={{ textAlign: 'right', borderTop: `1px dashed ${colors.border}`, pt: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Total replacement adjustment: {replacementAdjustmentTotal > 0 ? '+' : ''}{formatCurrency(replacementAdjustmentTotal)}
                    {' '}({replacementAdjustmentTotal > 0 ? 'payable by customer' : replacementAdjustmentTotal < 0 ? 'refundable to customer' : 'no change'})
                  </Typography>
                </Box>
              </Box>
            )}

            <TextField label="Notes" multiline rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Box>
        )}

        {activeStep === 4 && (
          <Box sx={{ textAlign: success ? 'center' : 'left', py: success ? 2 : 0 }}>
            {success ? (
              <Alert severity="success">Return submitted — pending approval. Redirecting...</Alert>
            ) : (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Shop: {selectedShop?.name ?? 'Skipped'}
                  {selectedOrder ? ` · Order: ${selectedOrder.code}` : ' · Order: Skipped'}
                </Typography>
                <Chip label={settlementLabel} size="small" sx={{ mb: 2, mr: 1 }} />
                {returnType === 'cash' && <Chip label={`Cash ${formatCurrency(total)}`} size="small" sx={{ mb: 2 }} />}
                {returnType === 'credit' && availableCredit != null && (
                  <Chip label={`Available credit ${formatCurrency(availableCredit)}`} size="small" sx={{ mb: 2 }} />
                )}
                {lineItems.map((p) => (
                  <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: `1px solid ${colors.border}` }}>
                    <Typography variant="body2">
                      {p.name} × {items[p.id]} ({reasons[p.id] ?? returnReasons[0]})
                      {needsPriceAdjustment && ` · Adj ${formatCurrency(adjustedPrices[p.id] ?? getProductPrice(p.id, p.price))}`}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(getProductPrice(p.id, p.price) * items[p.id])}
                    </Typography>
                  </Box>
                ))}
                {needsProductPicker && replacementItems.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      {returnType === 'replace' ? 'Replacement' : 'Transfer'} products
                    </Typography>
                    {replacementItems.map((p) => (
                      <Typography key={p.id} variant="body2">
                        {p.name} × {replacementQty[p.id]}
                      </Typography>
                    ))}
                  </Box>
                )}
                {replacementLineItems.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      Product Replacement Swaps
                    </Typography>
                    {replacementLineItems.map((p) => {
                      const replacement = getReplacementProduct(p.id)
                      const adjustment = getReplacementAdjustmentAmount(p.id)
                      return (
                        <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                          <Typography variant="body2">
                            {p.name} × {items[p.id]} → {replacement ? replacement.name : 'No replacement selected'}
                          </Typography>
                          {replacement && (
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: adjustment > 0 ? 'error.main' : adjustment < 0 ? 'success.main' : 'text.primary' }}
                            >
                              {adjustment > 0 ? 'Payable ' : adjustment < 0 ? 'Refund ' : ''}{formatCurrency(Math.abs(adjustment))}
                            </Typography>
                          )}
                        </Box>
                      )
                    })}
                  </Box>
                )}
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Return Value: {formatCurrency(total)}</Typography>
                  {needsPriceAdjustment && (
                    <Typography variant="body2" color="text.secondary">
                      Price adjustment: {formatCurrency(priceAdjustmentTotal)}
                    </Typography>
                  )}
                  {replacementLineItems.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Replacement adjustment: {replacementAdjustmentTotal > 0 ? '+' : ''}{formatCurrency(replacementAdjustmentTotal)}
                      {' '}({replacementAdjustmentTotal > 0 ? 'payable' : replacementAdjustmentTotal < 0 ? 'refundable' : 'no change'})
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">Settlement: {settlementLabel}</Typography>
                </Box>
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button variant="contained" color="primary" sx={primaryButtonSx} onClick={() => createReturn.mutate()} disabled={createReturn.isPending}>
                    Submit Return
                  </Button>
                </Box>
              </>
            )}
          </Box>
        )}

        {activeStep < 4 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={() => setActiveStep((s) => s - 1)}>Back</Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {(activeStep === 0 || activeStep === 1) && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (activeStep === 0) setShopId('')
                    if (activeStep === 1) setOrderId('')
                    setActiveStep((s) => s + 1)
                  }}
                >
                  Skip
                </Button>
              )}
              <Button variant="contained" color="primary" sx={primaryButtonSx} disabled={!canNext} onClick={() => setActiveStep((s) => s + 1)}>
                Next
              </Button>
            </Box>
          </Box>
        )}
        {activeStep === 4 && !success && (
          <Box sx={{ mt: 2 }}>
            <Button onClick={() => setActiveStep(3)}>Back</Button>
          </Box>
        )}
      </Box>
    </PageShell>
  )
}

function ProductThumb({ product, size = 60 }: { product: Product; size?: number }) {
  const [failed, setFailed] = useState(false)

  if (!product.image || failed) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '10px',
          flexShrink: 0,
          bgcolor: alpha(colors.primary, 0.08),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Inventory2OutlinedIcon sx={{ fontSize: size * 0.45, color: colors.primary }} />
      </Box>
    )
  }

  return (
    <Box
      component="img"
      src={product.image}
      alt={product.name}
      onError={() => setFailed(true)}
      sx={{
        width: size,
        height: size,
        borderRadius: '10px',
        flexShrink: 0,
        objectFit: 'cover',
        border: `1px solid ${colors.border}`,
      }}
    />
  )
}

interface ReplacementPanelProps {
  returnedProduct: Product
  qty: number
  originalPrice: number
  products: Product[]
  selectedReplacementId?: string
  onSelect: (productId: string) => void
  adjustmentAmount: number
  onAdjustmentChange: (value: number) => void
  getProductPrice: (productId: string, catalogPrice: number) => number
}

/** Two-panel replacement picker: product cards on the left, live preview + price adjustment on the right */
function ReplacementPanel({
  returnedProduct,
  qty,
  originalPrice,
  products,
  selectedReplacementId,
  onSelect,
  adjustmentAmount,
  onAdjustmentChange,
  getProductPrice,
}: ReplacementPanelProps) {
  const selected = products.find((p) => p.id === selectedReplacementId)
  const selectedPrice = selected ? getProductPrice(selected.id, selected.price) : null
  const priceDiffPerUnit = selected ? selectedPrice! - originalPrice : null
  const isPayable = adjustmentAmount > 0
  const isRefundable = adjustmentAmount < 0

  return (
    <Box sx={{ border: `1px solid ${colors.border}`, borderRadius: '14px', p: 2.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        Replace "{returnedProduct.name}" × {qty}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        Returned product price: {formatCurrency(originalPrice)} / unit
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box
          sx={{
            flex: 1.3,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 1.25,
            maxHeight: 380,
            overflowY: 'auto',
            pr: 0.5,
          }}
        >
          {products.map((p) => {
            const price = getProductPrice(p.id, p.price)
            const isSelected = p.id === selectedReplacementId
            return (
              <Box
                key={p.id}
                onClick={() => onSelect(p.id)}
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  border: `1.5px solid ${isSelected ? colors.primary : colors.border}`,
                  borderRadius: '12px',
                  p: 1.25,
                  bgcolor: isSelected ? alpha(colors.primary, 0.06) : '#fff',
                  transition: 'border-color 0.15s ease, background-color 0.15s ease',
                  '&:hover': { borderColor: colors.primary },
                }}
              >
                {isSelected && (
                  <CheckCircleIcon sx={{ position: 'absolute', top: 6, right: 6, fontSize: 18, color: colors.primary }} />
                )}
                <ProductThumb product={p} />
                <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }} noWrap>{p.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                  SKU: {p.barcode ?? p.id}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                  <Chip label={`Stock ${p.stockQty ?? '—'}`} size="small" sx={{ height: 20, fontSize: 10 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(price)}</Typography>
                </Box>
              </Box>
            )
          })}
        </Box>

        <Box sx={{ flex: 1, border: `1px solid ${colors.border}`, borderRadius: '12px', p: 2, bgcolor: alpha(colors.primary, 0.02) }}>
          {!selected ? (
            <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
              <Inventory2OutlinedIcon sx={{ fontSize: 32, mb: 1, opacity: 0.4 }} />
              <Typography variant="body2">Select a product from the list to preview replacement details.</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <ProductThumb product={selected} size={72} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>{selected.name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    SKU: {selected.barcode ?? selected.id} · {selected.category}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Stock available: {selected.stockQty ?? '—'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Returned product price</Typography>
                  <Typography variant="body2">{formatCurrency(originalPrice)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Replacement product price</Typography>
                  <Typography variant="body2">{formatCurrency(selectedPrice!)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderTop: `1px dashed ${colors.border}`, mt: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Price difference / unit</Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: priceDiffPerUnit! > 0 ? 'error.main' : priceDiffPerUnit! < 0 ? 'success.main' : 'text.primary',
                    }}
                  >
                    {priceDiffPerUnit! > 0 ? '+' : ''}{formatCurrency(priceDiffPerUnit!)}
                  </Typography>
                </Box>
              </Box>

              <TextField
                label="Price Adjustment (total)"
                type="number"
                size="small"
                fullWidth
                value={adjustmentAmount}
                onChange={(e) => onAdjustmentChange(Number(e.target.value) || 0)}
                sx={{ mt: 2 }}
                helperText="Auto-calculated as qty × price difference — editable if needed"
              />

              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  borderRadius: '10px',
                  textAlign: 'center',
                  bgcolor: isPayable ? alpha(colors.error, 0.08) : isRefundable ? alpha(colors.success, 0.08) : alpha(colors.textMuted, 0.08),
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {isPayable ? 'Amount Payable by Customer' : isRefundable ? 'Amount Refundable to Customer' : 'No Additional Payment'}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: isPayable ? 'error.main' : isRefundable ? 'success.main' : 'text.primary',
                  }}
                >
                  {formatCurrency(Math.abs(adjustmentAmount))}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  )
}
