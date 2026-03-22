import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useDarkMode } from '@/hooks/useDarkMode'

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/categories', label: 'Categorías' },
  { to: '/admin/products', label: 'Productos' },
  { to: '/admin/menus', label: 'Menús' },
  { to: '/admin/promotions', label: 'Promociones' },
  { to: '/admin/contacts', label: 'Contactos' },
]

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  )
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { dark, toggle } = useDarkMode()

  async function handleLogout() {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-stone-950 transition-colors duration-200">
      <aside className="w-64 bg-white dark:bg-stone-900 border-r border-gray-200 dark:border-stone-800 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-stone-800">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-stone-100">Little Claire</h1>
          <p className="text-xs text-gray-500 dark:text-stone-400 mt-1">Panel de administrador</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    : 'text-gray-600 dark:text-stone-400 hover:bg-gray-100 dark:hover:bg-stone-800 hover:text-gray-900 dark:hover:text-stone-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-stone-800 space-y-2">
          <button
            onClick={toggle}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-600 dark:text-stone-400 hover:bg-gray-100 dark:hover:bg-stone-800 transition-colors"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
            {dark ? 'Modo claro' : 'Modo oscuro'}
          </button>
          <p className="text-xs text-gray-500 dark:text-stone-500 truncate px-1">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-600 dark:text-stone-400 hover:bg-gray-100 dark:hover:bg-stone-800 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
