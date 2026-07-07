import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { StatusChip } from '@/components/ui/StatusChip'
import { formatCurrency } from '@/utils/export'
import { dash } from '@/components/dashboard/dashboardTokens'
import { DashboardPanel } from '@/components/dashboard/DashboardPanel'

interface RecentOrder {
  orderNo: string
  customer: string
  amount: number
  status: string
  date?: string
  time?: string
}

export function RecentOrdersTable({ orders }: { orders: RecentOrder[] }) {
  const headCellSx = {
    fontWeight: 600,
    fontSize: '11px',
    color: dash.trendMuted,
    border: 'none',
    py: 0.75,
    pb: 1.25,
    whiteSpace: 'nowrap',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  }

  const bodyCellSx = {
    fontSize: '13px',
    borderColor: 'rgba(0,0,0,0.06)',
    py: 1.25,
    whiteSpace: 'nowrap',
    color: '#374151',
  }

  return (
    <DashboardPanel title="Recent Orders">
      <Box sx={{ overflowX: 'auto', flex: 1 }}>
        <Table size="small" sx={{ minWidth: { xs: 480, md: 'auto' } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={headCellSx}>Order ID</TableCell>
              <TableCell sx={{ ...headCellSx, display: { xs: 'none', sm: 'table-cell' } }}>Customer</TableCell>
              <TableCell sx={headCellSx}>Amount</TableCell>
              <TableCell sx={headCellSx}>Status</TableCell>
              <TableCell sx={{ ...headCellSx, display: { xs: 'none', md: 'table-cell' } }}>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.orderNo} sx={{ '&:last-child td': { border: 0 } }}>
                <TableCell sx={{ ...bodyCellSx, fontWeight: 600, color: '#111827' }}>#{o.orderNo}</TableCell>
                <TableCell sx={{ ...bodyCellSx, display: { xs: 'none', sm: 'table-cell' } }}>{o.customer}</TableCell>
                <TableCell sx={{ ...bodyCellSx, fontWeight: 600 }}>{formatCurrency(o.amount)}</TableCell>
                <TableCell sx={bodyCellSx}><StatusChip status={o.status} /></TableCell>
                <TableCell sx={{ ...bodyCellSx, color: dash.body.color, display: { xs: 'none', md: 'table-cell' } }}>
                  {o.time ?? o.date}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </DashboardPanel>
  )
}
