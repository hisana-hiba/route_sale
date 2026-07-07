import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ColorPresetId } from '@/theme/presets'

interface AppState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  themeMode: 'light' | 'dark'
  colorPreset: ColorPresetId
  customAccent: string
  themeVersion: number
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapsed: () => void
  toggleTheme: () => void
  setThemeMode: (mode: 'light' | 'dark') => void
  setColorPreset: (preset: ColorPresetId) => void
  setCustomAccent: (color: string) => void
}

function bumpTheme(version: number) {
  return version + 1
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      themeMode: 'light',
      colorPreset: 'forest',
      customAccent: '#D4A745',
      themeVersion: 0,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      toggleTheme: () =>
        set((s) => ({
          themeMode: s.themeMode === 'light' ? 'dark' : 'light',
          themeVersion: bumpTheme(s.themeVersion),
        })),
      setThemeMode: (mode) =>
        set((s) => (s.themeMode === mode ? s : { themeMode: mode, themeVersion: bumpTheme(s.themeVersion) })),
      setColorPreset: (preset) =>
        set((s) => (s.colorPreset === preset ? s : { colorPreset: preset, themeVersion: bumpTheme(s.themeVersion) })),
      setCustomAccent: (color) =>
        set((s) => (s.customAccent === color ? s : { customAccent: color, themeVersion: bumpTheme(s.themeVersion) })),
    }),
    {
      name: 'route-sale-app',
      partialize: (s) => ({
        themeMode: s.themeMode,
        sidebarCollapsed: s.sidebarCollapsed,
        colorPreset: s.colorPreset,
        customAccent: s.customAccent,
      }),
    },
  ),
)
