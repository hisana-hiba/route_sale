import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import { Box, Typography, Grid, Skeleton } from '@mui/material'
import { motion } from 'framer-motion'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import { AddCustomerForm } from '@/components/flows/AddCustomerForm'
import { DashboardPanel } from '@/components/dashboard/DashboardPanel'
import { DashboardKpiCard } from '@/components/dashboard/DashboardKpiCard'
import { dash } from '@/components/dashboard/dashboardTokens'
import { dashboardGridSpacing } from '@/components/ui/cardStyles'
import { api } from '@/api/client'
import { formatCurrency } from '@/utils/export'
import type { ModuleListResponse } from '@/types/module'

interface TopSalesShop {
  id: string
  name: string
  sales: number
  orders: number
  lastOrder: string
  growth: number
  category?: string
}

export function CustomersPage() {
  const location = useLocation()
  const queryClient = useQueryClient()
  const formRef = useRef<HTMLDivElement>(null)

  const { data: customerData, isLoading: customersLoading } = useQuery({
    queryKey: ['customers-customer-list', 'stats'],
    queryFn: async () => (await api.get<ModuleListResponse>('/customers-customer-list', { params: { pageSize: 1 } })).data,
  })

  const { data: topShops, isLoading: shopsLoading } = useQuery({
    queryKey: ['top-sales-shops'],
    queryFn: async () => (await api.get<{ topShops: TopSalesShop[] }>('/customers/top-sales-shops')).data.topShops,
  })

  useEffect(() => {
    if ((location.state as { openCreate?: boolean })?.openCreate) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.state])

  const stats = customerData?.stats ?? {}
  const customerKpis = [
    {
      label: 'Total Customers',
      value: customersLoading ? '—' : Number(stats.total ?? 0).toLocaleString('en-IN'),
      trend: 12.5,
      trendLabel: 'vs last month',
      icon: <PeopleOutlinedIcon />,
      iconIndex: 3,
    },
    {
      label: 'Total Outstanding',
      value: customersLoading ? '—' : formatCurrency(Number(stats.totalOutstanding ?? 0)),
      trend: -3.2,
      trendLabel: 'vs last month',
      icon: <AccountBalanceWalletIcon />,
      iconIndex: 0,
    },
    {
      label: 'Total Credit Limit',
      value: customersLoading ? '—' : formatCurrency(Number(stats.totalCredit ?? 0)),
      trend: 8.5,
      trendLabel: 'active customers',
      icon: <CreditCardOutlinedIcon />,
      iconIndex: 1,
    },
    {
      label: 'Overdue Accounts',
      value: customersLoading ? '—' : Number(stats.overdue ?? 0).toLocaleString('en-IN'),
      trend: -6.3,
      trendLabel: 'vs last month',
      icon: <WarningAmberOutlinedIcon />,
      iconIndex: 2,
    },
  ]

  const handleCustomerAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['customers-customer-list'] })
    queryClient.invalidateQueries({ queryKey: ['top-sales-shops'] })
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: dash.greeting.weight, color: dash.greeting.color, letterSpacing: '-0.02em', fontSize: dash.greeting.size, lineHeight: 1.2, fontFamily: 'Inter, system-ui, sans-serif' }}>
          Customer Management
        </Typography>
        <Typography sx={{ color: dash.greetingSub.color, mt: 0.75, fontSize: dash.greetingSub.size, fontWeight: dash.greetingSub.weight }}>
          Add new customers and track your top-performing shops.
        </Typography>
      </Box>

      {/* Row 1: Add Customer Form + Customer KPI cards */}
      <Grid container spacing={dashboardGridSpacing} sx={{ mb: dashboardGridSpacing }}>
        <Grid size={{ xs: 12, lg: 5 }} ref={formRef}>
          <DashboardPanel title="Add New Customer" sx={{ minHeight: { xs: 'auto', md: 480 } }}>
            <AddCustomerForm onSuccess={handleCustomerAdded} />
          </DashboardPanel>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Grid container spacing={dashboardGridSpacing} sx={{ height: '100%' }}>
            {customersLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6 }}>
                    <Skeleton variant="rounded" height={140} sx={{ borderRadius: '20px' }} />
                  </Grid>
                ))
              : customerKpis.map((kpi, i) => (
                  <Grid key={kpi.label} size={{ xs: 12, sm: 6 }}>
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} style={{ height: '100%' }}>
                      <DashboardKpiCard {...kpi} />
                    </motion.div>
                  </Grid>
                ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Row 2: Top 4 Sales Shops */}
      <Box>
        <Typography sx={{ fontWeight: dash.title.weight, fontSize: dash.title.size, color: dash.title.color, mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'Inter, system-ui, sans-serif' }}>
          <StorefrontOutlinedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          Top 4 Sales Shops
        </Typography>

        <Grid container spacing={dashboardGridSpacing}>
          {shopsLoading
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
                        icon={<StorefrontOutlinedIcon />}
                        iconIndex={index}
                      />
                    </motion.div>
                  </Grid>
                ))
              : (
                  <Grid size={{ xs: 12 }}>
                    <DashboardPanel title="No sales data" sx={{ minHeight: 'auto' }}>
                      <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
                        No sales data available for shops yet.
                      </Typography>
                    </DashboardPanel>
                  </Grid>
                )}
        </Grid>
      </Box>
    </Box>
  )
}
