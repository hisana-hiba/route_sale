import { useState } from 'react'
import {
  Box, Button, Stepper, Step, StepLabel, Typography, TextField, MenuItem,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton, Alert, Chip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiCall } from '@/api/flowClient'
import { returnReasons, returnConditions } from '@/mocks/flowData'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { formatCurrency } from '@/utils/export'
import { colors } from '@/theme/palette'

const steps = ['Select Shop', 'Link Order', 'Return Items', 'Details', 'Confirm']

interface Shop { id: string; name: string; owner: string }
interface Product { id: string; name: string; category: string; price: number; gstRate: number }
interface Order {
  id: string
  code: string
  shopId: string
  shopName: string
  amount: number
  status: string
  items?: { productId: string; name: string; qty: number; price: number }[]
}

export function SalesReturnWizard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeStep, setActiveStep] = useState(0)
  const [shopId, setShopId] = useState('')
  const [orderId, setOrderId] = useState('')
  const [items, setItems] = useState<Record<string, number>>({})
  const [conditions, setConditions] = useState<Record<string, string>>({})
  const [returnType, setReturnType] = useState('credit_note')
  const [reason, setReason] = useState('Unsold')
  const [notes, setNotes] = useState('')
  const [success, setSuccess] = useState(false)

  const { data: shops = [] } = useQuery({ queryKey: ['shops'], queryFn: () => apiCall<Shop[]>('/shops') })
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => apiCall<Product[]>('/products') })
  const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: () => apiCall<Order[]>('/orders') })

  const shopOrders = orders.filter((o) => o.shopId === shopId && ['delivered', 'completed', 'confirmed'].includes(o.status))
  const selectedOrder = shopOrders.find((o) => o.id === orderId)

  const createReturn = useMutation({
    mutationFn: () => apiCall('/returns', {
      method: 'POST',
      body: {
        shopId,
        shopName: shops.find((s) => s.id === shopId)?.name,
        orderId: orderId || undefined,
        orderRef: selectedOrder?.code,
        returnType,
        reason,
        notes,
        items: Object.entries(items).filter(([, q]) => q > 0).map(([productId, qty]) => {
          const p = products.find((pr) => pr.id === productId)!
          return {
            productId,
            name: p.name,
            qty,
            price: p.price,
            condition: conditions[productId] ?? 'Good',
          }
        }),
      },
    }),
    onSuccess: () => {
      setSuccess(true)
      queryClient.invalidateQueries({ queryKey: ['returns'] })
      queryClient.invalidateQueries({ queryKey: ['module', 'sales-sales-return'] })
      setTimeout(() => navigate('/sales/sales-return'), 1500)
    },
  })

  const lineItems = products.filter((p) => (items[p.id] ?? 0) > 0)
  const total = lineItems.reduce((s, p) => s + p.price * (items[p.id] ?? 0), 0)

  const canNext = activeStep === 0 ? !!shopId
    : activeStep === 1 ? true
    : activeStep === 2 ? lineItems.length > 0
    : true

  return (
    <PageShell
      title="New Sales Return"
      subtitle="Create a customer return — linked to shop & order per documentation"
      breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Sales Returns', path: '/sales/sales-return' }, { label: 'New Return' }]}
    >
      <Box sx={{ ...whiteCardSx, p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>

        {activeStep === 0 && (
          <TextField select fullWidth label="Select Shop / Outlet" value={shopId} onChange={(e) => { setShopId(e.target.value); setOrderId('') }}>
            {shops.map((s) => <MenuItem key={s.id} value={s.id}>{s.name} — {s.owner}</MenuItem>)}
          </TextField>
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
              <Alert severity="info" sx={{ mt: 2 }}>No delivered orders for this shop. You can continue without linking.</Alert>
            )}
          </Box>
        )}

        {activeStep === 2 && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="center" width={120}>Return Qty</TableCell>
                <TableCell width={160}>Condition</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell align="right">{formatCurrency(p.price)}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => setItems((prev) => ({ ...prev, [p.id]: Math.max(0, (prev[p.id] ?? 0) - 1) }))}><RemoveIcon fontSize="small" /></IconButton>
                    {items[p.id] ?? 0}
                    <IconButton size="small" onClick={() => setItems((prev) => ({ ...prev, [p.id]: (prev[p.id] ?? 0) + 1 }))}><AddIcon fontSize="small" /></IconButton>
                  </TableCell>
                  <TableCell>
                    {(items[p.id] ?? 0) > 0 && (
                      <TextField select size="small" fullWidth value={conditions[p.id] ?? 'Good'} onChange={(e) => setConditions((prev) => ({ ...prev, [p.id]: e.target.value }))}>
                        {returnConditions.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                      </TextField>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {activeStep === 3 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
            <TextField select label="Return Reason" value={reason} onChange={(e) => setReason(e.target.value)} required>
              {returnReasons.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
            <TextField select label="Settlement Type" value={returnType} onChange={(e) => setReturnType(e.target.value)}>
              <MenuItem value="credit_note">Credit Note</MenuItem>
              <MenuItem value="cash_refund">Cash Refund</MenuItem>
              <MenuItem value="replace">Product Replacement</MenuItem>
            </TextField>
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
                  Shop: {shops.find((s) => s.id === shopId)?.name}
                  {selectedOrder && ` · Order: ${selectedOrder.code}`}
                </Typography>
                <Chip label={reason} size="small" sx={{ mb: 2 }} />
                {lineItems.map((p) => (
                  <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: `1px solid ${colors.border}` }}>
                    <Typography variant="body2">{p.name} × {items[p.id]} ({conditions[p.id] ?? 'Good'})</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatCurrency(p.price * items[p.id])}</Typography>
                  </Box>
                ))}
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Typography variant="h6" fontWeight={800}>Return Value: {formatCurrency(total)}</Typography>
                  <Typography variant="caption" color="text.secondary">Settlement: {returnType.replace(/_/g, ' ')}</Typography>
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
            <Button variant="contained" color="primary" sx={primaryButtonSx} disabled={!canNext} onClick={() => setActiveStep((s) => s + 1)}>
              Next
            </Button>
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
