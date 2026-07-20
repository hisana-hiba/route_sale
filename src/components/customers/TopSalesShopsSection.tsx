import { useQuery } from '@tanstack/react-query'
import { Box, Typography, Grid, Skeleton } from '@mui/material'
import { motion } from 'framer-motion'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import { DashboardKpiCard } from '@/components/dashboard/DashboardKpiCard'
import { DashboardPanel } from '@/components/dashboard/DashboardPanel'
import { dash } from '@/components/dashboard/dashboardTokens'
import { dashboardGridSpacing } from '@/components/ui/cardStyles'
import { api } from '@/api/client'
import { formatCurrency } from '@/utils/export'
import type { CustomerFilterParams } from '@/types/customer'

interface TopSalesShop {
  id: string
  name: string
  sales: number
  orders: number
  lastOrder: string
  growth: number
}

interface TopSalesShopsSectionProps {
  filters?: CustomerFilterParams
}

export function TopSalesShopsSection({ filters = {} }: TopSalesShopsSectionProps) {
  const { data: topShops, isLoading } = useQuery({
    queryKey: ['top-sales-shops', filters],
    queryFn: async () => (await api.get<{ topShops: TopSalesShop[] }>('/customers/top-sales-shops', { params: filters })).data.topShops,
  })

  return (
    <DashboardPanel title="Latest Top Sales Shops" sx={{ minHeight: 'auto', mb: dashboardGridSpacing }}>
      <Grid container spacing={dashboardGridSpacing}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Skeleton variant="rounded" height={140} sx={{ borderRadius: '20px' }} />
              </Grid>
            ))
          : topShops && topShops.length > 0
            ? topShops.slice(0, 4).map((shop, index) => (
                <Grid key={shop.id} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} style={{ height: '100%' }}>
                    <DashboardKpiCard
                      label={shop.name}
                      value={formatCurrency(shop.sales)}
                      trend={shop.growth}
                      trendLabel={`${shop.orders} orders · ${shop.lastOrder}`}
                      icon={<ShoppingBagOutlinedIcon />}
                      iconIndex={index}
                    />
                  </motion.div>
                </Grid>
              ))
            : (
                <Grid size={{ xs: 12 }}>
                  <Typography sx={{ color: dash.body.color, textAlign: 'center', py: 2, fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif' }}>
                    No shops match the current filters.
                  </Typography>
                </Grid>
              )}
      </Grid>
    </DashboardPanel>
  )
}
