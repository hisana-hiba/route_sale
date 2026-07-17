import { Box, Typography } from '@mui/material'
import type { ColumnDef } from '@/types/module'
import { formatCurrency, formatNumber } from '@/utils/export'
import { v } from '@/theme/cssVars'

interface ReportTotalsBarProps {
  columns: ColumnDef[]
  totals: Record<string, number>
  sumFields: string[]
}

function formatTotal(value: number, type?: string) {
  if (type === 'currency') return formatCurrency(value)
  return formatNumber(value)
}

export function ReportTotalsBar({ columns, totals, sumFields }: ReportTotalsBarProps) {
  if (!sumFields.length || !Object.keys(totals).length) return null

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        px: 2,
        py: 1.25,
        bgcolor: v.successSoft,
        borderTop: `1px solid ${v.border}`,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 700, color: v.textPrimary, alignSelf: 'center' }}>
        Totals:
      </Typography>
      {sumFields.map((field) => {
        const col = columns.find((c) => c.field === field)
        if (!col) return null
        return (
          <Box key={field} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography variant="caption" sx={{ color: v.textSecondary }}>{col.header}:</Typography>
            <Typography variant="caption" sx={{ fontWeight: 800, color: v.primary }}>
              {formatTotal(totals[field] ?? 0, col.type)}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}
