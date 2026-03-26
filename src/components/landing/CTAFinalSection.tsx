import { useQuery } from '@tanstack/react-query'
import { getMenus } from '@/api/menus'
import { useInView } from '@/hooks/useInView'
import { useLocale } from '@/hooks/useLocale'

export default function CTAFinalSection() {
  const ref = useInView()
  const { t } = useLocale()
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
      <div ref={ref} className="max-w-2xl mx-auto reveal-stagger">

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
          <span className="text-xs tracking-[0.3em] font-medium" style={{ color: 'var(--gold)' }}>{t.ctaFinal.location}</span>
          <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
        </div>

        <h2 className="font-display text-5xl md:text-6xl font-semibold text-white leading-tight mb-6 whitespace-pre-line">
          {t.ctaFinal.heading}
        </h2>

        <p className="text-base mb-10" style={{ color: 'rgba(240,232,220,0.7)' }}>
          {t.ctaFinal.subtext}
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
              {t.ctaFinal.ctaMenu}
            </a>
          )}
          <a
            href="#contacto"
            className="px-8 py-3 text-sm tracking-widest font-medium transition-colors cursor-pointer"
            style={{ border: '1px solid rgba(240,232,220,0.4)', color: 'rgba(240,232,220,0.85)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold-light)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(240,232,220,0.4)'; e.currentTarget.style.color = 'rgba(240,232,220,0.85)' }}
          >
            {t.ctaFinal.ctaContact}
          </a>
        </div>

      </div>
    </section>
  )
}
