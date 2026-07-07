---
name: ui-ux
description: >-
  Implements and reviews Route Sale dashboard UI to match reference mockups
  (forest-green sidebar, cream background, KPI cards with wave accents). Use when
  the user asks for UI/UX work, design matching, dashboard styling, card shadows,
  spacing, typography, colors, mockup parity, or Flavors of Malabar design.
---

# Route Sale UI/UX

## When to apply

Read this skill before changing dashboard layout, cards, colors, fonts, spacing, or shadows. Match the reference mockup exactly — do not improvise new styles.

## Workflow

1. **Read the reference** — If the user provides an image, extract: radius, shadow, font sizes, colors, padding, icon shape, decorative patterns.
2. **Check tokens first** — Edit `src/components/dashboard/dashboardTokens.ts` before hardcoding values in components.
3. **Reuse shells** — Use existing components; do not duplicate card markup.
4. **Verify** — Run `npm run build`. Hard-refresh browser after visual changes.

## File map

| Purpose | File |
|---------|------|
| Design tokens | `src/components/dashboard/dashboardTokens.ts` |
| KPI cards | `src/components/dashboard/DashboardKpiCard.tsx` |
| Panel cards | `src/components/dashboard/DashboardPanel.tsx` |
| Shared card sx | `src/components/ui/cardStyles.ts` |
| Dashboard layout | `src/pages/DashboardPage.tsx` |
| App shell | `src/components/layout/AppLayout.tsx` |
| Theme CSS vars | `src/index.css`, `src/theme/presets.ts` |

## Design rules

### Layout order (dashboard)

1. Greeting → 2. Four KPI cards → 3. Overview strip → 4. Quick Actions → 5. Charts row → 6. Bottom lists (Products, Orders, Notifications)

### Colors

- Page background: `#F9F8F3`
- Card background: `#FFFFFF`
- Sidebar: forest green via `--rs-sidebar` (`#1A2E25`)
- Accent gold: `--rs-secondary` (`#D4A745`)
- Positive trend: `#10B981` · Negative: `#EF4444` · Muted text: `#6B7280`

### Cards (panels & charts)

- Radius `14px`, padding `24px`, soft shadow from `dash.cardShadow`
- No colored top accent stripes on dashboard panels
- Grid gap: `dashboardGridSpacing` (2.5 = 20px)

### KPI cards (special)

- Radius `20px`, padding `24px`, shadow `0 4px 20px rgba(0,0,0,0.06)`
- Solid white — no gradient wash
- Label `14px` `#4B5563` · Value `30px` bold black · Trend `12px`
- Icon: **square** `44×44`, radius `12px`, top-right
- Bottom decoration: **thin SVG wave lines** (not radial glow, not filled blobs)
- Themes in `kpiCardThemes` — peach for revenue, green for orders/customers, orange for pending

### Typography

- UI text: **Inter**
- Brand name in sidebar: **Playfair Display**
- KPI values: Inter bold (per latest reference crop)

### MUI pitfalls

- **Never** pass CSS variables to MUI `alpha()` — use `colors` from `@/theme/palette` instead of `v.*` from `cssVars.ts`
- Use `overflow: hidden` on KPI cards so wave SVGs respect border radius
- Unique SVG gradient `id` per KPI card instance (use `iconIndex`)

### Quick Actions

- Beige buttons `#F5F0E8`, green icons `#2D6A4F`, radius `12px`, font `12px`

### Status pills

- Use tokens from `statusPills` in `dashboardTokens.ts`
- Pill radius `20px`, font `11px`, soft tinted backgrounds

## Adding a new dashboard widget

```tsx
import { cardPadding, dashCardHeaderSx, gradientCardSx } from '@/components/ui/cardStyles'
import { dash } from '@/components/dashboard/dashboardTokens'

<Box sx={{ ...gradientCardSx('default'), ...cardPadding }}>
  <Typography sx={dashCardHeaderSx}>Title</Typography>
  {/* content */}
</Box>
```

## Checklist before finishing UI work

- [ ] Values live in `dashboardTokens.ts` (not scattered literals)
- [ ] Spacing matches reference (padding 20–24px, consistent gaps)
- [ ] Shadows are soft/low-opacity — not harsh or missing
- [ ] KPI wave lines visible at card bottom-right
- [ ] Build passes
- [ ] No `alpha(v.sidebar)` or similar CSS-var + alpha combos

## Additional reference

- Full token tables and component notes: [reference.md](reference.md)
