import { Box, Typography } from '@mui/material'
import { v, mix } from '@/theme/cssVars'
import { colors } from '@/theme/palette'

const STEPS = [
  'Create Target',
  'Assign Salesman',
  'Orders & Invoices',
  'Collections',
  'Achievement %',
  'Incentive',
  'Payroll',
  'Approval',
  'Payment',
  'Payslip',
] as const

interface HrWorkflowStripProps {
  activeStep: number
}

/** Visual pipeline for Target → Incentive → Payroll → Payslip */
export function HrWorkflowStrip({ activeStep }: HrWorkflowStripProps) {
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
      {STEPS.map((label, i) => {
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
