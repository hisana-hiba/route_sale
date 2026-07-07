/** Design tokens — single source of truth for Route Sale dashboard UI */
export const dash = {
  bg: '#F9F8F3',
  cardBg: '#FFFFFF',
  cardRadius: '14px',
  cardBorder: '1px solid rgba(0, 0, 0, 0.045)',
  cardShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 12px 32px rgba(0, 0, 0, 0.045)',
  cardPadding: { px: '24px', py: '20px' },
  sectionGap: 2.5,
  title: { size: '15px', weight: 700, color: '#1A1A1A' },
  label: { size: '12px', weight: 500, color: '#777777' },
  body: { size: '13px', weight: 500, color: '#6B7280' },
  trendUp: '#10B981',
  trendDown: '#EF4444',
  trendMuted: '#6B7280',
  greeting: { size: '26px', weight: 800, color: '#111827' },
  greetingSub: { size: '14px', weight: 400, color: '#6B7280' },
} as const

/** KPI summary cards (Total Revenue, Orders, etc.) */
export const kpi = {
  radius: '20px',
  padding: '24px',
  shadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
  labelSize: '14px',
  labelColor: '#4B5563',
  valueSize: '30px',
  valueColor: '#000000',
  trendSize: '12px',
  iconSize: 44,
  iconRadius: '12px',
} as const

export const kpiCardThemes = [
  { iconBg: '#FFF7ED', iconColor: '#92400E', waveStroke: '#FFEDD5', waveStroke2: '#FED7AA' },
  { iconBg: '#ECFDF5', iconColor: '#047857', waveStroke: '#D1FAE5', waveStroke2: '#A7F3D0' },
  { iconBg: '#FFF7ED', iconColor: '#C2410C', waveStroke: '#FFEDD5', waveStroke2: '#FED7AA' },
  { iconBg: '#ECFDF5', iconColor: '#047857', waveStroke: '#D1FAE5', waveStroke2: '#A7F3D0' },
] as const

export const overviewIconThemes = [
  { bg: '#F5E8D8', color: '#8B5E34' },
  { bg: '#FAF0D4', color: '#B8860B' },
  { bg: '#E5F5EB', color: '#2D6A4F' },
  { bg: '#FFF0E0', color: '#D97706' },
  { bg: '#FDE8E8', color: '#DC3545' },
] as const

export const quickActionBtn = {
  bg: '#F5F0E8',
  hoverBg: '#EDE6D8',
  color: '#1A3026',
  iconColor: '#2D6A4F',
  radius: '12px',
  fontSize: '12px',
} as const

export const statusPills = {
  delivered: { label: 'Delivered', color: '#16A34A', bg: 'rgba(22, 163, 74, 0.12)' },
  processing: { label: 'Processing', color: '#EA580C', bg: 'rgba(234, 88, 12, 0.12)' },
  shipped: { label: 'Shipped', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.12)' },
  pending: { label: 'Pending', color: '#CA8A04', bg: 'rgba(202, 138, 4, 0.14)' },
} as const
