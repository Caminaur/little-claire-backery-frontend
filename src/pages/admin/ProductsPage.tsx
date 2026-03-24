import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProducts, createProduct, updateProduct, deleteProduct, createVariant, updateVariant, deleteVariant, getVariantImages, createVariantImage, deleteVariantImage } from '@/api/products'
import { getCategories } from '@/api/categories'
import type { Product, ProductVariant } from '@/types'
import Modal from '@/components/admin/Modal'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import Pagination from '@/components/admin/Pagination'

const emptyProduct = { name: '', description: '', category_id: 0, is_active: true }
const emptyVariant = { label: '', price: '', position: 1, is_active: true }

export default function ProductsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [productModal, setProductModal] = useState(false)
  const [variantModal, setVariantModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState<Partial<Product>>(emptyProduct)
  const [variantForm, setVariantForm] = useState<Partial<ProductVariant>>(emptyVariant)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'product' | 'variant'; item: Product | ProductVariant } | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [newImageFile, setNewImageFile] = useState<File | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['products', page],
    queryFn: () => getProducts(page),
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
    mutationFn: () => editingProduct ? updateProduct(editingProduct.id, productForm) : createProduct(productForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setProductModal(false); setSaveError(null) },
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
      const payload = { ...variantForm, price: variantForm.price }
      return editingVariant
        ? updateVariant(selectedProduct.id, editingVariant.id, payload)
        : createVariant(selectedProduct.id, payload)
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

  function openCreateProduct() {
    setEditingProduct(null)
    setProductForm(emptyProduct)
    setProductModal(true)
  }

  function openEditProduct(p: Product) {
    setEditingProduct(p)
    setProductForm({ name: p.name, description: p.description ?? '', category_id: p.category_id, is_active: p.is_active })
    setProductModal(true)
  }

  function openCreateVariant(p: Product) {
    setSelectedProduct(p)
    setEditingVariant(null)
    setVariantForm({ ...emptyVariant, position: (p.variants.length || 0) + 1 })
    setNewImageFile(null)
    setVariantModal(true)
  }

  function openEditVariant(p: Product, v: ProductVariant) {
    setSelectedProduct(p)
    setEditingVariant(v)
    setVariantForm({ label: v.label ?? '', price: v.price, position: v.position, is_active: v.is_active })
    setNewImageFile(null)
    setVariantModal(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold" style={{ color: 'var(--coffee)' }}>Productos</h1>
        <button onClick={openCreateProduct} className="admin-btn-primary px-4 py-2 text-sm rounded-md cursor-pointer">
          Nuevo producto
        </button>
      </div>

      {isLoading ? (
        <p style={{ color: 'var(--muted)' }}>Cargando...</p>
      ) : (
        <>
          <div className="space-y-4">
            {data?.data.map((product) => (
              <div key={product.id} className="admin-card rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 admin-table-hd">
                  <div>
                    <span className="font-medium" style={{ color: 'var(--coffee)' }}>{product.name}</span>
                    {product.description && <span className="ml-2 text-sm" style={{ color: 'var(--muted)' }}>{product.description}</span>}
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {product.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openCreateVariant(product)} className="admin-link text-xs hover:underline cursor-pointer">+ Variante</button>
                    <button onClick={() => openEditProduct(product)} className="admin-link text-xs hover:underline cursor-pointer">Editar</button>
                    <button onClick={() => setDeleteTarget({ type: 'product', item: product })} className="text-xs text-red-600 hover:underline cursor-pointer">Eliminar</button>
                  </div>
                </div>
                {product.variants.length > 0 && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th className="text-left px-4 py-2 text-xs font-medium" style={{ color: 'var(--muted)' }}>Variante</th>
                        <th className="text-left px-4 py-2 text-xs font-medium" style={{ color: 'var(--muted)' }}>Precio</th>
                        <th className="text-left px-4 py-2 text-xs font-medium" style={{ color: 'var(--muted)' }}>Pos.</th>
                        <th className="text-left px-4 py-2 text-xs font-medium" style={{ color: 'var(--muted)' }}>Estado</th>
                        <th className="px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {product.variants.map((v) => (
                        <tr key={v.id} className="admin-row">
                          <td className="px-4 py-2" style={{ color: 'var(--coffee)' }}>{v.label ?? '—'}</td>
                          <td className="px-4 py-2" style={{ color: 'var(--coffee)' }}>${v.price}</td>
                          <td className="px-4 py-2" style={{ color: 'var(--muted)' }}>{v.position}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${v.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {v.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right space-x-2">
                            <button onClick={() => openEditVariant(product, v)} className="admin-link text-xs hover:underline cursor-pointer">Editar</button>
                            <button onClick={() => setDeleteTarget({ type: 'variant', item: v })} className="text-xs text-red-600 hover:underline cursor-pointer">Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
          <Pagination currentPage={page} lastPage={data?.meta.last_page ?? 1} onPageChange={setPage} />
        </>
      )}

      {/* Product Modal */}
      <Modal open={productModal} title={editingProduct ? 'Editar producto' : 'Nuevo producto'} onClose={() => setProductModal(false)}>
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
              {categoriesData?.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="admin-label block mb-1">Descripción</label>
            <textarea value={productForm.description ?? ''} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              rows={2} className="admin-input w-full rounded-md px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--coffee)' }}>
            <input type="checkbox" checked={productForm.is_active ?? true} onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })} className="rounded" />
            Activo
          </label>
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setProductModal(false)} className="admin-btn-secondary px-4 py-2 text-sm rounded-md cursor-pointer">Cancelar</button>
            <button type="submit" disabled={saveProductMutation.isPending} className="admin-btn-primary px-4 py-2 text-sm rounded-md disabled:opacity-50 cursor-pointer">
              {saveProductMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Variant Modal */}
      <Modal open={variantModal} title={editingVariant ? 'Editar variante' : 'Nueva variante'} onClose={() => { setVariantModal(false); setNewImageFile(null) }}>
        <form onSubmit={(e) => { e.preventDefault(); saveVariantMutation.mutate() }} className="space-y-4">
          <div>
            <label className="admin-label block mb-1">Etiqueta (dejar vacío para precio único)</label>
            <input value={variantForm.label ?? ''} onChange={(e) => setVariantForm({ ...variantForm, label: e.target.value || undefined })}
              className="admin-input w-full rounded-md px-3 py-2 text-sm"
              placeholder="Ej: Chico, Grande..." />
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
          {editingVariant && (
            <div>
              <label className="admin-label block mb-2">Imágenes</label>
              {imagesLoading ? (
                <p className="text-xs" style={{ color: 'var(--subtle)' }}>Cargando...</p>
              ) : (
                <div className="space-y-2">
                  {images?.map((img) => (
                    <div key={img.id} className="flex items-center gap-2">
                      <img src={img.image_url} className="w-12 h-12 object-cover rounded" style={{ border: '1px solid var(--border)' }} />
                      <button
                        type="button"
                        onClick={() => deleteImageMutation.mutate(img.id)}
                        disabled={deleteImageMutation.isPending}
                        className="text-xs text-red-500 hover:underline ml-auto cursor-pointer"
                      >Eliminar</button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-1">
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
                    >{addImageMutation.isPending ? 'Subiendo...' : 'Subir'}</button>
                  </div>
                </div>
              )}
            </div>
          )}
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setVariantModal(false)} className="admin-btn-secondary px-4 py-2 text-sm rounded-md cursor-pointer">Cancelar</button>
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
