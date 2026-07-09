import { Box, Typography, alpha } from '@mui/material'
import Chart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { colors } from '@/theme/palette'
import { dash } from '@/components/dashboard/dashboardTokens'
import { cardPadding, dashCardHeaderSx, gradientCardSx } from '@/components/ui/cardStyles'

interface RoutePerformanceWidgetProps {
  totalRoutes: number
  completed: number
  inProgress: number
  pending: number
  completionPercent: number
}

export function RoutePerformanceWidget({
  totalRoutes, completed, inProgress, pending, completionPercent,
}: RoutePerformanceWidgetProps) {
  const radialOptions: ApexOptions = {
    chart: { sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        hollow: { size: '68%' },
        track: { background: alpha(colors.primary, 0.08), strokeWidth: '100%' },
        dataLabels: {
          name: { show: false },
          value: { fontSize: '14px', fontWeight: 800, color: colors.primary, offsetY: 3 },
        },
      },
    },
    colors: [colors.secondary],
    labels: ['Completion'],
  }

  const routePoints = [
    { x: 18, y: 72, n: 1 },
    { x: 32, y: 48, n: 2 },
    { x: 50, y: 58, n: 3 },
    { x: 68, y: 32, n: 4 },
    { x: 82, y: 52, n: 5 },
  ]

  return (
    <Box sx={{ ...gradientCardSx('default'), ...cardPadding, width: '100%', height: '100%', minHeight: { xs: 240, md: 300 } }}>
      <Typography sx={{ ...dashCardHeaderSx, mb: 1.5 }}>Route Performance</Typography>
      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            height: 130,
            borderRadius: '12px',
            bgcolor: 'color-mix(in srgb, var(--rs-background) 50%, transparent)',
            overflow: 'hidden',
            border: dash.cardBorder,
          }}
        >
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            <path d="M 18 72 Q 26 58 32 48 T 50 58 T 68 32 T 82 52" fill="none" stroke={alpha(colors.primary, 0.12)} strokeWidth="8" />
            <path d="M 18 72 Q 26 58 32 48 T 50 58 T 68 32 T 82 52" fill="none" stroke={alpha(colors.primary, 0.35)} strokeWidth="1.5" strokeDasharray="3 2" />
            {routePoints.map((p, i) => (
              <g key={p.n}>
                {i < routePoints.length - 1 && (
                  <line x1={p.x} y1={p.y} x2={routePoints[i + 1].x} y2={routePoints[i + 1].y} stroke={colors.primary} strokeWidth="2" opacity="0.55" />
                )}
                <circle cx={p.x} cy={p.y} r="5" fill={i < 3 ? colors.secondary : colors.primary} stroke="#fff" strokeWidth="1.5" />
                <text x={p.x} y={p.y + 0.5} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="4.5" fontWeight="bold">{p.n}</text>
              </g>
            ))}
          </svg>
        </Box>
        <Box sx={{ minWidth: 130, display: 'flex', flexDirection: 'column' }}>
          {[
            { label: 'Total Routes', value: totalRoutes },
            { label: 'Completed', value: completed, color: '#28A745' },
            { label: 'In Progress', value: inProgress, color: '#D97706' },
            { label: 'Pending', value: pending, color: '#9CA3AF' },
          ].map((s) => (
            <Box key={s.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <Typography sx={{ fontSize: '12px', color: dash.body.color }}>{s.label}</Typography>
              <Typography sx={{ fontSize: '12px', fontWeight: 700, color: s.color ?? '#111827' }}>{s.value}</Typography>
            </Box>
          ))}
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Chart options={radialOptions} series={[completionPercent]} type="radialBar" height={72} width={72} />
            <Typography sx={{ fontSize: '11px', color: dash.body.color, textAlign: 'center', mt: 0.25 }}>Overall Completion</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
