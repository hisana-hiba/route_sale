import type { ColorTokens } from '@/theme/palette'

export type ColorPresetId = 'forest' | 'ocean' | 'royal' | 'sunset' | 'slate' | 'rose'

export interface ColorPresetMeta {
  id: ColorPresetId
  label: string
  swatch: [string, string]
}

export const colorPresetList: ColorPresetMeta[] = [
  { id: 'forest', label: 'Forest', swatch: ['#1A2E25', '#D4A745'] },
  { id: 'ocean', label: 'Ocean', swatch: ['#0F3D5C', '#38BDF8'] },
  { id: 'royal', label: 'Royal', swatch: ['#312E81', '#A78BFA'] },
  { id: 'sunset', label: 'Sunset', swatch: ['#7C2D12', '#FB923C'] },
  { id: 'slate', label: 'Slate', swatch: ['#1E293B', '#94A3B8'] },
  { id: 'rose', label: 'Rose', swatch: ['#881337', '#FB7185'] },
]

const shared = {
  success: '#16A34A',
  successSoft: 'rgba(22, 163, 74, 0.12)',
  warning: '#EA580C',
  warningSoft: 'rgba(234, 88, 12, 0.12)',
  error: '#DC2626',
  errorSoft: 'rgba(220, 38, 38, 0.12)',
  info: '#2563EB',
  infoSoft: 'rgba(37, 99, 235, 0.12)',
  coral: '#E07A5F',
  coralSoft: 'rgba(224, 122, 95, 0.14)',
  action: '#111827',
  shadowSm: '0 1px 2px rgba(17, 24, 39, 0.04), 0 2px 8px rgba(17, 24, 39, 0.04)',
  shadowMd: '0 2px 8px rgba(17, 24, 39, 0.06), 0 8px 24px rgba(17, 24, 39, 0.06)',
  shadowLg: '0 4px 16px rgba(17, 24, 39, 0.08), 0 16px 48px rgba(17, 24, 39, 0.08)',
}

function lightBase(primary: string, primaryLight: string, primaryDark: string, secondary: string, sidebar: string): ColorTokens {
  return {
    ...shared,
    primary,
    primaryLight,
    primaryDark,
    secondary,
    background: '#F9F8F3',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: 'rgba(17, 24, 39, 0.08)',
    borderStrong: 'rgba(17, 24, 39, 0.14)',
    sidebar,
    sidebarHover: 'rgba(255, 255, 255, 0.08)',
    sidebarActive: 'rgba(212, 167, 69, 0.88)',
    gradientPrimary: `linear-gradient(180deg, ${primaryLight} 0%, ${primary} 50%, ${primaryDark} 100%)`,
    gradientAccent: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
    gradientSoft: `linear-gradient(180deg, ${primary}0A 0%, transparent 100%)`,
  }
}

function darkBase(primary: string, primaryLight: string, primaryDark: string, secondary: string, sidebar: string): ColorTokens {
  return {
    ...shared,
    primary: primaryLight,
    primaryLight: '#6B9E88',
    primaryDark,
    secondary,
    background: '#0F1412',
    surface: '#1A211E',
    surfaceElevated: '#243029',
    textPrimary: '#F3F4F6',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    border: 'rgba(243, 244, 246, 0.08)',
    borderStrong: 'rgba(243, 244, 246, 0.14)',
    sidebar,
    sidebarHover: 'rgba(255, 255, 255, 0.06)',
    sidebarActive: 'rgba(255, 255, 255, 0.12)',
    action: '#F3F4F6',
    gradientPrimary: `linear-gradient(180deg, ${primary} 0%, ${primaryDark} 100%)`,
    gradientAccent: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
    gradientSoft: `linear-gradient(180deg, ${primaryLight}1F 0%, transparent 100%)`,
    shadowSm: '0 1px 3px rgba(0, 0, 0, 0.2)',
    shadowMd: '0 4px 16px rgba(0, 0, 0, 0.25)',
    shadowLg: '0 12px 40px rgba(0, 0, 0, 0.35)',
  }
}

export const colorPresets: Record<ColorPresetId, { light: ColorTokens; dark: ColorTokens }> = {
  forest: {
    light: lightBase('#1A2E25', '#2D4A3E', '#0F1A15', '#D4A745', '#1A2E25'),
    dark: darkBase('#1A2E25', '#3D6B58', '#0F1A15', '#D4A745', '#0F1A15'),
  },
  ocean: {
    light: lightBase('#0F3D5C', '#1E5A7A', '#082A40', '#38BDF8', '#0F3D5C'),
    dark: darkBase('#0F3D5C', '#38BDF8', '#082A40', '#7DD3FC', '#082A40'),
  },
  royal: {
    light: lightBase('#312E81', '#4338CA', '#1E1B4B', '#A78BFA', '#312E81'),
    dark: darkBase('#312E81', '#818CF8', '#1E1B4B', '#C4B5FD', '#1E1B4B'),
  },
  sunset: {
    light: lightBase('#7C2D12', '#9A3412', '#431407', '#FB923C', '#7C2D12'),
    dark: darkBase('#7C2D12', '#FB923C', '#431407', '#FDBA74', '#431407'),
  },
  slate: {
    light: lightBase('#1E293B', '#334155', '#0F172A', '#94A3B8', '#1E293B'),
    dark: darkBase('#1E293B', '#94A3B8', '#0F172A', '#CBD5E1', '#0F172A'),
  },
  rose: {
    light: lightBase('#881337', '#9F1239', '#4C0519', '#FB7185', '#881337'),
    dark: darkBase('#881337', '#FB7185', '#4C0519', '#FDA4AF', '#4C0519'),
  },
}

export function resolveColorTokens(preset: ColorPresetId, mode: 'light' | 'dark', customAccent?: string): ColorTokens {
  const base = colorPresets[preset][mode]
  if (!customAccent) return base
  return {
    ...base,
    secondary: customAccent,
    gradientAccent: `linear-gradient(135deg, ${base.primary} 0%, ${customAccent} 100%)`,
  }
}
