import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Product } from '@/types'

interface Props {
  product: Product
  onRemove: (product: Product) => void
}

export default function SortableProductRow({ product, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between px-4 py-2.5 admin-row transition-colors"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="cursor-grab select-none flex-shrink-0"
          style={{ color: 'var(--subtle)' }}
          {...attributes}
          {...listeners}
        >⠿</span>
        <span className="text-sm truncate" style={{ color: 'var(--coffee)' }}>{product.name}</span>
      </div>
      <button
        onClick={() => onRemove(product)}
        className="ml-2 flex-shrink-0 px-2 py-1 text-red-400 hover:text-red-600 text-sm cursor-pointer"
      >×</button>
    </div>
  )
}
