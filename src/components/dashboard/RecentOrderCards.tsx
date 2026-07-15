import { Box, Grid } from '@mui/material'
import { motion } from 'framer-motion'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import { DashboardKpiCard } from '@/components/dashboard/DashboardKpiCard'
import { DashboardPanel } from '@/components/dashboard/DashboardPanel'
import { formatCurrency } from '@/utils/export'
import { dashboardGridSpacing } from '@/components/ui/cardStyles'
import { statusPills } from '@/components/dashboard/dashboardTokens'

interface RecentOrder {
  orderNo: string
  customer: string
  amount: number
  status: string
  date?: string
  time?: string
}

const statusTrend: Record<string, number> = {
  delivered: 12.4,
  processing: 6.2,
  shipped: 8.1,
  pending: -3.5,
}

export function RecentOrderCards({ orders }: { orders: RecentOrder[] }) {
  return (
    <DashboardPanel title="Recent Orders" sx={{ minHeight: { xs: 'auto', md: 300 } }}>
      <Grid container spacing={dashboardGridSpacing}>
        {orders.slice(0, 4).map((order, i) => {
          const pill = statusPills[order.status as keyof typeof statusPills]
          return (
            <Grid key={order.orderNo} size={{ xs: 12, sm: 6 }}>
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} style={{ height: '100%' }}>
                <DashboardKpiCard
                  label={order.customer}
                  value={formatCurrency(order.amount)}
                  trend={statusTrend[order.status] ?? 4.2}
                  trendLabel={`#${order.orderNo} · ${pill?.label ?? order.status} · ${order.time ?? order.date ?? ''}`}
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
