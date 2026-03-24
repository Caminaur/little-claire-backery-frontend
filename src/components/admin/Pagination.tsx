interface Props {
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, lastPage, onPageChange }: Props) {
  if (lastPage <= 1) return null

  return (
    <div className="flex items-center gap-2 mt-4">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="admin-btn-secondary px-3 py-1 text-sm rounded disabled:opacity-50 cursor-pointer"
      >
        Anterior
      </button>
      <span className="text-sm" style={{ color: 'var(--muted)' }}>
        Página {currentPage} de {lastPage}
      </span>
      <button
        disabled={currentPage === lastPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="admin-btn-secondary px-3 py-1 text-sm rounded disabled:opacity-50 cursor-pointer"
      >
        Siguiente
      </button>
    </div>
  )
}
