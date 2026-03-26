import type { Category, Product } from '@/types'

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e')
    .replace(/[íìï]/g, 'i').replace(/[óòö]/g, 'o')
    .replace(/[úùü]/g, 'u').replace(/ñ/g, 'n')
}

function fmt(price: string): string {
  const n = parseFloat(price)
  return isNaN(n) ? price : n.toLocaleString('es-AR', { minimumFractionDigits: 0 })
}

type SectionLayout =
  | 'inline_banner'
  | 'sized'
  | 'price_box'
  | 'price_box_desc'
  | 'jugos'
  | 'calientes'
  | 'heladas'
  | 'pasteleria'
  | 'default'

function detectLayout(cat: Category, products: Product[]): SectionLayout {
  if (cat.price_display === 'inline_banner' || cat.is_full_width) return 'inline_banner'

  if (products.length > 0 && products[0].variants.length > 1 && products[0].variants[0].label !== null) {
    return 'sized'
  }

  const catNorm = normalize(cat.name)
  if (cat.price_display === 'auto') {
    if (catNorm.includes('jugos')) return 'jugos'
    if (catNorm.includes('caliente')) return 'calientes'
    if (catNorm.includes('helada')) return 'heladas'
    if (catNorm.includes('pasteleria')) return 'pasteleria'
  }

  const uniquePrices = [...new Set(products.map(p => p.variants[0]?.price ?? '0'))]
  const forceBox = cat.price_display === 'price_box'
  const autoBox = cat.price_display === 'auto' && uniquePrices.length === 1 && products.length >= 4

  if (forceBox || autoBox) {
    return products.some(p => p.description) ? 'price_box_desc' : 'price_box'
  }

  return 'default'
}

// ── Section renderers ────────────────────────────────────────────────────────

const PAPER = '#fbf8f1'
const GOLD = '#b98d2d'
const MUTED = '#676055'
const INK = '#171717'
const TEAL = '#1d5864'

const sectionStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid #e8dfc8',
}

const titleStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  color: '#8d6320',
  marginBottom: 6,
  textTransform: 'uppercase',
}

const itemRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: 8,
  marginBottom: 3,
}

const itemNameStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  fontWeight: 700,
  color: INK,
}

const itemDescStyle: React.CSSProperties = {
  fontSize: '0.62rem',
  color: TEAL,
  fontWeight: 600,
}

const priceStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  fontWeight: 700,
  color: INK,
  flexShrink: 0,
}

function SectionTitle({ cat }: { cat: Category }) {
  return (
    <div style={titleStyle}>
      {cat.name}
      {cat.description && (
        <span style={{ fontWeight: 400, fontSize: '0.65rem', color: MUTED, marginLeft: 6, textTransform: 'none' }}>
          ({cat.description})
        </span>
      )}
    </div>
  )
}

function InlineBannerSection({ cat, products }: { cat: Category; products: Product[] }) {
  return (
    <div style={sectionStyle}>
      <SectionTitle cat={cat} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {products.map(p => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '4px 8px',
              background: 'rgba(185,141,45,0.08)',
              borderLeft: `2px solid ${GOLD}`,
            }}
          >
            <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>{p.name}</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: GOLD }}>
              $ {fmt(p.variants[0]?.price ?? '0')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SizedSection({ cat, products }: { cat: Category; products: Product[] }) {
  return (
    <div style={sectionStyle}>
      <SectionTitle cat={cat} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {products.map(p => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={itemNameStyle}>{p.name}</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
              {p.variants.filter(v => v.is_active).map(v => (
                <span key={v.id} style={{ fontSize: '0.62rem', color: MUTED }}>
                  {v.label} <strong style={{ color: INK }}>${fmt(v.price)}</strong>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PriceBoxSection({ cat, products, withDesc }: { cat: Category; products: Product[]; withDesc: boolean }) {
  const price = products[0]?.variants[0]?.price ?? '0'
  const label = normalize(cat.name).includes('bebida') ? 'TODAS' : 'TODOS'

  return (
    <div style={sectionStyle}>
      <SectionTitle cat={cat} />
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: withDesc ? 6 : 3 }}>
          {products.map(p => (
            <div key={p.id}>
              <div style={itemNameStyle}>{p.name}</div>
              {withDesc && p.description && <div style={itemDescStyle}>{p.description}</div>}
            </div>
          ))}
        </div>
        <div style={{
          flexShrink: 0,
          width: 64,
          borderLeft: `2px solid ${GOLD}`,
          borderRight: `2px solid ${GOLD}`,
          padding: '6px 8px',
          textAlign: 'center',
          color: '#8d6320',
        }}>
          <div style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.05em' }}>{label}</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 2 }}>$ {fmt(price)}</div>
        </div>
      </div>
    </div>
  )
}

function JugosSection({ cat, products }: { cat: Category; products: Product[] }) {
  const licuadoNorm = (name: string) => normalize(name).includes('licuado')
  const licuado = products.find(p => licuadoNorm(p.name))
  const main = products.filter(p => !licuadoNorm(p.name))
  const half = Math.ceil(main.length / 2)

  return (
    <div style={sectionStyle}>
      <SectionTitle cat={cat} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: licuado ? 6 : 0 }}>
        {[main.slice(0, half), main.slice(half)].map((col, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {col.map(p => (
              <div key={p.id} style={itemRowStyle}>
                <span style={itemNameStyle}>{p.name}</span>
                <span style={priceStyle}>$ {fmt(p.variants[0]?.price ?? '0')}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      {licuado && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '4px 8px',
          background: 'rgba(185,141,45,0.08)',
          borderLeft: `2px solid ${GOLD}`,
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>{licuado.name}</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: GOLD }}>
            $ {fmt(licuado.variants[0]?.price ?? '0')}
          </span>
        </div>
      )}
    </div>
  )
}

function CalientesSection({ cat, products }: { cat: Category; products: Product[] }) {
  return (
    <div style={sectionStyle}>
      <SectionTitle cat={cat} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
        {products.map(p => (
          <div key={p.id} style={{ fontSize: '0.68rem' }}>
            <div style={{ fontWeight: 700 }}>{p.name}</div>
            <div style={{ color: MUTED }}>$ {fmt(p.variants[0]?.price ?? '0')}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HeladasSection({ cat, products }: { cat: Category; products: Product[] }) {
  return (
    <div style={sectionStyle}>
      <SectionTitle cat={cat} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {products.map(p => (
          <div key={p.id} style={itemRowStyle}>
            <span style={itemNameStyle}>{p.name}</span>
            <span style={priceStyle}>$ {fmt(p.variants[0]?.price ?? '0')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PasteleriaSection({ cat, products }: { cat: Category; products: Product[] }) {
  return (
    <div style={sectionStyle}>
      <SectionTitle cat={cat} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {products.map(p => (
          <div key={p.id}>
            <div style={itemNameStyle}>{p.name}</div>
            {p.description && <div style={itemDescStyle}>{p.description}</div>}
            <div style={{ fontSize: '0.65rem', color: GOLD, marginTop: 2 }}>$ {fmt(p.variants[0]?.price ?? '0')}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DefaultSection({ cat, products }: { cat: Category; products: Product[] }) {
  return (
    <div style={sectionStyle}>
      <SectionTitle cat={cat} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {products.map(p => (
          <div key={p.id}>
            <div style={itemRowStyle}>
              <span style={itemNameStyle}>{p.name}</span>
              <span style={priceStyle}>$ {fmt(p.variants[0]?.price ?? '0')}</span>
            </div>
            {p.description && <div style={itemDescStyle}>{p.description}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewSection({ cat, products }: { cat: Category; products: Product[] }) {
  const layout = detectLayout(cat, products)

  switch (layout) {
    case 'inline_banner': return <InlineBannerSection cat={cat} products={products} />
    case 'sized':         return <SizedSection cat={cat} products={products} />
    case 'price_box':     return <PriceBoxSection cat={cat} products={products} withDesc={false} />
    case 'price_box_desc':return <PriceBoxSection cat={cat} products={products} withDesc={true} />
    case 'jugos':         return <JugosSection cat={cat} products={products} />
    case 'calientes':     return <CalientesSection cat={cat} products={products} />
    case 'heladas':       return <HeladasSection cat={cat} products={products} />
    case 'pasteleria':    return <PasteleriaSection cat={cat} products={products} />
    default:              return <DefaultSection cat={cat} products={products} />
  }
}

// ── Main component ───────────────────────────────────────────────────────────

interface Props {
  categories: Category[]
  productsByCategory: Map<number, Product[]>
}

const PAGE_SLICES: [number, number | undefined][] = [
  [0, 3],
  [3, 8],
  [8, undefined],
]

export default function MenuPreview({ categories, productsByCategory }: Props) {
  const pages = PAGE_SLICES.map(([start, end]) =>
    end !== undefined ? categories.slice(start, end) : categories.slice(start)
  )

  const hasContent = pages.some(p => p.length > 0)

  if (!hasContent) {
    return (
      <div className="p-6 text-center text-sm italic" style={{ color: 'var(--subtle)' }}>
        Sin categorías asignadas
      </div>
    )
  }

  return (
    <div className="p-4 space-y-5">
      <p className="text-xs tracking-widest font-medium" style={{ color: 'var(--muted)' }}>
        PREVIEW DEL MENÚ
      </p>

      {pages.map((pageCats, pageIndex) => {
        if (pageCats.length === 0) return null
        return (
          <div key={pageIndex}>
            {/* Page separator */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--subtle)' }}>
                Página {pageIndex + 1}
              </span>
              <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
            </div>

            {/* Page card */}
            <div style={{ background: PAPER, border: `1px solid #ddc790`, borderRadius: 6, overflow: 'hidden' }}>
              {/* Mini logo header */}
              <div style={{ borderBottom: `1px solid #e8dfc8`, padding: '6px 14px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: GOLD, fontWeight: 700 }}>
                  {pageIndex === 0 ? 'MENÚ · LITTLE CLAIRE BAKERY' : 'LITTLE CLAIRE BAKERY'}
                </span>
              </div>

              {pageCats.map((cat) => {
                const products = productsByCategory.get(cat.id) ?? []
                return <PreviewSection key={cat.id} cat={cat} products={products} />
              })}
            </div>
          </div>
        )
      })}

      <p className="text-xs text-center italic pb-2" style={{ color: 'var(--subtle)' }}>
        Vista aproximada — el PDF final puede diferir en detalle
      </p>
    </div>
  )
}
