import type { Product } from '@/types'

/**
 * Groups an array of menu products by their category_id.
 * All products from getMenuProducts() are included — no cross-check with
 * menu categories is done here, to avoid silent data loss when IDs mismatch.
 */
export function buildProductsByCategory(products: Product[]): Map<number, Product[]> {
  const map = new Map<number, Product[]>()
  for (const prod of products) {
    const group = map.get(prod.category_id) ?? []
    group.push(prod)
    map.set(prod.category_id, group)
  }
  return map
}
