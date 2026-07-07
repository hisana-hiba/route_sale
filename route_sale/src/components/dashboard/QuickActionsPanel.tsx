import { Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { dashboardQuickActions } from '@/config/quickActions'
import { dash, quickActionBtn } from '@/components/dashboard/dashboardTokens'
import { cardPadding, dashCardHeaderSx, gradientCardSx } from '@/components/ui/cardStyles'

export function QuickActionsPanel() {
  const navigate = useNavigate()

  return (
    <Box sx={{ ...gradientCardSx('default'), ...cardPadding }}>
      <Typography sx={{ ...dashCardHeaderSx, mb: 2 }}>Quick Actions</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' },
          gap: 1.5,
        }}
      >
        {dashboardQuickActions.map(({ label, icon: Icon, path, openCreate }) => (
          <Button
            key={label}
            onClick={() => navigate(path, openCreate ? { state: { openCreate: true } } : undefined)}
            sx={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              gap: 1,
              py: 1.25,
              px: 1.5,
              borderRadius: quickActionBtn.radius,
              bgcolor: quickActionBtn.bg,
              color: quickActionBtn.color,
              border: '1px solid rgba(0,0,0,0.04)',
              fontSize: quickActionBtn.fontSize,
              fontWeight: 600,
              textTransform: 'none',
              minHeight: 48,
              lineHeight: 1.2,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: quickActionBtn.hoverBg,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              },
            }}
          >
            <Icon sx={{ fontSize: 18, color: quickActionBtn.iconColor }} />
            {label}
          </Button>
        ))}
      </Box>
    </Box>
  )
}
