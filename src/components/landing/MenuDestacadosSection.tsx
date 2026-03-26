import { useQuery } from '@tanstack/react-query'
import { getMenus } from '@/api/menus'
import { useInView } from '@/hooks/useInView'
import { useLocale } from '@/hooks/useLocale'

const imgs = [
  '/Fotos/foto cafe lindo.jpg',
  '/Fotos/fotos comida.jpg',
  '/Fotos/pasteleria-little-claire.jpg',
]

export default function MenuDestacadosSection() {
  const headerRef = useInView()
  const cardsRef = useInView()
  const { t } = useLocale()
  const { data } = useQuery({
    queryKey: ['menus', 1],
    queryFn: () => getMenus(1),
  })

  const pdfUrl = data?.data.find((m) => m.is_active && m.pdf_url)?.pdf_url ?? null

  return (
    <section className="py-24 px-6" style={{ backgroundColor: 'var(--bg-alt)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div ref={headerRef} className="text-center mb-16 reveal">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
            <span className="text-xs tracking-[0.3em] font-medium" style={{ color: 'var(--gold)' }}>{t.menuDestacados.label}</span>
            <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
          </div>
          <h2 className="font-display text-5xl font-semibold" style={{ color: 'var(--coffee)' }}>
            {t.menuDestacados.heading}
          </h2>
          <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
            {t.menuDestacados.intro}
          </p>
        </div>

        {/* Cards */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8 mb-12 reveal-stagger">
          {t.menuDestacados.items.map((item, i) => (
            <div key={item.name} className="group overflow-hidden rounded-sm cursor-pointer" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <div className="overflow-hidden h-56">
                <img
                  src={imgs[i]}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--coffee)' }}>
                  {item.name}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          {pdfUrl ? (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 text-sm tracking-widest font-medium transition-colors cursor-pointer"
              style={{ border: '1px solid var(--gold)', color: 'var(--gold)' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--gold)'; e.currentTarget.style.color = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--gold)' }}
            >
              {t.menuDestacados.ctaMenu}
            </a>
          ) : null}
        </div>

      </div>
    </section>
  )
}
