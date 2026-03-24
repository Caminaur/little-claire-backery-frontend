import { useQuery } from '@tanstack/react-query'
import { getMenus } from '@/api/menus'

export default function Hero() {
  const { data } = useQuery({
    queryKey: ['menus', 1],
    queryFn: () => getMenus(1),
  })

  const pdfUrl = data?.data.find((m) => m.is_active && m.pdf_url)?.pdf_url ?? null

  return (
    <section className="bg-amber-50 dark:bg-stone-900 py-20 px-6 text-center transition-colors duration-200">
      <h1 className="text-5xl font-bold text-amber-900 dark:text-amber-300 mb-4">Little Claire Bakery</h1>
      <p className="text-xl text-amber-700 dark:text-amber-400 mb-8 max-w-xl mx-auto">
        Café artesanal, repostería y sabores que reconfortan el alma.
      </p>
      {pdfUrl ? (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-amber-600 dark:bg-amber-500 text-white px-8 py-3 rounded-full text-base font-medium hover:bg-amber-700 dark:hover:bg-amber-600 transition-colors"
        >
          Ver menú
        </a>
      ) : (
        <span className="inline-block bg-amber-300 dark:bg-amber-700 text-white px-8 py-3 rounded-full text-base font-medium cursor-not-allowed opacity-60">
          Ver menú
        </span>
      )}
    </section>
  )
}
