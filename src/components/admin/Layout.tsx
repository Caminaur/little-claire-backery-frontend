import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useDarkMode } from '@/hooks/useDarkMode'

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/categories', label: 'Categorías' },
  { to: '/admin/products', label: 'Productos' },
  { to: '/admin/menus', label: 'Menús' },
  { to: '/admin/promotions', label: 'Promociones' },
  { to: '/admin/contacts', label: 'Contactos' },
  { to: '/admin/reservations', label: 'Reservas' },
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

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  )
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { dark, toggle } = useDarkMode()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/admin/login')
  }

  function closeNav() {
    setSidebarOpen(false)
  }

  return (
    <div className="flex min-h-screen transition-colors duration-200" style={{ backgroundColor: 'var(--bg)' }}>

      {/* Mobile top bar */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 h-14"
        style={{ backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--border)' }}
      >
        <button onClick={() => setSidebarOpen(true)} className="cursor-pointer" style={{ color: 'var(--muted)' }}>
          <MenuIcon />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-px w-3 shrink-0" style={{ backgroundColor: 'var(--gold)' }} />
          <span className="text-xs tracking-[0.25em] shrink-0" style={{ color: 'var(--gold)' }}>ADMIN</span>
          <span className="text-xs shrink-0" style={{ color: 'var(--subtle)' }}>·</span>
          <span className="font-display text-sm font-semibold truncate" style={{ color: 'var(--coffee)' }}>Little Claire</span>
        </div>
      </header>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={closeNav}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: 'var(--card-bg)', borderRight: '1px solid var(--border)' }}
      >
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
              onClick={closeNav}
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

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-14 p-4 md:px-8 md:py-10 min-w-0">
        <div key={location.pathname} className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
