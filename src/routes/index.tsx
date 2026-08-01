import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { CustomersPage } from '@/pages/CustomersPage'
import { InvoicesPage } from '@/pages/InvoicesPage'
import { ModulePage } from '@/pages/ModulePage'
import { LoginPage } from '@/pages/LoginPage'
import { NewOrderWizard } from '@/components/flows/NewOrderWizard'
import { SalesReturnWizard } from '@/components/flows/SalesReturnWizard'
import { CreateStockTransferPage } from '@/components/flows/CreateStockTransferPage'
import { CreatePurchaseOrderPage } from '@/components/flows/CreatePurchaseOrderPage'
import { SalesEntryPage } from '@/pages/sales/SalesEntryPage'
import { SalePriceEntryPage } from '@/pages/sales/SalePriceEntryPage'
import { CollectionFormPage } from '@/pages/collections/CollectionFormPage'
import { ExpenseFormPage } from '@/pages/expenses/ExpenseFormPage'
import { VehicleLogFormPage } from '@/pages/logistics/VehicleLogFormPage'
import { QuotationFormPage } from '@/pages/quotations/QuotationFormPage'
import { SalesReturnSettingsPage } from '@/pages/sales/SalesReturnSettingsPage'
import { ProtectedRoute } from './ProtectedRoute'
import { allRoutes } from './navigation'

// Route Management Standalone Pages
import { RouteDashboardPage } from '@/pages/route/RouteDashboardPage'
import { AddRoutePage } from '@/pages/route/AddRoutePage'
import { RouteAssignmentPage } from '@/pages/route/RouteAssignmentPage'
import { TodayRoutePage } from '@/pages/route/TodayRoutePage'
import { WeeklySchedulePage } from '@/pages/route/WeeklySchedulePage'
import { RouteBuilderPage } from '@/pages/route/RouteBuilderPage'
import { RouteHistoryPage } from '@/pages/route/RouteHistoryPage'
import { MyRoutesPage } from '@/pages/route/MyRoutesPage'
import { RouteExecutionPage } from '@/pages/route/RouteExecutionPage'
import { FieldDayFlowPage } from '@/pages/route/FieldDayFlowPage'

// Accounting Standalone Pages
import { CurrentStockPage } from '@/pages/stock/CurrentStockPage'
import { LowStockPage } from '@/pages/stock/LowStockPage'
import { ExpiryReportPage } from '@/pages/stock/ExpiryReportPage'
import { WarehousePage } from '@/pages/stock/WarehousePage'
import { AccountPage } from '@/pages/accounts/AccountPage'
import { TransactionsPage } from '@/pages/accounts/TransactionsPage'
import { PaymentPage } from '@/pages/accounts/PaymentPage'
import { ReceiptPage } from '@/pages/accounts/ReceiptPage'
import { JournalPage } from '@/pages/accounts/JournalPage'
import { ProfitLossPage } from '@/pages/accounts/ProfitLossPage'
import { BalanceSheetPage } from '@/pages/accounts/BalanceSheetPage'
import { SalesTargetsPage } from '@/pages/hr/SalesTargetsPage'
import { IncentivesPage } from '@/pages/hr/IncentivesPage'
import { PayrollPage } from '@/pages/hr/PayrollPage'

export function AppRoutes() {
  const moduleRoutes = allRoutes.filter(
    (item) =>
      item.path &&
      item.path !== '/' &&
      item.path !== '/customers/customer-list' &&
      item.path !== '/sales/invoices' &&
      item.path !== '/sales/list' &&
      item.path !== '/sales/entry' &&
      item.path !== '/sales/sale-price-entry' &&
      item.path !== '/route-sales/dashboard' &&
      item.path !== '/route-sales/route-builder' &&
      item.path !== '/route-sales/route-history' &&
      item.path !== '/route-sales/route-planner' &&
      item.path !== '/route-sales/my-routes' &&
      item.path !== '/route-sales/route-assignment' &&
      item.path !== '/route-sales/todays-routes' &&
      item.path !== '/route-sales/weekly-schedule' &&
      item.path !== '/accounting/accounts' &&
      item.path !== '/accounting/transactions' &&
      item.path !== '/accounting/day-book' &&
      item.path !== '/accounting/cash-book' &&
      item.path !== '/accounting/bank-book' &&
      item.path !== '/accounting/general-ledger' &&
      item.path !== '/accounting/payment' &&
      item.path !== '/accounting/receipt' &&
      item.path !== '/accounting/journal' &&
      item.path !== '/accounting/profit-loss' &&
      item.path !== '/accounting/balance-sheet' &&
      item.path !== '/stock-management/current-stock' &&
      item.path !== '/stock-management/low-stock' &&
      item.path !== '/stock-management/expiry-report' &&
      item.path !== '/stock-management/warehouse' &&
      item.path !== '/hr/payroll' &&
      item.path !== '/hr/incentives' &&
      item.path !== '/hr/sales-targets',
  )

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="customers/customer-list" element={<CustomersPage />} />
        <Route path="sales/list" element={<InvoicesPage />} />
        <Route path="sales/invoices" element={<Navigate to="/sales/list" replace />} />
        <Route path="sales/entry" element={<SalesEntryPage />} />
        <Route path="sales/sale-price-entry" element={<SalePriceEntryPage />} />
        <Route path="sales/orders/new" element={<NewOrderWizard />} />
        <Route path="sales/sales-return/new" element={<SalesReturnWizard />} />
        <Route path="sales/sales-return/settings" element={<SalesReturnSettingsPage />} />
        <Route path="route-sales/collections/new" element={<CollectionFormPage />} />
        <Route path="route-sales/expenses/new" element={<ExpenseFormPage />} />
        <Route path="logistics/vehicle-log/new" element={<VehicleLogFormPage />} />
        <Route path="sales/quotations/new" element={<QuotationFormPage />} />
        <Route path="stock-management/stock-transfer/new" element={<CreateStockTransferPage />} />
        <Route path="purchase/purchase-orders/new" element={<CreatePurchaseOrderPage />} />

        {/* Stock Management stand-alone custom pages */}
        <Route path="stock-management/current-stock" element={<CurrentStockPage />} />
        <Route path="stock-management/low-stock" element={<LowStockPage />} />
        <Route path="stock-management/expiry-report" element={<ExpiryReportPage />} />
        <Route path="stock-management/warehouse" element={<WarehousePage />} />
        
        {/* Route Management stand-alone custom pages */}
        <Route path="route-sales/dashboard" element={<RouteDashboardPage />} />
        <Route path="route-sales/field-day" element={<FieldDayFlowPage />} />
        <Route path="route-sales/add-route" element={<AddRoutePage />} />
        <Route path="route-sales/route-builder" element={<RouteBuilderPage />} />
        <Route path="route-sales/route-history" element={<RouteHistoryPage />} />
        <Route path="route-sales/route-planner" element={<Navigate to="/route-sales/route-history" replace />} />
        <Route path="route-sales/my-routes" element={<MyRoutesPage />} />
        <Route path="route-sales/my-routes/:routeId" element={<RouteExecutionPage />} />
        <Route path="route-sales/route-assignment" element={<RouteAssignmentPage />} />
        <Route path="route-sales/todays-routes" element={<TodayRoutePage />} />
        <Route path="route-sales/weekly-schedule" element={<WeeklySchedulePage />} />

        {/* Accounting stand-alone custom pages */}
        <Route path="accounting/accounts" element={<AccountPage />} />
        <Route path="accounting/transactions" element={<TransactionsPage />} />
        <Route path="accounting/day-book" element={<TransactionsPage defaultTab="day-book" title="Day Book" />} />
        <Route path="accounting/cash-book" element={<TransactionsPage defaultTab="cash-book" title="Cash Book" />} />
        <Route path="accounting/general-ledger" element={<TransactionsPage defaultTab="general-ledger" title="General Ledger" />} />
        <Route path="accounting/bank-book" element={<TransactionsPage defaultTab="bank-book" title="Bank Book" />} />
        <Route path="accounting/payment" element={<PaymentPage />} />
        <Route path="accounting/receipt" element={<ReceiptPage />} />
        <Route path="accounting/journal" element={<JournalPage />} />
        <Route path="accounting/profit-loss" element={<ProfitLossPage />} />
        <Route path="accounting/balance-sheet" element={<BalanceSheetPage />} />

        {/* HR Target → Incentive → Payroll flow */}
        <Route path="hr/sales-targets" element={<SalesTargetsPage />} />
        <Route path="hr/incentives" element={<IncentivesPage />} />
        <Route path="hr/payroll" element={<PayrollPage />} />

        {moduleRoutes.map((item) => (
          <Route key={item.path} path={item.path!.replace(/^\//, '')} element={<ModulePage />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
