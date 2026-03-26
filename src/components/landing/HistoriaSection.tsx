import { useInView } from '@/hooks/useInView'
import { useLocale } from '@/hooks/useLocale'

export default function HistoriaSection() {
  const ref = useInView()
  const { t } = useLocale()

  return (
    <section id="historia" className="py-24 px-6" style={{ backgroundColor: 'var(--bg)' }}>
      <div ref={ref} className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center reveal-duo">

        {/* Text */}
        <div className="from-left">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8" style={{ backgroundColor: 'var(--gold)' }} />
            <span className="text-xs tracking-[0.3em] font-medium" style={{ color: 'var(--gold)' }}>{t.historia.label}</span>
          </div>

          <h2 className="font-display text-5xl font-semibold leading-tight mb-6 whitespace-pre-line" style={{ color: 'var(--coffee)' }}>
            {t.historia.heading}
          </h2>

          <div className="space-y-4 text-base leading-relaxed" style={{ color: 'var(--muted)' }}>
            <p>{t.historia.p1}</p>
            <p>{t.historia.p2}</p>
            <p>{t.historia.p3}</p>
          </div>
        </div>

        {/* Image */}
        <div className="relative from-right">
          <div
            className="absolute -inset-3 rounded-sm opacity-30"
            style={{ border: '1px solid var(--gold)' }}
          />
          <img
            src="/Fotos/pasteleria-little-claire.jpg"
            alt={t.historia.imgAlt}
            className="w-full h-[480px] object-cover rounded-sm relative z-10"
          />
        </div>

      </div>
    </section>
  )
}
