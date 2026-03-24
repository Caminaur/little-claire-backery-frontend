interface Props {
  open: boolean
  title: string
  description?: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  loading?: boolean
}

export default function ConfirmDialog({ open, title, description, onConfirm, onCancel, confirmLabel = 'Eliminar', loading }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 modal-backdrop">
      <div className="admin-card w-full max-w-md p-6 modal-card">
        <h2 className="text-sm font-semibold tracking-wide" style={{ color: 'var(--coffee)' }}>{title}</h2>
        {description && <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>{description}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="admin-btn-secondary px-4 py-2 text-sm font-medium cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? 'Eliminando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
