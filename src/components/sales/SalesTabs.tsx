import { Box, Tab, Tabs } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { v, mix } from '@/theme/cssVars'

export const SALES_TABS = [
  { label: 'Sales List', path: '/sales/list' },
  { label: 'Sales Entry', path: '/sales/entry' },
  { label: 'Sales Return', path: '/sales/sales-return' },
  { label: 'Sale Price Entry', path: '/sales/sale-price-entry' },
] as const

function activeTabIndex(pathname: string): number {
  if (pathname.startsWith('/sales/entry')) return 1
  if (pathname.startsWith('/sales/sales-return')) return 2
  if (pathname.startsWith('/sales/sale-price-entry')) return 3
  if (pathname.startsWith('/sales/list') || pathname.startsWith('/sales/invoices')) return 0
  return 0
}

/** Horizontal Sales module tabs — Sales List | Sales Entry | Sales Return | Sale Price Entry */
export function SalesTabs() {
  const location = useLocation()
  const navigate = useNavigate()
  const value = activeTabIndex(location.pathname)

  return (
    <Box
      sx={{
        mb: 2.5,
        borderBottom: `1px solid ${v.border}`,
        bgcolor: v.surface,
        borderRadius: '12px 12px 0 0',
        px: { xs: 0.5, sm: 1 },
      }}
    >
      <Tabs
        value={value}
        onChange={(_, next: number) => navigate(SALES_TABS[next].path)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 44,
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            bgcolor: v.primary,
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            minHeight: 44,
            color: v.textSecondary,
            px: { xs: 1.5, sm: 2.5 },
            '&.Mui-selected': {
              color: v.primary,
              fontWeight: 700,
            },
            '&:hover': {
              color: v.primary,
              bgcolor: mix.primary(4),
            },
          },
        }}
      >
        {SALES_TABS.map((tab) => (
          <Tab key={tab.path} label={tab.label} disableRipple />
        ))}
      </Tabs>
    </Box>
  )
}
