export interface StatusTone {
  label: string
  color: string
  bg: string
  border: string
  dot: string
}

/** Shared status palette — used by StatusChip and dashboard status pills */
export const statusStyles: Record<string, StatusTone> = {
  active: {
    label: 'Active',
    color: '#047857',
    bg: '#ECFDF5',
    border: 'rgba(4, 120, 87, 0.18)',
    dot: '#10B981',
  },
  pending: {
    label: 'Pending',
    color: '#B45309',
    bg: '#FFFBEB',
    border: 'rgba(180, 83, 9, 0.2)',
    dot: '#F59E0B',
  },
  completed: {
    label: 'Completed',
    color: '#047857',
    bg: '#ECFDF5',
    border: 'rgba(4, 120, 87, 0.18)',
    dot: '#10B981',
  },
  confirmed: {
    label: 'Confirmed',
    color: '#047857',
    bg: '#ECFDF5',
    border: 'rgba(4, 120, 87, 0.18)',
    dot: '#10B981',
  },
  cancelled: {
    label: 'Cancelled',
    color: '#B91C1C',
    bg: '#FEF2F2',
    border: 'rgba(185, 28, 28, 0.18)',
    dot: '#EF4444',
  },
  draft: {
    label: 'Draft',
    color: '#4B5563',
    bg: '#F3F4F6',
    border: 'rgba(75, 85, 99, 0.16)',
    dot: '#9CA3AF',
  },
  overdue: {
    label: 'Overdue',
    color: '#B91C1C',
    bg: '#FEF2F2',
    border: 'rgba(185, 28, 28, 0.18)',
    dot: '#EF4444',
  },
  low_stock: {
    label: 'Low Stock',
    color: '#C2410C',
    bg: '#FFF7ED',
    border: 'rgba(194, 65, 12, 0.2)',
    dot: '#F97316',
  },
  in_transit: {
    label: 'In Transit',
    color: '#1D4ED8',
    bg: '#EFF6FF',
    border: 'rgba(29, 78, 216, 0.18)',
    dot: '#3B82F6',
  },
  delivered: {
    label: 'Delivered',
    color: '#047857',
    bg: '#ECFDF5',
    border: 'rgba(4, 120, 87, 0.18)',
    dot: '#16A34A',
  },
  processing: {
    label: 'Processing',
    color: '#C2410C',
    bg: '#FFF7ED',
    border: 'rgba(194, 65, 12, 0.2)',
    dot: '#EA580C',
  },
  shipped: {
    label: 'Shipped',
    color: '#1D4ED8',
    bg: '#EFF6FF',
    border: 'rgba(29, 78, 216, 0.18)',
    dot: '#2563EB',
  },
  approved: {
    label: 'Approved',
    color: '#047857',
    bg: '#ECFDF5',
    border: 'rgba(4, 120, 87, 0.18)',
    dot: '#10B981',
  },
  rejected: {
    label: 'Rejected',
    color: '#B91C1C',
    bg: '#FEF2F2',
    border: 'rgba(185, 28, 28, 0.18)',
    dot: '#EF4444',
  },
  idle: {
    label: 'Idle',
    color: '#4B5563',
    bg: '#F3F4F6',
    border: 'rgba(75, 85, 99, 0.16)',
    dot: '#9CA3AF',
  },
  offline: {
    label: 'Offline',
    color: '#B91C1C',
    bg: '#FEF2F2',
    border: 'rgba(185, 28, 28, 0.18)',
    dot: '#EF4444',
  },
  checked_in: {
    label: 'Checked In',
    color: '#047857',
    bg: '#ECFDF5',
    border: 'rgba(4, 120, 87, 0.18)',
    dot: '#10B981',
  },
  checked_out: {
    label: 'Checked Out',
    color: '#1D4ED8',
    bg: '#EFF6FF',
    border: 'rgba(29, 78, 216, 0.18)',
    dot: '#3B82F6',
  },
  en_route: {
    label: 'En Route',
    color: '#B45309',
    bg: '#FFFBEB',
    border: 'rgba(180, 83, 9, 0.2)',
    dot: '#F59E0B',
  },
}

/** Compact map for dashboard recent-order labels */
export const statusPills = {
  delivered: statusStyles.delivered,
  processing: statusStyles.processing,
  shipped: statusStyles.shipped,
  pending: statusStyles.pending,
  completed: statusStyles.completed,
  cancelled: statusStyles.cancelled,
  approved: statusStyles.approved,
  draft: statusStyles.draft,
} as const
