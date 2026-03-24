import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getMenus } from '@/api/menus'

export default function Hero() {
  const { data } = useQuery({
    queryKey: ['menus', 1],
    queryFn: () => getMenus(1),
  })

  const pdfUrl = data?.data.find((m) => m.is_active && m.pdf_url)?.pdf_url ?? null

  const navigate = useNavigate()
  const [tapCount, setTapCount] = useState(0)
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleTitleTap() {
    setTapCount(prev => {
      const next = prev + 1
      if (tapTimer.current) clearTimeout(tapTimer.current)
      if (next >= 3) {
        navigate('/admin/login')
        return 0
      }
      tapTimer.current = setTimeout(() => setTapCount(0), 600)
      return next
    })
  }

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: "url('/Fotos/little claire interior.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Warm dark overlay */}
      <div className="absolute inset-0 bg-stone-950/55 dark:bg-stone-950/70" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto hero-animate">

        {/* Top ornament */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-16" style={{ backgroundColor: 'var(--gold)' }} />
          <span className="text-xs tracking-[0.35em] font-medium text-stone-300">CAFÉ · PASTELERÍA</span>
          <div className="h-px w-16" style={{ backgroundColor: 'var(--gold)' }} />
        </div>

        <h1
          className="font-display text-6xl md:text-8xl font-semibold text-white leading-tight mb-4 select-none"
          onClick={handleTitleTap}
        >
          Little Claire Bakery
        </h1>

        <p className="font-display text-xl md:text-2xl italic font-normal text-stone-200 mb-8">
          Sabores generosos, momentos que invitan a quedarse
        </p>

        {/* Gold divider */}
        <div className="flex items-center justify-center mb-10">
          <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
          <span className="mx-3 text-base" style={{ color: 'var(--gold)' }}>✦</span>
          <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {pdfUrl ? (
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
          ) : (
            <span className="px-8 py-3 text-sm tracking-widest font-medium text-white cursor-not-allowed opacity-50"
              style={{ backgroundColor: 'var(--gold)' }}>
              VER MENÚ
            </span>
          )}
          <a
            href="#historia"
            className="px-8 py-3 text-sm tracking-widest font-medium text-white border border-white/50 hover:border-[var(--gold)] transition-colors cursor-pointer"
            style={{ '--hover-color': 'var(--gold)' } as React.CSSProperties}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold-light)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = 'white' }}
          >
            NUESTRA HISTORIA
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="w-px h-10 bg-white/25" />
      </div>
    </section>
  )
}
