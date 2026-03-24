import { useInView } from '@/hooks/useInView'

export default function HistoriaSection() {
  const ref = useInView()

  return (
    <section id="historia" className="py-24 px-6" style={{ backgroundColor: 'var(--bg)' }}>
      <div ref={ref} className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center reveal-duo">

        {/* Text */}
        <div className="from-left">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8" style={{ backgroundColor: 'var(--gold)' }} />
            <span className="text-xs tracking-[0.3em] font-medium" style={{ color: 'var(--gold)' }}>NUESTRA HISTORIA</span>
          </div>

          <h2 className="font-display text-5xl font-semibold leading-tight mb-6" style={{ color: 'var(--coffee)' }}>
            Una casa con historia,<br />una mesa siempre abierta
          </h2>

          <div className="space-y-4 text-base leading-relaxed" style={{ color: 'var(--muted)' }}>
            <p>
              Little Claire Bakery nació como un proyecto familiar, construido con dedicación,
              trabajo y amor por los encuentros alrededor de una buena mesa.
            </p>
            <p>
              Durante un tiempo, nuestra historia comenzó en Palermo, donde dimos nuestros
              primeros pasos y fuimos formando la esencia de lo que queríamos ofrecer. Más adelante,
              decidimos seguir creciendo y encontramos en Ituzaingó el lugar indicado para
              continuar este camino.
            </p>
            <p>
              Hoy, Little Claire Bakery vive en una casa antigua con un encanto especial, un
              espacio que refleja nuestra identidad: elegante, cálido y pensado para disfrutar
              sin apuro.
            </p>
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
            alt="Little Claire Bakery"
            className="w-full h-[480px] object-cover rounded-sm relative z-10"
          />
        </div>

      </div>
    </section>
  )
}
