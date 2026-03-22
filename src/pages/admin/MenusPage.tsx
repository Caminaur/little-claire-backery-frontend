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

  const { data, isLoading } = useQuery({ queryKey: ['menus', page], queryFn: () => getMenus(page) })

  const saveMutation = useMutation({
    mutationFn: () => editing ? updateMenu(editing.id, form) : createMenu(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menus'] }); setMenuModal(false) },
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
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-stone-100">Menús</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-amber-600 text-white text-sm rounded-md hover:bg-amber-700">Nuevo menú</button>
      </div>

      {isLoading ? <p className="text-gray-500">Cargando...</p> : (
        <>
          <div className="bg-white dark:bg-stone-900 border border-gray-200 dark:border-stone-700 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-stone-800 border-b border-gray-200 dark:border-stone-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-stone-300">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-stone-300">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-stone-800">
                {data?.data.map((menu) => (
                  <tr key={menu.id} className="hover:bg-gray-50 dark:hover:bg-stone-800 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-stone-100">{menu.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${menu.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {menu.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link to={`/admin/menus/${menu.id}`} className="text-sm text-blue-600 hover:underline">Contenido</Link>
                      <button onClick={() => openEdit(menu)} className="text-sm text-amber-600 hover:underline">Editar</button>
                      <button onClick={() => setDeleteTarget(menu)} className="text-sm text-red-600 hover:underline">Eliminar</button>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input required value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.is_active ?? true} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
            Activo
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setMenuModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={saveMutation.isPending} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50">
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
