import { useQuery } from '@tanstack/react-query'
import { getPromotions } from '@/api/promotions'
import type { Promotion } from '@/types'

function formatDiscount(promo: Promotion) {
  if (promo.discount_type === 'percentage') return `${promo.discount_value}% OFF`
  return `$${promo.discount_value} OFF`
}

export default function PromotionsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['promotions', 1],
    queryFn: () => getPromotions(1),
  })

  const activePromos = data?.data.filter((p) => p.is_active) ?? []

  if (isLoading || activePromos.length === 0) return null

  return (
    <section className="py-12 px-6 bg-amber-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Promociones</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePromos.map((promo) => (
            <div key={promo.id} className="bg-white rounded-xl border border-amber-200 p-6 shadow-sm">
              <div className="inline-block bg-amber-600 text-white text-sm font-bold px-3 py-1 rounded-full mb-3">
                {formatDiscount(promo)}
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">{promo.title}</h3>
              {promo.description && <p className="text-sm text-gray-500 mb-3">{promo.description}</p>}
              {(promo.starts_at || promo.ends_at) && (
                <p className="text-xs text-gray-400">
                  {promo.starts_at ? promo.starts_at.slice(0, 10) : ''} — {promo.ends_at ? promo.ends_at.slice(0, 10) : 'Sin fecha límite'}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
