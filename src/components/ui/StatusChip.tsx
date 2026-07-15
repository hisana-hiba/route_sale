import { Box } from '@mui/material'
import { statusStyles, type StatusTone } from '@/components/ui/statusStyles'

interface StatusChipProps {
  status: string
  size?: 'small' | 'medium'
}

export function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const key = status.toLowerCase().replace(/\s+/g, '_')
  const cfg: StatusTone = statusStyles[key] ?? {
    label: status.replace(/_/g, ' '),
    color: '#4B5563',
    bg: '#F3F4F6',
    border: 'rgba(75, 85, 99, 0.18)',
    dot: '#6B7280',
  }

  const isSmall = size === 'small'

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: isSmall ? 1.15 : 1.4,
        py: isSmall ? 0.4 : 0.55,
        borderRadius: '999px',
        bgcolor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        fontSize: isSmall ? '11px' : '12px',
        fontWeight: 600,
        letterSpacing: '0.01em',
        lineHeight: 1.2,
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
        fontFamily: 'Inter, system-ui, sans-serif',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <Box
        component="span"
        sx={{
          width: isSmall ? 6 : 7,
          height: isSmall ? 6 : 7,
          borderRadius: '50%',
          bgcolor: cfg.dot,
          flexShrink: 0,
          boxShadow: `0 0 0 3px ${cfg.bg}`,
        }}
      />
      {cfg.label}
    </Box>
  )
}
