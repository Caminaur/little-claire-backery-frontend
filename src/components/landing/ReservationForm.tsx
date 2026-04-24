import { useState } from 'react'
import { createEventReservation } from '@/api/reservations'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types'
import { useInView } from '@/hooks/useInView'

const empty = {
  name: '',
  email: '',
  phone: '',
  event_date: '',
  event_time: '',
  guests_count: 1,
  event_type: 'birthday' as 'birthday' | 'corporate' | 'meeting' | 'other',
  notes: '',
}

const inputClass = 'w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors'
const inputStyle = { borderColor: 'var(--border)', backgroundColor: 'var(--card-bg)', color: 'var(--coffee)' }
const labelClass = 'block text-xs tracking-widest font-medium mb-2'

const todayISO = new Date().toISOString().split('T')[0]

export default function ReservationForm() {
  const ref = useInView()
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFieldErrors({})
    try {
      await createEventReservation({
        ...form,
        notes: form.notes || undefined,
      })
      setSuccess(true)
      setForm(empty)
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>
      if (axiosErr.response?.data?.errors) {
        setFieldErrors(axiosErr.response.data.errors)
      } else {
        setError(axiosErr.response?.data?.message ?? 'Error al enviar. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <section id="reservas" className="py-20 px-6" style={{ backgroundColor: 'var(--bg-alt)' }}>
        <div className="max-w-xl mx-auto text-center p-10" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card-bg)' }}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8" style={{ backgroundColor: 'var(--gold)' }} />
            <span className="text-xs tracking-[0.3em]" style={{ color: 'var(--gold)' }}>SOLICITUD ENVIADA</span>
            <div className="h-px w-8" style={{ backgroundColor: 'var(--gold)' }} />
          </div>
          <h3 className="font-display text-3xl font-semibold mb-3" style={{ color: 'var(--coffee)' }}>¡Gracias!</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Nos pondremos en contacto contigo para confirmar tu reserva.</p>
          <button onClick={() => setSuccess(false)} className="text-xs tracking-widest underline underline-offset-4" style={{ color: 'var(--gold)' }}>
            Enviar otra solicitud
          </button>
        </div>
      </section>
    )
  }

  return (
    <section id="reservas" className="py-20 px-6" style={{ backgroundColor: 'var(--bg-alt)' }}>
      <div ref={ref} className="max-w-xl mx-auto reveal-stagger">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
            <span className="text-xs tracking-[0.3em] font-medium" style={{ color: 'var(--gold)' }}>RESERVAS</span>
            <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
          </div>
          <h2 className="font-display text-5xl font-semibold" style={{ color: 'var(--coffee)' }}>Reservá tu evento</h2>
          <p className="mt-3 text-sm" style={{ color: 'var(--muted)' }}>Completá el formulario y nos pondremos en contacto para coordinar los detalles.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass} style={{ color: 'var(--muted)' }}>NOMBRE *</label>
            <input required name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} style={inputStyle} />
            {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name[0]}</p>}
          </div>
          <div>
            <label className={labelClass} style={{ color: 'var(--muted)' }}>EMAIL *</label>
            <input required type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} style={inputStyle} />
            {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email[0]}</p>}
          </div>
          <div>
            <label className={labelClass} style={{ color: 'var(--muted)' }}>TELÉFONO *</label>
            <input required type="tel" name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} style={inputStyle} />
            {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone[0]}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={{ color: 'var(--muted)' }}>FECHA DEL EVENTO *</label>
              <input required type="date" name="event_date" min={todayISO} value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className={inputClass} style={inputStyle} />
              {fieldErrors.event_date && <p className="text-xs text-red-500 mt-1">{fieldErrors.event_date[0]}</p>}
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--muted)' }}>HORA *</label>
              <input required type="time" name="event_time" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} className={inputClass} style={inputStyle} />
              {fieldErrors.event_time && <p className="text-xs text-red-500 mt-1">{fieldErrors.event_time[0]}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={{ color: 'var(--muted)' }}>CANTIDAD DE INVITADOS *</label>
              <input required type="number" name="guests_count" min={1} value={form.guests_count} onChange={(e) => setForm({ ...form, guests_count: Number(e.target.value) })} className={inputClass} style={inputStyle} />
              {fieldErrors.guests_count && <p className="text-xs text-red-500 mt-1">{fieldErrors.guests_count[0]}</p>}
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--muted)' }}>TIPO DE EVENTO *</label>
              <select required name="event_type" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value as typeof form.event_type })} className={inputClass} style={inputStyle}>
                <option value="birthday">Cumpleaños</option>
                <option value="corporate">Corporativo</option>
                <option value="meeting">Reunión</option>
                <option value="other">Otro</option>
              </select>
              {fieldErrors.event_type && <p className="text-xs text-red-500 mt-1">{fieldErrors.event_type[0]}</p>}
            </div>
          </div>
          <div>
            <label className={labelClass} style={{ color: 'var(--muted)' }}>NOTAS</label>
            <textarea name="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} className={inputClass} style={inputStyle} />
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
            {loading ? 'ENVIANDO...' : 'Enviar solicitud'}
          </button>
        </form>
      </div>
    </section>
  )
}
