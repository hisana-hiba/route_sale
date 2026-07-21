import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded'
import SpaIcon from '@mui/icons-material/Spa'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { useAuthStore } from '@/store/authStore'
import { login } from '@/api/flowClient'
import { demoAccounts } from '@/mocks/flowData'
import { colors } from '@/theme/palette'

export function LoginPage() {
  const navigate = useNavigate()
  const authLogin = useAuthStore((s) => s.login)
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (token) navigate('/')
  }, [token, navigate])
  const [mobile, setMobile] = useState('9876543213')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await login(mobile, password)
      authLogin(token, {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        role: user.role as 'admin',
        email: user.email,
      })
      navigate('/')
    } catch {
      setError('Invalid mobile or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(360px, 0.9fr) minmax(520px, 1.1fr)' },
        bgcolor: colors.background,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '100vh',
          p: { md: 5, lg: 7 },
          overflow: 'hidden',
          color: '#fff',
          background: `linear-gradient(145deg, ${colors.primaryLight} 0%, ${colors.sidebar} 52%, ${colors.primaryDark} 100%)`,
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            top: -180,
            right: -150,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 0 0 72px rgba(255,255,255,0.025), 0 0 0 144px rgba(255,255,255,0.02)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            bottom: -170,
            left: -100,
            background: `radial-gradient(circle, ${colors.secondary}33 0%, transparent 68%)`,
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: '13px', bgcolor: colors.secondary }}>
            <SpaIcon sx={{ color: colors.primaryDark, fontSize: 25 }} />
          </Box>
          <Typography sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 24, fontWeight: 800 }}>
            Route Sales
          </Typography>
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 560 }}>
          <Typography sx={{ color: colors.secondary, fontSize: 12, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', mb: 2 }}>
            Sales operations, simplified
          </Typography>
          <Typography sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: { md: 42, lg: 52 }, lineHeight: 1.08, fontWeight: 800, mb: 2.5 }}>
            Everything your sales team needs, in one place.
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.66)', fontSize: 16, lineHeight: 1.75, maxWidth: 480 }}>
            Track routes, manage inventory and stay on top of every order—from the field to the back office.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 5 }}>
            {[
              { icon: <LocalShippingOutlinedIcon />, label: 'Live route tracking' },
              { icon: <Inventory2OutlinedIcon />, label: 'Smart inventory' },
            ].map((feature) => (
              <Paper
                key={feature.label}
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 2,
                  borderRadius: '16px',
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Box sx={{ color: colors.secondary, display: 'flex' }}>{feature.icon}</Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{feature.label}</Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleRoundedIcon sx={{ color: colors.secondary, fontSize: 18 }} />
          <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.58)' }}>Secure access for authorized team members</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2.5, sm: 5, lg: 8 } }}>
        <Box sx={{ width: '100%', maxWidth: 440 }}>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.25, mb: 6 }}>
            <Box sx={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: '12px', bgcolor: colors.primary }}>
              <SpaIcon sx={{ color: colors.secondary, fontSize: 22 }} />
            </Box>
            <Typography sx={{ fontFamily: '"Playfair Display", Georgia, serif', color: colors.primary, fontSize: 22, fontWeight: 800 }}>
              Route Sales
            </Typography>
          </Box>

          <Typography sx={{ color: colors.textPrimary, fontFamily: '"Playfair Display", Georgia, serif', fontSize: { xs: 34, sm: 40 }, lineHeight: 1.2, fontWeight: 800 }}>
            Welcome back
          </Typography>
          <Typography sx={{ mt: 1, mb: 4, color: colors.textSecondary, fontSize: 14.5 }}>
            Sign in to continue to your sales workspace.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Typography component="label" htmlFor="mobile" sx={{ display: 'block', mb: 1, fontSize: 13, fontWeight: 700, color: colors.textPrimary }}>
              Mobile number
            </Typography>
            <TextField
              id="mobile"
              fullWidth
              placeholder="Enter your mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              slotProps={{
                htmlInput: { inputMode: 'numeric' },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIphoneRoundedIcon sx={{ color: colors.textMuted, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { height: 52, borderRadius: '12px', bgcolor: colors.surface } }}
            />

            <Typography component="label" htmlFor="password" sx={{ display: 'block', mb: 1, fontSize: 13, fontWeight: 700, color: colors.textPrimary }}>
              Password
            </Typography>
            <TextField
              id="password"
              fullWidth
              placeholder="Enter your password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: colors.textMuted, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((visible) => !visible)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { height: 52, borderRadius: '12px', bgcolor: colors.surface } }}
            />

            {error && <Alert severity="error" sx={{ mt: 2, borderRadius: '12px' }}>{error}</Alert>}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              endIcon={!loading && <ArrowForwardRoundedIcon />}
              sx={{
                mt: 3,
                height: 52,
                borderRadius: '12px',
                bgcolor: colors.primary,
                boxShadow: '0 10px 24px rgba(26,46,37,0.18)',
                fontSize: 14,
                fontWeight: 800,
                textTransform: 'none',
                '&:hover': { bgcolor: colors.primaryLight, boxShadow: '0 12px 28px rgba(26,46,37,0.24)' },
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </Box>

          <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${colors.border}` }}>
            <Typography sx={{ mb: 1.25, color: colors.textMuted, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Quick demo access
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {demoAccounts.map((account) => (
                <Button
                  key={account.mobile}
                  size="small"
                  variant="outlined"
                  onClick={() => { setMobile(account.mobile); setPassword(account.password) }}
                  sx={{
                    borderRadius: '9px',
                    borderColor: colors.borderStrong,
                    color: colors.textSecondary,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    '&:hover': { borderColor: colors.primary, bgcolor: `${colors.primary}08`, color: colors.primary },
                  }}
                >
                  {account.role}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
