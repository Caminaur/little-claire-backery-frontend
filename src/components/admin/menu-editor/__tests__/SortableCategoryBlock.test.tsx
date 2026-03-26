import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import SortableCategoryBlock from '../SortableCategoryBlock'
import type { Category, Product } from '@/types'

// useSortable requires a SortableContext — mock it to avoid DnD setup complexity
vi.mock('@dnd-kit/sortable', async () => {
  const actual = await vi.importActual<typeof import('@dnd-kit/sortable')>('@dnd-kit/sortable')
  return {
    ...actual,
    useSortable: () => ({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: null,
      isDragging: false,
    }),
  }
})

const baseCategory: Category = {
  id: 1,
  name: 'Cafés',
  description: null,
  image_url: null,
  is_visible: true,
  position: 1,
  price_display: 'auto',
  is_full_width: false,
}

const makeProduct = (id: number, name: string): Product => ({
  id,
  category_id: 1,
  name,
  description: null,
  is_active: true,
  variants: [],
})

const noop = vi.fn()

const defaultProps = {
  category: baseCategory,
  products: [],
  availableProducts: [],
  addProdId: 0,
  isAddingProd: false,
  onAddProdChange: noop,
  onAddProd: noop,
  onRemoveCat: noop,
  onRemoveProd: noop,
  onProductReorder: noop,
  onDisplayChange: noop,
}

function renderBlock(props = {}) {
  return render(
    <DndContext>
      <SortableContext items={[1]}>
        <SortableCategoryBlock {...defaultProps} {...props} />
      </SortableContext>
    </DndContext>
  )
}

describe('SortableCategoryBlock', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the category name', () => {
    renderBlock()
    expect(screen.getByText('Cafés')).toBeInTheDocument()
  })

  it('shows empty state when no products are assigned', () => {
    renderBlock({ products: [] })
    expect(screen.getByText('Sin productos en esta categoría')).toBeInTheDocument()
  })

  it('renders assigned product names', () => {
    const products = [makeProduct(1, 'Espresso'), makeProduct(2, 'Cappuccino')]
    renderBlock({ products })
    expect(screen.getByText('Espresso')).toBeInTheDocument()
    expect(screen.getByText('Cappuccino')).toBeInTheDocument()
    expect(screen.queryByText('Sin productos en esta categoría')).not.toBeInTheDocument()
  })

  it('shows the add-product dropdown when there are available products', () => {
    const available = [makeProduct(5, 'Latte')]
    renderBlock({ availableProducts: available })
    expect(screen.getByText('Latte')).toBeInTheDocument()
    expect(screen.getByText('Agregar')).toBeInTheDocument()
  })

  it('hides the add-product dropdown when no products are available', () => {
    renderBlock({ availableProducts: [] })
    expect(screen.queryByText('Agregar')).not.toBeInTheDocument()
  })

  it('renders the layout controls', () => {
    renderBlock()
    expect(screen.getByText('Ancho completo')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Layout: Automático')).toBeInTheDocument()
  })
})
