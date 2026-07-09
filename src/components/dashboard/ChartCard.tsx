import { Box, Typography } from '@mui/material'
import { ApexChart } from '@/components/charts/ApexChart'
import type { ChartData } from '@/types/module'
import { cardPadding, dashCardHeaderSx, gradientCardSx } from '@/components/ui/cardStyles'

interface ChartCardProps {
  title: string
  data: ChartData
  type?: 'area' | 'bar'
  height?: number
  yAxisFormat?: 'K' | 'L'
}

export function ChartCard({ title, data, type = 'area', height = 200, yAxisFormat = 'K' }: ChartCardProps) {
  return (
    <Box sx={{ ...gradientCardSx('default'), ...cardPadding, width: '100%', height: '100%', minHeight: { xs: 240, md: 300 } }}>
      <Typography sx={{ ...dashCardHeaderSx, mb: 1.5 }}>{title}</Typography>
      <ApexChart data={data} type={type} height={height} yAxisFormat={yAxisFormat} />
    </Box>
  )
}
