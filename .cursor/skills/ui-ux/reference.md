# Route Sale UI/UX Reference

## dashboardTokens.ts exports

### `dash` — global dashboard

| Token | Value |
|-------|-------|
| `bg` | `#F9F8F3` |
| `cardBg` | `#FFFFFF` |
| `cardRadius` | `14px` |
| `cardShadow` | `0 2px 8px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.045)` |
| `title.size` | `15px` bold |
| `greeting.size` | `26px` bold |
| `trendUp` | `#10B981` |
| `trendDown` | `#EF4444` |

### `kpi` — summary cards

| Token | Value |
|-------|-------|
| `radius` | `20px` |
| `padding` | `24px` |
| `shadow` | `0 4px 20px rgba(0,0,0,0.06)` |
| `labelSize` | `14px` |
| `valueSize` | `30px` |
| `iconSize` | `44px` |
| `iconRadius` | `12px` (square, not circle) |

### `kpiCardThemes[0..3]`

| Index | Card | iconBg | wave colors |
|-------|------|--------|-------------|
| 0 | Total Revenue | `#FFF7ED` | peach `#FFEDD5` / `#FED7AA` |
| 1 | Total Orders | `#ECFDF5` | green `#D1FAE5` / `#A7F3D0` |
| 2 | Pending Orders | `#FFF7ED` | peach/orange |
| 3 | Total Customers | `#ECFDF5` | green |

## Sidebar (AppLayout)

- Width `260px`, dark green background
- Active nav: gold/tan background `rgba(212,167,69,0.88)` with dark text
- Revenue mini-card above Premium Plan
- Brand: Playfair Display + gold leaf icon

## Header

- Search placeholder: "Search orders, products, customers..."
- Date range picker, notification badges (8, 3), theme toggle, avatar with initials

## Chart colors (ApexChart)

- Area/line: primary green
- Bar grouped: success green + warning orange (Collection vs Sales)

## INR formatting

Use `formatCurrency` from `@/utils/export` — `en-IN` locale (e.g. ₹12,45,709).
