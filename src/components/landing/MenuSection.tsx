import { useQuery } from '@tanstack/react-query'
import { getMenus } from '@/api/menus'

export default function MenuSection() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['menus', 1],
    queryFn: () => getMenus(1),
  })

  const activeMenus = data?.data.filter((m) => m.is_active) ?? []

  return (
    <section id="menu" className="py-16 px-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nuestro Menú</h2>
      {isLoading && <p className="text-center text-gray-400">Cargando menú...</p>}
      {isError && <p className="text-center text-gray-400">No se pudo cargar el menú.</p>}
      {activeMenus.map((menu) => (
        <div key={menu.id} className="mb-12">
          <h3 className="text-xl font-semibold text-gray-800 border-b border-amber-200 pb-2 mb-4">{menu.name}</h3>
          {menu.description && <p className="text-gray-500 mb-4">{menu.description}</p>}
          {menu.pdf_url ? (
            <a
              href={menu.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2.5 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-sm font-medium transition-colors"
            >
              Ver PDF completo
            </a>
          ) : (
            <p className="text-gray-400 italic text-sm">Menú no disponible</p>
          )}
        </div>
      ))}
      {!isLoading && !isError && activeMenus.length === 0 && (
        <p className="text-center text-gray-400">Próximamente...</p>
      )}
    </section>
  )
}
