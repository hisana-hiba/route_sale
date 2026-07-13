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
import { v } from '@/theme/cssVars'

const WAREHOUSES = [
  'Main Warehouse',
  'Cold Storage',
  'Depot North',
  'Depot South',
]

interface TransferProduct {
  id: string
  name: string
  category: string
  stockQty: number
  unit: string
}

export function CreateStockTransferPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [sourceWarehouse, setSourceWarehouse] = useState('')
  const [destinationWarehouse, setDestinationWarehouse] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [requestedBy, setRequestedBy] = useState('')
  const [notes, setNotes] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [selected, setSelected] = useState<Record<string, number>>({})
  const [error, setError] = useState('')

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['transfer-products'],
    queryFn: () => apiCall<TransferProduct[]>('/products'),
  })

  const createTransfer = useMutation({
    mutationFn: () => {
      const lineItems = products
        .filter((p) => (selected[p.id] ?? 0) > 0)
        .map((p) => ({
          productId: p.id,
          name: p.name,
          category: p.category,
          unit: p.unit,
          quantity: selected[p.id],
        }))

      return createItem('/stock-management-stock-transfer', {
        sourceWarehouse,
        destinationWarehouse,
        date,
        requestedBy: requestedBy || 'Admin User',
        notes,
        products: lineItems,
        productCount: lineItems.length,
        totalQuantity: lineItems.reduce((sum, item) => sum + item.quantity, 0),
        status: 'pending',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', 'stock-management-stock-transfer'] })
      navigate('/stock-management/stock-transfer')
    },
    onError: () => setError('Failed to create transfer. Please try again.'),
  })

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
    )
  }, [products, productSearch])

  const selectedItems = products.filter((p) => (selected[p.id] ?? 0) > 0)
  const totalQuantity = selectedItems.reduce((sum, p) => sum + (selected[p.id] ?? 0), 0)

  const toggleProduct = (productId: string, checked: boolean) => {
    setSelected((prev) => {
      const next = { ...prev }
      if (checked) next[productId] = next[productId] || 1
      else delete next[productId]
      return next
    })
  }

  const setQuantity = (productId: string, quantity: number) => {
    setSelected((prev) => ({
      ...prev,
      [productId]: Math.max(1, quantity),
    }))
  }

  const handleSubmit = () => {
    setError('')
    if (!sourceWarehouse || !destinationWarehouse) {
      setError('Please select both source and destination warehouses.')
      return
    }
    if (sourceWarehouse === destinationWarehouse) {
      setError('Source and destination warehouses must be different.')
      return
    }
    if (selectedItems.length === 0) {
      setError('Please select at least one product for the transfer.')
      return
    }
    createTransfer.mutate()
  }

  return (
    <PageShell
      title="Create Stock Transfer"
      subtitle="Transfer stock between warehouses and branches"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Stock Transfer', path: '/stock-management/stock-transfer' },
        { label: 'Create Transfer' },
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
              label="Source Warehouse"
              value={sourceWarehouse}
              onChange={(e) => setSourceWarehouse(e.target.value)}
            >
              {WAREHOUSES.map((w) => (
                <MenuItem key={w} value={w}>{w}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              required
              label="Destination Warehouse"
              value={destinationWarehouse}
              onChange={(e) => setDestinationWarehouse(e.target.value)}
            >
              {WAREHOUSES.map((w) => (
                <MenuItem key={w} value={w}>{w}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              required
              type="date"
              label="Transfer Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Requested By"
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
              placeholder="Admin User"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Transfer Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            Product Selection
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select one or more products and specify the quantity to transfer.
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
                  <TableCell align="right">Available</TableCell>
                  <TableCell align="center" width={120}>Transfer Qty</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" color="text.secondary">Loading products...</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" color="text.secondary">No products found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {filteredProducts.map((product) => {
                  const isSelected = (selected[product.id] ?? 0) > 0
                  return (
                    <TableRow key={product.id} hover selected={isSelected}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => toggleProduct(product.id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell align="right">{product.stockQty} {product.unit}</TableCell>
                      <TableCell align="center">
                        <TextField
                          size="small"
                          type="number"
                          disabled={!isSelected}
                          value={isSelected ? selected[product.id] : ''}
                          onChange={(e) => setQuantity(product.id, Number(e.target.value) || 1)}
                          inputProps={{ min: 1, style: { textAlign: 'center' } }}
                          sx={{ width: 88 }}
                        />
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
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">Selected Products</Typography>
            <Typography variant="h6" fontWeight={700}>{selectedItems.length}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Total Quantity</Typography>
            <Typography variant="h6" fontWeight={700}>{totalQuantity}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
          <Button onClick={() => navigate('/stock-management/stock-transfer')}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            sx={primaryButtonSx}
            onClick={handleSubmit}
            disabled={createTransfer.isPending}
          >
            {createTransfer.isPending ? 'Creating...' : 'Create Transfer'}
          </Button>
        </Box>
      </Box>
    </PageShell>
  )
}
