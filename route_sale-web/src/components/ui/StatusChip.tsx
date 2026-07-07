import { Box } from '@mui/material'
import { v } from '@/theme/cssVars'

interface StatusStyle {
  label: string
  color: string
  bg: string
}

const statusStyles: Record<string, StatusStyle> = {
  active: { label: 'Active', color: v.success, bg: v.successSoft },
  pending: { label: 'Pending', color: '#CA8A04', bg: 'rgba(202, 138, 4, 0.14)' },
  completed: { label: 'Completed', color: v.success, bg: v.successSoft },
  confirmed: { label: 'Confirmed', color: v.success, bg: v.successSoft },
  cancelled: { label: 'Cancelled', color: v.error, bg: v.errorSoft },
  draft: { label: 'Draft', color: v.textSecondary, bg: 'color-mix(in srgb, var(--rs-primary) 8%, var(--rs-surface))' },
  overdue: { label: 'Overdue', color: v.error, bg: v.errorSoft },
  low_stock: { label: 'Low Stock', color: v.coral, bg: v.coralSoft },
  in_transit: { label: 'In Transit', color: v.info, bg: v.infoSoft },
  delivered: { label: 'Delivered', color: '#16A34A', bg: 'rgba(22, 163, 74, 0.12)' },
  processing: { label: 'Processing', color: '#EA580C', bg: 'rgba(234, 88, 12, 0.12)' },
  shipped: { label: 'Shipped', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.12)' },
  approved: { label: 'Approved', color: v.success, bg: v.successSoft },
  rejected: { label: 'Rejected', color: v.error, bg: v.errorSoft },
  idle: { label: 'Idle', color: v.textSecondary, bg: 'color-mix(in srgb, var(--rs-primary) 8%, var(--rs-surface))' },
  offline: { label: 'Offline', color: v.error, bg: v.errorSoft },
  checked_in: { label: 'Checked In', color: v.success, bg: v.successSoft },
  checked_out: { label: 'Checked Out', color: v.info, bg: v.infoSoft },
  en_route: { label: 'En Route', color: v.warning, bg: v.warningSoft },
}

export function StatusChip({ status }: { status: string; size?: 'small' | 'medium' }) {
  const cfg = statusStyles[status] ?? {
    label: status.replace(/_/g, ' '),
    color: v.textSecondary,
    bg: v.successSoft,
  }

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.25,
        py: 0.35,
        borderRadius: '20px',
        bgcolor: cfg.bg,
        color: cfg.color,
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </Box>
  )
}
