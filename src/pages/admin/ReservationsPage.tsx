import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEventReservations, updateEventReservation, deleteEventReservation } from '@/api/reservations'
import type { EventReservation } from '@/types'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

const eventTypeLabels: Record<EventReservation['event_type'], string> = {
  birthday: 'Cumpleaños',
  corporate: 'Corporativo',
  meeting: 'Reunión',
  other: 'Otro',
}

const eventTypeColors: Record<EventReservation['event_type'], string> = {
  birthday: 'bg-pink-100 text-pink-700',
  corporate: 'bg-blue-100 text-blue-700',
  meeting: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-600',
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export default function ReservationsPage() {
  const qc = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<EventReservation | null>(null)
  const [selected, setSelected] = useState<EventReservation | null>(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['event-reservations'],
    queryFn: getEventReservations,
    refetchInterval: 20 * 1000,
    refetchIntervalInBackground: false,
  })

  const markReadMutation = useMutation({
    mutationFn: (id: number) => updateEventReservation(id, { is_read: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event-reservations'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEventReservation(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['event-reservations'] }); setDeleteTarget(null) },
  })

  function handleSelect(reservation: EventReservation) {
    setSelected(reservation)
    if (!reservation.is_read) markReadMutation.mutate(reservation.id)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 mt-2">
        {selected && (
          <button
            onClick={() => setSelected(null)}
            className="md:hidden text-sm cursor-pointer"
            style={{ color: 'var(--muted)' }}
          >
            ← Volver
          </button>
        )}
        {!selected && (
          <h1 className="text-2xl font-display font-semibold" style={{ color: 'var(--coffee)' }}>Reservas de eventos</h1>
        )}
        {selected && (
          <h1 className="text-lg font-display font-semibold md:hidden" style={{ color: 'var(--coffee)' }}>{selected.name}</h1>
        )}
        <h1 className="text-2xl font-display font-semibold hidden md:block" style={{ color: 'var(--coffee)' }}>Reservas de eventos</h1>
      </div>

      {isLoading ? <p style={{ color: 'var(--muted)' }}>Cargando...</p> : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-700">Error al cargar las reservas</p>
          <p className="text-xs text-red-500 mt-1">{(error as Error)?.message ?? 'Error desconocido'}</p>
        </div>
      ) : (
        <div className="md:flex md:gap-4 lg:gap-6 md:h-[calc(100vh-200px)]">

          {/* List — hidden on mobile when a reservation is selected */}
          <div className={`${selected ? 'hidden md:block' : 'block'} md:w-56 lg:w-72 md:flex-shrink-0 admin-card rounded-lg overflow-y-auto`}>
            {(!data || data.data.length === 0) && (
              <p className="p-4 text-sm" style={{ color: 'var(--subtle)' }}>Sin reservas</p>
            )}
            {data?.data.map((reservation) => (
              <button
                key={reservation.id}
                onClick={() => handleSelect(reservation)}
                className="w-full text-left px-4 py-3 transition-colors cursor-pointer"
                style={{
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: selected?.id === reservation.id ? 'var(--bg-alt)' : undefined,
                }}
                onMouseEnter={e => {
                  if (selected?.id !== reservation.id) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-alt)'
                }}
                onMouseLeave={e => {
                  if (selected?.id !== reservation.id) (e.currentTarget as HTMLElement).style.backgroundColor = ''
                }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-medium" style={{ color: reservation.is_read ? 'var(--muted)' : 'var(--coffee)' }}>{reservation.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${eventTypeColors[reservation.event_type]}`}>
                    {eventTypeLabels[reservation.event_type]}
                  </span>
                </div>
                <p className="text-xs truncate" style={{ color: 'var(--subtle)' }}>{formatDate(reservation.event_date)}</p>
                {!reservation.is_read && <span className="inline-block w-2 h-2 rounded-full mt-1" style={{ backgroundColor: 'var(--gold)' }} />}
              </button>
            ))}
          </div>

          {/* Detail — hidden on mobile when no reservation is selected */}
          <div className={`${selected ? 'block' : 'hidden md:block'} flex-1 admin-card rounded-lg p-6 overflow-y-auto overflow-x-hidden min-w-0 mt-4 md:mt-0`}>
            {selected ? (
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold" style={{ color: 'var(--coffee)' }}>{selected.name}</h2>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>{selected.email} · {selected.phone}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${eventTypeColors[selected.event_type]}`}>
                      {eventTypeLabels[selected.event_type]}
                    </span>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(selected)}
                    className="text-sm text-red-600 hover:underline cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>

                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs tracking-widest font-medium mb-0.5" style={{ color: 'var(--muted)' }}>FECHA</dt>
                    <dd className="text-sm" style={{ color: 'var(--coffee)' }}>{formatDate(selected.event_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs tracking-widest font-medium mb-0.5" style={{ color: 'var(--muted)' }}>HORA</dt>
                    <dd className="text-sm" style={{ color: 'var(--coffee)' }}>{selected.event_time}</dd>
                  </div>
                  <div>
                    <dt className="text-xs tracking-widest font-medium mb-0.5" style={{ color: 'var(--muted)' }}>INVITADOS</dt>
                    <dd className="text-sm" style={{ color: 'var(--coffee)' }}>{selected.guests_count}</dd>
                  </div>
                  <div>
                    <dt className="text-xs tracking-widest font-medium mb-0.5" style={{ color: 'var(--muted)' }}>TIPO</dt>
                    <dd className="text-sm" style={{ color: 'var(--coffee)' }}>{eventTypeLabels[selected.event_type]}</dd>
                  </div>
                  <div>
                    <dt className="text-xs tracking-widest font-medium mb-0.5" style={{ color: 'var(--muted)' }}>TELÉFONO</dt>
                    <dd className="text-sm" style={{ color: 'var(--coffee)' }}>{selected.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-xs tracking-widest font-medium mb-0.5" style={{ color: 'var(--muted)' }}>EMAIL</dt>
                    <dd className="text-sm" style={{ color: 'var(--coffee)' }}>{selected.email}</dd>
                  </div>
                  {selected.notes ? (
                    <div>
                      <dt className="text-xs tracking-widest font-medium mb-0.5" style={{ color: 'var(--muted)' }}>NOTAS</dt>
                      <dd className="text-sm whitespace-pre-wrap break-words" style={{ color: 'var(--coffee)' }}>{selected.notes}</dd>
                    </div>
                  ) : (
                    <div>
                      <dt className="text-xs tracking-widest font-medium mb-0.5" style={{ color: 'var(--muted)' }}>NOTAS</dt>
                      <dd className="text-sm italic" style={{ color: 'var(--subtle)' }}>Sin notas</dd>
                    </div>
                  )}
                </dl>
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--subtle)' }}>Selecciona una reserva</p>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="¿Eliminar reserva?"
        description={`Se eliminará la reserva de "${deleteTarget?.name}".`}
        onConfirm={() => {
          if (deleteTarget) {
            if (selected?.id === deleteTarget.id) setSelected(null)
            deleteMutation.mutate(deleteTarget.id)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
