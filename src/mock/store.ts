import type { Category, Product, ProductVariant, VariantImage, Menu, Promotion, ContactRequest, PaginatedResponse } from '@/types'
import categoriesJson from '@/data/categories.json'
import productsJson from '@/data/products.json'
import menusJson from '@/data/menus.json'
import promotionsJson from '@/data/promotions.json'
import contactsJson from '@/data/contacts.json'

// ─── helpers ────────────────────────────────────────────────────────────────

export function delay(ms = 150): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

function nextId(items: { id: number }[]): number {
  return items.length === 0 ? 1 : Math.max(...items.map(i => i.id)) + 1
}

export function paginate<T>(items: T[], page = 1, perPage = 15): PaginatedResponse<T> {
  const total = items.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const sliced = items.slice((page - 1) * perPage, page * perPage)
  return {
    data: sliced,
    links: { first: null, last: null, prev: null, next: null },
    meta: { current_page: page, last_page: lastPage, per_page: perPage, total },
  }
}

// ─── initial data (deep-clone so JSON imports are never mutated) ─────────────

interface ProductWithImages extends Product {
  variants: (ProductVariant & { images: VariantImage[] })[]
}

let categories: Category[] = JSON.parse(JSON.stringify(categoriesJson.data))
let products: ProductWithImages[] = JSON.parse(
  JSON.stringify((productsJson.data as Product[]).map(p => ({
    ...p,
    variants: (p.variants ?? []).map((v: ProductVariant) => ({ ...v, images: [] })),
  })))
)
let menus: Menu[] = JSON.parse(JSON.stringify(menusJson.data))
let promotions: Promotion[] = JSON.parse(JSON.stringify(promotionsJson.data))
let contacts: ContactRequest[] = JSON.parse(JSON.stringify(contactsJson))

// menu relations: { [menuId]: { categories, products } }
interface MenuRelation {
  categories: (Category & { position: number })[]
  products: (Product & { position: number })[]
}
let menuRelations: Record<number, MenuRelation> = {
  1: {
    categories: categories.map((c, i) => ({ ...c, position: i + 1 })),
    products: products.map((p, i) => ({ ...p, position: i + 1 })),
  },
}

// promotion relations: { [promotionId]: Product[] }
let promotionRelations: Record<number, Product[]> = {}

// ─── categories ─────────────────────────────────────────────────────────────

export const mockCategories = {
  getAll(page = 1) { return paginate([...categories], page) },

  getById(id: number): Category {
    const found = categories.find(c => c.id === id)
    if (!found) throw new Error(`Category ${id} not found`)
    return { ...found }
  },

  create(payload: Partial<Category>): Category {
    const item: Category = {
      id: nextId(categories),
      name: payload.name ?? '',
      description: payload.description ?? null,
      image_url: payload.image_url ?? null,
      is_visible: payload.is_visible ?? true,
      position: payload.position ?? categories.length + 1,
    }
    categories.push(item)
    return { ...item }
  },

  update(id: number, payload: Partial<Category>): Category {
    const idx = categories.findIndex(c => c.id === id)
    if (idx === -1) throw new Error(`Category ${id} not found`)
    categories[idx] = { ...categories[idx], ...payload }
    return { ...categories[idx] }
  },

  delete(id: number): void {
    categories = categories.filter(c => c.id !== id)
  },

  reorder(ids: number[]): void {
    ids.forEach((id, i) => {
      const idx = categories.findIndex(c => c.id === id)
      if (idx !== -1) categories[idx].position = i + 1
    })
    categories.sort((a, b) => a.position - b.position)
  },
}

// ─── products ────────────────────────────────────────────────────────────────

export const mockProducts = {
  getAll(page = 1) { return paginate([...products], page) },

  getById(id: number): ProductWithImages {
    const found = products.find(p => p.id === id)
    if (!found) throw new Error(`Product ${id} not found`)
    return JSON.parse(JSON.stringify(found))
  },

  create(payload: Partial<Product> & { initial_price?: string }): Product {
    const allVariants = products.flatMap(pr => pr.variants)
    const item: ProductWithImages = {
      id: nextId(products),
      category_id: payload.category_id ?? 0,
      name: payload.name ?? '',
      description: payload.description ?? null,
      is_active: payload.is_active ?? true,
      variants: payload.initial_price !== undefined && payload.initial_price !== ''
        ? [{ id: nextId(allVariants), product_id: nextId(products), label: null, price: String(payload.initial_price), position: 1, is_active: true, images: [] }]
        : [],
    }
    products.push(item)
    return JSON.parse(JSON.stringify(item))
  },

  update(id: number, payload: Partial<Product>): Product {
    const idx = products.findIndex(p => p.id === id)
    if (idx === -1) throw new Error(`Product ${id} not found`)
    products[idx] = { ...products[idx], ...payload }
    return JSON.parse(JSON.stringify(products[idx]))
  },

  delete(id: number): void {
    products = products.filter(p => p.id !== id)
  },

  // variants
  getVariants(productId: number): ProductVariant[] {
    const p = products.find(p => p.id === productId)
    if (!p) throw new Error(`Product ${productId} not found`)
    return JSON.parse(JSON.stringify(p.variants))
  },

  createVariant(productId: number, payload: Partial<ProductVariant>): ProductVariant {
    const p = products.find(p => p.id === productId)
    if (!p) throw new Error(`Product ${productId} not found`)
    const allVariants = products.flatMap(pr => pr.variants)
    const variant = {
      id: nextId(allVariants),
      product_id: productId,
      label: payload.label ?? null,
      price: String(payload.price ?? '0.00'),
      position: payload.position ?? p.variants.length + 1,
      is_active: payload.is_active ?? true,
      images: [] as VariantImage[],
    }
    p.variants.push(variant)
    return JSON.parse(JSON.stringify(variant))
  },

  updateVariant(productId: number, variantId: number, payload: Partial<ProductVariant>): ProductVariant {
    const p = products.find(p => p.id === productId)
    if (!p) throw new Error(`Product ${productId} not found`)
    const idx = p.variants.findIndex(v => v.id === variantId)
    if (idx === -1) throw new Error(`Variant ${variantId} not found`)
    p.variants[idx] = { ...p.variants[idx], ...payload }
    return JSON.parse(JSON.stringify(p.variants[idx]))
  },

  deleteVariant(productId: number, variantId: number): void {
    const p = products.find(p => p.id === productId)
    if (!p) throw new Error(`Product ${productId} not found`)
    p.variants = p.variants.filter(v => v.id !== variantId)
  },

  // images
  getImages(productId: number, variantId: number): VariantImage[] {
    const p = products.find(p => p.id === productId)
    const v = p?.variants.find(v => v.id === variantId)
    return JSON.parse(JSON.stringify(v?.images ?? []))
  },

  createImage(productId: number, variantId: number, file: File, position: number): VariantImage {
    const p = products.find(p => p.id === productId)
    const v = p?.variants.find(v => v.id === variantId)
    if (!v) throw new Error(`Variant ${variantId} not found`)
    const allImages = products.flatMap(pr => pr.variants.flatMap(vr => vr.images))
    const img: VariantImage = {
      id: nextId(allImages),
      product_variant_id: variantId,
      image_url: URL.createObjectURL(file),
      position,
    }
    v.images.push(img)
    return { ...img }
  },

  deleteImage(productId: number, variantId: number, imageId: number): void {
    const p = products.find(p => p.id === productId)
    const v = p?.variants.find(v => v.id === variantId)
    if (v) v.images = v.images.filter(i => i.id !== imageId)
  },
}

// ─── menus ───────────────────────────────────────────────────────────────────

export const mockMenus = {
  getAll(page = 1) { return paginate([...menus], page) },

  getById(id: number): Menu {
    const found = menus.find(m => m.id === id)
    if (!found) throw new Error(`Menu ${id} not found`)
    return { ...found }
  },

  create(payload: Partial<Menu>): Menu {
    const item: Menu = {
      id: nextId(menus),
      name: payload.name ?? '',
      description: payload.description ?? null,
      is_active: payload.is_active ?? true,
      pdf_url: null,
    }
    menus.push(item)
    menuRelations[item.id] = { categories: [], products: [] }
    return { ...item }
  },

  update(id: number, payload: Partial<Menu>): Menu {
    const idx = menus.findIndex(m => m.id === id)
    if (idx === -1) throw new Error(`Menu ${id} not found`)
    menus[idx] = { ...menus[idx], ...payload }
    return { ...menus[idx] }
  },

  delete(id: number): void {
    menus = menus.filter(m => m.id !== id)
    delete menuRelations[id]
  },

  // categories in menu
  getCategories(menuId: number): Category[] {
    const rel = menuRelations[menuId] ?? { categories: [], products: [] }
    return JSON.parse(JSON.stringify(rel.categories.sort((a, b) => a.position - b.position)))
  },

  addCategory(menuId: number, categoryId: number, position: number): void {
    if (!menuRelations[menuId]) menuRelations[menuId] = { categories: [], products: [] }
    const cat = categories.find(c => c.id === categoryId)
    if (!cat) return
    const rel = menuRelations[menuId]
    if (!rel.categories.find(c => c.id === categoryId)) {
      rel.categories.push({ ...cat, position })
    }
  },

  removeCategory(menuId: number, categoryId: number): void {
    const rel = menuRelations[menuId]
    if (rel) rel.categories = rel.categories.filter(c => c.id !== categoryId)
  },

  reorderCategories(menuId: number, items: { id: number; position: number }[]): void {
    const rel = menuRelations[menuId]
    if (!rel) return
    items.forEach(({ id, position }) => {
      const cat = rel.categories.find(c => c.id === id)
      if (cat) cat.position = position
    })
  },

  // products in menu
  getProducts(menuId: number): Product[] {
    const rel = menuRelations[menuId] ?? { categories: [], products: [] }
    return JSON.parse(JSON.stringify(rel.products.sort((a, b) => a.position - b.position)))
  },

  addProduct(menuId: number, productId: number, position: number): void {
    if (!menuRelations[menuId]) menuRelations[menuId] = { categories: [], products: [] }
    const prod = products.find(p => p.id === productId)
    if (!prod) return
    const rel = menuRelations[menuId]
    if (!rel.products.find(p => p.id === productId)) {
      rel.products.push({ ...prod, position })
    }
  },

  removeProduct(menuId: number, productId: number): void {
    const rel = menuRelations[menuId]
    if (rel) rel.products = rel.products.filter(p => p.id !== productId)
  },

  reorderProducts(menuId: number, items: { id: number; position: number }[]): void {
    const rel = menuRelations[menuId]
    if (!rel) return
    items.forEach(({ id, position }) => {
      const prod = rel.products.find(p => p.id === id)
      if (prod) prod.position = position
    })
  },
}

// ─── promotions ──────────────────────────────────────────────────────────────

export const mockPromotions = {
  getAll(page = 1) { return paginate([...promotions], page) },

  getById(id: number): Promotion {
    const found = promotions.find(p => p.id === id)
    if (!found) throw new Error(`Promotion ${id} not found`)
    return { ...found }
  },

  create(payload: Partial<Promotion>): Promotion {
    const item: Promotion = {
      id: nextId(promotions),
      title: payload.title ?? '',
      description: payload.description ?? null,
      discount_type: payload.discount_type ?? 'percentage',
      discount_value: String(payload.discount_value ?? '0'),
      starts_at: payload.starts_at ?? null,
      ends_at: payload.ends_at ?? null,
      is_active: payload.is_active ?? true,
    }
    promotions.push(item)
    promotionRelations[item.id] = []
    return { ...item }
  },

  update(id: number, payload: Partial<Promotion>): Promotion {
    const idx = promotions.findIndex(p => p.id === id)
    if (idx === -1) throw new Error(`Promotion ${id} not found`)
    promotions[idx] = { ...promotions[idx], ...payload }
    return { ...promotions[idx] }
  },

  delete(id: number): void {
    promotions = promotions.filter(p => p.id !== id)
    delete promotionRelations[id]
  },

  getProducts(promotionId: number): Product[] {
    return JSON.parse(JSON.stringify(promotionRelations[promotionId] ?? []))
  },

  addProduct(promotionId: number, productId: number): void {
    if (!promotionRelations[promotionId]) promotionRelations[promotionId] = []
    const prod = products.find(p => p.id === productId)
    if (prod && !promotionRelations[promotionId].find(p => p.id === productId)) {
      promotionRelations[promotionId].push({ ...prod })
    }
  },

  removeProduct(promotionId: number, productId: number): void {
    if (promotionRelations[promotionId]) {
      promotionRelations[promotionId] = promotionRelations[promotionId].filter(p => p.id !== productId)
    }
  },
}

// ─── contacts ────────────────────────────────────────────────────────────────

export const mockContacts = {
  getAll(): ContactRequest[] {
    return JSON.parse(JSON.stringify(contacts))
  },

  getById(id: number): ContactRequest {
    const found = contacts.find(c => c.id === id)
    if (!found) throw new Error(`Contact ${id} not found`)
    return { ...found }
  },

  update(id: number, payload: Partial<ContactRequest>): ContactRequest {
    const idx = contacts.findIndex(c => c.id === id)
    if (idx === -1) throw new Error(`Contact ${id} not found`)
    contacts[idx] = { ...contacts[idx], ...payload }
    return { ...contacts[idx] }
  },

  delete(id: number): void {
    contacts = contacts.filter(c => c.id !== id)
  },
}
