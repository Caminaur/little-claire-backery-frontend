import type { User } from '@/types'

const DEMO_EMAIL = 'admin@cafeteria.test'
const DEMO_PASSWORD = 'admin123'
const DEMO_USER: User = { id: 1, email: DEMO_EMAIL }

export async function login(email: string, password: string) {
  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    localStorage.setItem('demo_user', JSON.stringify(DEMO_USER))
    return
  }
  throw { response: { data: { message: 'Credenciales incorrectas' } } }
}

export async function logout() {
  localStorage.removeItem('demo_user')
}

export async function me(): Promise<User> {
  const stored = localStorage.getItem('demo_user')
  if (!stored) throw new Error('Not authenticated')
  return JSON.parse(stored) as User
}
