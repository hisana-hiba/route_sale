import { Grid } from '@mui/material'
import { motion } from 'framer-motion'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import { DashboardKpiCard } from '@/components/dashboard/DashboardKpiCard'
import { DashboardPanel } from '@/components/dashboard/DashboardPanel'
import { formatCurrency } from '@/utils/export'
import { dashboardGridSpacing } from '@/components/ui/cardStyles'
import { statusPills } from '@/components/dashboard/dashboardTokens'

interface OrderRow {
  id?: string | number
  code?: string
  customer?: string
  amount?: number
  status?: string
  date?: string
}

const statusTrend: Record<string, number> = {
  delivered: 12.4,
  completed: 12.4,
  approved: 10.2,
  processing: 6.2,
  pending: -3.5,
  cancelled: -8.1,
}

export function OrderRecordCards({ orders }: { orders: OrderRow[] }) {
  return (
    <DashboardPanel title="Recent Orders" sx={{ minHeight: 'auto', mb: dashboardGridSpacing }}>
      <Grid container spacing={dashboardGridSpacing}>
        {orders.slice(0, 4).map((order, i) => {
          const pill = statusPills[String(order.status) as keyof typeof statusPills]
          return (
            <Grid key={String(order.id ?? order.code ?? i)} size={{ xs: 12, sm: 6, lg: 3 }}>
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} style={{ height: '100%' }}>
                <DashboardKpiCard
                  label={String(order.customer ?? '—')}
                  value={formatCurrency(Number(order.amount) || 0)}
                  trend={statusTrend[String(order.status)] ?? 4.2}
                  trendLabel={`#${String(order.code ?? '')} · ${pill?.label ?? order.status ?? ''} · ${order.date ?? ''}`}
                  icon={<ShoppingBagOutlinedIcon />}
                  iconIndex={i}
                />
              </motion.div>
            </Grid>
          )
        })}
      </Grid>
    </DashboardPanel>
  )
}
