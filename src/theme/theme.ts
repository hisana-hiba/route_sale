import { createTheme, type ThemeOptions } from '@mui/material/styles'
import { getDesignTokens } from './palette'
import type { ColorPresetId } from './presets'

function tokens(mode: 'light' | 'dark', preset: ColorPresetId, customAccent?: string) {
  const c = getDesignTokens(preset, mode, customAccent)
  return { c }
}

const sharedComponents = (mode: 'light' | 'dark', preset: ColorPresetId, customAccent?: string): ThemeOptions['components'] => {
  const { c } = tokens(mode, preset, customAccent)
  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          backgroundColor: 'var(--rs-background)',
          color: 'var(--rs-text-primary)',
        },
        '*': { scrollbarWidth: 'none', msOverflowStyle: 'none' },
        '*::-webkit-scrollbar': { display: 'none', width: 0, height: 0 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid color-mix(in srgb, var(--rs-border-strong) 40%, transparent)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
          backgroundImage: 'none',
          backgroundColor: 'color-mix(in srgb, var(--rs-surface) 40%, transparent)',
          backdropFilter: 'blur(20px) saturate(120%)',
          WebkitBackdropFilter: 'blur(20px) saturate(120%)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': { boxShadow: c.shadowSm },
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            background: 'var(--rs-primary)',
            backgroundColor: 'var(--rs-primary)',
            color: '#fff',
            '&:hover': { background: 'var(--rs-primary-dark)', backgroundColor: 'var(--rs-primary-dark)' },
            '& .MuiSvgIcon-root': { color: '#fff' },
          },
        },
      ],
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 20, fontWeight: 600, fontSize: '0.75rem' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
          backgroundColor: 'color-mix(in srgb, var(--rs-surface) 40%, transparent)',
          backdropFilter: 'blur(20px) saturate(120%)',
          WebkitBackdropFilter: 'blur(20px) saturate(120%)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: 'color-mix(in srgb, var(--rs-surface) 30%, transparent)',
          backdropFilter: 'blur(20px) saturate(120%)',
          WebkitBackdropFilter: 'blur(20px) saturate(120%)',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'color-mix(in srgb, var(--rs-border-strong) 40%, transparent)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--rs-primary-light)' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--rs-primary)' },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: 'var(--rs-text-secondary)' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'var(--rs-border)',
          color: 'var(--rs-text-primary)',
        },
        head: {
          color: 'var(--rs-text-muted)',
          fontWeight: 600,
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          borderTop: '1px solid var(--rs-border)',
          color: 'var(--rs-text-secondary)',
        },
        actions: {
          '& .MuiIconButton-root': { borderRadius: '8px', color: 'var(--rs-text-secondary)' },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        root: {
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(26, 46, 37, 0.32)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          },
        },
        paper: {
          borderRadius: 20,
          border: '1px solid rgba(17, 24, 39, 0.08)',
          boxShadow: '0 20px 56px rgba(17, 24, 39, 0.14), 0 4px 16px rgba(17, 24, 39, 0.06)',
          backgroundColor: 'var(--rs-surface)',
          backgroundImage: 'none',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          overflow: 'hidden',
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          boxShadow: 'none',
          borderRadius: 0,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          marginBottom: 2,
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: 'var(--rs-primary)',
            color: '#fff',
            '&:hover': { backgroundColor: 'var(--rs-primary-dark)' },
          },
        },
      },
    },
  }
}

export function createAppTheme(mode: 'light' | 'dark', preset: ColorPresetId = 'forest', customAccent?: string) {
  const { c } = tokens(mode, preset, customAccent)

  return createTheme({
    palette: {
      mode,
      primary: { main: c.primary, light: c.primaryLight, dark: c.primaryDark, contrastText: '#fff' },
      secondary: { main: c.secondary, contrastText: c.textPrimary },
      background: { default: c.background, paper: c.surface },
      text: { primary: c.textPrimary, secondary: c.textSecondary },
      success: { main: c.success },
      warning: { main: c.warning },
      error: { main: c.error },
      info: { main: c.info },
      divider: c.border,
    },
    typography: {
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
      h3: { fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1.75rem' },
      h4: { fontWeight: 800, letterSpacing: '-0.02em', color: c.textPrimary },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500, color: c.textSecondary },
      body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
      body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
      caption: { fontSize: '0.75rem', color: c.textMuted },
      button: { fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: sharedComponents(mode, preset, customAccent),
  })
}

export { getDesignTokens, initColorTheme, applyColorTokens } from './palette'
export type { ColorTokens } from './palette'
