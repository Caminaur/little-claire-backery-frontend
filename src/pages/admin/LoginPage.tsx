import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    navigate('/admin', { replace: true })
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/admin', { replace: true })
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>
      setError(axiosErr.response?.data?.message ?? 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-sm p-8 admin-card">

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-6" style={{ backgroundColor: 'var(--gold)' }} />
            <span className="text-xs tracking-[0.3em]" style={{ color: 'var(--gold)' }}>ADMIN</span>
            <div className="h-px w-6" style={{ backgroundColor: 'var(--gold)' }} />
          </div>
          <a href="/" className="hover:opacity-75 transition-opacity inline-block">
            <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--coffee)' }}>
              Little Claire Bakery
            </h1>
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="admin-label">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="admin-input w-full px-3 py-2.5 text-sm"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="admin-label">CONTRASEÑA</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="admin-input w-full px-3 py-2.5 text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="admin-btn-primary w-full py-2.5 text-sm tracking-widest font-medium cursor-pointer"
          >
            {loading ? 'INICIANDO...' : 'INICIAR SESIÓN'}
          </button>
        </form>
      </div>
    </div>
  )
}
