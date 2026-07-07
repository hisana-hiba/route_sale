export interface ColorTokens {
  primary: string
  primaryLight: string
  primaryDark: string
  secondary: string
  background: string
  surface: string
  surfaceElevated: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  border: string
  borderStrong: string
  success: string
  successSoft: string
  warning: string
  warningSoft: string
  error: string
  errorSoft: string
  info: string
  infoSoft: string
  coral: string
  coralSoft: string
  sidebar: string
  sidebarHover: string
  sidebarActive: string
  action: string
  gradientPrimary: string
  gradientAccent: string
  gradientSoft: string
  shadowSm: string
  shadowMd: string
  shadowLg: string
}

import { resolveColorTokens, type ColorPresetId } from './presets'

const CSS_MAP: Record<keyof ColorTokens, string> = {
  primary: '--rs-primary',
  primaryLight: '--rs-primary-light',
  primaryDark: '--rs-primary-dark',
  secondary: '--rs-secondary',
  background: '--rs-background',
  surface: '--rs-surface',
  surfaceElevated: '--rs-surface-elevated',
  textPrimary: '--rs-text-primary',
  textSecondary: '--rs-text-secondary',
  textMuted: '--rs-text-muted',
  border: '--rs-border',
  borderStrong: '--rs-border-strong',
  success: '--rs-success',
  successSoft: '--rs-success-soft',
  warning: '--rs-warning',
  warningSoft: '--rs-warning-soft',
  error: '--rs-error',
  errorSoft: '--rs-error-soft',
  info: '--rs-info',
  infoSoft: '--rs-info-soft',
  coral: '--rs-coral',
  coralSoft: '--rs-coral-soft',
  sidebar: '--rs-sidebar',
  sidebarHover: '--rs-sidebar-hover',
  sidebarActive: '--rs-sidebar-active',
  action: '--rs-action',
  gradientPrimary: '--rs-gradient-primary',
  gradientAccent: '--rs-gradient-accent',
  gradientSoft: '--rs-gradient-soft',
  shadowSm: '--rs-shadow-sm',
  shadowMd: '--rs-shadow-md',
  shadowLg: '--rs-shadow-lg',
}

let activeTokens: ColorTokens = resolveColorTokens('forest', 'light')

export function applyColorTokens(tokens: ColorTokens, mode?: 'light' | 'dark') {
  activeTokens = tokens
  const root = document.documentElement
  ;(Object.keys(CSS_MAP) as (keyof ColorTokens)[]).forEach((key) => {
    root.style.setProperty(CSS_MAP[key], tokens[key])
  })
  root.style.setProperty('background-color', tokens.background)
  if (mode) root.dataset.theme = mode
}

export function initColorTheme(preset: ColorPresetId, mode: 'light' | 'dark', customAccent?: string) {
  const tokens = resolveColorTokens(preset, mode, customAccent)
  applyColorTokens(tokens, mode)
  return tokens
}

/** Live color tokens — updates when user changes theme preset */
export const colors: ColorTokens = new Proxy({} as ColorTokens, {
  get(_, prop: keyof ColorTokens) {
    return activeTokens[prop]
  },
})

/** @deprecated use resolveColorTokens */
export const darkColors = resolveColorTokens('forest', 'dark')

export function getDesignTokens(preset: ColorPresetId, mode: 'light' | 'dark', customAccent?: string) {
  return resolveColorTokens(preset, mode, customAccent)
}
