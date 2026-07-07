# RouteSale — Project Documentation

> Enterprise web portal for route-based sales and distribution companies.  
> Web companion to the Flutter Route Sales mobile app.

**Last verified:** July 7, 2026

---

## Verification Summary

| Check | Result | Notes |
|-------|--------|-------|
| Production build (`npm run build`) | **Pass** | Vite build completes in ~2s |
| Lint (`npm run lint`) | **Pass** | 0 errors, 1 warning in `public/mockServiceWorker.js` |
| Module definitions | **103 modules** | Confirmed in `src/config/modules.ts` |
| Navigation routes | **112 paths** | Defined in `src/routes/navigation.ts` |
| Mock API (MSW) | **Active in dev** | Disabled automatically in production |
| TypeScript | **Strict setup** | Path alias `@/` → `src/` |

**Build note:** The main JS bundle is ~3.5 MB (gzip ~1 MB). Vite reports a chunk-size warning; code-splitting may be worth considering for production optimization.

---

## What This Project Is

RouteSale is a **config-driven React SPA** that provides a full back-office system for FMCG, wholesale, and distribution businesses that sell through field salesmen on daily routes.

It covers:

- Sales, invoicing, collections, and returns
- Route assignment, GPS tracking, and field expenses
- Inventory, warehouses, batches, and expiry
- Purchase and supplier management
- Double-entry accounting and GST reports
- HR, payroll, and sales targets
- Logistics, dispatch, and e-way bills
- Administration, roles, and audit logs

In development, all data comes from **MSW (Mock Service Worker)** — no backend server is required.

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| UI framework | React | 19 |
| Language | TypeScript | 6 |
| Build tool | Vite | 8 |
| Component library | Material UI (MUI) | 9 |
| Routing | React Router | 7 |
| Server state | TanStack Query | 5 |
| Client state | Zustand | 5 |
| Data tables | AG Grid Community | 36 |
| Charts | ApexCharts | 5 |
| Forms | React Hook Form + Zod | 7 / 4 |
| HTTP client | Axios | 1 |
| Date handling | Dayjs + MUI Date Pickers | — |
| Animations | Framer Motion | 12 |
| Export | xlsx, jsPDF | — |
| Mock API | MSW | 2 |

---

## Architecture

### Config-driven module system

Instead of building 103 separate page components, the app uses a single rendering engine:

```
URL path (e.g. /sales/orders)
    → getModuleConfig(pathname) in src/config/modules.ts
    → ModulePage renders ModuleLayout with that config
    → useModuleData() fetches from GET /api/{slug}
    → MSW returns paginated mock data (dev only)
```

**Key files:**

| File | Role |
|------|------|
| `src/config/modules.ts` | All 103 module definitions (columns, stats, forms, layout type) |
| `src/pages/ModulePage.tsx` | Resolves config from URL and mounts `ModuleLayout` |
| `src/pages/layouts/ModuleLayout.tsx` | Shared page engine (KPI cards, filters, table, charts, CRUD) |
| `src/hooks/useModuleData.ts` | List, filter, pagination, and CRUD mutations |
| `src/routes/navigation.ts` | Sidebar menu structure and route paths |

### Layout types

Each module uses one of 10 layout types, which control which panels and charts appear:

`transaction` · `report` · `ledger` · `inventory` · `route` · `hr` · `customer` · `logistics` · `settings` · `tracking`

### Application shell

```
App
├── BrowserRouter
├── AppProviders (QueryClient, MUI Theme, Dayjs, CssBaseline)
└── AppRoutes
    ├── /login → LoginPage
    └── ProtectedRoute → AppLayout
        ├── / → DashboardPage
        ├── /sales/orders/new → NewOrderWizard
        ├── /sales/sales-return/new → SalesReturnWizard
        └── /* → ModulePage (all config-driven modules)
```

---

## Project Structure

```
route_sale/
├── public/
│   └── mockServiceWorker.js    # MSW service worker
├── src/
│   ├── api/
│   │   ├── client.ts           # Axios instance + CRUD helpers
│   │   └── flowClient.ts       # Auth and multi-step flow APIs
│   ├── components/
│   │   ├── charts/             # ApexCharts wrappers
│   │   ├── common/             # Loading, empty states
│   │   ├── dashboard/          # Dashboard widgets
│   │   ├── flows/              # Order/return wizards
│   │   ├── layout/             # AppLayout, sidebar, header
│   │   ├── module/             # Module-specific panels
│   │   ├── settings/           # Theme settings
│   │   └── ui/                 # Reusable UI (FilterBar, KpiCard, etc.)
│   ├── config/
│   │   ├── modules.ts          # 103 module configs
│   │   └── quickActions.ts     # Dashboard quick actions
│   ├── hooks/
│   │   └── useModuleData.ts    # Module data fetching + mutations
│   ├── mocks/
│   │   ├── browser.ts          # MSW worker setup
│   │   ├── handlers.ts         # REST API mock handlers
│   │   ├── flowHandlers.ts     # Flow-specific mock handlers
│   │   ├── flowData.ts         # Demo accounts, flow data
│   │   └── data/generators.ts  # Mock record generators
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ModulePage.tsx
│   │   └── layouts/ModuleLayout.tsx
│   ├── routes/
│   │   ├── index.tsx           # Route definitions
│   │   ├── navigation.ts       # Sidebar navigation
│   │   └── ProtectedRoute.tsx  # Auth guard
│   ├── store/
│   │   ├── appStore.ts         # Theme, sidebar, color presets
│   │   └── authStore.ts        # Auth token + user (persisted)
│   ├── theme/
│   │   ├── palette.ts          # Brand colors, dark/light
│   │   ├── presets.ts          # Color preset options
│   │   └── theme.ts            # MUI theme factory
│   ├── types/
│   │   └── module.ts           # ModuleConfig, ColumnDef, etc.
│   ├── utils/
│   │   └── export.ts           # Excel/PDF export helpers
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
├── README.md                     # End-user guide (103 modules documented)
└── PROJECT.md                    # This file — technical overview
```

---

## Authentication

- Login page at `/login` with mobile + password
- Auth state stored in Zustand with `persist` middleware (`route-sale-auth` in localStorage)
- `ProtectedRoute` redirects unauthenticated users to `/login`
- Demo credentials are pre-filled on the login form; accounts are defined in `src/mocks/flowData.ts`
- Supported roles: `salesman`, `deliveryAgent`, `manager`, `admin`, `shopOwner`

---

## API Layer

### Development (current)

MSW intercepts all `/api/*` requests in dev mode (`src/main.tsx` starts the worker when not in production).

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard` | Dashboard KPIs and chart data |
| `GET` | `/api/{slug}` | Paginated list with search, status, date filters |
| `POST` | `/api/{slug}` | Create record |
| `PUT` | `/api/{slug}/{id}` | Update record |
| `DELETE` | `/api/{slug}/{id}` | Delete record |

Mock data is held in an in-memory `Map` per module slug. Records are generated on first access (~55–75 rows per module).

### Production (connecting a real backend)

1. Point `api` base URL in `src/api/client.ts` to your server
2. Remove or disable MSW startup in `src/main.tsx`
3. Implement the same REST contract (`/api/{slug}` with pagination params)

---

## Theme & Branding

Aligned with the Flutter Route Sales mobile app:

| Token | Value |
|-------|-------|
| Primary | Brown `#5D3820` |
| Accent | Gold `#F3A008` |
| Background | Cream `#F7F3F0` |
| Font | Inter |
| Currency | INR (`en-IN`) |

Theme mode (light/dark), color presets, and custom accent are managed in `src/store/appStore.ts` and applied via MUI `ThemeProvider`.

---

## Module Groups (Sidebar)

| # | Section | Example paths |
|---|---------|---------------|
| 1 | Dashboard | `/` |
| 2 | Sales & Operations | `/sales/orders`, `/sales/invoices` |
| 3 | Route Management | `/route-sales/dashboard`, `/route-sales/gps-tracking` |
| 4 | Accounting | `/accounting/day-book`, `/accounting/gst-report` |
| 5 | Inventory | `/inventory/product-catalog`, `/inventory/low-stock` |
| 6 | Purchase | `/purchase/purchase-orders` |
| 7 | Customer Management | `/customers/customer-list` |
| 8 | HR & Payroll | `/hr/employees`, `/hr/payroll` |
| 9 | Logistics | `/logistics/dispatch`, `/logistics/e-way-bills` |
| 10 | Reports | `/reports/sales-report`, `/reports/profit-loss` |
| 11 | Administration | `/admin/users`, `/admin/audit-logs` |

Full module list with paths is in [README.md](./README.md).

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install and run

```bash
cd route_sale
npm install
npm run dev
```

Open **http://localhost:5173**

### Other scripts

```bash
npm run build    # Production build → dist/
npm run preview  # Preview production build
npm run lint     # ESLint
```

---

## Adding a New Module

1. Add a config entry in `src/config/modules.ts`:

```ts
cfg('sales-new-page', 'New Page', 'transaction', 'sales'),
```

2. Add a menu item in `src/routes/navigation.ts`:

```ts
{ id: 'new-page', label: 'New Page', path: '/sales/new-page' },
```

3. Routing, mock API handlers, and UI are wired automatically via the config-driven system.

---

## Key Design Decisions

1. **One layout engine for 103 modules** — reduces duplication; new modules are mostly config
2. **MSW for offline-first development** — full CRUD without a backend
3. **TanStack Query for server state** — caching, invalidation, loading states
4. **Zustand for UI/auth state** — lightweight, persisted auth
5. **AG Grid for tables** — sorting, pagination, column flexibility
6. **Path alias `@/`** — clean imports across the codebase

---

## Related Documentation

- [README.md](./README.md) — Complete user guide with all 103 modules, navigation help, and feature descriptions

---

*Private project — all rights reserved.*
