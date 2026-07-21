# RouteSale Web Portal — Developer Guide

Engineering documentation for the **RouteSale** web portal — a config-driven,
route-based sales & distribution back-office built with React 19, TypeScript,
Vite, and Material UI.

> This is the developer companion to [`README.md`](./README.md) (the end-user
> guide). If you want to understand *how the code works*, extend it, or connect a
> real backend, start here.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Architecture Overview](#architecture-overview)
5. [The Config-Driven Module System](#the-config-driven-module-system)
6. [Routing](#routing)
7. [Data Layer & Mock API](#data-layer--mock-api)
8. [State Management](#state-management)
9. [Theming System](#theming-system)
10. [Authentication](#authentication)
11. [Type System](#type-system)
12. [Recipes — Common Tasks](#recipes--common-tasks)
13. [Connecting a Real Backend](#connecting-a-real-backend)
14. [Conventions & Gotchas](#conventions--gotchas)
15. [Scripts & Tooling](#scripts--tooling)

---

## Quick Start

### Requirements

- **Node.js** 18+ (20+ recommended)
- **npm** (project ships a `package-lock.json`)

### Install & run

```bash
npm install
npm run dev          # Vite dev server → http://localhost:5173
```

In development the app runs entirely on **mock data** served by
[MSW](https://mswjs.io/) — no backend is required. Every module works with
realistic generated records.

### Build

```bash
npm run build        # tsc build + Vite production bundle → dist/
npm run preview      # serve the production build locally
npm run lint         # ESLint
```

> **Mocks are disabled in production builds** (`import.meta.env.PROD` guard in
> `src/main.tsx`). A production build expects a real `/api` backend.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | **React 19** | Function components + hooks |
| Language | **TypeScript 6** | Strict types across the app |
| Build tool | **Vite 8** | `@vitejs/plugin-react` |
| UI kit | **Material UI 9** (`@mui/material`, `@mui/icons-material`) | Emotion styling engine |
| Routing | **React Router 7** (`react-router-dom`) | `BrowserRouter` |
| Server state | **TanStack Query 5** | Caching, refetch, mutations |
| HTTP | **Axios** | `baseURL: '/api'` |
| Client state | **Zustand 5** | Theme + auth, `persist` middleware |
| Data grid | **AG Grid Community 36** | Registered globally in `main.tsx` |
| Charts | **ApexCharts** (`react-apexcharts`) | Wrapped by `ApexChart` |
| Forms | **React Hook Form 7** + **Zod 4** | `@hookform/resolvers` |
| Dates | **Day.js** + `@mui/x-date-pickers` | `AdapterDayjs` |
| Mock API | **MSW 2** | `src/mocks/*`, dev only |
| Export | **xlsx**, **jsPDF** + `jspdf-autotable` | Excel / PDF / print |
| Animation | **Framer Motion** | Transitions & micro-interactions |

Path alias: **`@` → `src/`** (configured in both `vite.config.ts` and
`tsconfig.json`).

---

## Project Structure

```
src/
├── main.tsx                  # Entry point — registers AG Grid, boots MSW, renders <App/>
├── App.tsx                   # Providers (Query, Theme, Localization, Router) + <AppRoutes/>
├── index.css                 # Global CSS + CSS variables (--rs-*)
│
├── api/
│   ├── client.ts             # Axios instance + fetchList/createItem/updateItem/deleteItem
│   └── flowClient.ts         # API helpers for documented flows (wizards)
│
├── config/
│   ├── modules.ts            # ★ THE registry — every business module is defined here
│   └── quickActions.ts       # Dashboard / sidebar quick-action shortcuts
│
├── routes/
│   ├── index.tsx             # Route table (standalone pages + generated module routes)
│   ├── navigation.ts         # Sidebar tree + flattened allRoutes
│   └── ProtectedRoute.tsx    # Auth gate (redirects to /login)
│
├── pages/
│   ├── DashboardPage.tsx     # Home dashboard
│   ├── ModulePage.tsx        # Thin wrapper: path → config → <ModuleLayout/>
│   ├── layouts/
│   │   └── ModuleLayout.tsx  # ★ The generic page engine (KPIs, charts, grid, CRUD dialogs)
│   ├── CustomersPage.tsx     # Bespoke pages that override the generic layout
│   ├── InvoicesPage.tsx
│   ├── accounts/             # Accounting standalone pages
│   ├── route/                # Route-management standalone pages
│   ├── stock/                # Stock standalone pages
│   ├── sales/ · collections/ · quotations/
│
├── hooks/
│   ├── useModuleData.ts      # ★ List query + create/update/delete mutations + filters
│   ├── usePeriodFilters.ts   # Period (today/week/month/custom) filter state
│   └── useCustomerFilters.ts
│
├── components/
│   ├── layout/               # AppLayout (shell), sidebar quick actions
│   ├── ui/                   # PageShell, DataPanel, FilterBar, KpiCard, StatusChip, cardStyles…
│   ├── dashboard/            # Dashboard widgets + dashboardTokens.ts (design tokens)
│   ├── charts/               # ApexChart wrapper + specific chart cards
│   ├── module/               # Renderers reused by ModuleLayout (FormFieldRenderer, ReportTotalsBar…)
│   ├── flows/                # Multi-step wizards (New Order, Sales Return, Purchase Order…)
│   ├── customers/ · orders/ · sales/ · settings/ · common/
│
├── mocks/
│   ├── browser.ts            # MSW worker setup
│   ├── handlers.ts           # ★ Generic REST handlers for /api/:module CRUD
│   ├── flowHandlers.ts       # Handlers for wizard/flow endpoints
│   ├── flowData.ts
│   └── data/generators.ts    # Fake record + chart + stats generators
│
├── store/
│   ├── appStore.ts           # Theme mode, color preset, sidebar (persisted)
│   └── authStore.ts          # Token + user (persisted)
│
├── theme/
│   ├── theme.ts              # createAppTheme() — builds the MUI theme
│   ├── palette.ts            # ColorTokens + initColorTheme() (writes --rs-* CSS vars)
│   ├── presets.ts            # 12 color presets × light/dark
│   ├── cssVars.ts            # `v` (CSS var refs) + `mix` (color-mix helpers)
│   └── fonts.ts
│
└── types/
    ├── module.ts             # ★ ModuleConfig, ColumnDef, StatDef, FormFieldDef, responses
    ├── customer.ts
    └── period.ts
```

★ = the files you touch most often when extending the app.

---

## Architecture Overview

The portal's defining idea: **one generic page engine renders ~100 business
modules from declarative config**. Instead of hand-writing a page per screen,
each module is a `ModuleConfig` object, and `ModuleLayout` interprets it.

```
Browser hits  /sales/orders
      │
      ▼
routes/index.tsx  ── matches ──►  <ModulePage/>
      │
      ▼
getModuleConfig('/sales/orders')  →  slug "sales-orders"  →  ModuleConfig
      │
      ▼
<ModuleLayout config={config}/>
      │  renders, based on config.layout & config.features:
      ├─ KPI cards          (config.stats)
      ├─ trend/report chart (config.chartType, config.showChart)
      ├─ layout-specific panels (route cards, ledger totals, GPS map…)
      ├─ FilterBar          (search / status / date / export / print)
      ├─ AG Grid table      (config.columns)
      └─ Create/Edit/View/Delete dialogs (config.formFields)
      │
      ▼
useModuleData(config)  →  TanStack Query  →  Axios GET /api/sales-orders
      │
      ▼
MSW handler (dev)  →  generators.ts  →  mock JSON  { data, total, stats, chart, totals }
```

Some screens need bespoke UX beyond the generic engine (dashboard, customers,
invoices, accounting books, route management, wizards). These are **standalone
pages** registered explicitly in `routes/index.tsx` and *excluded* from the
generated module routes.

---

## The Config-Driven Module System

### `ModuleConfig`

Defined in [`src/types/module.ts`](./src/types/module.ts). Key fields:

| Field | Purpose |
|-------|---------|
| `slug` | Unique id, also the API path segment (e.g. `sales-orders` → `/api/sales-orders`) |
| `title` / `subtitle` | Page heading |
| `layout` | One of 10 `LayoutType`s — drives which panels render |
| `domain` | Groups status option sets (`sales`, `invoice`, `route`, …) |
| `entityName` | Singular noun for dialogs ("Add Order") |
| `columns` | `ColumnDef[]` — AG Grid columns + export columns |
| `stats` | `StatDef[]` — KPI cards (key must exist in mock/real stats) |
| `formFields` | `FormFieldDef[]` — create/edit dialog fields (empty ⇒ read-only module) |
| `chartType` / `chartTitle` / `showChart` | Chart behaviour |
| `statuses` | Values shown in the status filter + `StatusChip` |
| `features` | Opt-in extras (see below) |
| `sumFields` | Columns to total in the report totals bar |
| `documentedFlow` | Routes the "Add" button to a custom wizard instead of a dialog |
| `showList` | Set `false` to hide the table (settings-style pages) |

### Layout types

`transaction · report · ledger · inventory · route · hr · customer · logistics ·
settings · tracking`

Each has sensible **defaults** (columns, stats, form fields, chart) applied by
the `cfg()` factory in `config/modules.ts`. You override only what differs.

### Feature flags (`ModuleFeature`)

| Feature | Effect in `ModuleLayout` |
|---------|--------------------------|
| `reportTotals` | Renders `ReportTotalsBar` under the grid (uses `sumFields`) |
| `chartTypeSwitch` | Adds a bar/line/area toggle to report charts |
| `routeOrderPerformance` | Renders the `RouteOrderPerformance` panel |
| `warehouseTransfer` | Renders `WarehouseTransferPanel` |
| `stockBatchAllocation` | Batch-aware allocation form defaults |

### The registry

`config/modules.ts` builds `moduleRegistry: Map<slug, ModuleConfig>` from a big
`registryEntries` array of `[slug, title, layout, domain, overrides?]` tuples.

```ts
export function getModuleConfig(path: string): ModuleConfig {
  const slug = path.replace(/^\//, '').replace(/\//g, '-')
  return moduleRegistry.get(slug) ?? cfg(slug, 'Module', 'transaction', 'sales')
}
```

Unknown paths fall back to a generic transaction config, so the app never
hard-crashes on a missing route.

---

## Routing

Routes are assembled in [`src/routes/index.tsx`](./src/routes/index.tsx):

1. **`/login`** — public.
2. Everything else is nested under `<ProtectedRoute><AppLayout/></ProtectedRoute>`.
3. **Standalone pages** are declared explicitly (dashboard, customers, invoices,
   sales entry, accounting books, route management, stock, and all `/…/new`
   wizards).
4. **Generated module routes** — `allRoutes` (from `navigation.ts`) minus the
   paths already handled as standalone pages, each mapped to `<ModulePage/>`.
5. `*` redirects to `/`.

The sidebar tree lives in [`src/routes/navigation.ts`](./src/routes/navigation.ts):

- `navigation` — the visible, grouped sidebar.
- `flattenNav()` / `findNavByPath()` — helpers.
- `allRoutes` — a **deduped superset** including "hidden" pages not shown in the
  condensed sidebar (the `extra`/`More` group). This is the source of truth for
  which module routes exist.

> **Important:** adding a nav item alone does *not* make a bespoke page. Nav
> items without a dedicated standalone route render through the generic
> `ModuleLayout` (which requires a matching entry in `config/modules.ts`).

---

## Data Layer & Mock API

### Client

[`src/api/client.ts`](./src/api/client.ts) exports a single Axios instance
(`baseURL: '/api'`, 15s timeout) plus typed helpers:
`fetchList`, `fetchOne`, `createItem`, `updateItem`, `deleteItem`.

### The `useModuleData` hook

[`src/hooks/useModuleData.ts`](./src/hooks/useModuleData.ts) is the heart of the
data layer. It owns pagination/search/status/date filter state and returns a
TanStack Query result plus three mutations:

```ts
const {
  data, isLoading, isFetching, refetch,
  page, setPage, pageSize, setPageSize,
  search, setSearch, statusFilter, setStatusFilter,
  dateFrom, setDateFrom, dateTo, setDateTo,
  createMutation, updateMutation, deleteMutation,
} = useModuleData(config, periodFilters?, extraParams?)
```

- Query key: `['module', slug, listParams]` — filters are part of the key, so
  changing a filter triggers a refetch.
- Mutations invalidate `['module', slug]` on success (auto-refresh).
- `page` is 0-indexed in the UI but sent to the API as 1-indexed.

### REST contract

The generic MSW handlers (and any real backend) must implement:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/dashboard` | Dashboard aggregate (`DashboardData`) |
| `GET` | `/api/:module` | Paginated list → `ModuleListResponse` |
| `GET` | `/api/:module/:id` | Single record |
| `POST` | `/api/:module` | Create |
| `PUT` | `/api/:module/:id` | Update |
| `DELETE` | `/api/:module/:id` | Delete |

**List query params:** `page`, `pageSize`, `search`, `status`, `dateFrom`,
`dateTo`, plus optional domain filters (`route`, `shopCategory`, `creditMin/Max`,
`outstandingMin/Max`, `view`, `payrollMonth`, …). See `ModuleListParams`.

**`ModuleListResponse` shape:**

```ts
{
  data: Record<string, unknown>[]
  total: number
  page: number
  pageSize: number
  stats?: Record<string, number>   // keyed by StatDef.key
  chart?: { categories: string[]; series: { name: string; data: number[] }[] }
  totals?: Record<string, number>  // for reportTotals
}
```

### Mock implementation

- [`src/mocks/handlers.ts`](./src/mocks/handlers.ts) — generic CRUD over an
  in-memory `Map<slug, records[]>`. Data is generated lazily on first request
  (`generateModuleRecords`) and mutated in place, so create/edit/delete persist
  for the session (until reload).
- [`src/mocks/data/generators.ts`](./src/mocks/data/generators.ts) — deterministic
  fake records, charts, stats, and domain calculations (incentives, leave days,
  achievement %).
- [`src/mocks/flowHandlers.ts`](./src/mocks/flowHandlers.ts) — endpoints for the
  wizard flows.
- The handlers include one-off **migration guards** that regenerate a slug's data
  when the shape has changed (e.g. a new field was added to a config). If you add
  fields to an existing module and dev data looks stale, add a similar guard or
  just clear the tab/session.

MSW is started in `src/main.tsx` via `enableMocking()` and only in dev.

---

## State Management

Two Zustand stores, both using `persist`:

### `appStore` ([`src/store/appStore.ts`](./src/store/appStore.ts))

UI/theme state: `themeMode` (light/dark), `colorPreset`, `customAccent`,
`sidebarOpen`, `sidebarCollapsed`, and a `themeVersion` counter.

> **`themeVersion` trick:** it's incremented on every theme change and used as a
> React `key` on the AG Grid container (`ModuleLayout`) to force the grid to
> re-mount so its theme class updates cleanly. Keep this in mind if you touch
> theming.

Persisted keys: `themeMode`, `sidebarCollapsed`, `colorPreset`, `customAccent`
(storage name `route-sale-app`).

### `authStore` ([`src/store/authStore.ts`](./src/store/authStore.ts))

`token`, `user`, and `login/logout/isAuthenticated`. Storage name
`route-sale-auth`.

**Server state** (all business data) lives in **TanStack Query**, not Zustand —
don't duplicate it into a store.

---

## Theming System

Theming is **CSS-variable driven** so non-MUI elements (AG Grid, raw DOM) stay in
sync.

- [`src/theme/presets.ts`](./src/theme/presets.ts) — **12 color presets**
  (forest, ocean, royal, sunset, slate, rose, emerald, teal, indigo, violet,
  amber, cyan) each with a `light` and `dark` `ColorTokens` object. Default is
  **forest** (`#1A2E25` sidebar / `#D4A745` gold accent).
- [`src/theme/palette.ts`](./src/theme/palette.ts) — `initColorTheme()` writes
  the resolved tokens as `--rs-*` CSS variables on `:root`; `createAppTheme()`
  builds the MUI theme from them. Both re-run in `AppProviders` when
  mode/preset/accent change.
- [`src/theme/cssVars.ts`](./src/theme/cssVars.ts) — `v` gives typed references
  to the CSS vars (`v.primary`, `v.surface`, …) and `mix` provides `color-mix`
  helpers (`mix.primary(10)` etc.) for translucent tints.

### Theming rules (from the `ui-ux` skill)

- Prefer editing tokens in `src/components/dashboard/dashboardTokens.ts` over
  hardcoding values in components.
- **Never** pass a CSS variable into MUI's `alpha()` — use the raw hex from
  `@/theme/palette` (or the `mix.*` helpers) instead. `alpha(v.sidebar)` will
  break.
- Page bg `#F9F8F3`, cards `#FFFFFF`, radius 14–20px, soft low-opacity shadows.
- UI font **Inter**; sidebar brand **Playfair Display**.

There is a dedicated skill at `.cursor/skills/ui-ux/SKILL.md` — read it before
doing dashboard/visual work.

---

## Authentication

- `ProtectedRoute` checks `authStore.token`; if absent it redirects to `/login`
  (preserving the intended path in `location.state.from`).
- `LoginPage` populates the store via `authStore.login(token, user)`.
- Auth is **client-side only** in this codebase — the token is not yet attached
  to Axios requests. When wiring a real backend, add an Axios request interceptor
  in `api/client.ts` to inject `Authorization: Bearer <token>` and a response
  interceptor to handle 401 → logout.

---

## Type System

All core contracts live in [`src/types/module.ts`](./src/types/module.ts):

- `RecordStatus` — the canonical status union (`active`, `pending`, `completed`,
  `cancelled`, `draft`, `overdue`, `low_stock`, `in_transit`, `delivered`,
  `approved`, `rejected`).
- `LayoutType`, `ChartType`, `ModuleFeature`, `DocumentedFlow`.
- `ColumnDef`, `StatDef`, `FormFieldDef`, `ModuleConfig`.
- Response shapes: `ModuleListResponse`, `DashboardData`.

Keep these authoritative — the mock generators, handlers, and `ModuleLayout` all
depend on them.

---

## Recipes — Common Tasks

### Add a new generic module

1. **Register the config** in `src/config/modules.ts`:

```ts
['sales-refunds', 'Refunds', 'transaction', 'sales', {
  subtitle: 'Track customer refunds',
  entityName: 'Refund',
  showChart: false,
}],
```

2. **Add a sidebar item** in `src/routes/navigation.ts` (under the right group or
   the `extra` list):

```ts
{ id: 'refunds', label: 'Refunds', path: '/sales/refunds' },
```

Routing, the mock API, KPIs, filtering, table, and CRUD dialogs now all work — no
new component required. The slug (`sales-refunds`) is derived from the path.

### Add a bespoke (custom) page

1. Create the page component under `src/pages/…`.
2. Register an explicit `<Route>` in `src/routes/index.tsx`.
3. Add it to the exclusion list at the top of `AppRoutes` so the generic
   `ModulePage` doesn't also claim the path.
4. Add the sidebar nav item.

### Add a field to a module's create/edit form

Add to that module's `formFields` in `config/modules.ts`. Field types:
`text · number · date · select · textarea · image · readonly`. The
`FormFieldRenderer` handles rendering; numeric fields are coerced on submit in
`ModuleLayout.onSubmit`.

### Add a column

Add a `ColumnDef` to `columns`. `type` controls formatting: `currency` (₹, en-IN),
`number`, `percent`, `date`, `status` (renders `StatusChip`). Use `flex` for the
stretchy column and `width` for fixed ones.

### Wire an "Add" button to a wizard instead of a dialog

Set `documentedFlow` on the config (e.g. `'new-order'`) and add the flow's
`/…/new` route + component. `ModuleLayout.openCreateDialog` navigates to the
wizard for known flows.

### Add a new color preset

Add an entry to `colorPresetList` and `colorPresets` in `theme/presets.ts`
(provide `light` and `dark` via `lightBase`/`darkBase`).

---

## Connecting a Real Backend

1. **Point Axios at your API.** Either keep `baseURL: '/api'` and add a Vite dev
   proxy, or set it from an env var:

```ts
// src/api/client.ts
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 15000,
})
```

2. **Implement the REST contract** above for each `slug`. The response shapes
   (`ModuleListResponse`, `DashboardData`) must match `types/module.ts`.

3. **Attach auth** — add an Axios interceptor to send the bearer token from
   `authStore` and handle `401`.

4. **Disable mocks** — they already no-op in production (`import.meta.env.PROD`
   guard in `main.tsx`). To test against a real API in dev, you can early-return
   from `enableMocking()`.

Because the whole app talks to the same typed client + query keys, a correct
backend is a drop-in replacement for MSW.

---

## Conventions & Gotchas

- **Imports use the `@/` alias**, not relative deep paths.
- **Slugs are king.** `path → slug` is `strip leading /, replace / with -`. The
  slug is simultaneously the registry key *and* the API path. Keep nav paths,
  config slugs, and any mock special-casing in sync.
- **`showChart: false`** and **empty `formFields`** are the two most common
  overrides — the latter makes a module read-only (no Add/Edit).
- **AG Grid is registered once** in `main.tsx` (`AllCommunityModule`); don't
  re-register per page.
- **Theme re-mounts the grid** via `themeVersion` keys — don't remove those keys.
- **Currency/number formatting** is centralized in `utils/export.ts`
  (`formatCurrency`, `formatNumber`) and `formatStatValue` in `useModuleData.ts`
  — always `en-IN` / ₹. Reuse them.
- **Mock data resets on reload** (in-memory Map). Session-only persistence is
  expected.
- **Don't put server data in Zustand** — use TanStack Query.
- After editing files, run `npm run lint` and (for visual work) `npm run build`.

---

## Scripts & Tooling

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server on port 5173 (with MSW mocks) |
| `npm run build` | Type-check + production bundle to `dist/` |
| `npm run preview` | Serve the built app locally |
| `npm run lint` | ESLint (flat config in `eslint.config.js`) |

**Config files:** `vite.config.ts` (alias, dev host allow-list for ngrok),
`tsconfig.json` / `tsconfig.node.json`, `eslint.config.js`.

---

*Private project — all rights reserved. Pair this with [`README.md`](./README.md)
for the end-user feature reference.*
