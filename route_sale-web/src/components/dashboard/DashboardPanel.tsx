import { Box, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'
import { cardPadding, dashCardHeaderSx, gradientCardSx } from '@/components/ui/cardStyles'

interface DashboardPanelProps {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
  sx?: SxProps<Theme>
}

export function DashboardPanel({ title, children, action, sx }: DashboardPanelProps) {
  return (
    <Box
      sx={{
        ...gradientCardSx('default'),
        ...cardPadding,
        width: '100%',
        height: '100%',
        minHeight: { xs: 300, sm: 360, md: 400 },
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexShrink: 0 }}>
        <Typography sx={{ ...dashCardHeaderSx }}>{title}</Typography>
        {action}
      </Box>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
