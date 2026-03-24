import { useInView } from '@/hooks/useInView'

const cards = [
  {
    title: 'Ambiente con historia',
    text: 'Una casa antigua, elegante y llena de carácter. Cada rincón tiene algo que contar.',
  },
  {
    title: 'Cocina generosa',
    text: 'Porciones abundantes, sabores honestos. Creemos en el placer de comer bien de verdad.',
  },
  {
    title: 'Hecho en familia',
    text: 'Una propuesta nacida del trabajo cercano y compartido, con el cuidado que solo da lo propio.',
  },
]

export default function ExperienciaSection() {
  const headerRef = useInView()
  const cardsRef = useInView()

  return (
    <section className="py-24 px-6" style={{ backgroundColor: 'var(--bg-alt)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div ref={headerRef} className="text-center mb-16 reveal">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
            <span className="text-xs tracking-[0.3em] font-medium" style={{ color: 'var(--gold)' }}>LA EXPERIENCIA</span>
            <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
          </div>
          <h2 className="font-display text-5xl font-semibold" style={{ color: 'var(--coffee)' }}>
            Little Claire
          </h2>
          <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
            Cada detalle está pensado para que la visita sea más que una pausa.
          </p>
        </div>

        {/* Cards */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8 reveal-stagger">
          {cards.map((card) => (
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
