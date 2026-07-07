import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { ModulePage } from '@/pages/ModulePage'
import { LoginPage } from '@/pages/LoginPage'
import { NewOrderWizard } from '@/components/flows/NewOrderWizard'
import { SalesReturnWizard } from '@/components/flows/SalesReturnWizard'
import { ProtectedRoute } from './ProtectedRoute'
import { allRoutes } from './navigation'

export function AppRoutes() {
  const moduleRoutes = allRoutes.filter((item) => item.path && item.path !== '/')

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
        <Route path="sales/orders/new" element={<NewOrderWizard />} />
        <Route path="sales/sales-return/new" element={<SalesReturnWizard />} />
        {moduleRoutes.map((item) => (
          <Route key={item.path} path={item.path!.replace(/^\//, '')} element={<ModulePage />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
