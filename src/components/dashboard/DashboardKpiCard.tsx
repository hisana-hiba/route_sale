import { Box, Typography } from '@mui/material'
import { dash, kpi, kpiCardThemes } from '@/components/dashboard/dashboardTokens'

function CardWaveLines({ stroke, stroke2, id }: { stroke: string; stroke2: string; id: string }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 64,
        pointerEvents: 'none',
        overflow: 'hidden',
        borderRadius: `0 0 ${kpi.radius} ${kpi.radius}`,
      }}
    >
      <svg viewBox="0 0 400 64" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={stroke} stopOpacity="0" />
            <stop offset="35%" stopColor={stroke} stopOpacity="0.35" />
            <stop offset="100%" stopColor={stroke2} stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <path d="M-20 46 C60 38, 120 52, 200 42 C280 32, 340 48, 420 40" fill="none" stroke={`url(#${id})`} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M-20 50 C70 44, 140 56, 220 48 C300 40, 360 54, 420 46" fill="none" stroke={`url(#${id})`} strokeWidth="1.6" strokeOpacity="0.7" strokeLinecap="round" />
        <path d="M-20 54 C50 50, 110 58, 190 52 C270 46, 330 58, 420 50" fill="none" stroke={`url(#${id})`} strokeWidth="1.2" strokeOpacity="0.5" strokeLinecap="round" />
        <path d="M-20 58 C80 54, 160 60, 240 56 C320 52, 380 58, 420 54" fill="none" stroke={`url(#${id})`} strokeWidth="1" strokeOpacity="0.35" strokeLinecap="round" />
      </svg>
    </Box>
  )
}

interface DashboardKpiCardProps {
  label: string
  value: string
  trend: number
  trendLabel: string
  icon: React.ReactNode
  iconIndex?: number
}

export function DashboardKpiCard({
  label, value, trend, trendLabel, icon, iconIndex = 0,
}: DashboardKpiCardProps) {
  const isUp = trend >= 0
  const theme = kpiCardThemes[iconIndex % kpiCardThemes.length]

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: kpi.radius,
        bgcolor: dash.cardBg,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: kpi.shadow,
        p: kpi.padding,
        minHeight: 140,
        overflow: 'hidden',
      }}
    >
      <CardWaveLines stroke={theme.waveStroke} stroke2={theme.waveStroke2} id={`kpi-wave-${iconIndex}`} />

      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <Typography sx={{ color: kpi.labelColor, fontWeight: 500, fontSize: kpi.labelSize, lineHeight: 1.3, fontFamily: 'Inter, system-ui, sans-serif' }}>
          {label}
        </Typography>
        <Box
          sx={{
            width: kpi.iconSize,
            height: kpi.iconSize,
            borderRadius: kpi.iconRadius,
            flexShrink: 0,
            bgcolor: theme.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.iconColor,
            '& .MuiSvgIcon-root': { fontSize: 22, color: 'inherit' },
          }}
        >
          {icon}
        </Box>
      </Box>

      <Typography
        sx={{
          position: 'relative',
          zIndex: 1,
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 700,
          color: kpi.valueColor,
          letterSpacing: '-0.02em',
          fontSize: kpi.valueSize,
          lineHeight: 1.2,
          mt: '8px',
          mb: '12px',
        }}
      >
        {value}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative', zIndex: 1 }}>
        <Typography component="span" sx={{ color: isUp ? dash.trendUp : dash.trendDown, fontWeight: 600, fontSize: kpi.trendSize, fontFamily: 'Inter, system-ui, sans-serif' }}>
          {isUp ? '+' : ''}{trend}%
        </Typography>
        <Typography component="span" sx={{ color: dash.trendMuted, fontSize: kpi.trendSize, fontWeight: 400, fontFamily: 'Inter, system-ui, sans-serif' }}>
          {trendLabel}
        </Typography>
      </Box>
    </Box>
  )
}
