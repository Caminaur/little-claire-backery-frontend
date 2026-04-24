import client, { ensureCsrf } from './client'
import type { EventReservation, PaginatedResponse } from '@/types'

export interface EventReservationPayload {
  name: string
  email: string
  phone: string
  event_date: string
  event_time: string
  guests_count: number
  event_type: 'birthday' | 'corporate' | 'meeting' | 'other'
  notes?: string
}

export async function createEventReservation(payload: EventReservationPayload): Promise<EventReservation> {
  await ensureCsrf()
  const { data } = await client.post<EventReservation>('/api/event-reservations', payload)
  return data
}

export async function getEventReservations(): Promise<PaginatedResponse<EventReservation>> {
  const { data } = await client.get<PaginatedResponse<EventReservation>>('/api/event-reservations')
  return data
}

export async function getEventReservation(id: number): Promise<EventReservation> {
  const { data } = await client.get<EventReservation>(`/api/event-reservations/${id}`)
  return data
}

export async function updateEventReservation(id: number, payload: Partial<EventReservation>): Promise<EventReservation> {
  const { data } = await client.put<EventReservation>(`/api/event-reservations/${id}`, payload)
  return data
}

export async function deleteEventReservation(id: number): Promise<void> {
  await client.delete(`/api/event-reservations/${id}`)
}
