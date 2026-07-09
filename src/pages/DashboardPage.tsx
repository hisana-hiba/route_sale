import { useQuery } from '@tanstack/react-query'
import { Box, Typography, Grid, Skeleton } from '@mui/material'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import { motion } from 'framer-motion'
import { DashboardKpiCard } from '@/components/dashboard/DashboardKpiCard'
import { QuickActionsPanel } from '@/components/dashboard/QuickActionsPanel'
import { ChartCard } from '@/components/dashboard/ChartCard'
import { RoutePerformanceWidget } from '@/components/dashboard/RoutePerformanceWidget'
import { RecentOrdersTable } from '@/components/dashboard/RecentOrdersTable'
import { BusinessOverviewStrip } from '@/components/dashboard/BusinessOverviewStrip'
import { TopSellingProducts } from '@/components/dashboard/TopSellingProducts'
import { NotificationsFeed } from '@/components/dashboard/NotificationsFeed'
import { api } from '@/api/client'
import { formatCurrency } from '@/utils/export'
import type { DashboardData } from '@/types/module'
import { dash } from '@/components/dashboard/dashboardTokens'
import { dashboardGridSpacing } from '@/components/ui/cardStyles'
import InventoryIcon from '@mui/icons-material/Inventory'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PeopleIcon from '@mui/icons-material/People'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import PaymentsIcon from '@mui/icons-material/Payments'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get<DashboardData>('/dashboard')).data,
  })

  if (isLoading || !data) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 1.5 }} />
        <Grid container spacing={dashboardGridSpacing}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, md: i < 4 ? 3 : 6 }}><Skeleton variant="rounded" height={140} sx={{ borderRadius: '16px' }} /></Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  const { stats } = data

  const kpis = [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.revenueOverview ?? stats.monthlySales),
      trend: 18.6,
      trendLabel: 'vs last month',
      icon: <CurrencyRupeeIcon />,
      iconIndex: 0,
    },
    {
      label: 'Total Orders',
      value: (stats.orderSummary ?? 1892).toLocaleString('en-IN'),
      trend: 12.4,
      trendLabel: 'vs last month',
      icon: <ShoppingBagOutlinedIcon />,
      iconIndex: 1,
    },
    {
      label: 'Pending Orders',
      value: (stats.pendingOrders ?? 124).toLocaleString('en-IN'),
      trend: -6.3,
      trendLabel: 'vs last month',
      icon: <ScheduleOutlinedIcon />,
      iconIndex: 2,
    },
    {
      label: 'Total Customers',
      value: stats.totalCustomers.toLocaleString('en-IN'),
      trend: 15.8,
      trendLabel: 'vs last month',
      icon: <PeopleOutlinedIcon />,
      iconIndex: 3,
    },
  ]

  const businessMetrics = [
    { label: 'Total Products', value: stats.totalProducts, trend: 4.2, icon: InventoryIcon },
    { label: 'Total Collections', value: stats.collectionSummary ?? 28, trend: 8.5, icon: AccountBalanceWalletIcon },
    { label: 'Total Customers', value: stats.totalCustomers, trend: 15.8, icon: PeopleIcon },
    { label: "Today's Orders", value: stats.deliveredOrders + stats.pendingOrders, trend: 6.1, icon: ReceiptLongIcon },
    { label: 'Pending Amount', value: stats.outstandingAmount, trend: -3.2, format: 'currency' as const, icon: PaymentsIcon },
  ]

  const gridSx = { mb: dashboardGridSpacing }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: dash.greeting.weight, color: dash.greeting.color, letterSpacing: '-0.02em', fontSize: dash.greeting.size, lineHeight: 1.2, fontFamily: 'Inter, system-ui, sans-serif' }}>
          {getGreeting()}, Admin! 👋
        </Typography>
        <Typography sx={{ color: dash.greetingSub.color, mt: 0.75, fontSize: dash.greetingSub.size, fontWeight: dash.greetingSub.weight }}>
          Here&apos;s what&apos;s happening with your store today.
        </Typography>
      </Box>

      <Grid container spacing={dashboardGridSpacing} sx={gridSx}>
        {kpis.map((kpi, i) => (
          <Grid key={kpi.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <DashboardKpiCard {...kpi} />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mb: dashboardGridSpacing }}>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <BusinessOverviewStrip metrics={businessMetrics} />
        </motion.div>
      </Box>

      <Box sx={{ mb: dashboardGridSpacing }}>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <QuickActionsPanel />
        </motion.div>
      </Box>

      <Grid container spacing={dashboardGridSpacing} sx={gridSx}>
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
          <ChartCard title="Sales Overview" data={data.dailySales} type="area" height={200} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
          <ChartCard title="Collection vs Sales" data={data.salesVsCollection} type="bar" height={200} yAxisFormat="L" />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
          <RoutePerformanceWidget
            totalRoutes={stats.activeRoutes}
            completed={18}
            inProgress={4}
            pending={2}
            completionPercent={75}
          />
        </Grid>
      </Grid>

      <Grid container spacing={dashboardGridSpacing}>
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
          <TopSellingProducts products={data.bestSellingProducts} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
          <RecentOrdersTable orders={data.recentOrders} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
          <NotificationsFeed notifications={data.notifications} />
        </Grid>
      </Grid>
    </Box>
  )
}
