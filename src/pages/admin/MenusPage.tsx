import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMenus, createMenu, updateMenu, deleteMenu } from '@/api/menus'
import type { Menu } from '@/types'
import Modal from '@/components/admin/Modal'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import Pagination from '@/components/admin/Pagination'

const emptyMenu = { name: '', description: '', is_active: true }

export default function MenusPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [menuModal, setMenuModal] = useState(false)
  const [editing, setEditing] = useState<Menu | null>(null)
  const [form, setForm] = useState<Partial<Menu>>(emptyMenu)
  const [deleteTarget, setDeleteTarget] = useState<Menu | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({ queryKey: ['menus', page], queryFn: () => getMenus(page) })

  const saveMutation = useMutation({
    mutationFn: () => editing ? updateMenu(editing.id, form) : createMenu(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menus'] }); setMenuModal(false); setSaveError(null) },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setSaveError(msg ?? 'Error al guardar el menú')
    },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMenu(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menus'] }); setDeleteTarget(null) },
  })

  function openCreate() {
    setEditing(null); setForm(emptyMenu); setMenuModal(true)
  }
  function openEdit(m: Menu) {
    setEditing(m); setForm({ name: m.name, description: m.description ?? '', is_active: m.is_active }); setMenuModal(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold" style={{ color: 'var(--coffee)' }}>Menús</h1>
        <button onClick={openCreate} className="admin-btn-primary px-4 py-2 text-sm rounded-md cursor-pointer">Nuevo menú</button>
      </div>

      {isLoading ? <p style={{ color: 'var(--muted)' }}>Cargando...</p> : (
        <>
          <div className="admin-card rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="admin-table-hd">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>Nombre</th>
                  <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {data?.data.map((menu) => (
                  <tr key={menu.id} className="admin-row transition-colors">
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--coffee)' }}>{menu.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${menu.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {menu.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link to={`/admin/menus/${menu.id}`} className="admin-link text-sm hover:underline">Contenido</Link>
                      <button onClick={() => openEdit(menu)} className="admin-link text-sm hover:underline cursor-pointer">Editar</button>
                      <button onClick={() => setDeleteTarget(menu)} className="text-sm text-red-600 hover:underline cursor-pointer">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} lastPage={data?.meta.last_page ?? 1} onPageChange={setPage} />
        </>
      )}

      <Modal open={menuModal} title={editing ? 'Editar menú' : 'Nuevo menú'} onClose={() => setMenuModal(false)}>
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate() }} className="space-y-4">
          <div>
            <label className="admin-label block mb-1">Nombre *</label>
            <input required value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="admin-input w-full rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="admin-label block mb-1">Descripción</label>
            <textarea value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2} className="admin-input w-full rounded-md px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--coffee)' }}>
            <input type="checkbox" checked={form.is_active ?? true} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
            Activo
          </label>
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setMenuModal(false)} className="admin-btn-secondary px-4 py-2 text-sm rounded-md cursor-pointer">Cancelar</button>
            <button type="submit" disabled={saveMutation.isPending} className="admin-btn-primary px-4 py-2 text-sm rounded-md disabled:opacity-50 cursor-pointer">
              {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="¿Eliminar menú?"
        description={`Se eliminará "${deleteTarget?.name}". Esta acción no se puede deshacer.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
