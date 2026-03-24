import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-stone-100 mb-2">Dashboard</h1>
      <p className="text-gray-500">Bienvenido, {user?.email}</p>
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Categorías', path: '/admin/categories' },
          { label: 'Productos', path: '/admin/products' },
          { label: 'Menús', path: '/admin/menus' },
          { label: 'Promociones', path: '/admin/promotions' },
          { label: 'Contactos', path: '/admin/contacts' },
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-amber-300 hover:shadow-sm transition-all"
          >
            <span className="text-base font-medium text-gray-900">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
