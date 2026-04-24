import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  createVariant, updateVariant, deleteVariant,
  getVariantImages, createVariantImage, deleteVariantImage,
  uploadProductImage,
} from '@/api/products'
import { getCategories } from '@/api/categories'
import type { Product, ProductVariant } from '@/types'
import Modal from '@/components/admin/Modal'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import Pagination from '@/components/admin/Pagination'
import { PencilIcon, TrashIcon } from '@/components/admin/Icons'

// ── Category color palette (deterministic by id) ────────────────────────────
const CATEGORY_COLORS = [
  '#b45309', '#1d4ed8', '#7c3aed', '#047857', '#dc2626',
  '#0891b2', '#c2410c', '#4338ca', '#be185d', '#4d7c0f',
  '#0369a1', '#6b21a8',
]

function getCategoryColor(id: number): string {
  return CATEGORY_COLORS[(id - 1) % CATEGORY_COLORS.length]
}

function CategoryBadge({ categoryId, categoryName }: { categoryId: number; categoryName?: string | null }) {
  if (!categoryName) return null
  const color = getCategoryColor(categoryId)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      backgroundColor: color + '22', color,
      padding: '1px 8px', borderRadius: 9999,
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
      {categoryName}
    </span>
  )
}

// ── Search icon ──────────────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  )
}

// ── Constants ────────────────────────────────────────────────────────────────
const emptyProduct = { name: '', description: '', category_id: 0, is_active: true, initial_price: '' }
const emptyVariant = { label: '', price: '', position: 1, is_active: true }

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [productModal, setProductModal] = useState(false)
  const [variantModal, setVariantModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState<Partial<Product> & { initial_price?: string }>(emptyProduct)
  const [variantForm, setVariantForm] = useState<Partial<ProductVariant>>(emptyVariant)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'product' | 'variant'; item: Product | ProductVariant } | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [productImageFile, setProductImageFile] = useState<File | null>(null)

  // Debounce search → reset to page 1
  useEffect(() => {
    const id = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 350)
    return () => clearTimeout(id)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, debouncedSearch],
    queryFn: () => getProducts(page, debouncedSearch),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 1],
    queryFn: () => getCategories(1),
  })

  const { data: images, isLoading: imagesLoading } = useQuery({
    queryKey: ['variant-images', selectedProduct?.id, editingVariant?.id],
    queryFn: () => getVariantImages(selectedProduct!.id, editingVariant!.id),
    enabled: variantModal && !!editingVariant && !!selectedProduct,
  })

  // ── Mutations ───────────────────────────────────────────────────────────────
  const addImageMutation = useMutation({
    mutationFn: () => createVariantImage(selectedProduct!.id, editingVariant!.id, {
      image: newImageFile!,
      position: (images?.length ?? 0) + 1,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['variant-images', selectedProduct?.id, editingVariant?.id] })
      setNewImageFile(null)
    },
  })

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: number) => deleteVariantImage(selectedProduct!.id, editingVariant!.id, imageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['variant-images', selectedProduct?.id, editingVariant?.id] }),
  })

  const saveProductMutation = useMutation({
    mutationFn: async () => {
      const product = editingProduct
        ? await updateProduct(editingProduct.id, productForm)
        : await createProduct(productForm)
      if (productImageFile) {
        await uploadProductImage(product.id, productImageFile)
      }
      return product
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      setProductModal(false)
      setSaveError(null)
      setProductImageFile(null)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setSaveError(msg ?? 'Error al guardar')
    },
  })

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setDeleteTarget(null) },
  })

  const saveVariantMutation = useMutation({
    mutationFn: () => {
      if (!selectedProduct) throw new Error('No product selected')
      return editingVariant
        ? updateVariant(selectedProduct.id, editingVariant.id, variantForm)
        : createVariant(selectedProduct.id, variantForm)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setVariantModal(false); setSaveError(null) },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setSaveError(msg ?? 'Error al guardar')
    },
  })

  const deleteVariantMutation = useMutation({
    mutationFn: ({ productId, variantId }: { productId: number; variantId: number }) =>
      deleteVariant(productId, variantId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setDeleteTarget(null) },
  })

  // ── Open helpers ────────────────────────────────────────────────────────────
  function openCreateProduct() {
    setEditingProduct(null)
    setProductForm(emptyProduct)
    setProductImageFile(null)
    setSaveError(null)
    setProductModal(true)
  }

  function openEditProduct(p: Product) {
    setEditingProduct(p)
    setProductForm({ name: p.name, description: p.description ?? '', category_id: p.category_id, is_active: p.is_active, initial_price: '' })
    setProductImageFile(null)
    setSaveError(null)
    setProductModal(true)
  }

  function openCreateVariant(p: Product) {
    setSelectedProduct(p)
    setEditingVariant(null)
    setVariantForm({ ...emptyVariant, position: (p.variants.length || 0) + 1 })
    setNewImageFile(null)
    setSaveError(null)
    setVariantModal(true)
  }

  function openEditVariant(p: Product, v: ProductVariant) {
    setSelectedProduct(p)
    setEditingVariant(v)
    setVariantForm({ label: v.label ?? '', price: v.price, position: v.position, is_active: v.is_active })
    setNewImageFile(null)
    setSaveError(null)
    setVariantModal(true)
  }

  const productImagePreview = productImageFile ? URL.createObjectURL(productImageFile) : null

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 mt-2">
        <h1 className="text-2xl font-display font-semibold shrink-0" style={{ color: 'var(--coffee)' }}>Productos</h1>
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }}>
              <SearchIcon />
            </span>
            <input
              type="search"
              placeholder="Buscar por nombre o categoría..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="admin-input w-full rounded-md pl-9 pr-3 py-2 text-sm"
            />
          </div>
          <button onClick={openCreateProduct} className="admin-btn-primary px-4 py-2 text-sm rounded-md cursor-pointer shrink-0">
            Nuevo producto
          </button>
        </div>
      </div>

      {isLoading ? (
        <p style={{ color: 'var(--muted)' }}>Cargando...</p>
      ) : data?.data.length === 0 ? (
        <p className="text-sm py-8 text-center" style={{ color: 'var(--muted)' }}>
          {debouncedSearch ? `Sin resultados para "${debouncedSearch}"` : 'No hay productos.'}
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {data?.data.map((product) => (
              <div key={product.id} className="admin-card rounded-lg overflow-hidden">
                {/* Product header */}
                <div className="flex items-center gap-3 px-4 py-3 admin-table-hd">
                  {/* Thumbnail */}
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded shrink-0"
                      style={{ border: '1px solid var(--border)' }}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded shrink-0 flex items-center justify-center text-xs"
                      style={{ border: '1px dashed var(--border)', color: 'var(--subtle)', backgroundColor: 'var(--bg-alt)' }}
                    >
                      <span>–</span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium" style={{ color: 'var(--coffee)' }}>{product.name}</span>
                      <CategoryBadge categoryId={product.category_id} categoryName={product.category_name} />
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {product.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    {product.description && (
                      <span className="text-xs truncate block" style={{ color: 'var(--muted)' }}>{product.description}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openCreateVariant(product)} className="admin-link text-sm font-semibold cursor-pointer px-1.5 py-0.5 rounded hover:opacity-70" title="Agregar variante">+</button>
                    <button onClick={() => openEditProduct(product)} className="admin-link cursor-pointer p-1" title="Editar"><PencilIcon /></button>
                    <button onClick={() => setDeleteTarget({ type: 'product', item: product })} className="cursor-pointer p-1 text-red-400 hover:text-red-600" title="Eliminar"><TrashIcon /></button>
                  </div>
                </div>

                {/* Variants table */}
                {product.variants.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <th className="text-left px-4 py-1.5 text-xs font-medium" style={{ color: 'var(--muted)' }}>Variante</th>
                          <th className="text-left px-2 py-1.5 text-xs font-medium" style={{ color: 'var(--muted)' }}>Precio</th>
                          <th className="text-left px-2 py-1.5 text-xs font-medium" style={{ color: 'var(--muted)' }}>Pos.</th>
                          <th className="text-left px-2 py-1.5 text-xs font-medium" style={{ color: 'var(--muted)' }}>Estado</th>
                          <th className="px-2 py-1.5" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {product.variants.map((v) => (
                          <tr key={v.id} className="admin-row">
                            <td className="px-4 py-1.5" style={{ color: 'var(--coffee)' }}>{v.label ?? '—'}</td>
                            <td className="px-2 py-1.5" style={{ color: 'var(--coffee)' }}>${v.price}</td>
                            <td className="px-2 py-1.5" style={{ color: 'var(--muted)' }}>{v.position}</td>
                            <td className="px-2 py-1.5">
                              <span className={`px-2 py-0.5 text-xs rounded-full ${v.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {v.is_active ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-right space-x-1">
                              <button onClick={() => openEditVariant(product, v)} className="admin-link cursor-pointer p-1" title="Editar variante e imágenes"><PencilIcon /></button>
                              <button onClick={() => setDeleteTarget({ type: 'variant', item: v })} className="cursor-pointer p-1 text-red-400 hover:text-red-600" title="Eliminar"><TrashIcon /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
          <Pagination currentPage={page} lastPage={data?.meta.last_page ?? 1} onPageChange={setPage} />
        </>
      )}

      {/* ── Product Modal ── */}
      <Modal open={productModal} title={editingProduct ? 'Editar producto' : 'Nuevo producto'} onClose={() => { setProductModal(false); setProductImageFile(null) }}>
        <form onSubmit={(e) => { e.preventDefault(); saveProductMutation.mutate() }} className="space-y-4">
          <div>
            <label className="admin-label block mb-1">Nombre *</label>
            <input required value={productForm.name ?? ''} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              className="admin-input w-full rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="admin-label block mb-1">Categoría *</label>
            <select required value={productForm.category_id ?? ''} onChange={(e) => setProductForm({ ...productForm, category_id: Number(e.target.value) })}
              className="admin-input w-full rounded-md px-3 py-2 text-sm cursor-pointer">
              <option value="">Seleccionar...</option>
              {categoriesData?.data.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label block mb-1">Descripción</label>
            <textarea value={productForm.description ?? ''} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              rows={2} className="admin-input w-full rounded-md px-3 py-2 text-sm" />
          </div>

          {!editingProduct && (
            <div>
              <label className="admin-label block mb-1">Precio inicial *</label>
              <input
                required
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={productForm.initial_price ?? ''}
                onChange={(e) => setProductForm({ ...productForm, initial_price: e.target.value })}
                className="admin-input w-full rounded-md px-3 py-2 text-sm"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--subtle)' }}>
                Se crea una variante de precio único. Podés agregar más variantes después.
              </p>
            </div>
          )}

          {/* Product thumbnail */}
          <div>
            <label className="admin-label block mb-2">Imagen principal</label>
            {(productImagePreview || editingProduct?.image_url) && (
              <img
                src={productImagePreview ?? editingProduct!.image_url!}
                alt="Vista previa"
                className="w-20 h-20 object-cover rounded mb-2"
                style={{ border: '1px solid var(--border)' }}
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProductImageFile(e.target.files?.[0] ?? null)}
              className="text-sm w-full cursor-pointer"
              style={{ color: 'var(--muted)' }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--subtle)' }}>
              Imagen de miniatura visible en el listado. Máx. 4 MB.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--coffee)' }}>
            <input type="checkbox" checked={productForm.is_active ?? true} onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })} className="rounded" />
            Activo
          </label>
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setProductModal(false); setProductImageFile(null) }} className="admin-btn-secondary px-4 py-2 text-sm rounded-md cursor-pointer">Cancelar</button>
            <button type="submit" disabled={saveProductMutation.isPending} className="admin-btn-primary px-4 py-2 text-sm rounded-md disabled:opacity-50 cursor-pointer">
              {saveProductMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Variant Modal ── */}
      <Modal
        open={variantModal}
        title={editingVariant ? `Variante: ${editingVariant.label ?? 'Sin etiqueta'}` : 'Nueva variante'}
        onClose={() => { setVariantModal(false); setNewImageFile(null) }}
      >
        <form onSubmit={(e) => { e.preventDefault(); saveVariantMutation.mutate() }} className="space-y-4">
          <div>
            <label className="admin-label block mb-1">Etiqueta (dejar vacío para precio único)</label>
            <input value={variantForm.label ?? ''} onChange={(e) => setVariantForm({ ...variantForm, label: e.target.value || undefined })}
              className="admin-input w-full rounded-md px-3 py-2 text-sm" placeholder="Ej: Chico, Grande..." />
          </div>
          <div>
            <label className="admin-label block mb-1">Precio *</label>
            <input required type="number" min={0} step="0.01" value={variantForm.price ?? ''} onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
              className="admin-input w-full rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="admin-label block mb-1">Posición *</label>
            <input required type="number" min={1} value={variantForm.position ?? 1} onChange={(e) => setVariantForm({ ...variantForm, position: Number(e.target.value) })}
              className="admin-input w-full rounded-md px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--coffee)' }}>
            <input type="checkbox" checked={variantForm.is_active ?? true} onChange={(e) => setVariantForm({ ...variantForm, is_active: e.target.checked })} className="rounded" />
            Activa
          </label>

          {/* Variant images — only when editing */}
          {editingVariant && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <label className="admin-label block mb-2">Imágenes de la variante</label>
              {imagesLoading ? (
                <p className="text-xs" style={{ color: 'var(--subtle)' }}>Cargando...</p>
              ) : (
                <div className="space-y-3">
                  {images && images.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {images.map((img) => (
                        <div key={img.id} className="relative group">
                          <img src={img.image_url} className="w-16 h-16 object-cover rounded" style={{ border: '1px solid var(--border)' }} />
                          <button
                            type="button"
                            onClick={() => deleteImageMutation.mutate(img.id)}
                            disabled={deleteImageMutation.isPending}
                            className="absolute inset-0 flex items-center justify-center rounded text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            style={{ backgroundColor: 'rgba(220,38,38,0.85)' }}
                          >
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--subtle)' }}>Sin imágenes aún.</p>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewImageFile(e.target.files?.[0] ?? null)}
                      className="text-sm flex-1 cursor-pointer"
                      style={{ color: 'var(--muted)' }}
                    />
                    <button
                      type="button"
                      disabled={!newImageFile || addImageMutation.isPending}
                      onClick={() => addImageMutation.mutate()}
                      className="admin-btn-primary px-3 py-1.5 text-sm rounded-md disabled:opacity-50 whitespace-nowrap cursor-pointer"
                    >
                      {addImageMutation.isPending ? 'Subiendo...' : 'Subir'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setVariantModal(false); setNewImageFile(null) }} className="admin-btn-secondary px-4 py-2 text-sm rounded-md cursor-pointer">Cancelar</button>
            <button type="submit" disabled={saveVariantMutation.isPending} className="admin-btn-primary px-4 py-2 text-sm rounded-md disabled:opacity-50 cursor-pointer">
              {saveVariantMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget?.type === 'product' ? '¿Eliminar producto?' : '¿Eliminar variante?'}
        description="Esta acción no se puede deshacer."
        onConfirm={() => {
          if (!deleteTarget) return
          if (deleteTarget.type === 'product') {
            deleteProductMutation.mutate((deleteTarget.item as Product).id)
          } else {
            const v = deleteTarget.item as ProductVariant
            deleteVariantMutation.mutate({ productId: v.product_id, variantId: v.id })
          }
        }}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteProductMutation.isPending || deleteVariantMutation.isPending}
      />
    </div>
  )
}
