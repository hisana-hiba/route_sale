# RouteSale Web Portal — Complete User Guide

> **RouteSale** is an enterprise business management web portal for **route-based sales and distribution** companies. It helps you manage sales, customers, inventory, accounting, field routes, HR, logistics, and reports — all from one place.

This portal is the web version of the Flutter Route Sales mobile app. It is built with **React 19**, **TypeScript**, **Vite**, and **Material UI**.

---

## Table of Contents

1. [What This Portal Does](#what-this-portal-does)
2. [Who Should Use It](#who-should-use-it)
3. [How to Open the Portal](#how-to-open-the-portal)
4. [Portal Layout — How to Navigate](#portal-layout--how-to-navigate)
5. [Common Features on Every Page](#common-features-on-every-page)
6. [Dashboard (Home Page)](#dashboard-home-page)
7. [All Modules Explained](#all-modules-explained)
   - [Sales & Operations](#1-sales--operations)
   - [Route Management](#2-route-management)
   - [Accounting](#3-accounting)
   - [Inventory](#4-inventory)
   - [Purchase](#5-purchase)
   - [Customer Management](#6-customer-management)
   - [HR & Payroll](#7-hr--payroll)
   - [Logistics](#8-logistics)
   - [Reports](#9-reports)
   - [Administration](#10-administration)
8. [Record Statuses](#record-statuses)
9. [Design & Appearance](#design--appearance)
10. [For Developers](#for-developers)

---

## What This Portal Does

RouteSale Web Portal is a **complete back-office system** for companies that sell products through field salesmen on daily routes (FMCG, wholesale, distribution, etc.).

| Area | What you can do |
|------|-----------------|
| **Sales** | Orders, invoices, billing, returns, quotations, credit notes |
| **Routes** | Assign routes, track salesman visits, GPS tracking, collections, expenses |
| **Customers** | Customer list, credit limits, outstanding balances, visit history |
| **Inventory** | Products, stock, warehouses, batches, expiry, low-stock alerts |
| **Purchase** | Purchase orders, suppliers, returns, settlements |
| **Accounting** | Day book, cash/bank book, ledger, vouchers, GST, P&L, balance sheet |
| **HR** | Employees, attendance, payroll, incentives, leave, sales targets |
| **Logistics** | Delivery schedule, dispatch, vehicles, drivers, e-way bills |
| **Reports** | Sales, purchase, collection, route, product, employee, financial |
| **Admin** | Users, roles, permissions, settings, audit logs, backup |

**Total: 103 business modules** — each with data tables, filters, charts, and create/edit/delete actions.

---

## Who Should Use It

| Role | Typical use |
|------|-------------|
| **Admin / Owner** | Dashboard, reports, settings, user management |
| **Accounts team** | Accounting, vouchers, GST, settlements, ledgers |
| **Sales manager** | Orders, route performance, sales targets, collections |
| **Warehouse staff** | Inventory, stock transfer, batch management |
| **HR team** | Employees, payroll, attendance, leave |
| **Logistics team** | Delivery, dispatch, vehicles, live tracking |

---

## How to Open the Portal

### Requirements
- Node.js 18 or higher
- npm

### Run locally

```bash
cd route_sale
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

> In development mode, the portal uses **mock (sample) data** — no backend server needed. All 103 modules work with realistic demo records.

### Build for production

```bash
npm run build
npm run preview
```

---

## Portal Layout — How to Navigate

When you open the portal, you see three main areas:

```
┌─────────────┬──────────────────────────────────────────┐
│             │  Header (search, date, theme, profile)   │
│   Sidebar   ├──────────────────────────────────────────┤
│   (menu)    │                                          │
│             │         Main content area                  │
│             │    (Dashboard or module page)              │
└─────────────┴──────────────────────────────────────────┘
```

### Sidebar (left)
- Brown gradient menu with grouped modules
- Click a group (e.g. **Sales & Operations**) to expand sub-items
- Click any item to open that page
- On mobile: tap the menu icon (☰) to open/close

### Header (top)
- **Global search** — quick search across the app
- **Date picker** — reference date for reports
- **Dark / Light mode** — toggle theme (saved automatically)
- **Notifications** — alerts and updates
- **Profile** — user account area

### Main content
- **Dashboard** at home (`/`)
- **Module pages** for all other screens — same consistent layout everywhere

---

## Common Features on Every Page

Almost every module page includes the same tools. Once you learn one page, you know them all.

### At the top — KPI cards
Four summary cards show key numbers for that module (e.g. total orders, total value, pending count, completed count). Each card includes a small trend sparkline.

### Layout-specific panels (varies by module type)
| Type | Extra UI you may see |
|------|----------------------|
| **Transaction** (orders, invoices) | Trend chart above the table |
| **Report** (sales report, P&L) | Analysis chart + summary panel + totals row |
| **Ledger** (day book, vouchers) | Debit / Credit summary boxes |
| **Inventory** | Low-stock overview + stock movement chart |
| **Route** | Route progress cards (outlets visited, collection) |
| **Customer** | Customer cards (outstanding vs credit limit) |
| **HR** | Workforce donut chart |
| **Logistics** | Delivery volume chart |
| **Tracking** (GPS) | Live map view + agent status list |
| **Settings** | Configuration table only |

### Filter bar (above table)
| Tool | What it does |
|------|--------------|
| **Search** | Find records by any field (code, name, customer, etc.) |
| **Status** | Filter by status (pending, completed, active, etc.) |
| **Date From / To** | Filter records by date range |
| **Excel** | Download table data as `.xlsx` file |
| **PDF** | Export table as PDF document |
| **Print** | Print the current table |
| **Refresh** | Reload data from server |

### Data table
- Sortable columns
- Pagination (5, 10, 25, or 50 rows per page)
- **View** (👁) — read-only detail popup
- **Edit** (✏️) — edit form (where allowed)
- **Delete** (🗑) — remove record with confirmation
- **Add** button (top right) — create new record

### Forms (create / edit)
- Text, number, date, dropdown, textarea fields
- Image upload (e.g. product catalog)
- Required field validation
- Save or Cancel

---

## Dashboard (Home Page)

The **Dashboard** is your business command center. Open it by clicking **Dashboard** in the sidebar or visiting `/`.

### Main KPIs (top row)
| Card | Shows |
|------|-------|
| Today's Sales | Total sales amount for today |
| Today's Collection | Cash/cheque collected today |
| Outstanding Amount | Total unpaid customer balances |
| Monthly Profit | Profit for the current month |

### Quick Actions
Shortcuts to common tasks (create order, add customer, view reports, etc.).

### Charts & widgets
| Widget | Purpose |
|--------|---------|
| Sales Overview | Daily sales trend (area chart) |
| Collection vs Sales | Compare collections and sales by day |
| Route Performance | Active routes — completed, in progress, pending |
| Top Salesmen | Leaderboard with sales vs target |
| Recent Orders | Latest orders with status |
| Notifications | System alerts (low stock, overdue payments, etc.) |
| Business Overview | Customers, products, employees, warehouse stock, expenses |
| Top Selling Products | Best products by quantity and revenue |

---

## All Modules Explained

Below is **every module** in the portal — what it is for, what data it shows, and what you can do.

---

### 1. Sales & Operations

Manage the full sales cycle from quotation to invoice and returns.

| Module | Path | What it does |
|--------|------|--------------|
| **Orders** | `/sales/orders` | Create and track customer orders. See order code, customer, salesman, date, amount, and status (pending/completed/cancelled). Add new orders, edit, view details, delete. |
| **Invoices** | `/sales/invoices` | Manage sales invoices with due dates. Track invoice number, customer, total, due date, and payment status (pending/overdue/completed). |
| **Collections** | `/route-sales/collections` | Record and view payment collections from customers on routes. Track voucher, account, amount, and date. |
| **Quotations** | `/sales/quotations` | Create price quotations before confirming orders. Same workflow as orders with draft/pending status. |
| **Billing** | `/sales/billing` | Handle billing documents linked to sales. Generate and manage bills for customers. |
| **Sales Return** | `/sales/sales-return` | Process product returns from customers. Reverse sales and adjust stock/accounting. |
| **Credit Notes** | `/sales/credit-notes` | Issue credit notes against invoices for discounts, damages, or returns. |
| **Sales Report** | `/sales/sales-report` | Analytical report: order number, customer, salesman, quantity, amount by date. Includes chart, totals row, export. |
| **Route Sales** | `/sales/route-sales` | View route-wise sales — route name, salesman, outlets visited, collections, and route status. |
| **Customer Ledger** | `/sales/customer-ledger` | Account-wise customer transactions — debits, credits, running balance per customer. |
| **Collection Report** | `/sales/collection-report` | Report of all collections received — filter by date, export to Excel/PDF. |

---

### 2. Route Management

For field sales teams — daily routes, visits, GPS, and expenses.

| Module | Path | What it does |
|--------|------|--------------|
| **Route Dashboard** | `/route-sales/dashboard` | Overview of all routes — active routes, completion status, total sales. Route cards with progress bars. |
| **Route Assignment** | `/route-sales/route-assignment` | Assign salesmen to routes and outlets. Set route name, salesman, outlet count. |
| **Today's Routes** | `/route-sales/todays-routes` | See which routes are scheduled for today and their live status. |
| **Weekly Schedule** | `/route-sales/weekly-schedule` | Plan routes for the full week — salesman assignments per day. |
| **Outlet Registration** | `/route-sales/outlet-registration` | Register new retail outlets/shops on a route. Customer details, route, credit limit. |
| **Visit History** | `/route-sales/visit-history` | Log of salesman visits to outlets — date, route, outlets visited, collection. |
| **Route Tracking** | `/route-sales/route-tracking` | Track salesman movement on routes. Live map view, agent status (active/idle/offline). |
| **GPS Tracking** | `/route-sales/gps-tracking` | Real-time GPS positions — salesman, current outlet, speed, battery level. |
| **Route Performance** | `/route-sales/route-performance` | Order performance per route — order value, customer, salesman. Includes order performance panel and totals. |
| **Expenses** | `/route-sales/expenses` | Field expense claims — fuel, travel, meals, maintenance. Expense head, amount, narration, date. |
| **Attendance** | `/route-sales/attendance` | Mark and view salesman attendance for route days. |
| **Customer Visits** | `/route-sales/customer-visits` | Detailed visit records per customer on routes. |
| **Route Sales Report** | `/route-sales/route-sales-report` | Summary report of route-wise sales and collections. |

---

### 3. Accounting

Full double-entry accounting — books, ledgers, vouchers, and statutory reports.

| Module | Path | What it does |
|--------|------|--------------|
| **Transactions** | `/accounting/transactions` | All financial transactions in one list. Voucher, account, debit, credit, balance. |
| **Day Book** | `/accounting/day-book` | Daily summary of all vouchers — every debit and credit for a selected day. |
| **Cash Book** | `/accounting/cash-book` | Cash-only transactions. Track cash in and cash out. |
| **Bank Book** | `/accounting/bank-book` | Bank account transactions — deposits, withdrawals, transfers. |
| **Journal Entries** | `/accounting/journal-entries` | Manual journal vouchers for adjustments and corrections. |
| **Ledger** | `/accounting/ledger` | Chart of accounts — create ledger accounts with sub-group, account head, description, balance. |
| **Trial Balance** | `/accounting/trial-balance` | Trial balance report — total debits vs credits across all accounts. Bar chart of balances. |
| **Profit & Loss** | `/accounting/profit-loss` | Income vs expenses statement. Switch chart type (bar/line/area). Debit/credit totals. |
| **Balance Sheet** | `/accounting/balance-sheet` | Assets, liabilities, and equity snapshot. Donut chart of asset distribution. |
| **Receipt Voucher** | `/accounting/receipt-voucher` | Record money received — account, amount, narration, date. |
| **Payment Voucher** | `/accounting/payment-voucher` | Record money paid out — account, amount, narration, date. |
| **Contra Voucher** | `/accounting/contra-voucher` | Cash-to-bank or bank-to-cash transfers within the company. |
| **Purchase Report** | `/accounting/purchase-report` | Accounting view of purchase transactions. |
| **Sales Report** | `/accounting/sales-report` | Accounting view of sales with quantity and amount totals. |
| **Supplier Settlement** | `/accounting/supplier-settlement` | Settle outstanding balances with suppliers. |
| **Customer Settlement** | `/accounting/customer-settlement` | Settle outstanding balances with customers. |
| **Outstanding Report** | `/accounting/outstanding-report` | List of all pending receivables and payables. |
| **GST Report** | `/accounting/gst-report` | GST breakdown — taxable amount, CGST, SGST, total per party/period. |
| **Tax Summary** | `/accounting/tax-summary` | Consolidated tax summary across all transactions. |

---

### 4. Inventory

Product catalog, stock control, warehouses, and expiry management.

| Module | Path | What it does |
|--------|------|--------------|
| **Product Catalog** | `/inventory/product-catalog` | Master product list — SKU, name, category, brand, stock, MRP, status. Upload product image. Add/edit products. |
| **Categories** | `/inventory/categories` | Product categories for grouping (e.g. Oils, Rice, Beverages). |
| **Brands** | `/inventory/brands` | Brand master — manage all product brands. |
| **Units** | `/inventory/units` | Measurement units (kg, litre, piece, case, etc.). |
| **Warehouses** | `/inventory/warehouse` | Warehouse locations — name, location, stock rooms, total stock. **Includes warehouse transfer panel** to move stock between warehouses. |
| **Stock Allocation** | `/inventory/stock-allocation` | Allocate stock to warehouses by batch. Select batch, see batch stock count, assign quantity. |
| **Stock Transfer** | `/inventory/stock-transfer` | Transfer stock between warehouses or locations. |
| **Stock Adjustment** | `/inventory/stock-adjustment` | Correct stock quantities (damage, loss, recount). |
| **Stock Movement** | `/inventory/stock-movement` | History of all stock in/out movements. |
| **Low Stock** | `/inventory/low-stock` | Products below minimum stock level — highlighted with low_stock status. |
| **Batch Management** | `/inventory/batch-management` | Manage product batches — batch number, batch date, stock count, expiry date. |
| **Expiry Report** | `/inventory/expiry-report` | Products nearing expiry — days remaining, batch, quantity. Totals at bottom. |

---

### 5. Purchase

Buying from suppliers — orders, receipts, returns, and settlements.

| Module | Path | What it does |
|--------|------|--------------|
| **Purchase Orders** | `/purchase/purchase-orders` | Create POs to suppliers — PO number, supplier, date, items, amount, approval status. |
| **Purchases** | `/purchase/purchases` | Record goods received against purchase orders. |
| **Suppliers** | `/purchase/supplier-management` | Supplier master — contact, outstanding, credit terms. |
| **Supplier Settlement** | `/purchase/supplier-settlement` | Pay outstanding amounts to suppliers. |
| **Purchase Returns** | `/purchase/purchase-return` | Return defective or excess goods to suppliers. |
| **Purchase Report** | `/purchase/purchase-report` | Purchase analysis by period, supplier, amount. |

---

### 6. Customer Management

Everything about your retail customers and outlets.

| Module | Path | What it does |
|--------|------|--------------|
| **Customers** | `/customers/customer-list` | Main customer list — code, name, route, credit limit, outstanding, last visit. Customer summary cards at top. |
| **Customer Profiles** | `/customers/customer-profile` | Detailed customer profiles with contact and business info. |
| **Outstanding** | `/customers/outstanding` | Customers with unpaid balances — amount due, overdue status. |
| **Credit Limits** | `/customers/credit-limit` | Set and review credit limits per customer. |
| **Customer Ledger** | `/customers/customer-ledger` | Full account statement per customer — all debits and credits. |
| **Visit History** | `/customers/visit-history` | When salesmen visited each customer — dates and outcomes. |
| **Customer Locations** | `/customers/customer-location` | Map view of customer GPS locations for route planning. |

---

### 7. HR & Payroll

Workforce management for office and field staff.

| Module | Path | What it does |
|--------|------|--------------|
| **Employees** | `/hr/employees` | Employee master — ID, name, department, role, salary, attendance status. Workforce donut chart. |
| **Attendance** | `/hr/attendance` | Daily attendance records — present, absent, half-day. |
| **Payroll** | `/hr/payroll` | Monthly salary processing — gross, deductions, net pay. |
| **Incentives** | `/hr/incentives` | Sales incentives and bonuses for field staff. |
| **Sales Targets** | `/hr/sales-targets` | Set monthly/quarterly sales targets per salesman. |
| **Performance** | `/hr/performance` | Employee performance ratings and KPIs. |
| **Leave Management** | `/hr/leave-management` | Leave requests — apply, approve, reject, track balance. |
| **Roles & Permissions** | `/hr/roles-permissions` | Define HR roles and access permissions. |

---

### 8. Logistics

Delivery operations — vehicles, drivers, dispatch, and compliance.

| Module | Path | What it does |
|--------|------|--------------|
| **Delivery Schedule** | `/logistics/delivery-schedule` | Plan delivery dates and routes for outbound goods. |
| **Dispatch** | `/logistics/dispatch` | Dispatch orders to vehicles — vehicle, driver, customer, status. |
| **Vehicles** | `/logistics/vehicle-management` | Vehicle fleet register — registration, capacity, status. |
| **Drivers** | `/logistics/driver-management` | Driver details — license, contact, assigned vehicle. |
| **Live Tracking** | `/logistics/live-tracking` | Real-time vehicle GPS tracking on map. |
| **E-Way Bills** | `/logistics/e-way-bills` | Generate and manage GST e-way bills for interstate transport. |

---

### 9. Reports

Central reporting hub — cross-module analytics and exports.

| Module | Path | What it does |
|--------|------|--------------|
| **Sales Report** | `/reports/sales-report` | Company-wide sales — orders, customers, salesmen, quantities, amounts. Totals and chart. |
| **Purchase Report** | `/reports/purchase-report` | Purchase spending analysis by supplier and period. |
| **Collection Report** | `/reports/collection-report` | All collections received — by route, salesman, date. |
| **Expense Report** | `/reports/expense-report` | Business expenses breakdown — fuel, travel, office, etc. |
| **Route Report** | `/reports/route-report` | Route efficiency — visits, sales, collections per route. |
| **Product Report** | `/reports/product-report` | Product-wise sales and stock performance. |
| **Employee Report** | `/reports/employee-report` | Employee productivity — sales, attendance, targets. |
| **Profit & Loss** | `/reports/profit-loss` | Financial P&L statement with chart type switcher. |
| **Balance Sheet** | `/reports/balance-sheet` | Assets vs liabilities report. |
| **Cash Flow** | `/reports/cash-flow` | Cash inflow and outflow over time. |
| **GST Report** | `/reports/gst-report` | GST filing summary — taxable value, tax components. |
| **Inventory Report** | `/reports/inventory-report` | Stock valuation and movement summary. |

---

### 10. Administration

System setup, security, and maintenance.

| Module | Path | What it does |
|--------|------|--------------|
| **Settings** | `/admin/system-settings` | General system configuration — company preferences, defaults. |
| **Users & Roles** | `/admin/users` | Create user accounts, assign roles (admin, manager, salesman, etc.). |
| **Permissions** | `/admin/permissions` | Fine-grained access control — which modules each role can access. |
| **Notifications** | `/admin/notifications` | Configure system notification rules and templates. |
| **Company Settings** | `/admin/company-settings` | Company name, address, GSTIN, logo, financial year. |
| **Audit Logs** | `/admin/audit-logs` | Who changed what and when — full activity trail. |
| **Roles** | `/admin/roles` | Role definitions and hierarchy. |
| **AI Assistant Logs** | `/admin/ai-assistant-logs` | History of AI assistant interactions (if enabled). |
| **Backup & Restore** | `/admin/backup-restore` | Database backup and restore operations. |

---

## Record Statuses

Records use color-coded status chips. Common values:

| Status | Meaning | Typical modules |
|--------|---------|-----------------|
| `pending` | Waiting for action | Orders, invoices, routes |
| `completed` | Finished successfully | Orders, routes, deliveries |
| `cancelled` | Cancelled / voided | Orders, purchases |
| `draft` | Saved but not submitted | Quotations, invoices |
| `overdue` | Past due date | Invoices, outstanding |
| `active` | Currently active | Products, employees, GPS |
| `low_stock` | Below minimum stock | Inventory |
| `in_transit` | On the way | Deliveries, routes |
| `delivered` | Delivered to customer | Logistics |
| `approved` | Approved by manager | Purchases, leave |
| `rejected` | Rejected / denied | Leave, purchases |
| `idle` / `offline` | Not moving / no signal | GPS tracking |

---

## Design & Appearance

The portal matches the original **Flutter Route Sales** mobile app design:

| Element | Value |
|---------|-------|
| Primary color | Brown `#5D3820` |
| Accent color | Gold `#F3A008` |
| Background | Warm cream `#F7F3F0` |
| Font | Inter |
| Cards | Rounded corners (16px) |
| Sidebar | Brown gradient with white text |
| Currency | Indian Rupees (₹) — `en-IN` format |

**Dark mode** — click the sun/moon icon in the header. Your preference is saved automatically.

---

## For Developers

### Architecture (short)

The portal uses a **config-driven module system**. One shared `ModuleLayout` component renders all 103 business pages. Each page is defined by a `ModuleConfig` entry in `src/config/modules.ts`.

```
User opens /sales/orders
    → slug: sales-orders
    → getModuleConfig() loads config
    → ModuleLayout renders table, charts, forms
    → useModuleData() calls GET /api/sales-orders
    → MSW returns mock data (dev only)
```

### Tech stack

| Layer | Technology |
|-------|------------|
| UI | React 19, Material UI 9, Framer Motion |
| Language | TypeScript |
| Build | Vite 8 |
| Routing | React Router 7 |
| Data fetching | TanStack Query + Axios |
| State | Zustand (theme, sidebar) |
| Tables | AG Grid Community |
| Charts | ApexCharts |
| Forms | React Hook Form + Zod |
| Mock API | MSW (Mock Service Worker) |
| Export | xlsx, jsPDF |

### Project structure

```
src/
├── api/client.ts           # HTTP client
├── config/modules.ts       # 103 module definitions
├── pages/
│   ├── DashboardPage.tsx   # Home dashboard
│   ├── ModulePage.tsx      # Routes to ModuleLayout
│   └── layouts/ModuleLayout.tsx  # Shared page engine
├── routes/navigation.ts    # Sidebar menu + all paths
├── hooks/useModuleData.ts  # List, filter, CRUD mutations
├── mocks/                  # MSW handlers + data generators
├── components/             # UI, dashboard, charts, module panels
├── theme/                  # Light/dark MUI theme
└── types/module.ts         # TypeScript interfaces
```

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard` | Dashboard data |
| GET | `/api/{slug}` | List with pagination, search, filters |
| POST | `/api/{slug}` | Create record |
| PUT | `/api/{slug}/{id}` | Update record |
| DELETE | `/api/{slug}/{id}` | Delete record |

### Add a new module

1. Add entry in `src/config/modules.ts`:
```ts
['sales-new-page', 'New Page', 'transaction', 'sales'],
```

2. Add menu item in `src/routes/navigation.ts`:
```ts
{ id: 'new-page', label: 'New Page', path: '/sales/new-page' },
```

3. Done — routing, mock API, and UI work automatically.

### Connect real backend

Replace `/api` with your server URL and disable MSW in `src/main.tsx` for production.

### Scripts

```bash
npm run dev      # Start dev server (port 5173)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint check
```

---

## Summary

| Item | Count |
|------|-------|
| Business modules | **103** |
| Sidebar groups | **10** (Dashboard + 9 sections) |
| Layout types | **10** (transaction, report, ledger, inventory, route, hr, customer, logistics, settings, tracking) |
| Languages | English (INR currency) |

**RouteSale Web Portal** gives you one place to run a route-based distribution business — from the salesman on the road to the accountant in the office.

---

*Private project — all rights reserved.*
