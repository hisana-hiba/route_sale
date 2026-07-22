import { Box, Chip, Typography } from '@mui/material'
import RouteIcon from '@mui/icons-material/Route'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import StraightenIcon from '@mui/icons-material/Straighten'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import PublicIcon from '@mui/icons-material/Public'
import { formatDistance, formatDuration } from '@/utils/geo'
import { v } from '@/theme/cssVars'

interface RouteSummaryBarProps {
  stopCount: number
  distanceKm: number
  durationMins: number
  optimized?: boolean
  routingSource?: 'osrm' | 'estimate'
  loading?: boolean
}

export function RouteSummaryBar({ stopCount, distanceKm, durationMins, optimized, routingSource, loading }: RouteSummaryBarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        alignItems: 'center',
        p: 1.5,
        borderRadius: '14px',
        bgcolor: 'color-mix(in srgb, var(--rs-primary) 6%, var(--rs-surface))',
        border: `1px solid ${v.border}`,
      }}
    >
      <Chip icon={<RouteIcon sx={{ fontSize: 16 }} />} label={`${stopCount} stop${stopCount === 1 ? '' : 's'}`} size="small" sx={{ fontWeight: 600 }} />
      <Chip
        icon={<StraightenIcon sx={{ fontSize: 16 }} />}
        label={loading ? 'Calculating…' : formatDistance(distanceKm)}
        size="small"
        sx={{ fontWeight: 600 }}
      />
      <Chip
        icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
        label={loading ? 'Calculating…' : `ETA ${formatDuration(durationMins)}`}
        size="small"
        sx={{ fontWeight: 600 }}
      />
      {optimized && (
        <Chip icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />} label="Optimized" size="small" color="success" sx={{ fontWeight: 600 }} />
      )}
      {routingSource && (
        <Chip
          icon={<PublicIcon sx={{ fontSize: 14 }} />}
          label={routingSource === 'osrm' ? 'Live road routing' : 'Estimated route'}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      )}
      <Box sx={{ flex: 1 }} />
      <Typography variant="caption" sx={{ color: v.textMuted }}>
        Avg speed accounts for city traffic conditions
      </Typography>
    </Box>
  )
}
