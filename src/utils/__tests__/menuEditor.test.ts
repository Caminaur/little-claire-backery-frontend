import { describe, it, expect } from 'vitest'
import { buildProductsByCategory } from '../menuEditor'
import type { Product } from '@/types'

const makeProduct = (id: number, category_id: number): Product => ({
  id,
  category_id,
  name: `Product ${id}`,
  description: null,
  is_active: true,
  variants: [],
})

describe('buildProductsByCategory', () => {
  it('returns empty map for empty array', () => {
    const result = buildProductsByCategory([])
    expect(result.size).toBe(0)
  })

  it('groups products by category_id', () => {
    const products = [
      makeProduct(1, 10),
      makeProduct(2, 10),
      makeProduct(3, 20),
    ]
    const result = buildProductsByCategory(products)

    expect(result.get(10)).toHaveLength(2)
    expect(result.get(20)).toHaveLength(1)
    expect(result.get(10)?.map(p => p.id)).toEqual([1, 2])
    expect(result.get(20)?.map(p => p.id)).toEqual([3])
  })

  it('includes all products regardless of whether category_id matches menu categories', () => {
    // This is the core regression test for the bug:
    // products were previously filtered out if their category_id wasn't in
    // the menu's assigned category IDs (e.g. when the backend returns pivot IDs).
    const menuCategoryIds = new Set([99, 100]) // IDs as returned by the menu API
    const products = [
      makeProduct(1, 10), // category_id=10 is NOT in menuCategoryIds
      makeProduct(2, 20), // category_id=20 is NOT in menuCategoryIds
    ]

    const result = buildProductsByCategory(products)

    // Both products must be in the map — no filtering by external category IDs
    expect(result.get(10)).toHaveLength(1)
    expect(result.get(20)).toHaveLength(1)
    // Verify the old broken behavior would have returned nothing
    expect([...result.keys()].every(id => !menuCategoryIds.has(id))).toBe(true)
  })

  it('preserves product order within each category', () => {
    const products = [
      makeProduct(3, 10),
      makeProduct(1, 10),
      makeProduct(2, 10),
    ]
    const result = buildProductsByCategory(products)
    expect(result.get(10)?.map(p => p.id)).toEqual([3, 1, 2])
  })

  it('handles a single product', () => {
    const products = [makeProduct(42, 7)]
    const result = buildProductsByCategory(products)
    expect(result.size).toBe(1)
    expect(result.get(7)?.[0].id).toBe(42)
  })
})
