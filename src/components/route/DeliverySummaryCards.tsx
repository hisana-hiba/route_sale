import { Grid } from '@mui/material'
import StraightenIcon from '@mui/icons-material/Straighten'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import PaymentsIcon from '@mui/icons-material/Payments'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import { DashboardKpiCard } from '@/components/dashboard/DashboardKpiCard'
import { formatDistance, formatDuration } from '@/utils/geo'
import { formatCurrency } from '@/utils/export'

interface DeliverySummaryCardsProps {
  distanceKm: number
  elapsedMins: number
  orders: number
  sales: number
  collections: number
  mini?: boolean
}

export function DeliverySummaryCards({ distanceKm, elapsedMins, orders, sales, collections, mini = true }: DeliverySummaryCardsProps) {
  const items = [
    { label: 'Distance Covered', value: formatDistance(distanceKm), icon: <StraightenIcon />, trend: 0, trendLabel: 'so far' },
    { label: 'Time on Route', value: formatDuration(elapsedMins), icon: <AccessTimeIcon />, trend: 0, trendLabel: 'elapsed' },
    { label: 'Orders Delivered', value: String(orders), icon: <Inventory2Icon />, trend: 0, trendLabel: 'stops completed' },
    { label: 'Sales Value', value: formatCurrency(sales), icon: <PaymentsIcon />, trend: 0, trendLabel: 'today' },
    { label: 'Collections', value: formatCurrency(collections), icon: <AccountBalanceWalletIcon />, trend: 0, trendLabel: 'cash + digital' },
  ]

  return (
    <Grid container spacing={1.25}>
      {items.map((item, idx) => (
        <Grid key={item.label} size={{ xs: 6, sm: 4, md: mini ? 2.4 : 4 }}>
          <DashboardKpiCard label={item.label} value={item.value} trend={item.trend} trendLabel={item.trendLabel} icon={item.icon} iconIndex={idx} mini={mini} />
        </Grid>
      ))}
    </Grid>
  )
}
