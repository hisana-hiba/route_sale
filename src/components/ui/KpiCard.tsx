import { Box, Typography, Skeleton, alpha } from '@mui/material'
import { motion } from 'framer-motion'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import { useAppStore } from '@/store/appStore'
import { getDesignTokens } from '@/theme/palette'
import { formatCurrency, formatNumber } from '@/utils/export'

interface KpiCardProps {
  label: string
  value: number | string
  format?: 'currency' | 'number' | 'percent'
  trend?: number
  icon?: React.ReactNode
  color?: string
  loading?: boolean
  variant?: 'default' | 'gradient' | 'outline'
}

export function KpiCard({ label, value, format, trend, icon, color, loading, variant = 'default' }: KpiCardProps) {
  const mode = useAppStore((s) => s.themeMode)
  const colorPreset = useAppStore((s) => s.colorPreset)
  const customAccent = useAppStore((s) => s.customAccent)
  const tokens = getDesignTokens(colorPreset, mode, customAccent)
  const accent = color ?? tokens.primary

  const display = typeof value === 'string' ? value
    : format === 'currency' ? formatCurrency(value)
    : format === 'percent' ? `${value}%`
    : formatNumber(value)

  if (loading) {
    return (
      <Box sx={{ p: 2.5, borderRadius: '20px', border: `1px solid ${tokens.border}`, bgcolor: tokens.surface }}>
        <Skeleton width="50%" height={16} />
        <Skeleton width="70%" height={36} sx={{ my: 1.5 }} />
        <Skeleton width="40%" height={14} />
      </Box>
    )
  }

  const isGradient = variant === 'gradient'

  return (
    <Box
      component={motion.div}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      sx={{
        p: 2.5,
        borderRadius: '20px',
        border: `1px solid ${isGradient ? 'transparent' : tokens.border}`,
        bgcolor: isGradient ? 'transparent' : tokens.surface,
        background: isGradient ? `linear-gradient(135deg, ${alpha(accent, 0.08)} 0%, ${alpha(tokens.secondary, 0.06)} 100%)` : undefined,
        boxShadow: tokens.shadowSm,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: tokens.shadowMd },
      }}
    >
      {isGradient && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${accent}, ${tokens.secondary})` }} />
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" sx={{ color: tokens.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.7rem' }}>
            {label}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mt: 1, color: tokens.textPrimary, letterSpacing: '-0.02em' }}>
            {display}
          </Typography>
          {trend !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              {trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 16, color: tokens.success }} /> : <TrendingDownIcon sx={{ fontSize: 16, color: tokens.error }} />}
              <Typography variant="caption" sx={{ color: trend >= 0 ? tokens.success : tokens.error, fontWeight: 600 }}>
                {Math.abs(trend)}% vs last period
              </Typography>
            </Box>
          )}
        </Box>
        {icon && (
          <Box sx={{ width: 44, height: 44, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(accent, 0.1), color: accent }}>
            {icon}
          </Box>
        )}
      </Box>
    </Box>
  )
}
