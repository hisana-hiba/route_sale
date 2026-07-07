import { Box, Typography, Tooltip, Button, Grid, alpha } from '@mui/material'
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import CheckIcon from '@mui/icons-material/Check'
import { useAppStore } from '@/store/appStore'
import { colorPresetList } from '@/theme/presets'
import { v, mix } from '@/theme/cssVars'
import { DataPanel } from '@/components/ui/DataPanel'
import { primaryButtonSx } from '@/components/ui/PageShell'

export function ThemeSettingsPanel() {
  const { colorPreset, setColorPreset, customAccent, setCustomAccent, themeMode, setThemeMode } = useAppStore()

  return (
    <Box sx={{ mb: 2 }}>
      <DataPanel title="Color Theme" subtitle="Choose a preset, accent color, and light or dark mode for the portal">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Theme presets
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
              {colorPresetList.map((preset) => {
                const selected = colorPreset === preset.id
                return (
                  <Tooltip key={preset.id} title={preset.label} arrow>
                    <Box
                      onClick={() => setColorPreset(preset.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setColorPreset(preset.id)}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: '12px',
                        border: `2px solid ${selected ? v.primary : v.border}`,
                        p: 1,
                        minWidth: 88,
                        bgcolor: selected ? mix.surface(6) : v.surface,
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                        '&:hover': { boxShadow: v.shadowSm },
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 0.75 }}>
                        <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: preset.swatch[0] }} />
                        <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: preset.swatch[1] }} />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: v.textPrimary }}>
                          {preset.label}
                        </Typography>
                        {selected && <CheckIcon sx={{ fontSize: 14, color: v.success }} />}
                      </Box>
                    </Box>
                  </Tooltip>
                )
              })}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Accent color
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderRadius: '12px',
                border: `1px solid ${v.border}`,
                bgcolor: v.background,
                mb: 2.5,
              }}
            >
              <Box
                component="input"
                type="color"
                value={customAccent || v.secondary}
                onChange={(e) => setCustomAccent(e.target.value)}
                aria-label="Pick accent color"
                sx={{
                  width: 48,
                  height: 48,
                  border: `1px solid ${v.border}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  bgcolor: 'transparent',
                  p: 0.25,
                }}
              />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Custom accent
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Used for highlights, badges, and sidebar accents
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontFamily: 'monospace' }}>
                  {customAccent || v.secondary}
                </Typography>
              </Box>
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Appearance mode
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={themeMode === 'light' ? 'contained' : 'outlined'}
                startIcon={<WbSunnyOutlinedIcon />}
                onClick={() => setThemeMode('light')}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  borderRadius: '10px',
                  ...(themeMode === 'light' ? primaryButtonSx : { borderColor: v.border }),
                }}
              >
                Light
              </Button>
              <Button
                variant={themeMode === 'dark' ? 'contained' : 'outlined'}
                startIcon={<DarkModeOutlinedIcon />}
                onClick={() => setThemeMode('dark')}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  borderRadius: '10px',
                  ...(themeMode === 'dark' ? primaryButtonSx : { borderColor: v.border }),
                }}
              >
                Dark
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 2.5,
            p: 2,
            borderRadius: '12px',
            background: v.gradientPrimary,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <PaletteOutlinedIcon sx={{ color: v.secondary, fontSize: 28 }} />
          <Box>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>
              Preview: {colorPresetList.find((p) => p.id === colorPreset)?.label} · {themeMode === 'light' ? 'Light' : 'Dark'}
            </Typography>
            <Typography sx={{ color: alpha('#fff', 0.65), fontSize: '0.75rem' }}>
              Changes apply instantly across the portal and are saved automatically.
            </Typography>
          </Box>
        </Box>
      </DataPanel>
    </Box>
  )
}
