import { Box, Typography } from '@mui/material'
import { formatCurrency, formatNumber } from '@/utils/export'
import { dash, overviewIconThemes } from '@/components/dashboard/dashboardTokens'
import { cardPadding, gradientCardSx } from '@/components/ui/cardStyles'

interface BusinessMetric {
  label: string
  value: number | string
  trend: number
  format?: 'currency' | 'number'
  icon: React.ElementType
}

export function BusinessOverviewStrip({ metrics }: { metrics: BusinessMetric[] }) {
  return (
    <Box sx={{ ...gradientCardSx('default'), ...cardPadding }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 2 }}>
        {metrics.map((m, i) => {
          const Icon = m.icon
          const iconTheme = overviewIconThemes[i % overviewIconThemes.length]
          const display = typeof m.value === 'string' ? m.value
            : m.format === 'currency' ? formatCurrency(m.value)
            : formatNumber(m.value)
          const isUp = m.trend >= 0
          return (
            <Box
              key={m.label}
              sx={{
                p: 2,
                borderRadius: '12px',
                bgcolor: dash.bg,
                border: dash.cardBorder,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: iconTheme.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ fontSize: 18, color: iconTheme.color }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ color: dash.label.color, fontWeight: dash.label.weight, fontSize: '11px', lineHeight: 1.3, mb: 0.5 }}>
                    {m.label}
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '18px', color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.2, mb: 0.35 }}>
                    {display}
                  </Typography>
                  <Typography sx={{ fontSize: '11px', fontWeight: 600, color: isUp ? dash.trendUp : dash.trendDown }}>
                    {isUp ? '+' : ''}{m.trend}% <Box component="span" sx={{ color: dash.trendMuted, fontWeight: 400 }}>vs last month</Box>
                  </Typography>
                </Box>
              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
