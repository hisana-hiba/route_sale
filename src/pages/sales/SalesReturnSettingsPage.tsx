import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Switch,
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
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { formatCurrency } from '@/utils/export'
import { v, mix } from '@/theme/cssVars'

interface Shop {
  id: string
  name: string
  owner: string
}

interface Product {
  id: string
  name: string
  price: number
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

const emptyForm = {
  shopId: '',
  productId: '',
  amount: 0,
  enabled: true,
  variantSupport: false,
  attributeSupport: false,
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    bgcolor: v.surface,
    fontSize: '0.875rem',
  },
} as const

export function SalesReturnSettingsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { data: shops = [] } = useQuery({
    queryKey: ['shops'],
    queryFn: () => apiCall<Shop[]>('/shops'),
  })
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiCall<Product[]>('/products'),
  })
  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['return-pricing-rules'],
    queryFn: () => apiCall<PricingRule[]>('/return-pricing-rules'),
  })

  const shopMap = useMemo(() => Object.fromEntries(shops.map((s) => [s.id, s])), [shops])
  const productMap = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products])

  const saveRule = useMutation({
    mutationFn: () => {
      const body = {
        shopId: form.shopId,
        productId: form.productId,
        amount: form.amount,
        enabled: form.enabled,
        variantSupport: form.variantSupport,
        attributeSupport: form.attributeSupport,
      }
      if (editingId) {
        return apiCall(`/return-pricing-rules/${editingId}`, { method: 'PUT', body })
      }
      return apiCall('/return-pricing-rules', { method: 'POST', body })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['return-pricing-rules'] })
      setSuccess(editingId ? 'Rule updated.' : 'Rule created.')
      setEditingId(null)
      setForm(emptyForm)
      setError('')
    },
    onError: () => setError('Failed to save pricing rule.'),
  })

  const deleteRule = useMutation({
    mutationFn: (id: string) => apiCall(`/return-pricing-rules/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['return-pricing-rules'] })
      setSuccess('Rule deleted.')
    },
  })

  const handleSave = () => {
    setError('')
    setSuccess('')
    if (!form.shopId) {
      setError('Shop ID is required.')
      return
    }
    if (!form.productId) {
      setError('Product ID is required.')
      return
    }
    if (form.amount < 0) {
      setError('Product amount must be zero or greater.')
      return
    }
    saveRule.mutate()
  }

  const startEdit = (rule: PricingRule) => {
    setEditingId(rule.id)
    setForm({
      shopId: rule.shopId,
      productId: rule.productId,
      amount: rule.amount,
      enabled: rule.enabled,
      variantSupport: rule.variantSupport,
      attributeSupport: rule.attributeSupport,
    })
    setError('')
    setSuccess('')
  }

  return (
    <PageShell
      title="Sales Return Settings"
      subtitle="Configure shop-wise return product pricing, variants, and attributes"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Sales Returns', path: '/sales/sales-return' },
        { label: 'Settings' },
      ]}
      actions={
        <Button
          variant="outlined"
          onClick={() => navigate('/sales/sales-return')}
          sx={{ borderRadius: '12px', textTransform: 'none' }}
        >
          Back to Returns
        </Button>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Box sx={{ ...whiteCardSx, mb: 2.5 }}>
        <Typography sx={{ fontWeight: 700, mb: 2, color: v.textPrimary }}>
          {editingId ? 'Edit Pricing Rule' : 'Add Pricing Rule'}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="Shop ID"
              value={form.shopId}
              onChange={(e) => setForm((prev) => ({ ...prev, shopId: e.target.value }))}
              fullWidth
              size="small"
              sx={fieldSx}
            >
              <MenuItem value="">Select shop</MenuItem>
              {shops.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.id} — {s.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="Product ID"
              value={form.productId}
              onChange={(e) => {
                const product = products.find((p) => p.id === e.target.value)
                setForm((prev) => ({
                  ...prev,
                  productId: e.target.value,
                  amount: product && prev.amount === 0 ? product.price : prev.amount,
                }))
              }}
              fullWidth
              size="small"
              sx={fieldSx}
            >
              <MenuItem value="">Select product</MenuItem>
              {products.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.id} — {p.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              label="Product Amount"
              type="number"
              value={form.amount || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: Math.max(0, Number(e.target.value) || 0) }))}
              fullWidth
              size="small"
              sx={fieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.enabled}
                  onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
                />
              }
              label="Enabled"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.variantSupport}
                  onChange={(e) => setForm((prev) => ({ ...prev, variantSupport: e.target.checked }))}
                />
              }
              label="Variant Support"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.attributeSupport}
                  onChange={(e) => setForm((prev) => ({ ...prev, attributeSupport: e.target.checked }))}
                />
              }
              label="Attribute Support"
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            sx={primaryButtonSx}
            onClick={handleSave}
            disabled={saveRule.isPending}
          >
            {editingId ? 'Update Rule' : 'Add Rule'}
          </Button>
          {editingId && (
            <Button
              variant="outlined"
              onClick={() => {
                setEditingId(null)
                setForm(emptyForm)
              }}
              sx={{ borderRadius: '12px', textTransform: 'none' }}
            >
              Cancel Edit
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={whiteCardSx}>
        <Typography sx={{ fontWeight: 700, mb: 0.5, color: v.textPrimary }}>
          Shop-wise Pricing Configuration
        </Typography>
        <Typography variant="body2" sx={{ color: v.textSecondary, mb: 2 }}>
          Enabled rules override catalog prices when creating a return for the matching shop and product.
        </Typography>

        <Box sx={{ overflowX: 'auto', border: `1px solid ${v.border}`, borderRadius: '12px' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: mix.surface(8) }}>
                {['Shop ID', 'Shop', 'Product ID', 'Product', 'Amount', 'Enabled', 'Variant', 'Attribute', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', color: v.textSecondary, whiteSpace: 'nowrap' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography variant="body2" color="text.secondary">Loading rules…</Typography>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && rules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography variant="body2" color="text.secondary">No pricing rules configured.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {rules.map((rule) => (
                <TableRow key={rule.id} hover>
                  <TableCell>{rule.shopId}</TableCell>
                  <TableCell>{shopMap[rule.shopId]?.name ?? '—'}</TableCell>
                  <TableCell>{rule.productId}</TableCell>
                  <TableCell>{productMap[rule.productId]?.name ?? '—'}</TableCell>
                  <TableCell>{formatCurrency(rule.amount)}</TableCell>
                  <TableCell>
                    <Switch
                      size="small"
                      checked={rule.enabled}
                      onChange={(e) => {
                        apiCall(`/return-pricing-rules/${rule.id}`, {
                          method: 'PUT',
                          body: { ...rule, enabled: e.target.checked },
                        }).then(() => queryClient.invalidateQueries({ queryKey: ['return-pricing-rules'] }))
                      }}
                    />
                  </TableCell>
                  <TableCell>{rule.variantSupport ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{rule.attributeSupport ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => startEdit(rule)} sx={{ textTransform: 'none' }}>
                      Edit
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteRule.mutate(rule.id)}
                      aria-label="Delete rule"
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
    </PageShell>
  )
}
