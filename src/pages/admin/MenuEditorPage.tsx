import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  getMenu,
  updateMenu,
  duplicateMenu,
  getMenuCategories,
  addMenuCategory,
  removeMenuCategory,
  reorderMenuCategories,
  getMenuProducts,
  addMenuProduct,
  removeMenuProduct,
  reorderMenuProducts,
} from "@/api/menus";
import { getCategories, updateCategory } from "@/api/categories";
import { getAllProducts } from "@/api/products";
import type { Menu, Category, Product } from "@/types";
import { buildProductsByCategory } from "@/utils/menuEditor";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import SortableCategoryBlock from "@/components/admin/menu-editor/SortableCategoryBlock";
import MenuPreview from "@/components/admin/menu-editor/MenuPreview";

export default function MenuEditorPage() {
  const { id } = useParams<{ id: string }>();
  const menuId = Number(id);
  const qc = useQueryClient();

  const [tab, setTab] = useState<"editor" | "preview">("editor");
  const [editModal, setEditModal] = useState(false);
  const [form, setForm] = useState<Partial<Menu>>({});
  const [addCatId, setAddCatId] = useState(0);
  const [addProdIds, setAddProdIds] = useState<Record<number, number>>({});
  const [removeCatTarget, setRemoveCatTarget] = useState<Category | null>(null);
  const [removeProdTarget, setRemoveProdTarget] = useState<Product | null>(null);
  const [copyName, setCopyName] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  // ── Queries ──────────────────────────────────────────────────────────────

  const { data: menu, isLoading: menuLoading } = useQuery({
    queryKey: ["menu", menuId],
    queryFn: () => getMenu(menuId),
  });
  const { data: menuCategories } = useQuery({
    queryKey: ["menu-categories", menuId],
    queryFn: () => getMenuCategories(menuId),
    enabled: !!menuId,
  });
  const { data: menuProducts } = useQuery({
    queryKey: ["menu-products", menuId],
    queryFn: () => getMenuProducts(menuId),
    enabled: !!menuId,
  });
  const { data: allCategories } = useQuery({
    queryKey: ["categories", 1],
    queryFn: () => getCategories(1),
  });
  const { data: allProducts } = useQuery({
    queryKey: ["all-products"],
    queryFn: getAllProducts,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Menu>) => updateMenu(menuId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu", menuId] });
      setEditModal(false);
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: () =>
      updateMenu(menuId, {
        name: menu!.name,
        description: menu!.description,
        is_active: menu!.is_active,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu", menuId] }),
  });

  const duplicateMutation = useMutation({
    mutationFn: () => duplicateMenu(menuId),
    onSuccess: (copy) => {
      qc.invalidateQueries({ queryKey: ['menus'] })
      setCopyName(copy.name)
    },
  });

  const addCatMutation = useMutation({
    mutationFn: ({ catId, pos }: { catId: number; pos: number }) =>
      addMenuCategory(menuId, catId, pos),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu-categories", menuId] });
      setAddCatId(0);
    },
  });
  const removeCatMutation = useMutation({
    mutationFn: (catId: number) => removeMenuCategory(menuId, catId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu-categories", menuId] });
      setRemoveCatTarget(null);
    },
  });
  const reorderCatMutation = useMutation({
    mutationFn: (items: { id: number; position: number }[]) =>
      reorderMenuCategories(menuId, items),
    onError: () =>
      qc.invalidateQueries({ queryKey: ["menu-categories", menuId] }),
  });

  const addProdMutation = useMutation({
    mutationFn: ({ prodId, pos }: { prodId: number; pos: number }) =>
      addMenuProduct(menuId, prodId, pos),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["menu-products", menuId] }),
  });
  const removeProdMutation = useMutation({
    mutationFn: (prodId: number) => removeMenuProduct(menuId, prodId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu-products", menuId] });
      setRemoveProdTarget(null);
    },
  });
  const reorderProdMutation = useMutation({
    mutationFn: (items: { id: number; position: number }[]) =>
      reorderMenuProducts(menuId, items),
    onError: () =>
      qc.invalidateQueries({ queryKey: ["menu-products", menuId] }),
  });

  const updateCatDisplayMutation = useMutation({
    mutationFn: ({
      catId,
      payload,
    }: {
      catId: number;
      payload: Partial<Category>;
    }) => updateCategory(catId, payload),
    onError: () =>
      qc.invalidateQueries({ queryKey: ["menu-categories", menuId] }),
  });

  // ── DnD handlers ─────────────────────────────────────────────────────────

  function handleCategoryDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !menuCategories) return;

    const oldIndex = menuCategories.findIndex((c) => c.id === active.id);
    const newIndex = menuCategories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(menuCategories, oldIndex, newIndex);

    const snapshot = qc.getQueryData(["menu-categories", menuId]);
    qc.setQueryData(["menu-categories", menuId], reordered);
    reorderCatMutation.mutate(
      reordered.map((c, i) => ({ id: c.id, position: i + 1 })),
      { onError: () => qc.setQueryData(["menu-categories", menuId], snapshot) },
    );
  }

  function handleProductReorder(catId: number, reorderedCatProds: Product[]) {
    if (!menuProducts) return;

    const catProdIds = new Set(reorderedCatProds.map((p) => p.id));
    // Rebuild full product list: keep non-category products in place, replace this category's in order
    const allProds = [...menuProducts];
    let catIdx = 0;
    for (let i = 0; i < allProds.length; i++) {
      if (catProdIds.has(allProds[i].id)) {
        allProds[i] = reorderedCatProds[catIdx++];
      }
    }

    const snapshot = qc.getQueryData(["menu-products", menuId]);
    qc.setQueryData(["menu-products", menuId], allProds);
    reorderProdMutation.mutate(
      allProds.map((p, i) => ({ id: p.id, position: i + 1 })),
      { onError: () => qc.setQueryData(["menu-products", menuId], snapshot) },
    );
  }

  function handleDisplayChange(
    catId: number,
    field: "price_display" | "is_full_width",
    value: string | boolean,
  ) {
    // Optimistic update
    qc.setQueryData<Category[]>(
      ["menu-categories", menuId],
      (old) =>
        old?.map((c) => (c.id === catId ? { ...c, [field]: value } : c)) ?? [],
    );
    updateCatDisplayMutation.mutate({ catId, payload: { [field]: value } });
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  const assignedCatIds = new Set(menuCategories?.map((c) => c.id) ?? []);
  const assignedProdIds = new Set(menuProducts?.map((p) => p.id) ?? []);

  // menuProducts has correct menu order and fresh prices/variants, but lacks category_id.
  // allProducts has category_id but may be a different cache snapshot.
  // Merge: take ALL data from menuProducts (fresh), only add category_id from allProducts.
  const allProductsById = new Map((allProducts ?? []).map(p => [p.id, p]));
  const menuProductsWithCategory = (menuProducts ?? [])
    .map(mp => {
      const fromAll = allProductsById.get(mp.id);
      if (!fromAll) return undefined;
      return { ...mp, category_id: fromAll.category_id };
    })
    .filter((p): p is Product => p !== undefined);
  const productsByCategory = buildProductsByCategory(menuProductsWithCategory);

  const catIds = menuCategories?.map((c) => c.id) ?? [];

  // ── Render ────────────────────────────────────────────────────────────────

  if (menuLoading) return <p style={{ color: "var(--muted)" }}>Cargando...</p>;
  if (!menu) return <p className="text-red-500">Menú no encontrado.</p>;

  const editorContent = (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <Link
          to="/admin/menus"
          className="text-sm inline-flex items-center gap-1 mb-3 hover:underline"
          style={{ color: "var(--muted)" }}
        >
          ← Volver a Menús
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1
              className="text-xl font-display font-semibold"
              style={{ color: "var(--coffee)" }}
            >
              {menu.name}
            </h1>
            {menu.description && (
              <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
                {menu.description}
              </p>
            )}
            <span
              className={`mt-1 inline-block px-2 py-0.5 text-xs rounded-full font-medium ${menu.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
            >
              {menu.is_active ? "Activo" : "Inactivo"}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setForm({
                  name: menu.name,
                  description: menu.description ?? "",
                  is_active: menu.is_active,
                });
                setEditModal(true);
              }}
              className="admin-btn-secondary px-3 py-1.5 text-sm rounded-md cursor-pointer"
            >
              Editar
            </button>
            <button
              disabled={duplicateMutation.isPending}
              onClick={() => { setCopyName(null); duplicateMutation.mutate() }}
              className="admin-btn-secondary px-3 py-1.5 text-sm rounded-md disabled:opacity-50 cursor-pointer"
              title="Crea una copia inactiva del menú actual como respaldo"
            >
              {duplicateMutation.isPending ? "Copiando..." : "☁ Copia de seguridad"}
            </button>
            <button
              disabled={regenerateMutation.isPending || !menu}
              onClick={() => regenerateMutation.mutate()}
              className="admin-btn-primary px-3 py-1.5 text-sm rounded-md disabled:opacity-50 cursor-pointer"
              title="Guarda los cambios actuales y regenera el PDF"
            >
              {regenerateMutation.isPending ? "Generando..." : "↻ PDF"}
            </button>
          </div>
          {copyName && (
            <p className="text-xs mt-2" style={{ color: 'var(--gold)' }}>
              ✓ Copia creada: <strong>{copyName}</strong> — visible en la lista de menús
            </p>
          )}
        </div>
      </div>

      {/* Category DnD list */}
      {menuCategories?.length === 0 && (
        <p className="text-sm italic" style={{ color: "var(--subtle)" }}>
          Sin categorías asignadas. Agregá una abajo.
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleCategoryDragEnd}
      >
        <SortableContext items={catIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {menuCategories?.map((cat) => {
              const catProds = productsByCategory.get(cat.id) ?? [];
              const availableProds =
                (allProducts ?? []).filter((p) => !assignedProdIds.has(p.id));

              return (
                <SortableCategoryBlock
                  key={cat.id}
                  category={cat}
                  products={catProds}
                  availableProducts={availableProds}
                  addProdId={addProdIds[cat.id] ?? 0}
                  isAddingProd={addProdMutation.isPending}
                  onAddProdChange={(catId, prodId) =>
                    setAddProdIds({ ...addProdIds, [catId]: prodId })
                  }
                  onAddProd={(catId) => {
                    const prodId = addProdIds[catId];
                    if (prodId) {
                      addProdMutation.mutate({
                        prodId,
                        pos: (menuProducts?.length ?? 0) + 1,
                      });
                      setAddProdIds({ ...addProdIds, [catId]: 0 });
                    }
                  }}
                  onRemoveCat={setRemoveCatTarget}
                  onRemoveProd={setRemoveProdTarget}
                  onProductReorder={handleProductReorder}
                  onDisplayChange={handleDisplayChange}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add category */}
      <div className="flex gap-2 pt-2">
        <select
          value={addCatId}
          onChange={(e) => setAddCatId(Number(e.target.value))}
          className="admin-input flex-1 rounded-md px-3 py-2 text-sm cursor-pointer"
        >
          <option value={0}>Agregar categoría al menú...</option>
          {allCategories?.data
            .filter((c) => !assignedCatIds.has(c.id))
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
        <button
          disabled={!addCatId || addCatMutation.isPending}
          onClick={() =>
            addCatId &&
            addCatMutation.mutate({
              catId: addCatId,
              pos: (menuCategories?.length ?? 0) + 1,
            })
          }
          className="admin-btn-primary px-4 py-2 text-sm rounded-md disabled:opacity-50 cursor-pointer"
        >
          Agregar
        </button>
      </div>
    </div>
  );

  const previewContent = (
    <MenuPreview
      categories={menuCategories ?? []}
      productsByCategory={productsByCategory}
    />
  );

  return (
    <>
      {/* Desktop: split screen */}
      <div
        className="hidden md:flex gap-0"
        style={{ minHeight: "calc(100vh - 160px)" }}
      >
        <div
          className="flex-1 overflow-y-auto pr-6"
          style={{ maxHeight: "calc(100vh - 130px)" }}
        >
          {editorContent}
        </div>
        <div
          className="w-80 xl:w-96 flex-shrink-0 overflow-y-auto rounded-lg"
          style={{
            maxHeight: "calc(100vh - 130px)",
            backgroundColor: "var(--bg-alt)",
            border: "1px solid var(--border)",
          }}
        >
          {previewContent}
        </div>
      </div>

      {/* Mobile: toggle tabs */}
      <div className="md:hidden">
        <div
          className="flex mb-4 rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          <button
            onClick={() => setTab("editor")}
            className="flex-1 py-2 text-sm font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor:
                tab === "editor" ? "var(--gold)" : "var(--card-bg)",
              color: tab === "editor" ? "#fff" : "var(--muted)",
            }}
          >
            Editor
          </button>
          <button
            onClick={() => setTab("preview")}
            className="flex-1 py-2 text-sm font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor:
                tab === "preview" ? "var(--gold)" : "var(--card-bg)",
              color: tab === "preview" ? "#fff" : "var(--muted)",
            }}
          >
            Preview
          </button>
        </div>
        {tab === "editor" ? (
          editorContent
        ) : (
          <div
            className="rounded-lg"
            style={{
              backgroundColor: "var(--bg-alt)",
              border: "1px solid var(--border)",
            }}
          >
            {previewContent}
          </div>
        )}
      </div>

      {/* Edit menu modal */}
      <Modal
        open={editModal}
        title="Editar menú"
        onClose={() => setEditModal(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateMutation.mutate(form);
          }}
          className="space-y-4"
        >
          <div>
            <label className="admin-label block mb-1">Nombre *</label>
            <input
              required
              value={form.name ?? ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="admin-input w-full rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="admin-label block mb-1">Descripción</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
              className="admin-input w-full rounded-md px-3 py-2 text-sm"
            />
          </div>
          <label
            className="flex items-center gap-2 text-sm cursor-pointer"
            style={{ color: "var(--coffee)" }}
          >
            <input
              type="checkbox"
              checked={form.is_active ?? true}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
            />
            Activo
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditModal(false)}
              className="admin-btn-secondary px-4 py-2 text-sm rounded-md cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="admin-btn-primary px-4 py-2 text-sm rounded-md disabled:opacity-50 cursor-pointer"
            >
              {updateMutation.isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!removeCatTarget}
        title="¿Quitar categoría del menú?"
        description={`Se quitará "${removeCatTarget?.name}" del menú. Los productos de esta categoría permanecerán asignados.`}
        onConfirm={() =>
          removeCatTarget && removeCatMutation.mutate(removeCatTarget.id)
        }
        onCancel={() => setRemoveCatTarget(null)}
        loading={removeCatMutation.isPending}
      />
      <ConfirmDialog
        open={!!removeProdTarget}
        title="¿Quitar producto del menú?"
        description={`Se quitará "${removeProdTarget?.name}" del menú.`}
        onConfirm={() =>
          removeProdTarget && removeProdMutation.mutate(removeProdTarget.id)
        }
        onCancel={() => setRemoveProdTarget(null)}
        loading={removeProdMutation.isPending}
      />
    </>
  );
}
