import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getCategories, createCategory, updateCategory, deleteCategory, reorderCategories, uploadCategoryImage } from '@/api/categories'
import type { Category } from '@/types'
import Modal from '@/components/admin/Modal'
import { PencilIcon, TrashIcon } from '@/components/admin/Icons'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import Pagination from '@/components/admin/Pagination'

const empty: Partial<Category> = { name: '', description: '', is_visible: true, position: 1 }

// --- Fila sortable ---
interface RowProps {
  cat: Category
  onEdit: (cat: Category) => void
  onDelete: (cat: Category) => void
  onToggleVisible: (cat: Category) => void
}

function SortableCategoryRow({ cat, onEdit, onDelete, onToggleVisible }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative',
    zIndex: isDragging ? 1 : undefined,
  }

  return (
    <tr ref={setNodeRef} style={style} className="admin-row transition-colors">
      <td
        className="px-3 py-2 cursor-grab select-none text-base"
        style={{ color: 'var(--subtle)' }}
        {...attributes}
        {...listeners}
      >
        ⠿
      </td>
      <td className="px-3 py-2 font-medium" style={{ color: 'var(--coffee)' }}>{cat.name}</td>
      <td className="px-3 py-2">
        <button
          onClick={() => onToggleVisible(cat)}
          className={`px-2 py-0.5 text-xs rounded-full font-medium cursor-pointer ${
            cat.is_visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {cat.is_visible ? 'Visible' : 'Oculta'}
        </button>
      </td>
      <td className="px-3 py-2 text-right space-x-1">
        <button onClick={() => onEdit(cat)} className="admin-link cursor-pointer p-1" title="Editar"><PencilIcon /></button>
        <button onClick={() => onDelete(cat)} className="cursor-pointer p-1 text-red-400 hover:text-red-600" title="Eliminar"><TrashIcon /></button>
      </td>
    </tr>
  )
}

// --- Página principal ---
export default function CategoriesPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState<Partial<Category>>(empty)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null)

  const sensors = useSensors(useSensor(PointerSensor))

  const { data, isLoading } = useQuery({
    queryKey: ['categories', page],
    queryFn: () => getCategories(page),
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const cat = editing ? await updateCategory(editing.id, form) : await createCategory(form)
      if (categoryImageFile) {
        await uploadCategoryImage(cat.id, categoryImageFile)
      }
      return cat
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); closeModal() },
    onError: () => setFormError('Error al guardar'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setDeleteTarget(null) },
  })

  const reorderMutation = useMutation({
    mutationFn: (ids: number[]) => reorderCategories(ids),
  })

  function openCreate() {
    setEditing(null); setForm(empty); setFormError(null); setCategoryImageFile(null); setModalOpen(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setForm({ name: cat.name, description: cat.description ?? '', is_visible: cat.is_visible, position: cat.position })
    setFormError(null)
    setCategoryImageFile(null)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false); setEditing(null); setCategoryImageFile(null)
  }

  async function toggleVisible(cat: Category) {
    await updateCategory(cat.id, { is_visible: !cat.is_visible })
    qc.invalidateQueries({ queryKey: ['categories'] })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id || !data) return

    const cats = data.data
    const oldIndex = cats.findIndex(c => c.id === active.id)
    const newIndex = cats.findIndex(c => c.id === over.id)
    const reordered = arrayMove(cats, oldIndex, newIndex)

    const snapshot = qc.getQueryData(['categories', page])
    qc.setQueryData(['categories', page], { ...data, data: reordered })

    reorderMutation.mutate(reordered.map(c => c.id), {
      onError: () => qc.setQueryData(['categories', page], snapshot),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
    })
  }

  const ids = data?.data.map(c => c.id) ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6 mt-2">
        <h1 className="text-2xl font-display font-semibold" style={{ color: 'var(--coffee)' }}>Categorías</h1>
        <button onClick={openCreate} className="admin-btn-primary px-4 py-2 text-sm rounded-md cursor-pointer">
          Nueva categoría
        </button>
      </div>

      {isLoading ? (
        <p style={{ color: 'var(--muted)' }}>Cargando...</p>
      ) : (
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="admin-card rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="admin-table-hd">
                  <tr>
                    <th className="px-3 py-2 w-8" />
                    <th className="text-left px-3 py-2 text-sm font-medium" style={{ color: 'var(--muted)' }}>Nombre</th>
                    <th className="text-left px-3 py-2 text-sm font-medium" style={{ color: 'var(--muted)' }}>Visible</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                  <tbody className="divide-y divide-[var(--border)]">
                    {data?.data.map((cat) => (
                      <SortableCategoryRow
                        key={cat.id}
                        cat={cat}
                        onEdit={openEdit}
                        onDelete={setDeleteTarget}
                        onToggleVisible={toggleVisible}
                      />
                    ))}
                  </tbody>
                </SortableContext>
              </table>
              </div>
            </div>
            <Pagination currentPage={page} lastPage={data?.meta.last_page ?? 1} onPageChange={setPage} />
          </DndContext>
        </>
      )}

      <Modal open={modalOpen} title={editing ? 'Editar categoría' : 'Nueva categoría'} onClose={closeModal}>
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate() }} className="space-y-4">
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
              rows={3}
              className="admin-input w-full rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="admin-label block mb-2">Imagen</label>
            {(categoryImageFile
              ? URL.createObjectURL(categoryImageFile)
              : editing?.image_url) && (
              <img
                src={categoryImageFile ? URL.createObjectURL(categoryImageFile) : editing!.image_url!}
                alt="Vista previa"
                className="w-20 h-20 object-cover rounded mb-2"
                style={{ border: '1px solid var(--border)' }}
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCategoryImageFile(e.target.files?.[0] ?? null)}
              className="text-sm w-full cursor-pointer"
              style={{ color: 'var(--muted)' }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--subtle)' }}>Máx. 4 MB.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="admin-label block mb-1">Posición</label>
              <input
                type="number"
                min={1}
                value={form.position ?? 1}
                onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
                className="admin-input w-full rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--coffee)' }}>
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
            <button type="button" onClick={closeModal} className="admin-btn-secondary px-4 py-2 text-sm rounded-md cursor-pointer">Cancelar</button>
            <button type="submit" disabled={saveMutation.isPending} className="admin-btn-primary px-4 py-2 text-sm rounded-md disabled:opacity-50 cursor-pointer">
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
