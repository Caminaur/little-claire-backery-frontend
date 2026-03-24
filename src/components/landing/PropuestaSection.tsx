const items = [
  {
    title: 'Café',
    text: 'Preparado con cuidado, desde un espresso clásico hasta opciones de especialidad.',
  },
  {
    title: 'Pastelería',
    text: 'Tortas, cheesecakes y dulces de elaboración propia. Siempre frescos, siempre generosos.',
  },
  {
    title: 'Brunch y desayunos',
    text: 'Una propuesta abundante para disfrutar sin apuro, ideal para empezar el día bien.',
  },
  {
    title: 'Para compartir',
    text: 'Opciones pensadas para los encuentros. Porque la mejor mesa es la que se comparte.',
  },
]

export default function PropuestaSection() {
  return (
    <section className="py-24 px-6" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
            <span className="text-xs tracking-[0.3em] font-medium" style={{ color: 'var(--gold)' }}>LO QUE OFRECEMOS</span>
            <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
          </div>
          <h2 className="font-display text-5xl font-semibold" style={{ color: 'var(--coffee)' }}>
            Nuestra propuesta
          </h2>
        </div>

        {/* Intro */}
        <p className="text-center text-base leading-relaxed max-w-2xl mx-auto mb-16" style={{ color: 'var(--muted)' }}>
          En Little Claire Bakery creemos en los sabores honestos, en los platos bien servidos
          y en el placer de compartir. Una carta casera, cuidada y generosa.
        </p>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 gap-px" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--border)' }}>
          {items.map((item) => (
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
