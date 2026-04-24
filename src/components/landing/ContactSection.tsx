import { useState } from 'react'
import { createContactRequest } from '@/api/contacts'
import { createEventReservation } from '@/api/reservations'
import { ensureCsrf } from '@/api/client'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types'
import { useInView } from '@/hooks/useInView'
import { useLocale } from '@/hooks/useLocale'
import DatePicker from './DatePicker'
import TimePicker from './TimePicker'

type Tab = 'contact' | 'reservation'

const emptyContact = { name: '', email: '', phone: '', message: '' }
const emptyReservation = {
  name: '', email: '', phone: '',
  event_date: '', event_time: '',
  guests_count: 1,
  event_type: 'birthday' as 'birthday' | 'corporate' | 'meeting' | 'other',
  notes: '',
}

const inputClass = 'w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors'
const inputStyle = { borderColor: 'var(--border)', backgroundColor: 'var(--card-bg)', color: 'var(--coffee)' }
const labelClass = 'block text-xs tracking-widest font-medium mb-2'
const todayISO = new Date().toISOString().split('T')[0]

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-6 py-2.5 text-xs tracking-widest font-medium transition-all duration-200 cursor-pointer"
      style={{
        backgroundColor: active ? 'var(--gold)' : 'transparent',
        color: active ? '#fff' : 'var(--muted)',
        border: `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'var(--gold)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      {children}
    </button>
  )
}

function ContactFormPanel({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useLocale()
  const [form, setForm] = useState(emptyContact)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFieldErrors({})
    try {
      await ensureCsrf()
      await createContactRequest(form)
      onSuccess()
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>
      if (axiosErr.response?.data?.errors) setFieldErrors(axiosErr.response.data.errors)
      else setError(axiosErr.response?.data?.message ?? t.contacto.errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass} style={{ color: 'var(--muted)' }}>{t.contacto.fields.name}</label>
        <input required name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} style={inputStyle} />
        {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name[0]}</p>}
      </div>
      <div>
        <label className={labelClass} style={{ color: 'var(--muted)' }}>{t.contacto.fields.email}</label>
        <input required type="email" name="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} style={inputStyle} />
        {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email[0]}</p>}
      </div>
      <div>
        <label className={labelClass} style={{ color: 'var(--muted)' }}>{t.contacto.fields.phone}</label>
        <input required name="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} style={inputStyle} />
        {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone[0]}</p>}
      </div>
      <div>
        <label className={labelClass} style={{ color: 'var(--muted)' }}>{t.contacto.fields.message}</label>
        <textarea name="message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} className={inputClass} style={inputStyle} />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit" disabled={loading}
        className="w-full py-3 text-sm tracking-widest font-medium text-white disabled:opacity-50 transition-colors cursor-pointer"
        style={{ backgroundColor: 'var(--gold)' }}
        onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = 'var(--gold-hover)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--gold)')}
      >
        {loading ? t.contacto.submitting : t.contacto.submit}
      </button>
    </form>
  )
}

function ReservationFormPanel({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useLocale()
  const r = t.reservas
  const [form, setForm] = useState(emptyReservation)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFieldErrors({})
    try {
      await createEventReservation({ ...form, notes: form.notes || undefined })
      onSuccess()
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>
      if (axiosErr.response?.data?.errors) setFieldErrors(axiosErr.response.data.errors)
      else setError(axiosErr.response?.data?.message ?? r.errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass} style={{ color: 'var(--muted)' }}>{r.fields.name}</label>
        <input required name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} style={inputStyle} />
        {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name[0]}</p>}
      </div>
      <div>
        <label className={labelClass} style={{ color: 'var(--muted)' }}>{r.fields.email}</label>
        <input required type="email" name="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} style={inputStyle} />
        {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email[0]}</p>}
      </div>
      <div>
        <label className={labelClass} style={{ color: 'var(--muted)' }}>{r.fields.phone}</label>
        <input required type="tel" name="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} style={inputStyle} />
        {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone[0]}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={{ color: 'var(--muted)' }}>{r.fields.event_date}</label>
          <DatePicker
            value={form.event_date}
            onChange={v => setForm({ ...form, event_date: v })}
            min={todayISO}
            placeholder={r.fields.event_date_placeholder}
            hasError={!!fieldErrors.event_date}
          />
          {fieldErrors.event_date && <p className="text-xs text-red-500 mt-1">{fieldErrors.event_date[0]}</p>}
        </div>
        <div>
          <label className={labelClass} style={{ color: 'var(--muted)' }}>{r.fields.event_time}</label>
          <TimePicker
            value={form.event_time}
            onChange={v => setForm({ ...form, event_time: v })}
            placeholder={r.fields.event_time_placeholder}
            hasError={!!fieldErrors.event_time}
          />
          {fieldErrors.event_time && <p className="text-xs text-red-500 mt-1">{fieldErrors.event_time[0]}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={{ color: 'var(--muted)' }}>{r.fields.guests_count}</label>
          <input required type="number" name="guests_count" min={1} value={form.guests_count} onChange={e => setForm({ ...form, guests_count: Number(e.target.value) })} className={inputClass} style={inputStyle} />
          {fieldErrors.guests_count && <p className="text-xs text-red-500 mt-1">{fieldErrors.guests_count[0]}</p>}
        </div>
        <div>
          <label className={labelClass} style={{ color: 'var(--muted)' }}>{r.fields.event_type}</label>
          <select required name="event_type" value={form.event_type} onChange={e => setForm({ ...form, event_type: e.target.value as typeof form.event_type })} className={inputClass} style={inputStyle}>
            <option value="birthday">{r.fields.typeOptions.birthday}</option>
            <option value="corporate">{r.fields.typeOptions.corporate}</option>
            <option value="meeting">{r.fields.typeOptions.meeting}</option>
            <option value="other">{r.fields.typeOptions.other}</option>
          </select>
          {fieldErrors.event_type && <p className="text-xs text-red-500 mt-1">{fieldErrors.event_type[0]}</p>}
        </div>
      </div>
      <div>
        <label className={labelClass} style={{ color: 'var(--muted)' }}>{r.fields.notes}</label>
        <textarea name="notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={4} className={inputClass} style={inputStyle} />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit" disabled={loading}
        className="w-full py-3 text-sm tracking-widest font-medium text-white disabled:opacity-50 transition-colors cursor-pointer"
        style={{ backgroundColor: 'var(--gold)' }}
        onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = 'var(--gold-hover)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--gold)')}
      >
        {loading ? r.submitting : r.submit}
      </button>
    </form>
  )
}

export default function ContactSection() {
  const ref = useInView()
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useState<Tab>('contact')
  const [success, setSuccess] = useState(false)

  function switchTab(tab: Tab) {
    setActiveTab(tab)
    setSuccess(false)
  }

  const successMeta = activeTab === 'contact'
    ? { label: t.contacto.successLabel, heading: t.contacto.successHeading, text: t.contacto.successText, reset: t.contacto.successReset }
    : { label: t.reservas.successLabel, heading: t.reservas.successHeading, text: t.reservas.successText, reset: t.reservas.successReset }

  const heading = activeTab === 'contact'
    ? { label: t.contacto.label, heading: t.contacto.heading, intro: t.contacto.intro }
    : { label: t.reservas.label, heading: t.reservas.heading, intro: t.reservas.intro }

  return (
    <section id="contacto" className="py-20 px-6" style={{ backgroundColor: 'var(--bg-alt)' }}>
      <div ref={ref} className="max-w-xl mx-auto reveal-stagger">

        {/* Tab toggle — always visible */}
        <div className="flex justify-center gap-0 mb-10">
          <TabButton active={activeTab === 'reservation'} onClick={() => switchTab('reservation')}>
            {t.reservas.tabLabel}
          </TabButton>
          <TabButton active={activeTab === 'contact'} onClick={() => switchTab('contact')}>
            {t.contacto.tabLabel}
          </TabButton>
        </div>

        {success ? (
          <div key={`success-${activeTab}`} className="form-enter text-center p-10" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card-bg)' }}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-8" style={{ backgroundColor: 'var(--gold)' }} />
              <span className="text-xs tracking-[0.3em]" style={{ color: 'var(--gold)' }}>{successMeta.label}</span>
              <div className="h-px w-8" style={{ backgroundColor: 'var(--gold)' }} />
            </div>
            <h3 className="font-display text-3xl font-semibold mb-3" style={{ color: 'var(--coffee)' }}>{successMeta.heading}</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>{successMeta.text}</p>
            <button onClick={() => setSuccess(false)} className="text-xs tracking-widest underline underline-offset-4" style={{ color: 'var(--gold)' }}>
              {successMeta.reset}
            </button>
          </div>
        ) : (
          <>
            {/* Heading — swaps with the tab */}
            <div key={`heading-${activeTab}`} className="form-enter text-center mb-10">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
                <span className="text-xs tracking-[0.3em] font-medium" style={{ color: 'var(--gold)' }}>{heading.label}</span>
                <div className="h-px w-10" style={{ backgroundColor: 'var(--gold)' }} />
              </div>
              <h2 className="font-display text-5xl font-semibold" style={{ color: 'var(--coffee)' }}>{heading.heading}</h2>
              <p className="mt-3 text-sm" style={{ color: 'var(--muted)' }}>{heading.intro}</p>
            </div>

            {/* Active form — key forces remount + animation on tab switch */}
            <div key={`form-${activeTab}`} className="form-enter">
              {activeTab === 'contact'
                ? <ContactFormPanel onSuccess={() => setSuccess(true)} />
                : <ReservationFormPanel onSuccess={() => setSuccess(true)} />
              }
            </div>
          </>
        )}

      </div>
    </section>
  )
}
