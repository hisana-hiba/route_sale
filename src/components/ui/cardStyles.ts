import type { SxProps, Theme } from '@mui/material'
import { dash } from '@/components/dashboard/dashboardTokens'

type CardVariant = 'default' | 'warm' | 'gold' | 'rose' | 'sage' | 'cream'

/** Clean white dashboard card — matches reference mockup */
export function gradientCardSx(_variant: CardVariant = 'default', _accentColor?: string): SxProps<Theme> {
  return {
    borderRadius: dash.cardRadius,
    background: dash.cardBg,
    backdropFilter: 'blur(20px) saturate(120%)',
    WebkitBackdropFilter: 'blur(20px) saturate(120%)',
    border: dash.cardBorder,
    boxShadow: dash.cardShadow,
    position: 'relative',
    overflow: 'hidden',
  }
}

export const dashCardSx = gradientCardSx('default')

export const dashCardHeaderSx = {
  fontWeight: dash.title.weight,
  fontSize: dash.title.size,
  color: dash.title.color,
  letterSpacing: '-0.01em',
  fontFamily: 'Inter, system-ui, sans-serif',
} as const

export const cardPadding = { px: 3, py: 2.5 } as const

export const cardPaddingCompact = { px: 2.5, py: 2 } as const

export const inputRootSx = {
  borderRadius: '12px',
  bgcolor: dash.cardBg,
  backdropFilter: 'blur(20px) saturate(120%)',
  WebkitBackdropFilter: 'blur(20px) saturate(120%)',
} as const

export const toolbarIconButtonSx = {
  border: dash.cardBorder,
  borderRadius: '10px',
  bgcolor: dash.cardBg,
  backdropFilter: 'blur(20px) saturate(120%)',
  WebkitBackdropFilter: 'blur(20px) saturate(120%)',
  color: dash.body.color,
} as const

export const dashboardGridSpacing = 2.5

export const kpiVariants = ['default', 'gold', 'rose', 'sage'] as const
