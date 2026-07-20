import { useMemo, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
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
import DeleteIcon from '@mui/icons-material/Delete'
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
  const [selectedProducts, setSelectedProducts] = useState<TransferProduct[]>([])
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [error, setError] = useState('')

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['transfer-products'],
    queryFn: () => apiCall<TransferProduct[]>('/products'),
  })

  const createTransfer = useMutation({
    mutationFn: () => {
      const lineItems = selectedProducts.map((p) => ({
        productId: p.id,
        name: p.name,
        category: p.category,
        unit: p.unit,
        quantity: quantities[p.id] ?? 1,
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

  const totalQuantity = useMemo(
    () => selectedProducts.reduce((sum, p) => sum + (quantities[p.id] ?? 1), 0),
    [selectedProducts, quantities],
  )

  const handleProductsChange = (_: unknown, value: TransferProduct[]) => {
    setSelectedProducts(value)
    setQuantities((prev) => {
      const next: Record<string, number> = {}
      for (const product of value) {
        next[product.id] = prev[product.id] ?? 1
      }
      return next
    })
  }

  const setQuantity = (productId: string, quantity: number, max: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.min(max, Math.max(1, quantity)),
    }))
  }

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId))
    setQuantities((prev) => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
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
    if (selectedProducts.length === 0) {
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
              slotProps={{ inputLabel: { shrink: true } }}
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

          <Grid size={{ xs: 12 }}>
            <Autocomplete
              multiple
              options={products}
              loading={isLoading}
              value={selectedProducts}
              onChange={handleProductsChange}
              inputValue={productSearch}
              onInputChange={(_, value) => setProductSearch(value)}
              getOptionLabel={(option) => option.name}
              filterOptions={(options, { inputValue }) => {
                const q = inputValue.trim().toLowerCase()
                if (!q) return options
                return options.filter(
                  (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q),
                )
              }}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props
                return (
                  <li key={key} {...optionProps}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', py: 0.25 }}>
                      <Typography variant="body2">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.category} · {option.stockQty} {option.unit} available
                      </Typography>
                    </Box>
                  </li>
                )
              }}
              renderValue={(value, getItemProps) =>
                value.map((option, index) => {
                  const { key, ...itemProps } = getItemProps({ index })
                  return (
                    <Chip
                      key={key}
                      {...itemProps}
                      label={option.name}
                      size="small"
                    />
                  )
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Product Selection"
                  placeholder={selectedProducts.length ? 'Add more products…' : 'Search and select products'}
                  helperText="Search by name or category, then select one or more products"
                />
              )}
            />
          </Grid>
        </Grid>

        {selectedProducts.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Transfer Quantities
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Set how many units to transfer for each selected product.
            </Typography>

            <Box sx={{ border: `1px solid ${v.borderStrong}`, borderRadius: '12px', overflow: 'hidden' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'color-mix(in srgb, var(--rs-surface) 60%, transparent)' }}>
                    <TableCell>Product</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Available</TableCell>
                    <TableCell align="center" width={120}>Transfer Qty</TableCell>
                    <TableCell align="center" width={56} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedProducts.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell align="right">{product.stockQty} {product.unit}</TableCell>
                      <TableCell align="center">
                        <TextField
                          size="small"
                          type="number"
                          value={quantities[product.id] ?? 1}
                          onChange={(e) =>
                            setQuantity(product.id, Number(e.target.value) || 1, product.stockQty)
                          }
                          slotProps={{
                            htmlInput: {
                              min: 1,
                              max: product.stockQty,
                              style: { textAlign: 'center' },
                            },
                          }}
                          sx={{ width: 88 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          aria-label={`Remove ${product.name}`}
                          onClick={() => removeProduct(product.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>
        )}

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
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedProducts.length}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Total Quantity</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{totalQuantity}</Typography>
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
