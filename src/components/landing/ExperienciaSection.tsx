import { useInView } from '@/hooks/useInView'
import { useLocale } from '@/hooks/useLocale'

export default function ExperienciaSection() {
  const headerRef = useInView()
  const cardsRef = useInView()
  const { t } = useLocale()

  return (
    <section className="py-24 px-6" style={{ backgroundColor: 'var(--bg-alt)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div ref={headerRef} className="text-center mb-16 reveal">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
            <span className="text-xs tracking-[0.3em] font-medium" style={{ color: 'var(--gold)' }}>{t.experiencia.label}</span>
            <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
          </div>
          <h2 className="font-display text-5xl font-semibold" style={{ color: 'var(--coffee)' }}>
            {t.experiencia.heading}
          </h2>
          <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
            {t.experiencia.intro}
          </p>
        </div>

        {/* Cards */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8 reveal-stagger">
          {t.experiencia.cards.map((card) => (
            <div
              key={card.title}
              className="p-8 rounded-sm"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
            >
              <div className="h-px w-8 mb-6" style={{ backgroundColor: 'var(--gold)' }} />
              <h3 className="font-display text-2xl font-semibold mb-3" style={{ color: 'var(--coffee)' }}>
                {card.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                {card.text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
