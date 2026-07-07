import { useLayoutEffect, useMemo } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { createAppTheme } from '@/theme/theme'
import { initColorTheme } from '@/theme/palette'
import { useAppStore } from '@/store/appStore'
import { AppRoutes } from '@/routes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
})

export function AppProviders({ children }: { children: React.ReactNode }) {
  const themeMode = useAppStore((s) => s.themeMode)
  const colorPreset = useAppStore((s) => s.colorPreset)
  const customAccent = useAppStore((s) => s.customAccent)

  useLayoutEffect(() => {
    initColorTheme(colorPreset, themeMode, customAccent)
  }, [colorPreset, themeMode, customAccent])

  const theme = useMemo(
    () => createAppTheme(themeMode, colorPreset, customAccent),
    [themeMode, colorPreset, customAccent],
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CssBaseline />
          {children}
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  )
}
