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
        className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
      >
        Anterior
      </button>
      <span className="text-sm text-gray-600">
        Página {currentPage} de {lastPage}
      </span>
      <button
        disabled={currentPage === lastPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
      >
        Siguiente
      </button>
    </div>
  )
}
