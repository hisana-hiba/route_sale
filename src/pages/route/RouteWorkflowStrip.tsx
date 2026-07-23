import { Box, Typography } from '@mui/material'
import { v, mix } from '@/theme/cssVars'
import { colors } from '@/theme/palette'

export const ROUTE_DAY_STEPS = [
  'Start Day',
  'GPS On',
  'Visit Market',
  'New Shop?',
  'Check-In',
  'Create Order',
  'Invoice',
  'Payment',
  'Check-Out',
  'End Route',
  'Upload History',
  'Route Learned',
  'Suggestions',
] as const

interface RouteWorkflowStripProps {
  activeStep: number
}

/** Visual pipeline for the field sales day cycle under Route Management */
export function RouteWorkflowStrip({ activeStep }: RouteWorkflowStripProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.75,
        overflowX: 'auto',
        pb: 0.5,
        mb: 2.5,
        '&::-webkit-scrollbar': { height: 4 },
      }}
    >
      {ROUTE_DAY_STEPS.map((label, i) => {
        const done = i < activeStep
        const active = i === activeStep
        return (
          <Box
            key={label}
            sx={{
              flex: '0 0 auto',
              px: 1.25,
              py: 0.75,
              borderRadius: '10px',
              border: `1px solid ${active ? colors.primary : done ? mix.primary(25) : v.border}`,
              bgcolor: active ? mix.primary(10) : done ? mix.primary(5) : v.surface,
              minWidth: 96,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                fontWeight: 700,
                color: active || done ? colors.primary : v.textMuted,
                fontSize: '0.65rem',
                letterSpacing: '0.02em',
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: active ? 700 : 500,
                color: active ? v.textPrimary : v.textSecondary,
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}
