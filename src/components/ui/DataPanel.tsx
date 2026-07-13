import { Box, Typography, type SxProps, type Theme } from '@mui/material'
import { v } from '@/theme/cssVars'
import { cardPadding, dashCardHeaderSx, gradientCardSx } from '@/components/ui/cardStyles'

interface DataPanelProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
  noPadding?: boolean
  variant?: 'default' | 'warm' | 'gold' | 'rose' | 'sage' | 'cream'
  sx?: SxProps<Theme>
  /** Threads flex:1 through both the title and the children wrapper so the
   *  inner grid can fill remaining height without a fixed pixel height. */
  fillHeight?: boolean
}

export function DataPanel({ title, subtitle, actions, children, noPadding, variant = 'default', sx, fillHeight }: DataPanelProps) {
  return (
    <Box
      sx={[
        gradientCardSx(variant),
        { overflow: 'hidden' },
        fillHeight ? { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 } : {},
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
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
            flexShrink: 0,
          }}
        >
          <Box>
            {title && <Typography sx={dashCardHeaderSx}>{title}</Typography>}
            {subtitle && <Typography variant="caption" sx={{ color: v.textSecondary, fontSize: '0.7rem' }}>{subtitle}</Typography>}
          </Box>
          {actions}
        </Box>
      )}
      <Box
        sx={{
          ...(noPadding ? {} : cardPadding),
          position: 'relative',
          zIndex: 1,
          ...(fillHeight ? { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' } : {}),
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
