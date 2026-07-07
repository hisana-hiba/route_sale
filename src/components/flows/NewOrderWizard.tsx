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
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { formatCurrency } from '@/utils/export'
import { colors } from '@/theme/palette'

const steps = ['Select Shop', 'Add Products', 'Payment & Discount', 'Review', 'Confirm']

interface Shop { id: string; name: string; owner: string; category: string }
interface Product { id: string; name: string; category: string; price: number; gstRate: number }

export function NewOrderWizard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeStep, setActiveStep] = useState(0)
  const [shopId, setShopId] = useState('')
  const [items, setItems] = useState<Record<string, number>>({})
  const [paymentType, setPaymentType] = useState('Cash')
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')
  const [success, setSuccess] = useState(false)

  const { data: shops = [] } = useQuery({ queryKey: ['shops'], queryFn: () => apiCall<Shop[]>('/shops') })
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => apiCall<Product[]>('/products') })

  const createOrder = useMutation({
    mutationFn: () => apiCall('/orders', {
      method: 'POST',
      body: {
        shopId,
        shopName: shops.find((s) => s.id === shopId)?.name,
        paymentType,
        discount,
        notes,
        items: Object.entries(items).filter(([, q]) => q > 0).map(([productId, qty]) => {
          const p = products.find((pr) => pr.id === productId)!
          return { productId, name: p.name, qty, price: p.price, gstRate: p.gstRate }
        }),
      },
    }),
    onSuccess: () => {
      setSuccess(true)
      queryClient.invalidateQueries({ queryKey: ['module', 'sales-orders'] })
      setTimeout(() => navigate('/sales/orders'), 1500)
    },
  })

  const lineItems = products.filter((p) => (items[p.id] ?? 0) > 0)
  const subtotal = lineItems.reduce((s, p) => s + p.price * (items[p.id] ?? 0), 0)
  const gst = lineItems.reduce((s, p) => s + (p.price * (items[p.id] ?? 0) * p.gstRate) / 100, 0)
  const total = subtotal + gst - discount

  const canNext = activeStep === 0 ? !!shopId
    : activeStep === 1 ? lineItems.length > 0
    : true

  return (
    <PageShell
      title="New Order"
      subtitle="5-step order wizard — per documentation flow 3.1"
      breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Orders', path: '/sales/orders' }, { label: 'New Order' }]}
    >
      <Box sx={{ ...whiteCardSx, p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>

        {activeStep === 0 && (
          <TextField select fullWidth label="Select Shop / Outlet" value={shopId} onChange={(e) => setShopId(e.target.value)}>
            {shops.map((s) => <MenuItem key={s.id} value={s.id}>{s.name} — {s.owner}</MenuItem>)}
          </TextField>
        )}

        {activeStep === 1 && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="center" width={140}>Qty</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell align="right">{formatCurrency(p.price)}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => setItems((prev) => ({ ...prev, [p.id]: Math.max(0, (prev[p.id] ?? 0) - 1) }))}><RemoveIcon fontSize="small" /></IconButton>
                    {items[p.id] ?? 0}
                    <IconButton size="small" onClick={() => setItems((prev) => ({ ...prev, [p.id]: (prev[p.id] ?? 0) + 1 }))}><AddIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {activeStep === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
            <TextField select label="Payment Type" value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
              {['Cash', 'Credit', 'UPI'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField label="Discount (₹)" type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
            <TextField label="Notes" multiline rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Box>
        )}

        {activeStep === 3 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>Shop: {shops.find((s) => s.id === shopId)?.name}</Typography>
            {lineItems.map((p) => (
              <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: `1px solid ${colors.border}` }}>
                <Typography variant="body2">{p.name} × {items[p.id]}</Typography>
                <Typography variant="body2" fontWeight={600}>{formatCurrency(p.price * items[p.id])}</Typography>
              </Box>
            ))}
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Typography variant="body2">Subtotal: {formatCurrency(subtotal)}</Typography>
              <Typography variant="body2">GST: {formatCurrency(gst)}</Typography>
              <Typography variant="body2">Discount: -{formatCurrency(discount)}</Typography>
              <Typography variant="h6" fontWeight={800}>Total: {formatCurrency(total)}</Typography>
            </Box>
          </Box>
        )}

        {activeStep === 4 && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            {success ? (
              <Alert severity="success">Order created successfully! Redirecting...</Alert>
            ) : (
              <>
                <Typography gutterBottom>Confirm order for {formatCurrency(total)}?</Typography>
                <Button variant="contained" color="primary" sx={primaryButtonSx} onClick={() => createOrder.mutate()} disabled={createOrder.isPending}>
                  Submit Order
                </Button>
              </>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button disabled={activeStep === 0} onClick={() => setActiveStep((s) => s - 1)}>Back</Button>
          {activeStep < 4 && (
            <Button variant="contained" color="primary" sx={primaryButtonSx} disabled={!canNext} onClick={() => setActiveStep((s) => s + 1)}>
              Next
            </Button>
          )}
        </Box>
      </Box>
    </PageShell>
  )
}
