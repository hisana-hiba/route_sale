import { useState, useEffect } from 'react'
import {
  Box, Button, TextField, Typography, Paper, Alert, MenuItem, alpha,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import SpaIcon from '@mui/icons-material/Spa'
import { useAuthStore } from '@/store/authStore'
import { login } from '@/api/flowClient'
import { demoAccounts } from '@/mocks/flowData'
import { colors } from '@/theme/palette'
import { primaryButtonSx } from '@/components/ui/PageShell'

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: colors.sidebar,
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 4,
          borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <SpaIcon sx={{ color: colors.secondary, fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ fontFamily: '"Playfair Display", Georgia, serif', color: colors.primary }}>Route Sales</Typography>
            <Typography variant="caption" color="text.secondary">Web Portal — Sign in</Typography>
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            margin="normal"
            required
            inputProps={{ inputMode: 'numeric' }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ ...primaryButtonSx, mt: 3, py: 1.25 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, mb: 1, fontWeight: 600 }}>
          Demo accounts (from documentation):
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {demoAccounts.map((a) => (
            <Button
              key={a.mobile}
              size="small"
              variant="text"
              onClick={() => { setMobile(a.mobile); setPassword(a.password) }}
              sx={{ justifyContent: 'flex-start', textTransform: 'none', fontSize: '0.75rem', color: colors.textSecondary }}
            >
              {a.role}: {a.mobile} / {a.password}
            </Button>
          ))}
        </Box>
      </Paper>
    </Box>
  )
}
