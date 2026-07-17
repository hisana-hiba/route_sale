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
import { QuotationFormPage } from '@/pages/quotations/QuotationFormPage'
import { ProtectedRoute } from './ProtectedRoute'
import { allRoutes } from './navigation'

// Route Management Standalone Pages
import { RouteDashboardPage } from '@/pages/route/RouteDashboardPage'
import { AddRoutePage } from '@/pages/route/AddRoutePage'
import { RouteAssignmentPage } from '@/pages/route/RouteAssignmentPage'
import { TodayRoutePage } from '@/pages/route/TodayRoutePage'
import { WeeklySchedulePage } from '@/pages/route/WeeklySchedulePage'

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
      item.path !== '/route-sales/route-assignment' &&
      item.path !== '/route-sales/todays-routes' &&
      item.path !== '/route-sales/weekly-schedule',
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
        <Route path="route-sales/collections/new" element={<CollectionFormPage />} />
        <Route path="sales/quotations/new" element={<QuotationFormPage />} />
        <Route path="stock-management/stock-transfer/new" element={<CreateStockTransferPage />} />
        <Route path="purchase/purchase-orders/new" element={<CreatePurchaseOrderPage />} />
        
        {/* Route Management stand-alone custom pages */}
        <Route path="route-sales/dashboard" element={<RouteDashboardPage />} />
        <Route path="route-sales/add-route" element={<AddRoutePage />} />
        <Route path="route-sales/route-assignment" element={<RouteAssignmentPage />} />
        <Route path="route-sales/todays-routes" element={<TodayRoutePage />} />
        <Route path="route-sales/weekly-schedule" element={<WeeklySchedulePage />} />

        {moduleRoutes.map((item) => (
          <Route key={item.path} path={item.path!.replace(/^\//, '')} element={<ModulePage />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
