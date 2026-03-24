import { useState } from 'react'

const empty = { name: '', email: '', phone: '', type: 'general' as 'general' | 'catering', message: '' }

const inputClass = 'w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors'
const inputStyle = { borderColor: 'var(--border)', backgroundColor: 'var(--card-bg)', color: 'var(--coffee)' }
const labelClass = 'block text-xs tracking-widest font-medium mb-2'

export default function ContactForm() {
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 'form-name': 'contacto', ...form }).toString(),
      })
      setSuccess(true)
      setForm(empty)
    } catch {
      setError('Error al enviar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <section id="contacto" className="py-20 px-6" style={{ backgroundColor: 'var(--bg-alt)' }}>
        <div className="max-w-xl mx-auto text-center p-10" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card-bg)' }}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8" style={{ backgroundColor: 'var(--gold)' }} />
            <span className="text-xs tracking-[0.3em]" style={{ color: 'var(--gold)' }}>MENSAJE ENVIADO</span>
            <div className="h-px w-8" style={{ backgroundColor: 'var(--gold)' }} />
          </div>
          <h3 className="font-display text-3xl font-semibold mb-3" style={{ color: 'var(--coffee)' }}>¡Gracias!</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Nos pondremos en contacto contigo pronto.</p>
          <button onClick={() => setSuccess(false)} className="text-xs tracking-widest underline underline-offset-4" style={{ color: 'var(--gold)' }}>
            Enviar otro mensaje
          </button>
        </div>
      </section>
    )
  }

  return (
    <section id="contacto" className="py-20 px-6" style={{ backgroundColor: 'var(--bg-alt)' }}>
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
            <span className="text-xs tracking-[0.3em] font-medium" style={{ color: 'var(--gold)' }}>CONTACTO</span>
            <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
          </div>
          <h2 className="font-display text-5xl font-semibold" style={{ color: 'var(--coffee)' }}>Escribinos</h2>
          <p className="mt-3 text-sm" style={{ color: 'var(--muted)' }}>
            ¿Tenés alguna pregunta o querés hacer un pedido de catering?
          </p>
        </div>

        <form
          name="contacto"
          data-netlify="true"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <input type="hidden" name="form-name" value="contacto" />
          <div>
            <label className={labelClass} style={{ color: 'var(--muted)' }}>NOMBRE *</label>
            <input required name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass} style={{ color: 'var(--muted)' }}>EMAIL *</label>
            <input required type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass} style={{ color: 'var(--muted)' }}>TELÉFONO *</label>
            <input required name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass} style={{ color: 'var(--muted)' }}>TIPO DE CONSULTA *</label>
            <select name="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'general' | 'catering' })} className={inputClass} style={inputStyle}>
              <option value="general">Consulta general</option>
              <option value="catering">Catering / Pedido especial</option>
            </select>
          </div>
          <div>
            <label className={labelClass} style={{ color: 'var(--muted)' }}>MENSAJE</label>
            <textarea name="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className={inputClass} style={inputStyle} />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm tracking-widest font-medium text-white disabled:opacity-50 transition-colors cursor-pointer"
            style={{ backgroundColor: 'var(--gold)' }}
            onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = 'var(--gold-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--gold)')}
          >
            {loading ? 'ENVIANDO...' : 'ENVIAR MENSAJE'}
          </button>
        </form>
      </div>
    </section>
  )
}
