import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, alpha } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { sidebarQuickAction } from '@/config/quickActions'
import { v } from '@/theme/cssVars'

/** Single quick action relocated from dashboard to sidebar */
export function SidebarQuickActions() {
  const navigate = useNavigate()
  const action = sidebarQuickAction
  const Icon = action.icon

  return (
    <Box sx={{ px: 1.5, pt: 0.5, pb: 0.5 }}>
      <List disablePadding dense>
        <ListItemButton
          onClick={() => navigate(action.path, action.openCreate ? { state: { openCreate: true } } : undefined)}
          sx={{
            borderRadius: '8px',
            py: 0.75,
            color: alpha('#fff', 0.85),
            borderLeft: `3px solid ${v.secondary}`,
            bgcolor: v.sidebarActive,
            '&:hover': { bgcolor: alpha('#fff', 0.16), color: '#fff' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 34, color: v.secondary }}>
            <Icon sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText
            primary={action.label}
            primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 600 }}
          />
        </ListItemButton>
      </List>
    </Box>
  )
}
