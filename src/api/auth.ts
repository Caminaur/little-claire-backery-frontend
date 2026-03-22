import client, { ensureCsrf } from './client'
import type { User } from '@/types'

export async function login(email: string, password: string) {
  await ensureCsrf()
  await client.post('/api/admin/login', { email, password })
}

export async function logout() {
  await client.post('/api/admin/logout')
}

export async function me(): Promise<User> {
  const { data } = await client.get<User>('/api/admin/me')
  return data
}
