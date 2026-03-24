import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-1 mt-2" style={{ color: 'var(--coffee)' }}>Dashboard</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>Bienvenido, {user?.email}</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
            className="admin-card block p-6 transition-colors cursor-pointer"
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--coffee)' }}>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
