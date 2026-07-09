import { Box, Typography } from '@mui/material'
import { v } from '@/theme/cssVars'
import { cardPadding, dashCardHeaderSx, gradientCardSx } from '@/components/ui/cardStyles'

interface DataPanelProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
  noPadding?: boolean
  variant?: 'default' | 'warm' | 'gold' | 'rose' | 'sage' | 'cream'
}

export function DataPanel({ title, subtitle, actions, children, noPadding, variant = 'default' }: DataPanelProps) {
  return (
    <Box sx={{ ...gradientCardSx(variant), overflow: 'hidden' }}>
      {(title || actions) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 1.75,
            py: 1.25,
            borderBottom: `1px solid color-mix(in srgb, var(--rs-border-strong) 40%, transparent)`,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box>
            {title && <Typography sx={dashCardHeaderSx}>{title}</Typography>}
            {subtitle && <Typography variant="caption" sx={{ color: v.textSecondary, fontSize: '0.7rem' }}>{subtitle}</Typography>}
          </Box>
          {actions}
        </Box>
      )}
      <Box sx={{ ...(noPadding ? {} : cardPadding), position: 'relative', zIndex: 1 }}>{children}</Box>
    </Box>
  )
}
