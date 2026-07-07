import { useState } from 'react'
import {
  Box, Drawer, Typography, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Collapse, useMediaQuery, Avatar, Badge,
  TextField, InputAdornment, Button, alpha, Menu, MenuItem, Dialog,
  DialogTitle, DialogContent, DialogActions, Popover, ListItem,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import MenuIcon from '@mui/icons-material/Menu'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined'
import SearchIcon from '@mui/icons-material/Search'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import SpaIcon from '@mui/icons-material/Spa'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { navigation, type NavItem } from '@/routes/navigation'
import { useAppStore } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/api/client'
import type { DashboardData } from '@/types/module'
import { v } from '@/theme/cssVars'
import { colors } from '@/theme/palette'
import { primaryButtonSx } from '@/components/ui/PageShell'
import { AnimatePresence, motion } from 'framer-motion'
import { formatCurrency } from '@/utils/export'

const DRAWER_WIDTH = 260

const navItemSx = (active: boolean) => ({
  borderRadius: '10px',
  mx: 1.5,
  mb: 0.35,
  py: 0.9,
  pl: 1.5,
  color: active ? v.sidebar : alpha('#fff', 0.78),
  bgcolor: active ? v.sidebarActive : 'transparent',
  '&.Mui-selected': {
    bgcolor: v.sidebarActive,
    color: v.sidebar,
    '&:hover': { bgcolor: 'color-mix(in srgb, var(--rs-sidebar-active) 92%, #fff)' },
  },
  '&:hover': { bgcolor: active ? v.sidebarActive : v.sidebarHover },
})

function NavGroup({ item }: { item: NavItem }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(() => item.children?.some((c) => c.path === location.pathname) ?? false)
  const Icon = item.icon

  if (item.path) {
    const active = location.pathname === item.path
    return (
      <ListItemButton
        selected={active}
        onClick={() => navigate(item.path!)}
        sx={navItemSx(active)}
      >
        {Icon && <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}><Icon sx={{ fontSize: 20 }} /></ListItemIcon>}
        <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 700 : 400 }} />
        <ChevronRightIcon sx={{ fontSize: 16, color: active ? alpha(colors.sidebar, 0.45) : alpha('#fff', 0.3) }} />
      </ListItemButton>
    )
  }

  return (
    <>
      <ListItemButton
        onClick={() => setOpen(!open)}
        sx={{ borderRadius: '8px', mx: 1.5, py: 0.75, color: alpha('#fff', 0.55), '&:hover': { bgcolor: 'transparent' } }}
      >
        {Icon && <ListItemIcon sx={{ minWidth: 34, color: alpha('#fff', 0.7) }}><Icon sx={{ fontSize: 20 }} /></ListItemIcon>}
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
        />
        {open ? <ExpandLess sx={{ fontSize: 18, color: alpha('#fff', 0.4) }} /> : <ExpandMore sx={{ fontSize: 18, color: alpha('#fff', 0.4) }} />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List disablePadding>
          {item.children?.map((child) => {
            const active = location.pathname === child.path
            return (
              <ListItemButton
                key={child.id}
                selected={active}
                onClick={() => child.path && navigate(child.path)}
                sx={{
                  ...navItemSx(active),
                  pl: active ? 'calc(44px - 3px)' : 5.5,
                  py: 0.7,
                }}
              >
                <ListItemText primary={child.label} primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: active ? 600 : 400 }} />
                <ChevronRightIcon sx={{ fontSize: 14, color: alpha('#fff', active ? 0.55 : 0.28) }} />
              </ListItemButton>
            )
          })}
        </List>
      </Collapse>
    </>
  )
}

const iconButtonSx = {
  border: `1px solid ${v.border}`,
  borderRadius: '10px',
  width: 40,
  height: 40,
  bgcolor: v.surface,
  '&:hover': { bgcolor: 'color-mix(in srgb, var(--rs-primary) 4%, var(--rs-surface))' },
}

export function AppLayout() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const location = useLocation()
  const navigate = useNavigate()
  const { sidebarOpen, setSidebarOpen, themeMode, toggleTheme, colorPreset, customAccent, themeVersion } = useAppStore()
  const { user, logout } = useAuthStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null)
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null)
  const [dateAnchor, setDateAnchor] = useState<HTMLElement | null>(null)
  const [planOpen, setPlanOpen] = useState(false)
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(dayjs().subtract(6, 'day'))
  const [dateTo, setDateTo] = useState<Dayjs | null>(dayjs())

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get<DashboardData>('/dashboard')).data,
  })

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      if (q.includes('order')) navigate('/sales/orders')
      else if (q.includes('invoice')) navigate('/sales/invoices')
      else if (q.includes('customer')) navigate('/customers/customer-list')
      else if (q.includes('route')) navigate('/route-sales/route-assignment')
      else if (q.includes('product')) navigate('/inventory/product-catalog')
      else navigate('/sales/orders', { state: { search: searchQuery } })
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const drawer = (
    <Box
      key={themeVersion}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: v.sidebar,
        color: '#fff',
      }}
    >
      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <SpaIcon sx={{ color: v.secondary, fontSize: 28 }} />
        <Typography
          sx={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontWeight: 800,
            fontSize: '1.05rem',
            color: v.secondary,
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}
        >
          Route Sales
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', py: 1, scrollbarWidth: 'none', msOverflowStyle: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        <List disablePadding>
          {navigation.map((item) => (
            <NavGroup key={item.id} item={item} />
          ))}
        </List>
      </Box>

      {dashboard && (
        <Box
          sx={{
            mx: 1.5,
            mb: 1.25,
            p: 1.75,
            borderRadius: '14px',
            bgcolor: alpha('#000', 0.28),
            border: `1px solid ${alpha(colors.secondary, 0.35)}`,
            backgroundImage: `radial-gradient(circle at 20% 80%, color-mix(in srgb, ${v.secondary} 14%, transparent) 0%, transparent 55%)`,
          }}
        >
          <Typography variant="caption" sx={{ color: alpha('#fff', 0.65), fontWeight: 500, fontSize: '0.7rem' }}>
            Total Revenue
          </Typography>
          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', my: 0.35 }}>
            {formatCurrency(dashboard.stats.revenueOverview ?? dashboard.stats.monthlySales)}
          </Typography>
          <Typography variant="caption" sx={{ color: v.success, fontWeight: 600, fontSize: '0.68rem', display: 'block', mb: 1.25 }}>
            +18.86% vs last month
          </Typography>
          <Button
            fullWidth
            size="small"
            onClick={() => navigate('/reports/sales-report')}
            sx={{
              bgcolor: 'transparent',
              color: v.secondary,
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.72rem',
              border: `1px solid ${alpha(colors.secondary, 0.55)}`,
              py: 0.65,
              '&:hover': { bgcolor: alpha(colors.secondary, 0.12) },
            }}
          >
            View Full Report
          </Button>
        </Box>
      )}

      <Box
        sx={{
          p: 2,
          m: 1.5,
          borderRadius: '12px',
          bgcolor: alpha('#000', 0.22),
          border: `1px solid ${alpha('#fff', 0.08)}`,
          backgroundImage: `radial-gradient(circle at 80% 20%, color-mix(in srgb, ${v.secondary} 12%, transparent) 0%, transparent 50%)`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
          <WorkspacePremiumIcon sx={{ color: v.secondary, fontSize: 18 }} />
          <Typography variant="caption" fontWeight={700} sx={{ color: v.secondary }}>Premium Plan</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: alpha('#fff', 0.7), mb: 1.5, fontSize: '0.75rem' }}>
          Valid till 31 Dec 2025
        </Typography>
        <Button
          fullWidth
          size="small"
          onClick={() => setPlanOpen(true)}
          sx={{
            bgcolor: 'transparent',
            color: '#fff',
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.75rem',
            border: `1px solid ${alpha('#fff', 0.2)}`,
            py: 0.75,
            '&:hover': { bgcolor: alpha('#fff', 0.1) },
          }}
        >
          View Plan Details
        </Button>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: v.background }}>
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? sidebarOpen : true}
          onClose={() => setSidebarOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box
          component="header"
          key={themeVersion}
          sx={{
            minHeight: { xs: 56, md: 64 },
            display: 'flex',
            alignItems: 'center',
            flexWrap: { xs: 'wrap', lg: 'nowrap' },
            gap: { xs: 1, md: 1.5 },
            py: { xs: 1, md: 0 },
            px: { xs: 1.5, sm: 2, md: 3 },
            bgcolor: v.surface,
            borderBottom: `1px solid ${v.border}`,
            flexShrink: 0,
          }}
        >
          <IconButton onClick={() => setSidebarOpen(true)} sx={{ display: { md: 'none' }, ...iconButtonSx, width: 36, height: 36 }}>
            <MenuIcon fontSize="small" />
          </IconButton>

          <TextField
            placeholder="Search orders, products, customers..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            sx={{
              flex: { xs: 1, md: 'none' },
              width: { md: 360, lg: 420 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: v.background,
                '& fieldset': { borderColor: v.border },
              },
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: v.textMuted }} /></InputAdornment>,
            }}
          />

          <Box sx={{ flex: 1, display: { xs: 'none', lg: 'block' } }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexWrap: 'nowrap' }}>
          <Box
            onClick={(e) => setDateAnchor(e.currentTarget)}
            sx={{
              display: { xs: 'none', lg: 'flex' },
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.75,
              borderRadius: '10px',
              border: `1px solid ${v.border}`,
              cursor: 'pointer',
              bgcolor: v.surface,
            }}
          >
            <CalendarTodayIcon sx={{ fontSize: 15, color: v.textSecondary }} />
            <Typography variant="body2" fontWeight={500} sx={{ color: v.textSecondary, fontSize: '0.8125rem' }}>
              {dateFrom?.format('DD MMM YYYY')} - {dateTo?.format('DD MMM YYYY')}
            </Typography>
            <KeyboardArrowDownIcon sx={{ fontSize: 16, color: v.textMuted }} />
          </Box>

          <Popover open={!!dateAnchor} anchorEl={dateAnchor} onClose={() => setDateAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DatePicker label="From" value={dateFrom} onChange={setDateFrom} slotProps={{ textField: { size: 'small' } }} />
              <DatePicker label="To" value={dateTo} onChange={setDateTo} slotProps={{ textField: { size: 'small' } }} />
              <Button variant="contained" color="primary" size="small" onClick={() => setDateAnchor(null)} sx={primaryButtonSx}>Apply</Button>
            </Box>
          </Popover>

          <IconButton sx={iconButtonSx} onClick={(e) => setNotifAnchor(e.currentTarget)}>
            <Badge badgeContent={8} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', minWidth: 16, height: 16 } }}>
              <NotificationsNoneIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>

          <Menu anchorEl={notifAnchor} open={!!notifAnchor} onClose={() => setNotifAnchor(null)}>
            {dashboard?.notifications?.map((n) => (
              <MenuItem key={n.id} onClick={() => { setNotifAnchor(null); navigate('/admin/notifications') }}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{n.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{n.message}</Typography>
                </Box>
              </MenuItem>
            )) ?? <MenuItem disabled>No notifications</MenuItem>}
          </Menu>

          <IconButton sx={{ ...iconButtonSx, display: { xs: 'none', sm: 'inline-flex' } }} onClick={() => navigate('/admin/notifications')}>
            <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', minWidth: 16, height: 16 } }}>
              <ForumOutlinedIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>

          <IconButton onClick={toggleTheme} sx={iconButtonSx}>
            {themeMode === 'light' ? <WbSunnyOutlinedIcon sx={{ fontSize: 20 }} /> : <DarkModeOutlinedIcon sx={{ fontSize: 20 }} />}
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', pl: 0.5 }} onClick={(e) => setProfileAnchor(e.currentTarget)}>
            <Avatar sx={{ width: 38, height: 38, bgcolor: v.primary, fontSize: '0.8rem', fontWeight: 700 }}>
              {(user?.name ?? 'Admin User').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" fontWeight={600} lineHeight={1.2} fontSize="0.8125rem">{user?.name ?? 'Admin User'}</Typography>
              <Typography variant="caption" color="text.secondary" fontSize="0.7rem">Super Admin</Typography>
            </Box>
            <KeyboardArrowDownIcon sx={{ fontSize: 18, color: v.textMuted, display: { xs: 'none', sm: 'block' } }} />
          </Box>

          <Menu anchorEl={profileAnchor} open={!!profileAnchor} onClose={() => setProfileAnchor(null)}>
            <MenuItem onClick={() => { setProfileAnchor(null); navigate('/hr/employees') }}><PersonIcon fontSize="small" sx={{ mr: 1 }} /> Profile</MenuItem>
            <MenuItem onClick={() => { setProfileAnchor(null); navigate('/admin/system-settings') }}><SettingsIcon fontSize="small" sx={{ mr: 1 }} /> Settings</MenuItem>
            <MenuItem onClick={handleLogout}><LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout</MenuItem>
          </Menu>
          </Box>
        </Box>

        <Dialog open={planOpen} onClose={() => setPlanOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Premium Plan</DialogTitle>
          <DialogContent>
            <Typography variant="body2" gutterBottom>Your Route Sales Premium plan includes all 103 modules, GPS tracking, and unlimited users.</Typography>
            <List dense>
              <ListItem>✓ All documented flows (14 modules)</ListItem>
              <ListItem>✓ Valid till 31 Dec 2026</ListItem>
              <ListItem>✓ Priority support</ListItem>
            </List>
          </DialogContent>
          <DialogActions><Button onClick={() => setPlanOpen(false)}>Close</Button></DialogActions>
        </Dialog>

        <Box component="main" className="dashboard-leaf-bg" sx={{ flex: 1, p: { xs: 1.5, md: 2.5 }, overflow: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          <AnimatePresence mode="wait">
            <motion.div key={`${location.pathname}-${themeVersion}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} style={{ position: 'relative', zIndex: 1 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  )
}
