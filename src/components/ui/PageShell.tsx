import { Box, Typography, Breadcrumbs, Link, Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { motion } from 'framer-motion'
import type { Breadcrumb } from '@/types/module'
import { v } from '@/theme/cssVars'
import { gradientCardSx, cardPadding } from '@/components/ui/cardStyles'

interface PageShellProps {
  title: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]
  actions?: React.ReactNode
  children?: React.ReactNode
}

export function PageShell({ title, subtitle, breadcrumbs, actions, children }: PageShellProps) {
  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 200 } }}>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs
              separator={<NavigateNextIcon sx={{ fontSize: 14, color: v.textMuted }} />}
              sx={{ mb: 1 }}
            >
              {breadcrumbs.map((crumb) =>
                crumb.path ? (
                  <Link key={crumb.label} component={RouterLink} to={crumb.path} underline="hover" variant="caption" sx={{ color: v.textSecondary }}>
                    {crumb.label}
                  </Link>
                ) : (
                  <Typography key={crumb.label} variant="caption" sx={{ color: v.textMuted }}>{crumb.label}</Typography>
                ),
              )}
            </Breadcrumbs>
          )}
          <Typography variant="h4" sx={{ fontWeight: 800, color: v.textPrimary, letterSpacing: '-0.02em' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: v.textSecondary, mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {actions}
          </Box>
        )}
      </Box>
      {children}
    </Box>
  )
}

export const whiteCardSx = {
  ...gradientCardSx('default'),
  ...cardPadding,
} as const

export const primaryButtonSx = {
  borderRadius: '12px',
  textTransform: 'none' as const,
  fontWeight: 600,
  background: v.primary,
  backgroundColor: v.primary,
  color: '#fff',
  boxShadow: 'none',
  px: 2.5,
  '&.MuiButton-contained': {
    background: v.primary,
    backgroundColor: v.primary,
    '&:hover': { background: v.primaryDark, backgroundColor: v.primaryDark },
  },
  '&:hover': { background: v.primaryDark, backgroundColor: v.primaryDark, boxShadow: v.shadowSm },
  '& .MuiSvgIcon-root': { color: '#fff' },
}
