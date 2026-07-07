import { useState } from 'react'
import {
  Box, Typography, TextField, MenuItem, Button, Grid, Alert, alpha,
} from '@mui/material'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import { v } from '@/theme/cssVars'
import { gradientCardSx, cardPadding } from '@/components/ui/cardStyles'
import { primaryButtonSx } from '@/components/ui/PageShell'

const warehouses = ['Main Warehouse', 'Cold Storage', 'Depot North', 'Depot South']
const stockRooms = ['Room A', 'Room B', 'Room C', 'Room D']
const products = ['Mineral Water 1L', 'Potato Chips 50g', 'Milk 500ml', 'Rice 5kg', 'Cooking Oil 1L']

export function WarehouseTransferPanel() {
  const [fromWarehouse, setFromWarehouse] = useState(warehouses[0])
  const [toWarehouse, setToWarehouse] = useState(warehouses[1])
  const [fromRoom, setFromRoom] = useState(stockRooms[0])
  const [toRoom, setToRoom] = useState(stockRooms[1])
  const [product, setProduct] = useState(products[0])
  const [quantity, setQuantity] = useState('50')
  const [message, setMessage] = useState('')

  const handleTransfer = () => {
    setMessage(`Transferred ${quantity} units of ${product} from ${fromWarehouse} (${fromRoom}) to ${toWarehouse} (${toRoom}).`)
  }

  const handleDistribute = () => {
    const qty = Math.floor(Number(quantity) / stockRooms.length) || 0
    setMessage(`Distributed ${quantity} units of ${product} across ${stockRooms.length} stock rooms in ${toWarehouse} (~${qty} per room).`)
  }

  return (
    <Box sx={{ ...gradientCardSx('gold'), ...cardPadding, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, position: 'relative', zIndex: 1 }}>
        <SwapHorizIcon sx={{ color: v.primary }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Stock Room Transfer</Typography>
      </Box>

      <Grid container spacing={1.25} sx={{ position: 'relative', zIndex: 1 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField select fullWidth size="small" label="From Warehouse" value={fromWarehouse} onChange={(e) => setFromWarehouse(e.target.value)}>
            {warehouses.map((w) => <MenuItem key={w} value={w}>{w}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField select fullWidth size="small" label="From Stock Room" value={fromRoom} onChange={(e) => setFromRoom(e.target.value)}>
            {stockRooms.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField select fullWidth size="small" label="To Warehouse" value={toWarehouse} onChange={(e) => setToWarehouse(e.target.value)}>
            {warehouses.map((w) => <MenuItem key={w} value={w}>{w}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField select fullWidth size="small" label="To Stock Room" value={toRoom} onChange={(e) => setToRoom(e.target.value)}>
            {stockRooms.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField select fullWidth size="small" label="Product" value={product} onChange={(e) => setProduct(e.target.value)}>
            {products.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField fullWidth size="small" label="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 6 }} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button variant="contained" color="primary" onClick={handleTransfer} sx={{ ...primaryButtonSx, flex: 1 }}>Transfer Stock</Button>
          <Button
            variant="outlined"
            onClick={handleDistribute}
            sx={{ flex: 1, borderRadius: '12px', textTransform: 'none', fontWeight: 600, borderColor: v.border }}
          >
            Distribute
          </Button>
        </Grid>
      </Grid>

      {message && (
        <Alert severity="success" sx={{ mt: 1.5, py: 0, fontSize: '0.75rem', position: 'relative', zIndex: 1 }}>
          {message}
        </Alert>
      )}
    </Box>
  )
}
