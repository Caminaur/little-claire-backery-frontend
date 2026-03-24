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
    <div className="flex min-h-screen transition-colors duration-200" style={{ backgroundColor: 'var(--bg)' }}>
      <aside className="w-64 flex flex-col" style={{ backgroundColor: 'var(--card-bg)', borderRight: '1px solid var(--border)' }}>

        {/* Branding */}
        <div className="p-6" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px w-4" style={{ backgroundColor: 'var(--gold)' }} />
            <span className="text-xs tracking-[0.25em]" style={{ color: 'var(--gold)' }}>ADMIN</span>
          </div>
          <h1 className="font-display text-xl font-semibold" style={{ color: 'var(--coffee)' }}>Little Claire</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Panel de administrador</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'active-nav' : 'inactive-nav'}`
              }
              style={({ isActive }) => isActive
                ? { color: 'var(--gold)', backgroundColor: 'var(--bg-alt)' }
                : { color: 'var(--muted)' }
              }
              onMouseEnter={e => {
                if (!(e.currentTarget as HTMLElement).style.color.includes('var(--gold)')) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-alt)'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--coffee)'
                }
              }}
              onMouseLeave={e => {
                if (!(e.currentTarget as HTMLElement).style.color.includes('var(--gold)')) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--muted)'
                }
              }}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={toggle}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors cursor-pointer"
            style={{ color: 'var(--muted)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-alt)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
            {dark ? 'Modo claro' : 'Modo oscuro'}
          </button>
          <p className="text-xs truncate px-3" style={{ color: 'var(--muted)' }}>{user?.email}</p>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer"
            style={{ color: 'var(--muted)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-alt)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
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
