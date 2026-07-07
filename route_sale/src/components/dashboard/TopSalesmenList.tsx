import { Box, Typography, Avatar } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { formatCurrency } from '@/utils/export'
import { v } from '@/theme/cssVars'
import { DashboardPanel } from '@/components/dashboard/DashboardPanel'

interface Salesman {
  name: string
  sales: number
  target: number
  growth?: number
  avatar?: string
}

export function TopSalesmenList({ salesmen }: { salesmen: Salesman[] }) {
  return (
    <DashboardPanel title="Top Salesmen" variant="cream">
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {salesmen.map((s, i) => (
          <Box
            key={s.name}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 1,
              flex: 1,
              borderBottom: i < salesmen.length - 1 ? `1px solid ${v.border}` : 'none',
            }}
          >
            <Typography variant="caption" sx={{ width: 14, color: v.textMuted, fontWeight: 700, fontSize: '0.7rem' }}>
              {i + 1}
            </Typography>
            <Avatar sx={{ width: 40, height: 40, bgcolor: i % 2 === 0 ? v.primary : v.secondary, fontSize: '0.7rem', fontWeight: 700 }}>
              {s.name.split(' ').map((n) => n[0]).join('')}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }} noWrap>
                {s.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {formatCurrency(s.sales)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
              <TrendingUpIcon sx={{ fontSize: 13, color: v.success }} />
              <Typography variant="caption" sx={{ color: v.success, fontWeight: 700, fontSize: '0.7rem' }}>
                +{s.growth ?? Math.round((s.sales / s.target - 1) * 100)}%
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </DashboardPanel>
  )
}
