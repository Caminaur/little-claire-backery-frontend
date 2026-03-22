import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProducts, createProduct, updateProduct, deleteProduct, createVariant, updateVariant, deleteVariant } from '@/api/products'
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

  const { data, isLoading } = useQuery({
    queryKey: ['products', page],
    queryFn: () => getProducts(page),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 1],
    queryFn: () => getCategories(1),
  })

  const saveProductMutation = useMutation({
    mutationFn: () => editingProduct ? updateProduct(editingProduct.id, productForm) : createProduct(productForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setProductModal(false) },
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setVariantModal(false) },
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
    setVariantModal(true)
  }

  function openEditVariant(p: Product, v: ProductVariant) {
    setSelectedProduct(p)
    setEditingVariant(v)
    setVariantForm({ label: v.label ?? '', price: v.price, position: v.position, is_active: v.is_active })
    setVariantModal(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-stone-100">Productos</h1>
        <button onClick={openCreateProduct} className="px-4 py-2 bg-amber-600 text-white text-sm rounded-md hover:bg-amber-700">
          Nuevo producto
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <>
          <div className="space-y-4">
            {data?.data.map((product) => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div>
                    <span className="font-medium text-gray-900">{product.name}</span>
                    {product.description && <span className="ml-2 text-sm text-gray-500">{product.description}</span>}
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {product.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openCreateVariant(product)} className="text-xs text-blue-600 hover:underline">+ Variante</button>
                    <button onClick={() => openEditProduct(product)} className="text-xs text-amber-600 hover:underline">Editar</button>
                    <button onClick={() => setDeleteTarget({ type: 'product', item: product })} className="text-xs text-red-600 hover:underline">Eliminar</button>
                  </div>
                </div>
                {product.variants.length > 0 && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Variante</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Precio</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Pos.</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Estado</th>
                        <th className="px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {product.variants.map((v) => (
                        <tr key={v.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-700">{v.label ?? '—'}</td>
                          <td className="px-4 py-2 text-gray-700">${v.price}</td>
                          <td className="px-4 py-2 text-gray-500">{v.position}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${v.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {v.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right space-x-2">
                            <button onClick={() => openEditVariant(product, v)} className="text-xs text-amber-600 hover:underline">Editar</button>
                            <button onClick={() => setDeleteTarget({ type: 'variant', item: v })} className="text-xs text-red-600 hover:underline">Eliminar</button>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input required value={productForm.name ?? ''} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            <select required value={productForm.category_id ?? ''} onChange={(e) => setProductForm({ ...productForm, category_id: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option value="">Seleccionar...</option>
              {categoriesData?.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={productForm.description ?? ''} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              rows={2} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={productForm.is_active ?? true} onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })} className="rounded" />
            Activo
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setProductModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={saveProductMutation.isPending} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50">
              {saveProductMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Variant Modal */}
      <Modal open={variantModal} title={editingVariant ? 'Editar variante' : 'Nueva variante'} onClose={() => setVariantModal(false)}>
        <form onSubmit={(e) => { e.preventDefault(); saveVariantMutation.mutate() }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta (dejar vacío para precio único)</label>
            <input value={variantForm.label ?? ''} onChange={(e) => setVariantForm({ ...variantForm, label: e.target.value || undefined })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Ej: Chico, Grande..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
            <input required type="number" min={0} step="0.01" value={variantForm.price ?? ''} onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Posición *</label>
            <input required type="number" min={1} value={variantForm.position ?? 1} onChange={(e) => setVariantForm({ ...variantForm, position: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={variantForm.is_active ?? true} onChange={(e) => setVariantForm({ ...variantForm, is_active: e.target.checked })} className="rounded" />
            Activa
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setVariantModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={saveVariantMutation.isPending} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50">
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
