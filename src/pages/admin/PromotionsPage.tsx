import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPromotions, createPromotion, updatePromotion, deletePromotion,
  getPromotionProducts, addPromotionProduct, removePromotionProduct,
} from '@/api/promotions'
import { getProducts } from '@/api/products'
import type { Promotion } from '@/types'
import Modal from '@/components/admin/Modal'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import Pagination from '@/components/admin/Pagination'
import { PencilIcon, TrashIcon } from '@/components/admin/Icons'

const emptyPromotion: Partial<Promotion> = {
  title: '',
  description: '',
  discount_type: 'percentage',
  discount_value: '',
  starts_at: '',
  ends_at: '',
  is_active: true,
}

export default function PromotionsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(false)
  const [detailPromo, setDetailPromo] = useState<Promotion | null>(null)
  const [editing, setEditing] = useState<Promotion | null>(null)
  const [form, setForm] = useState<Partial<Promotion>>(emptyPromotion)
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null)
  const [addProdId, setAddProdId] = useState<number>(0)
  const [saveError, setSaveError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({ queryKey: ['promotions', page], queryFn: () => getPromotions(page) })
  const { data: promoProducts } = useQuery({
    queryKey: ['promo-products', detailPromo?.id],
    queryFn: () => getPromotionProducts(detailPromo!.id),
    enabled: !!detailPromo,
  })
  const { data: allProducts } = useQuery({ queryKey: ['products', 1], queryFn: () => getProducts(1) })

  const saveMutation = useMutation({
    mutationFn: () => editing ? updatePromotion(editing.id, form) : createPromotion(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['promotions'] }); setModal(false); setSaveError(null) },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setSaveError(msg ?? 'Error al guardar la promoción')
    },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePromotion(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['promotions'] }); setDeleteTarget(null) },
  })
  const addProdMutation = useMutation({
    mutationFn: ({ promoId, prodId }: { promoId: number; prodId: number }) => addPromotionProduct(promoId, prodId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promo-products'] }),
  })
  const removeProdMutation = useMutation({
    mutationFn: ({ promoId, prodId }: { promoId: number; prodId: number }) => removePromotionProduct(promoId, prodId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promo-products'] }),
  })

  function openCreate() {
    setEditing(null); setForm(emptyPromotion); setSaveError(null); setModal(true)
  }
  function openEdit(p: Promotion) {
    setEditing(p)
    setForm({
      title: p.title, description: p.description ?? '', discount_type: p.discount_type,
      discount_value: p.discount_value, starts_at: p.starts_at?.slice(0, 10) ?? '',
      ends_at: p.ends_at?.slice(0, 10) ?? '', is_active: p.is_active,
    })
    setModal(true)
  }

  const assignedProdIds = new Set(promoProducts?.map((p) => p.id) ?? [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6 mt-2">
        <h1 className="text-2xl font-display font-semibold" style={{ color: 'var(--coffee)' }}>Promociones</h1>
        <button onClick={openCreate} className="admin-btn-primary px-4 py-2 text-sm rounded-md cursor-pointer">Nueva promoción</button>
      </div>

      {isLoading ? <p style={{ color: 'var(--muted)' }}>Cargando...</p> : (
        <>
          <div className="admin-card rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="admin-table-hd">
                <tr>
                  <th className="text-left px-3 py-2 text-sm font-medium" style={{ color: 'var(--muted)' }}>Título</th>
                  <th className="text-left px-3 py-2 text-sm font-medium" style={{ color: 'var(--muted)' }}>Descuento</th>
                  <th className="text-left px-3 py-2 text-sm font-medium" style={{ color: 'var(--muted)' }}>Vigencia</th>
                  <th className="text-left px-3 py-2 text-sm font-medium" style={{ color: 'var(--muted)' }}>Estado</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {data?.data.map((promo) => (
                  <tr key={promo.id} className="admin-row">
                    <td className="px-3 py-2 font-medium" style={{ color: 'var(--coffee)' }}>{promo.title}</td>
                    <td className="px-3 py-2" style={{ color: 'var(--coffee)' }}>
                      {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `$${promo.discount_value}`}
                    </td>
                    <td className="px-3 py-2 text-xs" style={{ color: 'var(--muted)' }}>
                      {promo.starts_at ? promo.starts_at.slice(0, 10) : '—'} → {promo.ends_at ? promo.ends_at.slice(0, 10) : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${promo.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {promo.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right space-x-1">
                      <button onClick={() => setDetailPromo(promo)} className="admin-link text-sm hover:underline cursor-pointer">Productos</button>
                      <button onClick={() => openEdit(promo)} className="admin-link cursor-pointer p-1" title="Editar"><PencilIcon /></button>
                      <button onClick={() => setDeleteTarget(promo)} className="cursor-pointer p-1 text-red-400 hover:text-red-600" title="Eliminar"><TrashIcon /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
          <Pagination currentPage={page} lastPage={data?.meta.last_page ?? 1} onPageChange={setPage} />
        </>
      )}

      <Modal open={modal} title={editing ? 'Editar promoción' : 'Nueva promoción'} onClose={() => setModal(false)}>
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate() }} className="space-y-4">
          <div>
            <label className="admin-label block mb-1">Título *</label>
            <input required value={form.title ?? ''} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="admin-input w-full rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="admin-label block mb-1">Descripción</label>
            <textarea value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2} className="admin-input w-full rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="admin-label block mb-1">Tipo *</label>
              <select required value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })}
                className="admin-input w-full rounded-md px-3 py-2 text-sm cursor-pointer">
                <option value="percentage">Porcentaje</option>
                <option value="fixed">Fijo ($)</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="admin-label block mb-1">Valor *</label>
              <input required type="number" min={0} step="0.01" value={form.discount_value ?? ''} onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                className="admin-input w-full rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="admin-label block mb-1">Inicia</label>
              <input type="date" value={form.starts_at ?? ''} onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                className="admin-input w-full rounded-md px-3 py-2 text-sm" />
            </div>
            <div className="flex-1">
              <label className="admin-label block mb-1">Termina</label>
              <input type="date" value={form.ends_at ?? ''} onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                className="admin-input w-full rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--coffee)' }}>
            <input type="checkbox" checked={form.is_active ?? true} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
            Activa
          </label>
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="admin-btn-secondary px-4 py-2 text-sm rounded-md cursor-pointer">Cancelar</button>
            <button type="submit" disabled={saveMutation.isPending} className="admin-btn-primary px-4 py-2 text-sm rounded-md disabled:opacity-50 cursor-pointer">
              {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!detailPromo} title={`Productos: ${detailPromo?.title ?? ''}`} onClose={() => setDetailPromo(null)}>
        <div className="space-y-3">
          {promoProducts && promoProducts.length > 0 ? (
            <ul className="space-y-1 mb-3">
              {promoProducts.map((prod) => (
                <li key={prod.id} className="flex items-center justify-between rounded px-3 py-1.5 text-sm" style={{ backgroundColor: 'var(--bg-alt)', color: 'var(--coffee)' }}>
                  <span>{prod.name}</span>
                  <button
                    onClick={() => detailPromo && removeProdMutation.mutate({ promoId: detailPromo.id, prodId: prod.id })}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                  >×</button>
                </li>
              ))}
            </ul>
          ) : <p className="text-xs mb-3" style={{ color: 'var(--subtle)' }}>Sin productos asignados</p>}
          <div className="flex gap-2">
            <select value={addProdId} onChange={(e) => setAddProdId(Number(e.target.value))}
              className="admin-input flex-1 rounded px-2 py-1.5 text-sm cursor-pointer">
              <option value={0}>Agregar producto...</option>
              {allProducts?.data.filter((p) => !assignedProdIds.has(p.id)).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              disabled={!addProdId || addProdMutation.isPending}
              onClick={() => detailPromo && addProdId && addProdMutation.mutate({ promoId: detailPromo.id, prodId: addProdId })}
              className="admin-btn-primary px-3 py-1.5 text-sm rounded disabled:opacity-50 cursor-pointer">
              Agregar
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="¿Eliminar promoción?"
        description={`Se eliminará "${deleteTarget?.title}". Esta acción no se puede deshacer.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
