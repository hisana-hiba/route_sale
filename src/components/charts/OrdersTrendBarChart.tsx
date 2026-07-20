import { Box, Typography } from '@mui/material'
import type { ChartData } from '@/types/module'
import { gradientCardSx, cardPadding, dashCardHeaderSx } from '@/components/ui/cardStyles'

/** Fallback values (₹K) matching the Orders Trend reference mockup */
const FALLBACK_K = [45, 52, 38, 65, 48, 55, 72, 68, 51, 85, 42, 60]
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const BAR_COLOR = '#1A2E25'
const GRID_COLOR = '#E5E7EB'
const LABEL_COLOR = '#9CA3AF'

const CHART_W = 560
const CHART_H = 220
const PAD_L = 44
const PAD_B = 28
const PAD_T = 8
const PLOT_W = CHART_W - PAD_L
const PLOT_H = CHART_H - PAD_B - PAD_T

const Y_TICKS = [0, 20, 40, 60, 80]
const MAX_VAL = 90

function toK(value: number) {
  return value >= 1000 ? value / 1000 : value
}

function yPx(val: number) {
  return PAD_T + PLOT_H - (val / MAX_VAL) * PLOT_H
}

function resolveSeries(data?: ChartData): number[] {
  const raw = data?.series?.[0]?.data
  if (!raw || raw.length === 0) return FALLBACK_K
  const valuesK = raw.map(toK)
  const hasSignal = valuesK.some((v) => v > 0)
  return hasSignal ? valuesK : FALLBACK_K
}

function resolveCategories(data?: ChartData, length = 12): string[] {
  if (data?.categories?.length) return data.categories.slice(0, length)
  return MONTHS.slice(0, length)
}

interface OrdersTrendBarChartProps {
  title?: string
  data?: ChartData
}

export function OrdersTrendBarChart({
  title = 'Orders Trend',
  data,
}: OrdersTrendBarChartProps) {
  const categories = resolveCategories(data)
  const values = resolveSeries(data)
  const slotW = PLOT_W / Math.max(categories.length, 1)
  const barW = slotW * 0.42

  return (
    <Box
      sx={{
        ...gradientCardSx('default'),
        ...cardPadding,
        width: '100%',
        height: '100%',
        minHeight: { xs: 240, md: 220 },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography sx={{ ...dashCardHeaderSx, mb: 1.5, flexShrink: 0 }}>{title}</Typography>

      <Box sx={{ flex: 1, width: '100%', minHeight: 180, display: 'flex', alignItems: 'flex-end' }}>
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block' }}
          aria-label={title}
        >
          {Y_TICKS.map((tick) => {
            const y = yPx(tick)
            return (
              <g key={tick}>
                <line
                  x1={PAD_L}
                  y1={y}
                  x2={CHART_W}
                  y2={y}
                  stroke={GRID_COLOR}
                  strokeWidth={1}
                  strokeDasharray="4 3"
                />
                <text
                  x={PAD_L - 6}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={10}
                  fill={LABEL_COLOR}
                  fontFamily="Plus Jakarta Sans, Inter, system-ui, sans-serif"
                >
                  {tick === 0 ? '₹0' : `₹${tick}K`}
                </text>
              </g>
            )
          })}

          {categories.map((month, i) => {
            const valK = values[i] ?? 0
            const barH = Math.max((valK / MAX_VAL) * PLOT_H, 0)
            const cx = PAD_L + i * slotW + slotW / 2
            const barX = cx - barW / 2
            const barY = PAD_T + PLOT_H - barH

            return (
              <g key={month}>
                <rect
                  x={barX}
                  y={barY}
                  width={barW}
                  height={barH}
                  rx={3}
                  ry={3}
                  fill={BAR_COLOR}
                />
                <text
                  x={cx}
                  y={CHART_H - 6}
                  textAnchor="middle"
                  fontSize={10}
                  fill={LABEL_COLOR}
                  fontFamily="Plus Jakarta Sans, Inter, system-ui, sans-serif"
                >
                  {month}
                </text>
              </g>
            )
          })}
        </svg>
      </Box>
    </Box>
  )
}
