export default function EspacioSection() {
  return (
    <section className="py-24 px-6" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
            <span className="text-xs tracking-[0.3em] font-medium" style={{ color: 'var(--gold)' }}>EL ESPACIO</span>
            <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
          </div>
          <h2 className="font-display text-5xl font-semibold" style={{ color: 'var(--coffee)' }}>
            Un espacio para quedarse
          </h2>
          <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
            La calidez de la casa, su estilo clásico y la atención cercana hacen que cada visita
            tenga algo especial.
          </p>
        </div>

        {/* Gallery — 2 equal + 1 tall */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <img
            src="/Fotos/little claire interior.png"
            alt="Interior Little Claire"
            className="col-span-2 md:col-span-1 md:row-span-2 w-full h-64 md:h-full object-cover rounded-sm cursor-pointer"
            style={{ border: '1px solid var(--border)' }}
          />
          <img
            src="/Fotos/foto cafe lindo.jpg"
            alt="Café"
            className="w-full h-48 object-cover rounded-sm cursor-pointer"
            style={{ border: '1px solid var(--border)' }}
          />
          <img
            src="/Fotos/fotos comida.jpg"
            alt="Comida"
            className="w-full h-48 object-cover rounded-sm cursor-pointer"
            style={{ border: '1px solid var(--border)' }}
          />
        </div>

      </div>
    </section>
  )
}
