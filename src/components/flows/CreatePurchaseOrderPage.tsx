import { useMemo, useState } from 'react'
import {
  Alert,
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
import { v } from '@/theme/cssVars'

const SUPPLIERS = [
  'Hindustan Foods Ltd',
  'Amul Dairy Co-op',
  'Britannia Industries',
  'ITC Limited',
  'Parle Products',
  'Nestle India',
  'HUL Distributors',
  'PepsiCo India',
]

const UOM_OPTIONS = [
  { value: 'L', label: 'Litre (L)' },
  { value: 'ml', label: 'Millilitre (ml)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'box', label: 'Box' },
  { value: 'pkt', label: 'Packet' },
  { value: 'case', label: 'Case' },
] as const

interface OrderProduct {
  id: string
  name: string
  category: string
  price: number
  unit: string
}

interface LineSelection {
  quantity: number
  uom: string
}

export function CreatePurchaseOrderPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [supplier, setSupplier] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [expectedDate, setExpectedDate] = useState('')
  const [warehouse, setWarehouse] = useState('Main Warehouse')
  const [notes, setNotes] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [selected, setSelected] = useState<Record<string, LineSelection>>({})
  const [error, setError] = useState('')

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['purchase-order-products'],
    queryFn: () => apiCall<OrderProduct[]>('/products'),
  })

  const createOrder = useMutation({
    mutationFn: () => {
      const lineItems = products
        .filter((p) => (selected[p.id]?.quantity ?? 0) > 0)
        .map((p) => {
          const line = selected[p.id]
          return {
            productId: p.id,
            name: p.name,
            category: p.category,
            unit: line.uom,
            price: p.price,
            quantity: line.quantity,
            lineTotal: p.price * line.quantity,
          }
        })

      const totalQuantity = lineItems.reduce((sum, item) => sum + item.quantity, 0)
      const totalPurchase = lineItems.reduce((sum, item) => sum + item.lineTotal, 0)
      const productList = lineItems.map((item) => `${item.name} (${item.quantity} ${item.unit})`).join(', ')

      return createItem('/purchase-purchase-orders', {
        supplier,
        date,
        expectedDate: expectedDate || undefined,
        warehouse,
        notes,
        products: lineItems,
        productList,
        items: lineItems.length,
        totalQuantity,
        amount: totalPurchase,
        status: 'pending',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', 'purchase-purchase-orders'] })
      navigate('/purchase/purchase-orders')
    },
    onError: () => setError('Failed to create purchase order. Please try again.'),
  })

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
    )
  }, [products, productSearch])

  const selectedItems = products.filter((p) => (selected[p.id]?.quantity ?? 0) > 0)
  const totalQuantity = selectedItems.reduce((sum, p) => sum + (selected[p.id]?.quantity ?? 0), 0)
  const totalPurchase = selectedItems.reduce((sum, p) => sum + p.price * (selected[p.id]?.quantity ?? 0), 0)

  const defaultUom = (product: OrderProduct) => {
    const match = UOM_OPTIONS.find((u) => u.value === product.unit)
    return match?.value ?? 'pcs'
  }

  const toggleProduct = (product: OrderProduct, checked: boolean) => {
    setSelected((prev) => {
      const next = { ...prev }
      if (checked) {
        next[product.id] = next[product.id] ?? { quantity: 1, uom: defaultUom(product) }
      } else {
        delete next[product.id]
      }
      return next
    })
  }

  const setQuantity = (productId: string, quantity: number) => {
    setSelected((prev) => ({
      ...prev,
      [productId]: {
        quantity: Math.max(1, quantity),
        uom: prev[productId]?.uom ?? 'pcs',
      },
    }))
  }

  const setUom = (productId: string, uom: string) => {
    setSelected((prev) => ({
      ...prev,
      [productId]: {
        quantity: prev[productId]?.quantity ?? 1,
        uom,
      },
    }))
  }

  const handleSubmit = () => {
    setError('')
    if (!supplier) {
      setError('Please select a supplier.')
      return
    }
    if (selectedItems.length === 0) {
      setError('Please add at least one product to the purchase order.')
      return
    }
    createOrder.mutate()
  }

  return (
    <PageShell
      title="New Purchase Order"
      subtitle="Create a purchase order with supplier and product details"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Purchase Orders', path: '/purchase/purchase-orders' },
        { label: 'New Purchase Order' },
      ]}
    >
      <Box sx={{ ...whiteCardSx, p: { xs: 2, md: 3 } }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              required
              label="Supplier Name"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            >
              {SUPPLIERS.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              required
              type="date"
              label="Order Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              type="date"
              label="Expected Delivery"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Warehouse"
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
            >
              {['Main Warehouse', 'Cold Storage', 'Depot North', 'Depot South'].map((w) => (
                <MenuItem key={w} value={w}>{w}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional order notes"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
            Product List
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select products, enter quantity, and choose the unit of measure.
          </Typography>

          <TextField
            fullWidth
            size="small"
            label="Search products"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            sx={{ mb: 2, maxWidth: 420 }}
          />

          <Box sx={{ border: `1px solid ${v.borderStrong}`, borderRadius: '12px', overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'color-mix(in srgb, var(--rs-surface) 60%, transparent)' }}>
                  <TableCell padding="checkbox" />
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="center" width={120}>Quantity</TableCell>
                  <TableCell align="center" width={150}>Unit of Measure</TableCell>
                  <TableCell align="right">Line Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography variant="body2" color="text.secondary">Loading products...</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography variant="body2" color="text.secondary">No products found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {filteredProducts.map((product) => {
                  const line = selected[product.id]
                  const qty = line?.quantity ?? 0
                  const isSelected = qty > 0
                  return (
                    <TableRow key={product.id} hover selected={isSelected}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => toggleProduct(product, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell align="right">{formatCurrency(product.price)}</TableCell>
                      <TableCell align="center">
                        <TextField
                          size="small"
                          type="number"
                          disabled={!isSelected}
                          value={isSelected ? qty : ''}
                          onChange={(e) => setQuantity(product.id, Number(e.target.value) || 1)}
                          slotProps={{
                            htmlInput: {
                              min: 1,
                              style: { textAlign: 'center' },
                            },
                          }}
                          sx={{ width: 88 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          select
                          size="small"
                          disabled={!isSelected}
                          value={isSelected ? (line?.uom ?? defaultUom(product)) : ''}
                          onChange={(e) => setUom(product.id, e.target.value)}
                          sx={{ minWidth: 130 }}
                        >
                          {UOM_OPTIONS.map((u) => (
                            <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell align="right">
                        {isSelected ? formatCurrency(product.price * qty) : '—'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: '12px',
            bgcolor: 'color-mix(in srgb, var(--rs-surface) 50%, transparent)',
            border: `1px solid ${v.borderStrong}`,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">Products Selected</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedItems.length}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Total Quantity</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{totalQuantity}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Total Purchase</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>{formatCurrency(totalPurchase)}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
          <Button onClick={() => navigate('/purchase/purchase-orders')}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            sx={primaryButtonSx}
            onClick={handleSubmit}
            disabled={createOrder.isPending}
          >
            {createOrder.isPending ? 'Creating...' : 'Create Purchase Order'}
          </Button>
        </Box>
      </Box>
    </PageShell>
  )
}
