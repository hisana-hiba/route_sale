import { Box, Typography } from '@mui/material'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import { dash } from '@/components/dashboard/dashboardTokens'
import { DashboardPanel } from '@/components/dashboard/DashboardPanel'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  time: string
}

const iconMap = {
  success: { icon: CheckCircleOutlinedIcon, color: '#28A745', bg: 'rgba(40, 167, 69, 0.12)' },
  warning: { icon: WarningAmberOutlinedIcon, color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)' },
  info: { icon: InfoOutlinedIcon, color: '#2563EB', bg: 'rgba(37, 99, 235, 0.12)' },
  error: { icon: ErrorOutlineOutlinedIcon, color: '#DC3545', bg: 'rgba(220, 53, 69, 0.12)' },
}

export function NotificationsFeed({ notifications }: { notifications: Notification[] }) {
  return (
    <DashboardPanel title="Recent Notifications">
      {notifications.map((n, i) => {
        const cfg = iconMap[n.type as keyof typeof iconMap] ?? iconMap.info
        const Icon = cfg.icon
        return (
          <Box
            key={n.id}
            sx={{
              display: 'flex',
              gap: 1.5,
              py: 1.25,
              borderBottom: i < notifications.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                bgcolor: cfg.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: 18, color: cfg.color }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, lineHeight: 1.3, fontSize: '13px', color: '#111827' }}>{n.title}</Typography>
              <Typography sx={{ mt: 0.25, fontSize: '12px', color: dash.body.color }}>{n.message}</Typography>
              <Typography sx={{ color: dash.trendMuted, fontSize: '11px', mt: 0.25 }}>{n.time}</Typography>
            </Box>
          </Box>
        )
      })}
    </DashboardPanel>
  )
}
