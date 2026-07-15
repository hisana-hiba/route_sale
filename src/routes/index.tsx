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
import { ProtectedRoute } from './ProtectedRoute'
import { allRoutes } from './navigation'

export function AppRoutes() {
  const moduleRoutes = allRoutes.filter(
    (item) => item.path && item.path !== '/' && item.path !== '/customers/customer-list' && item.path !== '/sales/invoices',
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
        <Route path="sales/invoices" element={<InvoicesPage />} />
        <Route path="sales/orders/new" element={<NewOrderWizard />} />
        <Route path="sales/sales-return/new" element={<SalesReturnWizard />} />
        <Route path="stock-management/stock-transfer/new" element={<CreateStockTransferPage />} />
        <Route path="purchase/purchase-orders/new" element={<CreatePurchaseOrderPage />} />
        {moduleRoutes.map((item) => (
          <Route key={item.path} path={item.path!.replace(/^\//, '')} element={<ModulePage />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
