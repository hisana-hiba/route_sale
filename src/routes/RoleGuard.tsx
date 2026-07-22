import { Box, Button, Typography } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, type UserRole } from '@/store/authStore'
import { primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  salesman: 'Salesman',
  deliveryAgent: 'Driver',
  shopOwner: 'Shop Owner',
}

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
  /** Where to send the user if they're logged in but lack access */
  redirectLabel?: string
  redirectPath?: string
}

export function RoleGuard({ allowedRoles, children, redirectPath = '/', redirectLabel = 'Back to Dashboard' }: RoleGuardProps) {
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role)

  if (role && allowedRoles.includes(role)) {
    return <>{children}</>
  }

  return (
    <Box sx={{ ...whiteCardSx, maxWidth: 520, mx: 'auto', mt: { xs: 4, md: 8 }, textAlign: 'center', py: 6 }}>
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          bgcolor: 'rgba(239,68,68,0.1)',
          color: 'error.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
        }}
      >
        <LockOutlinedIcon sx={{ fontSize: 30 }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Access Restricted</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        This section is only available to: <strong>{allowedRoles.map((r) => ROLE_LABELS[r]).join(', ')}</strong>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Your current role: <strong>{role ? ROLE_LABELS[role] : 'Unknown'}</strong>
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate(redirectPath)} sx={primaryButtonSx}>
        {redirectLabel}
      </Button>
    </Box>
  )
}
