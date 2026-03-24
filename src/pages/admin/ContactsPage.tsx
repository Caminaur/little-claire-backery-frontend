import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getContactRequests, updateContactRequest, deleteContactRequest } from '@/api/contacts'
import type { ContactRequest } from '@/types'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

export default function ContactsPage() {
  const qc = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<ContactRequest | null>(null)
  const [selected, setSelected] = useState<ContactRequest | null>(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['contacts'],
    queryFn: getContactRequests,
    refetchInterval: 20 * 1000,
    refetchIntervalInBackground: false,
  })

  const markReadMutation = useMutation({
    mutationFn: (id: number) => updateContactRequest(id, { is_read: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteContactRequest(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contacts'] }); setDeleteTarget(null) },
  })

  function handleSelect(contact: ContactRequest) {
    setSelected(contact)
    if (!contact.is_read) markReadMutation.mutate(contact.id)
  }

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold mb-6" style={{ color: 'var(--coffee)' }}>Solicitudes de contacto</h1>

      {isLoading ? <p style={{ color: 'var(--muted)' }}>Cargando...</p> : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-700">Error al cargar las solicitudes</p>
          <p className="text-xs text-red-500 mt-1">{(error as Error)?.message ?? 'Error desconocido'}</p>
        </div>
      ) : (
        <div className="flex gap-6 h-[calc(100vh-200px)]">
          <div className="w-80 flex-shrink-0 admin-card rounded-lg overflow-y-auto">
            {(!data || data.length === 0) && (
              <p className="p-4 text-sm" style={{ color: 'var(--subtle)' }}>Sin solicitudes</p>
            )}
            {data?.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleSelect(contact)}
                className="w-full text-left px-4 py-3 transition-colors cursor-pointer"
                style={{
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: selected?.id === contact.id ? 'var(--bg-alt)' : undefined,
                }}
                onMouseEnter={e => {
                  if (selected?.id !== contact.id) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-alt)'
                }}
                onMouseLeave={e => {
                  if (selected?.id !== contact.id) (e.currentTarget as HTMLElement).style.backgroundColor = ''
                }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-medium" style={{ color: contact.is_read ? 'var(--muted)' : 'var(--coffee)' }}>{contact.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${contact.type === 'catering' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {contact.type}
                  </span>
                </div>
                <p className="text-xs truncate" style={{ color: 'var(--subtle)' }}>{contact.email}</p>
                {!contact.is_read && <span className="inline-block w-2 h-2 rounded-full mt-1" style={{ backgroundColor: 'var(--gold)' }} />}
              </button>
            ))}
          </div>

          <div className="flex-1 admin-card rounded-lg p-6 overflow-y-auto overflow-x-hidden min-w-0">
            {selected ? (
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold" style={{ color: 'var(--coffee)' }}>{selected.name}</h2>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>{selected.email} · {selected.phone}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${selected.type === 'catering' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {selected.type}
                    </span>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(selected)}
                    className="text-sm text-red-600 hover:underline cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
                {selected.message ? (
                  <p className="text-sm whitespace-pre-wrap break-words" style={{ color: 'var(--coffee)' }}>{selected.message}</p>
                ) : (
                  <p className="text-sm italic" style={{ color: 'var(--subtle)' }}>Sin mensaje</p>
                )}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--subtle)' }}>Selecciona una solicitud</p>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="¿Eliminar solicitud?"
        description={`Se eliminará la solicitud de "${deleteTarget?.name}".`}
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
