import { useInView } from '@/hooks/useInView'
import { useLocale } from '@/hooks/useLocale'

export default function PropuestaSection() {
  const topRef = useInView()
  const gridRef = useInView()
  const { t } = useLocale()

  return (
    <section className="py-24 px-6" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Header + Intro */}
        <div ref={topRef} className="reveal">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
              <span className="text-xs tracking-[0.3em] font-medium" style={{ color: 'var(--gold)' }}>{t.propuesta.label}</span>
              <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
            </div>
            <h2 className="font-display text-5xl font-semibold" style={{ color: 'var(--coffee)' }}>
              {t.propuesta.heading}
            </h2>
          </div>
          <p className="text-center text-base leading-relaxed max-w-2xl mx-auto mb-16" style={{ color: 'var(--muted)' }}>
            {t.propuesta.intro}
          </p>
        </div>

        {/* Grid */}
        <div ref={gridRef} className="grid sm:grid-cols-2 gap-px reveal-stagger" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--border)' }}>
          {t.propuesta.items.map((item) => (
            <div
              key={item.title}
              className="p-10"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <h3 className="font-display text-2xl font-semibold mb-3" style={{ color: 'var(--coffee)' }}>
                {item.title}
              </h3>
              <div className="h-px w-6 mb-4" style={{ backgroundColor: 'var(--gold)' }} />
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
