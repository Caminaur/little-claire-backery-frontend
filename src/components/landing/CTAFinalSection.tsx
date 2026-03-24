import { useQuery } from '@tanstack/react-query'
import { getMenus } from '@/api/menus'

export default function CTAFinalSection() {
  const { data } = useQuery({
    queryKey: ['menus', 1],
    queryFn: () => getMenus(1),
  })

  const pdfUrl = data?.data.find((m) => m.is_active && m.pdf_url)?.pdf_url ?? null

  return (
    <section
      className="py-28 px-6 text-center"
      style={{ backgroundColor: 'var(--cta-bg)' }}
    >
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
          <span className="text-xs tracking-[0.3em] font-medium" style={{ color: 'var(--gold)' }}>ITUZAINGÓ, BUENOS AIRES</span>
          <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
        </div>

        <h2 className="font-display text-5xl md:text-6xl font-semibold text-white leading-tight mb-6">
          Te esperamos en<br />Little Claire Bakery
        </h2>

        <p className="text-base mb-10" style={{ color: 'rgba(240,232,220,0.7)' }}>
          Un café con historia, sabores generosos y un ambiente que invita a volver.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 text-sm tracking-widest font-medium text-white transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--gold)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--gold-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--gold)')}
            >
              VER MENÚ
            </a>
          )}
          <a
            href="#contacto"
            className="px-8 py-3 text-sm tracking-widest font-medium transition-colors cursor-pointer"
            style={{ border: '1px solid rgba(240,232,220,0.4)', color: 'rgba(240,232,220,0.85)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold-light)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(240,232,220,0.4)'; e.currentTarget.style.color = 'rgba(240,232,220,0.85)' }}
          >
            CONTACTO
          </a>
        </div>

      </div>
    </section>
  )
}
