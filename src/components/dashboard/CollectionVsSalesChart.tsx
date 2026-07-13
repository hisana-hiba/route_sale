import { Box, Typography } from '@mui/material'
import { gradientCardSx, cardPadding, dashCardHeaderSx } from '@/components/ui/cardStyles'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const COLLECTION = [45, 52, 38, 65, 48, 55, 72, 68, 51, 85, 42, 60]
const SALES      = [35, 41, 31, 52, 39, 44, 58, 54, 41, 68, 34, 48]

const MAX_VAL  = 90
const Y_TICKS  = [0, 20, 40, 60, 80]

const CHART_W  = 440
const CHART_H  = 200
const PAD_L    = 40
const PAD_B    = 26
const PAD_T    = 10
const PLOT_W   = CHART_W - PAD_L
const PLOT_H   = CHART_H - PAD_B - PAD_T

const COL_COLOR  = '#1A2E25'
const SALES_COLOR = '#EA580C'

function yPx(val: number) {
  return PAD_T + PLOT_H - (val / MAX_VAL) * PLOT_H
}

export function CollectionVsSalesChart() {
  const slotW   = PLOT_W / MONTHS.length
  const barW    = slotW * 0.28
  const gap     = slotW * 0.06

  return (
    <Box sx={{
      ...gradientCardSx('default'),
      ...cardPadding,
      width: '100%',
      height: '100%',
      minHeight: { xs: 240, md: 300 },
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexShrink: 0 }}>
        <Typography sx={dashCardHeaderSx}>Collection vs Sales</Typography>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <LegendDot color={COL_COLOR} label="Collection" />
          <LegendDot color={SALES_COLOR} label="Sales" />
        </Box>
      </Box>

      {/* chart — fills remaining card height, aligned to bottom */}
      <Box sx={{ flex: 1, width: '100%', position: 'relative', minHeight: 140, display: 'flex', alignItems: 'flex-end' }}>
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block' }}
          aria-label="Collection vs Sales bar chart"
        >
          {/* horizontal grid lines + y labels */}
          {Y_TICKS.map((tick) => {
            const y = yPx(tick)
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

          {/* bars */}
          {MONTHS.map((month, i) => {
            const slotX = PAD_L + i * slotW
            const cx    = slotX + slotW / 2
            const colX  = cx - barW - gap / 2
            const salX  = cx + gap / 2

            const colH  = (COLLECTION[i] / MAX_VAL) * PLOT_H
            const salH  = (SALES[i]      / MAX_VAL) * PLOT_H

            const colY  = PAD_T + PLOT_H - colH
            const salY  = PAD_T + PLOT_H - salH

            const r = 2

            return (
              <g key={month}>
                {/* Collection bar */}
                <rect
                  x={colX} y={colY}
                  width={barW} height={colH}
                  rx={r} ry={r}
                  fill={COL_COLOR}
                />
                {/* Sales bar */}
                <rect
                  x={salX} y={salY}
                  width={barW} height={salH}
                  rx={r} ry={r}
                  fill={SALES_COLOR}
                />
                {/* x-axis label */}
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
