import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import type { Category, Product } from '@/types'
import SortableProductRow from './SortableProductRow'

interface Props {
  category: Category
  products: Product[]
  availableProducts: Product[]
  addProdId: number
  isAddingProd: boolean
  onAddProdChange: (catId: number, prodId: number) => void
  onAddProd: (catId: number) => void
  onRemoveCat: (cat: Category) => void
  onRemoveProd: (prod: Product) => void
  onProductReorder: (catId: number, reordered: Product[]) => void
  onDisplayChange: (catId: number, field: 'price_display' | 'is_full_width', value: string | boolean) => void
}

export default function SortableCategoryBlock({
  category, products, availableProducts, addProdId, isAddingProd,
  onAddProdChange, onAddProd, onRemoveCat, onRemoveProd,
  onProductReorder, onDisplayChange,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id })
  const sensors = useSensors(useSensor(PointerSensor))

  const blockStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
    position: 'relative',
  }

  function handleProductDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = products.findIndex(p => p.id === active.id)
    const newIndex = products.findIndex(p => p.id === over.id)
    onProductReorder(category.id, arrayMove(products, oldIndex, newIndex))
  }

  return (
    <div ref={setNodeRef} style={blockStyle} className="admin-card rounded-lg overflow-hidden">
      {/* Category header */}
      <div
        className="px-4 py-3"
        style={{ backgroundColor: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="cursor-grab select-none flex-shrink-0 text-base"
              style={{ color: 'var(--subtle)' }}
              {...attributes}
              {...listeners}
            >⠿</span>
            <h3 className="font-medium truncate" style={{ color: 'var(--gold)' }}>{category.name}</h3>
          </div>
          <button
            onClick={() => onRemoveCat(category)}
            className="flex-shrink-0 px-2 py-1 text-red-400 hover:text-red-600 cursor-pointer"
          >×</button>
        </div>

        {/* Layout controls */}
        <div className="flex flex-wrap items-center gap-3 mt-2 ml-6">
          <select
            value={category.price_display}
            onChange={(e) => onDisplayChange(category.id, 'price_display', e.target.value)}
            className="admin-input rounded px-2 py-1 text-xs cursor-pointer"
          >
            <option value="auto">Layout: Automático</option>
            <option value="price_box">Precio agrupado</option>
            <option value="inline_banner">Banner ancho completo</option>
          </select>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none" style={{ color: 'var(--muted)' }}>
            <input
              type="checkbox"
              checked={category.is_full_width}
              onChange={(e) => onDisplayChange(category.id, 'is_full_width', e.target.checked)}
            />
            Ancho completo
          </label>
        </div>
      </div>

      {/* Products */}
      <div className="divide-y divide-[var(--border)]">
        {products.length === 0 ? (
          <p className="px-4 py-3 text-sm italic" style={{ color: 'var(--subtle)' }}>Sin productos en esta categoría</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleProductDragEnd}>
            <SortableContext items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
              {products.map(prod => (
                <SortableProductRow key={prod.id} product={prod} onRemove={onRemoveProd} />
              ))}
            </SortableContext>
          </DndContext>
        )}

        {/* Add product */}
        {availableProducts.length > 0 && (
          <div className="flex gap-2 px-4 py-3" style={{ backgroundColor: 'var(--bg-alt)' }}>
            <select
              value={addProdId}
              onChange={(e) => onAddProdChange(category.id, Number(e.target.value))}
              className="admin-input flex-1 rounded px-2 py-1.5 text-sm cursor-pointer"
            >
              <option value={0}>Agregar producto de esta categoría...</option>
              {availableProducts.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              disabled={!addProdId || isAddingProd}
              onClick={() => onAddProd(category.id)}
              className="admin-btn-primary px-3 py-1.5 text-sm rounded disabled:opacity-50 cursor-pointer"
            >
              Agregar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
