import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material'
import type { ChartType } from '@/types/module'

const chartTypes: { value: ChartType; label: string }[] = [
  { value: 'area', label: 'Area' },
  { value: 'bar', label: 'Bar' },
  { value: 'line', label: 'Line' },
  { value: 'donut', label: 'Donut' },
]

interface ChartTypeSelectorProps {
  value: ChartType
  onChange: (type: ChartType) => void
}

export function ChartTypeSelector({ value, onChange }: ChartTypeSelectorProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
      <ToggleButtonGroup
        size="small"
        exclusive
        value={value}
        onChange={(_, v) => v && onChange(v as ChartType)}
        sx={{ '& .MuiToggleButton-root': { px: 1.5, py: 0.4, fontSize: '0.7rem', textTransform: 'none' } }}
      >
        {chartTypes.map((t) => (
          <ToggleButton key={t.value} value={t.value}>{t.label}</ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  )
}
