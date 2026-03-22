import { Navigate, Route, Routes } from 'react-router-dom'
import { type ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

import LandingPage from '@/pages/landing/LandingPage'
import LoginPage from '@/pages/admin/LoginPage'
import AdminLayout from '@/components/admin/Layout'
import DashboardPage from '@/pages/admin/DashboardPage'
import CategoriesPage from '@/pages/admin/CategoriesPage'
import ProductsPage from '@/pages/admin/ProductsPage'
import MenusPage from '@/pages/admin/MenusPage'
import MenuDetailPage from '@/pages/admin/MenuDetailPage'
import PromotionsPage from '@/pages/admin/PromotionsPage'
import ContactsPage from '@/pages/admin/ContactsPage'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="menus" element={<MenusPage />} />
        <Route path="menus/:id" element={<MenuDetailPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="contacts" element={<ContactsPage />} />
      </Route>
    </Routes>
  )
}
