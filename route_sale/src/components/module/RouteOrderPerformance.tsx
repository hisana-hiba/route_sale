import { Box, Typography, alpha } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import { formatCurrency } from '@/utils/export'
import { colors } from '@/theme/palette'
import { gradientCardSx, cardPaddingCompact } from '@/components/ui/cardStyles'

interface OrderRow {
  orderNo?: string
  code?: string
  customer?: string
  salesman?: string
  amount?: number
  status?: string
}

export function RouteOrderPerformance({ orders }: { orders: OrderRow[] }) {
  const totalValue = orders.reduce((s, o) => s + (Number(o.amount) || 0), 0)
  const completed = orders.filter((o) => ['completed', 'delivered'].includes(String(o.status))).length
  const pending = orders.filter((o) => o.status === 'pending').length
  const inTransit = orders.filter((o) => o.status === 'in_transit').length

  const metrics = [
    { label: 'Total Orders', value: String(orders.length), icon: ShoppingCartOutlinedIcon, color: colors.primary },
    { label: 'Order Value', value: formatCurrency(totalValue), icon: TrendingUpIcon, color: colors.success },
    { label: 'Completed', value: String(completed), icon: CheckCircleOutlinedIcon, color: colors.success },
    { label: 'In Transit', value: String(inTransit), icon: PendingActionsIcon, color: colors.warning },
    { label: 'Pending', value: String(pending), icon: PendingActionsIcon, color: colors.textMuted },
  ]

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 1.5 }}>
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <Box key={m.label} sx={{ flex: '1 1 140px', minWidth: 140 }}>
              <Box sx={{ ...gradientCardSx('warm'), ...cardPaddingCompact }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative', zIndex: 1 }}>
                  <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: alpha(m.color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon sx={{ fontSize: 16, color: m.color }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary }}>{m.label}</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: colors.textPrimary }}>{m.value}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )
        })}
      </Box>

      <Box sx={{ ...gradientCardSx('cream'), ...cardPaddingCompact }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', mb: 1, position: 'relative', zIndex: 1 }}>
          Order-Based Performance
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, position: 'relative', zIndex: 1 }}>
          {orders.slice(0, 6).map((o) => {
            const pct = totalValue > 0 ? ((Number(o.amount) || 0) / totalValue) * 100 : 0
            return (
              <Box key={String(o.orderNo ?? o.code)} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, width: 90, flexShrink: 0 }}>{o.orderNo ?? o.code}</Typography>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }} noWrap>{o.customer}</Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary }}>{o.salesman}</Typography>
                </Box>
                <Box sx={{ width: 80, height: 4, borderRadius: 2, bgcolor: alpha(colors.primary, 0.08), overflow: 'hidden' }}>
                  <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: colors.secondary, borderRadius: 2 }} />
                </Box>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, width: 80, textAlign: 'right' }}>
                  {formatCurrency(Number(o.amount) || 0)}
                </Typography>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
