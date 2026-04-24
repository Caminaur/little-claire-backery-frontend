import client from './client'
import type { ContactRequest } from '@/types'

export interface ContactRequestPayload {
  name: string
  email: string
  phone: string
  message?: string
}

export async function createContactRequest(payload: ContactRequestPayload): Promise<ContactRequest> {
  const { data } = await client.post<ContactRequest>('/api/contact-requests', payload)
  return data
}

export async function getContactRequests(): Promise<ContactRequest[]> {
  const { data } = await client.get<ContactRequest[]>('/api/contact-requests')
  return data
}

export async function getContactRequest(id: number): Promise<ContactRequest> {
  const { data } = await client.get<ContactRequest>(`/api/contact-requests/${id}`)
  return data
}

export async function updateContactRequest(id: number, payload: Partial<ContactRequest>): Promise<ContactRequest> {
  const { data } = await client.put<ContactRequest>(`/api/contact-requests/${id}`, payload)
  return data
}

export async function deleteContactRequest(id: number): Promise<void> {
  await client.delete(`/api/contact-requests/${id}`)
}
