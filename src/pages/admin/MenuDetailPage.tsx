import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getMenu, updateMenu,
  getMenuCategories, addMenuCategory, removeMenuCategory, reorderMenuCategories,
  getMenuProducts, addMenuProduct, removeMenuProduct, reorderMenuProducts,
} from '@/api/menus'
import { getCategories } from '@/api/categories'
import { getProducts } from '@/api/products'
import type { Menu, Category, Product } from '@/types'
import Modal from '@/components/admin/Modal'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

const emptyForm = { name: '', description: '', is_active: true }

export default function MenuDetailPage() {
  const { id } = useParams<{ id: string }>()
  const menuId = Number(id)
  const qc = useQueryClient()

  const [editModal, setEditModal] = useState(false)
  const [form, setForm] = useState<Partial<Menu>>(emptyForm)
  const [addCatId, setAddCatId] = useState(0)
  const [addProdIds, setAddProdIds] = useState<Record<number, number>>({})
  const [removeCatTarget, setRemoveCatTarget] = useState<Category | null>(null)
  const [removeProdTarget, setRemoveProdTarget] = useState<Product | null>(null)

  const { data: menu, isLoading: menuLoading } = useQuery({
    queryKey: ['menu', menuId],
    queryFn: () => getMenu(menuId),
  })
  const { data: menuCategories } = useQuery({
    queryKey: ['menu-categories', menuId],
    queryFn: () => getMenuCategories(menuId),
    enabled: !!menuId,
  })
  const { data: menuProducts } = useQuery({
    queryKey: ['menu-products', menuId],
    queryFn: () => getMenuProducts(menuId),
    enabled: !!menuId,
  })
  const { data: allCategories } = useQuery({ queryKey: ['categories', 1], queryFn: () => getCategories(1) })
  const { data: allProducts } = useQuery({ queryKey: ['products', 1], queryFn: () => getProducts(1) })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Menu>) => updateMenu(menuId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu', menuId] }); setEditModal(false) },
  })
  const addCatMutation = useMutation({
    mutationFn: ({ catId, pos }: { catId: number; pos: number }) => addMenuCategory(menuId, catId, pos),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu-categories', menuId] }); setAddCatId(0) },
  })
  const removeCatMutation = useMutation({
    mutationFn: (catId: number) => removeMenuCategory(menuId, catId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu-categories', menuId] }); setRemoveCatTarget(null) },
  })
  const reorderCatMutation = useMutation({
    mutationFn: (items: { id: number; position: number }[]) => reorderMenuCategories(menuId, items),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu-categories', menuId] }),
    onError: () => qc.invalidateQueries({ queryKey: ['menu-categories', menuId] }),
  })
  const addProdMutation = useMutation({
    mutationFn: ({ prodId, pos }: { prodId: number; pos: number }) => addMenuProduct(menuId, prodId, pos),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu-products', menuId] }),
  })
  const removeProdMutation = useMutation({
    mutationFn: (prodId: number) => removeMenuProduct(menuId, prodId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu-products', menuId] }); setRemoveProdTarget(null) },
  })
  const reorderProdMutation = useMutation({
    mutationFn: (items: { id: number; position: number }[]) => reorderMenuProducts(menuId, items),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu-products', menuId] }),
    onError: () => qc.invalidateQueries({ queryKey: ['menu-products', menuId] }),
  })

  function openEdit() {
    if (!menu) return
    setForm({ name: menu.name, description: menu.description ?? '', is_active: menu.is_active })
    setEditModal(true)
  }

  function moveCategory(index: number, dir: -1 | 1) {
    if (!menuCategories) return
    const cats = [...menuCategories]
    const temp = cats[index]
    cats[index] = cats[index + dir]
    cats[index + dir] = temp
    qc.setQueryData(['menu-categories', menuId], cats)
    reorderCatMutation.mutate(cats.map((c, i) => ({ id: c.id, position: i + 1 })))
  }

  function moveProduct(catProds: Product[], catIndex: number, dir: -1 | 1) {
    if (!menuProducts) return
    const prodA = catProds[catIndex]
    const prodB = catProds[catIndex + dir]
    const allProds = [...menuProducts]
    const idxA = allProds.findIndex((p) => p.id === prodA.id)
    const idxB = allProds.findIndex((p) => p.id === prodB.id)
    allProds[idxA] = prodB
    allProds[idxB] = prodA
    qc.setQueryData(['menu-products', menuId], allProds)
    reorderProdMutation.mutate(allProds.map((p, i) => ({ id: p.id, position: i + 1 })))
  }

  // Group menu products by category_id, preserving order from server
  const assignedCatIds = new Set(menuCategories?.map((c) => c.id) ?? [])
  const assignedProdIds = new Set(menuProducts?.map((p) => p.id) ?? [])

  const productsByCategory = new Map<number, Product[]>()
  const uncategorizedProducts: Product[] = []
  for (const prod of menuProducts ?? []) {
    if (assignedCatIds.has(prod.category_id)) {
      const group = productsByCategory.get(prod.category_id) ?? []
      group.push(prod)
      productsByCategory.set(prod.category_id, group)
    } else {
      uncategorizedProducts.push(prod)
    }
  }

  if (menuLoading) return <p style={{ color: 'var(--muted)' }}>Cargando...</p>
  if (!menu) return <p className="text-red-500">Menú no encontrado.</p>

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/admin/menus"
          className="text-sm inline-flex items-center gap-1 mb-3 hover:underline"
          style={{ color: 'var(--muted)' }}
        >
          ← Volver a Menús
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold" style={{ color: 'var(--coffee)' }}>{menu.name}</h1>
            {menu.description && (
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{menu.description}</p>
            )}
            <span className={`mt-2 inline-block px-2 py-0.5 text-xs rounded-full font-medium ${menu.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {menu.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <button
            onClick={openEdit}
            className="flex-shrink-0 admin-btn-primary px-4 py-2 text-sm rounded-md cursor-pointer"
          >
            Editar menú
          </button>
        </div>
      </div>

      {/* Category sections */}
      <div className="space-y-4">
        {menuCategories?.length === 0 && (
          <p className="text-sm italic" style={{ color: 'var(--subtle)' }}>Sin categorías asignadas. Agregá una abajo.</p>
        )}

        {menuCategories?.map((cat, catIndex) => {
          const catProds = productsByCategory.get(cat.id) ?? []
          const availableProds = allProducts?.data.filter(
            (p) => p.category_id === cat.id && !assignedProdIds.has(p.id)
          ) ?? []
          const addProdId = addProdIds[cat.id] ?? 0

          return (
            <div key={cat.id} className="admin-card rounded-lg overflow-hidden">
              {/* Category header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ backgroundColor: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}
              >
                <h3 className="font-medium" style={{ color: 'var(--gold)' }}>{cat.name}</h3>
                <div className="flex items-center gap-0.5">
                  <button
                    disabled={catIndex === 0}
                    onClick={() => moveCategory(catIndex, -1)}
                    className="px-2 py-1 disabled:opacity-30 cursor-pointer"
                    style={{ color: 'var(--muted)' }}
                  >↑</button>
                  <button
                    disabled={catIndex === (menuCategories?.length ?? 0) - 1}
                    onClick={() => moveCategory(catIndex, 1)}
                    className="px-2 py-1 disabled:opacity-30 cursor-pointer"
                    style={{ color: 'var(--muted)' }}
                  >↓</button>
                  <button
                    onClick={() => setRemoveCatTarget(cat)}
                    className="ml-2 px-2 py-1 text-red-400 hover:text-red-600 cursor-pointer"
                  >×</button>
                </div>
              </div>

              {/* Products in this category */}
              <div className="divide-y divide-[var(--border)]">
                {catProds.length === 0 ? (
                  <p className="px-4 py-3 text-sm italic" style={{ color: 'var(--subtle)' }}>Sin productos en esta categoría</p>
                ) : (
                  catProds.map((prod, prodIndex) => (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between px-4 py-2.5 admin-row transition-colors"
                    >
                      <span className="text-sm" style={{ color: 'var(--coffee)' }}>{prod.name}</span>
                      <div className="flex items-center gap-0.5">
                        <button
                          disabled={prodIndex === 0}
                          onClick={() => moveProduct(catProds, prodIndex, -1)}
                          className="px-2 py-1 disabled:opacity-30 text-sm cursor-pointer"
                          style={{ color: 'var(--muted)' }}
                        >↑</button>
                        <button
                          disabled={prodIndex === catProds.length - 1}
                          onClick={() => moveProduct(catProds, prodIndex, 1)}
                          className="px-2 py-1 disabled:opacity-30 text-sm cursor-pointer"
                          style={{ color: 'var(--muted)' }}
                        >↓</button>
                        <button
                          onClick={() => setRemoveProdTarget(prod)}
                          className="ml-2 px-2 py-1 text-red-400 hover:text-red-600 text-sm cursor-pointer"
                        >×</button>
                      </div>
                    </div>
                  ))
                )}

                {/* Add product from this category */}
                {availableProds.length > 0 && (
                  <div className="flex gap-2 px-4 py-3" style={{ backgroundColor: 'var(--bg-alt)' }}>
                    <select
                      value={addProdId}
                      onChange={(e) => setAddProdIds({ ...addProdIds, [cat.id]: Number(e.target.value) })}
                      className="admin-input flex-1 rounded px-2 py-1.5 text-sm cursor-pointer"
                    >
                      <option value={0}>Agregar producto de esta categoría...</option>
                      {availableProds.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <button
                      disabled={!addProdId || addProdMutation.isPending}
                      onClick={() => {
                        if (addProdId) {
                          addProdMutation.mutate({ prodId: addProdId, pos: (menuProducts?.length ?? 0) + 1 })
                          setAddProdIds({ ...addProdIds, [cat.id]: 0 })
                        }
                      }}
                      className="admin-btn-primary px-3 py-1.5 text-sm rounded disabled:opacity-50 cursor-pointer"
                    >
                      Agregar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Products with no matching menu category */}
        {uncategorizedProducts.length > 0 && (
          <div className="admin-card rounded-lg overflow-hidden">
            <div className="px-4 py-3 admin-table-hd">
              <h3 className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Sin categoría asignada al menú</h3>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {uncategorizedProducts.map((prod) => (
                <div key={prod.id} className="flex items-center justify-between px-4 py-2.5 admin-row">
                  <span className="text-sm" style={{ color: 'var(--coffee)' }}>{prod.name}</span>
                  <button
                    onClick={() => setRemoveProdTarget(prod)}
                    className="px-2 py-1 text-red-400 hover:text-red-600 text-sm cursor-pointer"
                  >×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add category */}
        <div className="flex gap-2 pt-2">
          <select
            value={addCatId}
            onChange={(e) => setAddCatId(Number(e.target.value))}
            className="admin-input flex-1 rounded-md px-3 py-2 text-sm cursor-pointer"
          >
            <option value={0}>Agregar categoría al menú...</option>
            {allCategories?.data.filter((c) => !assignedCatIds.has(c.id)).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            disabled={!addCatId || addCatMutation.isPending}
            onClick={() => addCatId && addCatMutation.mutate({ catId: addCatId, pos: (menuCategories?.length ?? 0) + 1 })}
            className="admin-btn-primary px-4 py-2 text-sm rounded-md disabled:opacity-50 cursor-pointer"
          >
            Agregar categoría
          </button>
        </div>
      </div>

      {/* Edit menu modal */}
      <Modal open={editModal} title="Editar menú" onClose={() => setEditModal(false)}>
        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(form) }} className="space-y-4">
          <div>
            <label className="admin-label block mb-1">Nombre *</label>
            <input
              required
              value={form.name ?? ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="admin-input w-full rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="admin-label block mb-1">Descripción</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="admin-input w-full rounded-md px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--coffee)' }}>
            <input
              type="checkbox"
              checked={form.is_active ?? true}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="rounded"
            />
            Activo
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditModal(false)} className="admin-btn-secondary px-4 py-2 text-sm rounded-md cursor-pointer">Cancelar</button>
            <button type="submit" disabled={updateMutation.isPending} className="admin-btn-primary px-4 py-2 text-sm rounded-md disabled:opacity-50 cursor-pointer">
              {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!removeCatTarget}
        title="¿Quitar categoría del menú?"
        description={`Se quitará "${removeCatTarget?.name}" del menú. Los productos de esta categoría permanecerán asignados.`}
        onConfirm={() => removeCatTarget && removeCatMutation.mutate(removeCatTarget.id)}
        onCancel={() => setRemoveCatTarget(null)}
        loading={removeCatMutation.isPending}
      />
      <ConfirmDialog
        open={!!removeProdTarget}
        title="¿Quitar producto del menú?"
        description={`Se quitará "${removeProdTarget?.name}" del menú.`}
        onConfirm={() => removeProdTarget && removeProdMutation.mutate(removeProdTarget.id)}
        onCancel={() => setRemoveProdTarget(null)}
        loading={removeProdMutation.isPending}
      />
    </div>
  )
}
