import type { Category, PaginatedResponse } from '@/types'
import { mockCategories, delay } from '@/mock/store'

export async function getCategories(_page = 1): Promise<PaginatedResponse<Category>> {
  await delay()
  return mockCategories.getAll(_page)
}

export async function getCategory(id: number): Promise<Category> {
  await delay()
  return mockCategories.getById(id)
}

export async function createCategory(payload: Partial<Category>): Promise<Category> {
  await delay()
  return mockCategories.create(payload)
}

export async function updateCategory(id: number, payload: Partial<Category>): Promise<Category> {
  await delay()
  return mockCategories.update(id, payload)
}

export async function deleteCategory(id: number): Promise<void> {
  await delay()
  mockCategories.delete(id)
}

export async function reorderCategories(ids: number[]): Promise<void> {
  await delay()
  mockCategories.reorder(ids)
}
