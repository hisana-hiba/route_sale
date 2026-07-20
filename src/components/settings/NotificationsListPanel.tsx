import { Box, Typography, Chip } from '@mui/material'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import { useQuery } from '@tanstack/react-query'
import { fetchList } from '@/api/client'
import { DataPanel } from '@/components/ui/DataPanel'
import { StatusChip } from '@/components/ui/StatusChip'
import { v } from '@/theme/cssVars'

const iconMap = {
  success: { icon: CheckCircleOutlinedIcon, color: '#28A745', bg: 'rgba(40, 167, 69, 0.12)' },
  warning: { icon: WarningAmberOutlinedIcon, color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)' },
  info: { icon: InfoOutlinedIcon, color: '#2563EB', bg: 'rgba(37, 99, 235, 0.12)' },
  error: { icon: ErrorOutlineOutlinedIcon, color: '#DC3545', bg: 'rgba(220, 53, 69, 0.12)' },
}

export function NotificationsListPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-notifications-list'],
    queryFn: () => fetchList('/admin-notifications', { page: 1, pageSize: 50 }),
  })

  const notifications = data?.data ?? []

  return (
    <Box sx={{ mb: 2 }}>
      <DataPanel title="Notification List" subtitle={`${data?.total ?? 0} notifications`}>
        {isLoading && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            Loading notifications…
          </Typography>
        )}

        {!isLoading && notifications.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            No notifications yet.
          </Typography>
        )}

        {notifications.map((n, i) => {
          const type = String(n.type ?? 'info')
          const cfg = iconMap[type as keyof typeof iconMap] ?? iconMap.info
          const Icon = cfg.icon
          const isUnread = n.status === 'pending'

          return (
            <Box
              key={String(n.id)}
              sx={{
                display: 'flex',
                gap: 1.5,
                py: 1.5,
                px: 0.5,
                borderBottom: i < notifications.length - 1 ? `1px solid ${v.border}` : 'none',
                bgcolor: isUnread ? 'color-mix(in srgb, var(--rs-primary) 4%, transparent)' : 'transparent',
                borderRadius: 1,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: cfg.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ fontSize: 20, color: cfg.color }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontWeight: 700, lineHeight: 1.3, fontSize: '0.875rem', color: v.textPrimary }}>
                    {String(n.title ?? '—')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                    <Chip
                      label={type}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.7rem',
                        textTransform: 'capitalize',
                        bgcolor: cfg.bg,
                        color: cfg.color,
                      }}
                    />
                    <StatusChip status={isUnread ? 'pending' : 'active'} />
                  </Box>
                </Box>
                <Typography sx={{ mt: 0.35, fontSize: '0.8125rem', color: v.textSecondary }}>
                  {String(n.message ?? '—')}
                </Typography>
                <Typography sx={{ color: v.textMuted, fontSize: '0.75rem', mt: 0.35 }}>
                  {String(n.time ?? n.date ?? '—')}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </DataPanel>
    </Box>
  )
}
