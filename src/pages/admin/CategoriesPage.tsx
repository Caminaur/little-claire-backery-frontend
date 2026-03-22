import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/categories'
import type { Category } from '@/types'
import Modal from '@/components/admin/Modal'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import Pagination from '@/components/admin/Pagination'

const empty: Partial<Category> = { name: '', description: '', is_visible: true, position: 1 }

export default function CategoriesPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState<Partial<Category>>(empty)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['categories', page],
    queryFn: () => getCategories(page),
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      editing ? updateCategory(editing.id, form) : createCategory(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      closeModal()
    },
    onError: () => setFormError('Error al guardar'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      setDeleteTarget(null)
    },
  })

  function openCreate() {
    setEditing(null)
    setForm(empty)
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setForm({ name: cat.name, description: cat.description ?? '', is_visible: cat.is_visible, position: cat.position })
    setFormError(null)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  async function toggleVisible(cat: Category) {
    await updateCategory(cat.id, { is_visible: !cat.is_visible })
    qc.invalidateQueries({ queryKey: ['categories'] })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-stone-100">Categorías</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-amber-600 text-white text-sm rounded-md hover:bg-amber-700">
          Nueva categoría
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Posición</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Visible</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.data.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                    <td className="px-4 py-3 text-gray-500">{cat.position}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleVisible(cat)}
                        className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                          cat.is_visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {cat.is_visible ? 'Visible' : 'Oculta'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => openEdit(cat)} className="text-sm text-amber-600 hover:underline">Editar</button>
                      <button onClick={() => setDeleteTarget(cat)} className="text-sm text-red-600 hover:underline">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} lastPage={data?.meta.last_page ?? 1} onPageChange={setPage} />
        </>
      )}

      <Modal open={modalOpen} title={editing ? 'Editar categoría' : 'Nueva categoría'} onClose={closeModal}>
        <form
          onSubmit={(e) => { e.preventDefault(); saveMutation.mutate() }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              required
              value={form.name ?? ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de imagen</label>
            <input
              value={form.image_url ?? ''}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Posición</label>
              <input
                type="number"
                min={1}
                value={form.position ?? 1}
                onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_visible ?? true}
                  onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
                  className="rounded"
                />
                Visible
              </label>
            </div>
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={saveMutation.isPending} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50">
              {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="¿Eliminar categoría?"
        description={`Se eliminará "${deleteTarget?.name}". Esta acción no se puede deshacer.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
