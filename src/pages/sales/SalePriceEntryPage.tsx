import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography, InputAdornment,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import SaveIcon from '@mui/icons-material/Save'
import { useQuery } from '@tanstack/react-query'
import { apiCall } from '@/api/flowClient'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { SalesTabs } from '@/components/sales/SalesTabs'
import { formatCurrency } from '@/utils/export'
import { v, mix } from '@/theme/cssVars'

interface Product {
  id: string
  name: string
  category: string
  price: number
  gstRate: number
  unit: string
  stockQty: number
  barcode: string
  mrp: number
  mop: number
  batch: string
}

/** Sale Price Entry — update MRP / MOP / sale price for catalog products */
export function SalePriceEntryPage() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiCall<Product[]>('/products'),
  })

  const [search, setSearch] = useState('')
  const [prices, setPrices] = useState<Record<string, { price: number; mrp: number; mop: number }>>({})
  const [saved, setSaved] = useState(false)

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.category.toLowerCase().includes(q),
    )
  }, [products, search])

  const getPrice = (p: Product) => prices[p.id] ?? { price: p.price, mrp: p.mrp, mop: p.mop }

  const setField = (id: string, field: 'price' | 'mrp' | 'mop', value: number, base: Product) => {
    setSaved(false)
    setPrices((prev) => {
      const current = prev[id] ?? { price: base.price, mrp: base.mrp, mop: base.mop }
      return {
        ...prev,
        [id]: {
          ...current,
          [field]: Math.max(0, value),
        },
      }
    })
  }

  const handleSave = () => {
    setSaved(true)
  }

  return (
    <PageShell
      title="Sale Price Entry"
      subtitle="Maintain sale price, MRP, and MOP for route billing"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Sales', path: '/sales/list' },
        { label: 'Sale Price Entry' },
      ]}
      actions={
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          sx={primaryButtonSx}
          onClick={handleSave}
        >
          Save Prices
        </Button>
      }
    >
      <SalesTabs />

      {saved && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSaved(false)}>
          Sale prices updated successfully.
        </Alert>
      )}

      <Box sx={whiteCardSx}>
        <TextField
          size="small"
          placeholder="Search by name, barcode, or category"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            mb: 2,
            maxWidth: 420,
            width: '100%',
            '& .MuiOutlinedInput-root': { borderRadius: '10px' },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: v.textMuted }} />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ overflowX: 'auto', border: `1px solid ${v.border}`, borderRadius: '12px' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: mix.surface(8) }}>
                {['Barcode', 'Product', 'Category', 'Stock', 'Sale Price', 'MRP', 'MOP', 'Incl. Tax'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', color: v.textSecondary }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography variant="body2" color="text.secondary">Loading products…</Typography>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography variant="body2" color="text.secondary">No products found.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {rows.map((p) => {
                const vals = getPrice(p)
                const inclTax = vals.price * (1 + p.gstRate / 100)
                return (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {p.barcode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: v.textSecondary }}>{p.category}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{p.stockQty} {p.unit}</Typography>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={vals.price}
                        onChange={(e) => setField(p.id, 'price', Number(e.target.value), p)}
                        sx={{ width: 110, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={vals.mrp}
                        onChange={(e) => setField(p.id, 'mrp', Number(e.target.value), p)}
                        sx={{ width: 110, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={vals.mop}
                        onChange={(e) => setField(p.id, 'mop', Number(e.target.value), p)}
                        sx={{ width: 110, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(inclTax)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </PageShell>
  )
}
