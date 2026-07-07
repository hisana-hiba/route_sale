import { Box, Typography, Skeleton } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import Chart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { colors } from '@/theme/palette'
import { v } from '@/theme/cssVars'
import { cardPaddingCompact, gradientCardSx } from '@/components/ui/cardStyles'
import { formatCurrency, formatNumber } from '@/utils/export'

const iconBgPresets = [
  'color-mix(in srgb, var(--rs-primary) 12%, var(--rs-surface))',
  'color-mix(in srgb, var(--rs-secondary) 22%, var(--rs-surface))',
  'color-mix(in srgb, var(--rs-error) 12%, var(--rs-surface))',
  'color-mix(in srgb, var(--rs-success) 12%, var(--rs-surface))',
]

interface ModuleStatCardProps {
  label: string
  value: number | string
  format?: 'currency' | 'number' | 'percent'
  trend?: number
  trendLabel?: string
  icon?: React.ReactNode
  iconBg?: string
  iconIndex?: number
  loading?: boolean
  sparkData?: number[]
  variant?: 'warm' | 'gold' | 'rose' | 'sage'
}

const variants = ['warm', 'gold', 'rose', 'sage'] as const

export function ModuleStatCard({
  label, value, format, trend, trendLabel = 'vs last period',
  icon, iconBg, iconIndex = 0, loading, sparkData, variant,
}: ModuleStatCardProps) {
  const display = typeof value === 'string' ? value
    : format === 'currency' ? formatCurrency(value)
    : format === 'percent' ? `${value}%`
    : formatNumber(value)

  const sparkOptions: ApexOptions = {
    chart: { sparkline: { enabled: true }, animations: { enabled: true } },
    stroke: { curve: 'smooth', width: 1.5 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.02 } },
    colors: [trend !== undefined && trend < 0 ? colors.error : colors.success],
    tooltip: { enabled: false },
  }

  const cardVariant = variant ?? variants[Math.abs(label.length) % variants.length]
  const resolvedIconBg = iconBg ?? iconBgPresets[iconIndex % iconBgPresets.length]

  if (loading) {
    return (
      <Box sx={{ ...gradientCardSx(cardVariant), ...cardPaddingCompact }}>
        <Skeleton width="60%" height={12} />
        <Skeleton width="80%" height={24} sx={{ my: 0.75 }} />
        <Skeleton width="40%" height={10} />
      </Box>
    )
  }

  return (
    <Box sx={{ ...gradientCardSx('default'), ...cardPaddingCompact }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, position: 'relative', zIndex: 1 }}>
        {icon && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              flexShrink: 0,
              bgcolor: resolvedIconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: iconIndex === 1 ? v.secondary : v.primary,
              '& .MuiSvgIcon-root': { color: iconIndex === 1 ? v.secondary : v.primary },
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ color: v.textSecondary, fontWeight: 500, fontSize: '0.75rem', lineHeight: 1.2 }}>{label}</Typography>
          <Typography sx={{ fontWeight: 800, color: v.textPrimary, letterSpacing: '-0.02em', fontSize: '1.25rem', lineHeight: 1.3, my: 0.35 }}>{display}</Typography>
          {trend !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, flexWrap: 'wrap' }}>
              {trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 11, color: v.success }} /> : <TrendingDownIcon sx={{ fontSize: 11, color: v.error }} />}
              <Typography sx={{ color: trend >= 0 ? v.success : v.error, fontWeight: 600, fontSize: '0.65rem' }}>
                {trend >= 0 ? '+' : ''}{trend}%
              </Typography>
              <Typography sx={{ color: v.textMuted, fontSize: '0.65rem' }}>{trendLabel}</Typography>
            </Box>
          )}
        </Box>
        {sparkData && (
          <Box sx={{ width: 44, height: 32, flexShrink: 0, opacity: 0.9 }}>
            <Chart options={sparkOptions} series={[{ data: sparkData }]} type="area" height={32} width={44} />
          </Box>
        )}
      </Box>
    </Box>
  )
}
