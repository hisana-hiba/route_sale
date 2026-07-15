import { Box, Button, Typography } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import { DashboardPanel } from '@/components/dashboard/DashboardPanel'
import { inputRootSx } from '@/components/ui/cardStyles'
import { quickActionBtn } from '@/components/dashboard/dashboardTokens'
import type { CustomerPeriod } from '@/types/customer'
import { CUSTOMER_PERIOD_LABELS } from '@/types/customer'
import type { Dayjs } from 'dayjs'

const PERIODS: CustomerPeriod[] = ['day', 'weekly', 'monthly', 'year', 'custom']

interface CustomerPeriodFilterProps {
  period: CustomerPeriod
  customFrom: Dayjs | null
  customTo: Dayjs | null
  onPeriodChange: (period: CustomerPeriod) => void
  onCustomFromChange: (date: Dayjs | null) => void
  onCustomToChange: (date: Dayjs | null) => void
}

export function CustomerPeriodFilter({
  period, customFrom, customTo, onPeriodChange, onCustomFromChange, onCustomToChange,
}: CustomerPeriodFilterProps) {
  return (
    <DashboardPanel title="Filter by Period" sx={{ minHeight: 'auto', mb: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <CalendarTodayOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
        <Typography variant="body2" color="text.secondary">
          Filter by day, week, month, year, or custom date range.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: period === 'custom' ? 2 : 0 }}>
        {PERIODS.map((p) => {
          const active = period === p
          return (
            <Button
              key={p}
              size="small"
              onClick={() => onPeriodChange(p)}
              sx={{
                borderRadius: quickActionBtn.radius,
                textTransform: 'none',
                fontSize: quickActionBtn.fontSize,
                fontWeight: 600,
                px: 2,
                py: 0.75,
                bgcolor: active ? 'primary.main' : quickActionBtn.bg,
                color: active ? '#fff' : quickActionBtn.color,
                border: active ? 'none' : '1px solid color-mix(in srgb, var(--rs-border-strong) 40%, transparent)',
                '&:hover': {
                  bgcolor: active ? 'primary.dark' : quickActionBtn.hoverBg,
                },
              }}
            >
              {CUSTOMER_PERIOD_LABELS[p]}
            </Button>
          )
        })}
      </Box>

      {period === 'custom' && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
          <DatePicker
            label="From Date"
            value={customFrom}
            onChange={onCustomFromChange}
            slotProps={{ textField: { size: 'small', sx: { minWidth: 160, '& .MuiOutlinedInput-root': inputRootSx } } }}
          />
          <DatePicker
            label="To Date"
            value={customTo}
            onChange={onCustomToChange}
            slotProps={{ textField: { size: 'small', sx: { minWidth: 160, '& .MuiOutlinedInput-root': inputRootSx } } }}
          />
        </Box>
      )}
    </DashboardPanel>
  )
}
