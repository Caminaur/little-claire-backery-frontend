import { useState } from 'react'
import { createContactRequest } from '@/api/contacts'
import { ensureCsrf } from '@/api/client'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types'

const empty = { name: '', email: '', phone: '', type: 'general' as 'general' | 'catering', message: '' }

const inputClass = 'w-full border border-gray-300 dark:border-stone-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-stone-800 text-gray-900 dark:text-stone-100 placeholder-gray-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400'
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-stone-300 mb-1'

export default function ContactForm() {
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
      await ensureCsrf()
      await createContactRequest(form)
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
      <section id="contacto" className="py-16 px-6 max-w-xl mx-auto text-center">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-8">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-2">¡Mensaje enviado!</h3>
          <p className="text-green-700 dark:text-green-500 text-sm">Nos pondremos en contacto contigo pronto.</p>
          <button onClick={() => setSuccess(false)} className="mt-4 text-sm text-green-600 dark:text-green-400 underline">Enviar otro mensaje</button>
        </div>
      </section>
    )
  }

  return (
    <section id="contacto" className="py-16 px-6 max-w-xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-stone-100 mb-2 text-center">Contacto</h2>
      <p className="text-gray-500 dark:text-stone-400 text-center mb-8">¿Tienes alguna pregunta o quieres hacer un pedido de catering?</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Nombre *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name[0]}</p>}
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
          {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email[0]}</p>}
        </div>
        <div>
          <label className={labelClass}>Teléfono *</label>
          <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
          {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone[0]}</p>}
        </div>
        <div>
          <label className={labelClass}>Tipo de consulta *</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'general' | 'catering' })} className={inputClass}>
            <option value="general">Consulta general</option>
            <option value="catering">Catering / Pedido especial</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Mensaje</label>
          <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={4} className={inputClass} />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-amber-600 dark:bg-amber-500 text-white rounded-md py-2.5 text-sm font-medium hover:bg-amber-700 dark:hover:bg-amber-600 disabled:opacity-50 transition-colors">
          {loading ? 'Enviando...' : 'Enviar mensaje'}
        </button>
      </form>
    </section>
  )
}
