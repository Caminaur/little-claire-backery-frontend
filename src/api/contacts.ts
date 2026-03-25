import type { ContactRequest } from '@/types'
import { mockContacts, delay } from '@/mock/store'

export interface ContactRequestPayload {
  name: string
  email: string
  phone: string
  type: 'general' | 'catering'
  message?: string
}

export async function createContactRequest(payload: ContactRequestPayload): Promise<ContactRequest> {
  await delay()
  // In demo mode, just return a fake response — contact form on landing still "works"
  return {
    id: Date.now(),
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    message: payload.message ?? null,
    type: payload.type,
    is_read: false,
  }
}

export async function getContactRequests(): Promise<ContactRequest[]> {
  await delay()
  return mockContacts.getAll()
}

export async function getContactRequest(id: number): Promise<ContactRequest> {
  await delay()
  return mockContacts.getById(id)
}

export async function updateContactRequest(id: number, payload: Partial<ContactRequest>): Promise<ContactRequest> {
  await delay()
  return mockContacts.update(id, payload)
}

export async function deleteContactRequest(id: number): Promise<void> {
  await delay()
  mockContacts.delete(id)
}
