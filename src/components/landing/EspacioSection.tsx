import { useState } from 'react'
import { useInView } from '@/hooks/useInView'

const HOMER = '/Fotos/foto broma torta de homero simpson.jpg'

function FlipImage({ src, alt, gridClass }: { src: string; alt: string; gridClass?: string }) {
  const [clicks, setClicks] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle')

  function handleClick() {
    if (flipped || phase !== 'idle') return
    const next = clicks + 1
    setClicks(next)
    if (next >= 5) {
      setPhase('out')
      setTimeout(() => {
        setFlipped(true)
        setPhase('in')
        setTimeout(() => setPhase('idle'), 320)
      }, 300)
    }
  }

  const animClass = phase === 'out' ? 'flip-out' : phase === 'in' ? 'flip-in' : ''

  return (
    <div
      className={gridClass}
      style={{ perspective: '800px', cursor: 'pointer' }}
      onClick={handleClick}
    >
      <img
        src={flipped ? HOMER : src}
        alt={alt}
        className={`w-full h-full object-cover rounded-sm ${animClass}`}
        style={{ border: '1px solid var(--border)', display: 'block' }}
      />
    </div>
  )
}

export default function EspacioSection() {
  const headerRef = useInView()
  const galleryRef = useInView()

  return (
    <section className="py-24 px-6" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div ref={headerRef} className="text-center mb-16 reveal">
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

        {/* Gallery — consistent row heights via gridAutoRows */}
        <div
          ref={galleryRef}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 reveal-stagger"
          style={{ gridAutoRows: '13rem' }}
        >
          <FlipImage
            src="/Fotos/little claire interior.png"
            alt="Interior Little Claire"
            gridClass="col-span-2 md:col-span-1 md:row-span-2"
          />
          <FlipImage
            src="/Fotos/foto cafe lindo.jpg"
            alt="Café"
          />
          <FlipImage
            src="/Fotos/fotos comida.jpg"
            alt="Comida"
          />
        </div>

      </div>
    </section>
  )
}
