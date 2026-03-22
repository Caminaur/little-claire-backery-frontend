import { useQuery } from '@tanstack/react-query'
import { getMenus } from '@/api/menus'
import { getMenuCategories, getMenuProducts } from '@/api/menus'
import type { Menu } from '@/types'

function MenuDetail({ menu }: { menu: Menu }) {
  const { data: categories } = useQuery({
    queryKey: ['menu-categories', menu.id],
    queryFn: () => getMenuCategories(menu.id),
  })
  const { data: products } = useQuery({
    queryKey: ['menu-products', menu.id],
    queryFn: () => getMenuProducts(menu.id),
  })

  return (
    <div className="mt-4">
      {categories && categories.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-600 mb-2">Categorías</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span key={cat.id} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">{cat.name}</span>
            ))}
          </div>
        </div>
      )}
      {products && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg border border-amber-100 p-4 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-1">{product.name}</h4>
              {product.description && <p className="text-sm text-gray-500 mb-2">{product.description}</p>}
              {product.variants.map((v) => (
                <div key={v.id} className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">{v.label ?? 'Precio'}</span>
                  <span className="font-medium text-amber-700">${v.price}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

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
          <MenuDetail menu={menu} />
        </div>
      ))}
      {!isLoading && !isError && activeMenus.length === 0 && (
        <p className="text-center text-gray-400">Próximamente...</p>
      )}
    </section>
  )
}
