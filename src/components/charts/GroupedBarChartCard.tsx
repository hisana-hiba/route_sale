import { Box, Typography } from '@mui/material'
import type { ChartData } from '@/types/module'
import { gradientCardSx, cardPadding, dashCardHeaderSx } from '@/components/ui/cardStyles'

const SERIES_COLORS = ['#1A2E25', '#EA580C']

const CHART_W = 440
const CHART_H = 200
const PAD_L = 40
const PAD_B = 26
const PAD_T = 10
const PLOT_W = CHART_W - PAD_L
const PLOT_H = CHART_H - PAD_B - PAD_T

function toThousands(value: number) {
  return value >= 1000 ? value / 1000 : value
}

function buildTicks(maxK: number) {
  const step = maxK <= 80 ? 20 : Math.ceil(maxK / 4 / 10) * 10
  const ticks: number[] = []
  for (let v = 0; v <= maxK; v += step) ticks.push(v)
  if (ticks[ticks.length - 1] < maxK) ticks.push(ticks[ticks.length - 1] + step)
  return ticks
}

function yPx(val: number, maxVal: number) {
  return PAD_T + PLOT_H - (val / maxVal) * PLOT_H
}

interface GroupedBarChartCardProps {
  title: string
  data: ChartData
  minHeight?: number | { xs?: number; md?: number }
}

export function GroupedBarChartCard({ title, data, minHeight = { xs: 240, md: 300 } }: GroupedBarChartCardProps) {
  const categories = data.categories ?? []
  const series = data.series ?? []
  const seriesCount = series.length

  const allValuesK = series.flatMap((s) => s.data.map(toThousands))
  const dataMax = Math.max(...allValuesK, 1)
  const maxVal = Math.max(80, Math.ceil(dataMax / 20) * 20)
  const yTicks = buildTicks(maxVal)

  const slotW = PLOT_W / Math.max(categories.length, 1)
  const barW = slotW * 0.28
  const gap = slotW * 0.06
  const groupW = seriesCount * barW + (seriesCount - 1) * gap

  return (
    <Box sx={{
      ...gradientCardSx('default'),
      ...cardPadding,
      width: '100%',
      minHeight,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexShrink: 0, flexWrap: 'wrap', gap: 1 }}>
        <Typography sx={dashCardHeaderSx}>{title}</Typography>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          {series.map((s, i) => (
            <LegendDot key={s.name} color={SERIES_COLORS[i % SERIES_COLORS.length]} label={s.name} />
          ))}
        </Box>
      </Box>

      <Box sx={{ flex: 1, width: '100%', position: 'relative', minHeight: 180, display: 'flex', alignItems: 'flex-end' }}>
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block' }}
          aria-label={title}
        >
          {yTicks.map((tick) => {
            const y = yPx(tick, maxVal)
            return (
              <g key={tick}>
                <line
                  x1={PAD_L} y1={y} x2={CHART_W} y2={y}
                  stroke="#E5E7EB" strokeWidth={1} strokeDasharray="4 3"
                />
                <text
                  x={PAD_L - 5} y={y + 4}
                  textAnchor="end"
                  fontSize={9}
                  fill="#9CA3AF"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {tick === 0 ? '₹0' : `₹${tick}K`}
                </text>
              </g>
            )
          })}

          {categories.map((month, i) => {
            const slotX = PAD_L + i * slotW
            const cx = slotX + slotW / 2
            const groupStart = cx - groupW / 2

            return (
              <g key={month}>
                {series.map((s, si) => {
                  const valK = toThousands(s.data[i] ?? 0)
                  const barH = (valK / maxVal) * PLOT_H
                  const barX = groupStart + si * (barW + gap)
                  const barY = PAD_T + PLOT_H - barH

                  return (
                    <rect
                      key={s.name}
                      x={barX} y={barY}
                      width={barW} height={barH}
                      rx={2} ry={2}
                      fill={SERIES_COLORS[si % SERIES_COLORS.length]}
                    />
                  )
                })}
                <text
                  x={cx} y={CHART_H - 4}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#9CA3AF"
                  fontFamily="Inter, system-ui, sans-serif"
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

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: color, flexShrink: 0 }} />
      <Typography sx={{ fontSize: '11px', color: '#6B7280', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {label}
      </Typography>
    </Box>
  )
}
