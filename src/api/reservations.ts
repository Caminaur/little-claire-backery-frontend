import { delay } from '@/mock/store'

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

export async function createEventReservation(payload: EventReservationPayload): Promise<void> {
  await delay()
  // Demo mode: simulate a successful submission
  console.log('[demo] reservation submitted', payload)
}
