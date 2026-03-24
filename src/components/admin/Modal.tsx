import { type ReactNode } from 'react'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export default function Modal({ open, title, onClose, children }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 modal-backdrop">
      <div className="admin-card w-full mx-4 max-w-lg max-h-[90vh] flex flex-col modal-card">
        <div className="flex items-center justify-between px-6 py-4 admin-divide">
          <h2 className="text-sm font-semibold tracking-wide" style={{ color: 'var(--coffee)' }}>{title}</h2>
          <button onClick={onClose} className="text-xl leading-none cursor-pointer" style={{ color: 'var(--muted)' }}>&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}
