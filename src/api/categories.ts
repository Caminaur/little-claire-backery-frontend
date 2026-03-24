import client from './client'
import type { Category, PaginatedResponse } from '@/types'

export async function getCategories(page = 1): Promise<PaginatedResponse<Category>> {
  const { data } = await client.get<PaginatedResponse<Category>>('/api/categories', { params: { page } })
  return data
}

export async function getCategory(id: number): Promise<Category> {
  const { data } = await client.get<Category>(`/api/categories/${id}`)
  return data
}

export async function createCategory(payload: Partial<Category>): Promise<Category> {
  const { data } = await client.post<Category>('/api/categories', payload)
  return data
}

export async function updateCategory(id: number, payload: Partial<Category>): Promise<Category> {
  const { data } = await client.put<Category>(`/api/categories/${id}`, payload)
  return data
}

export async function deleteCategory(id: number): Promise<void> {
  await client.delete(`/api/categories/${id}`)
}

export async function reorderCategories(ids: number[]): Promise<void> {
  await client.put('/api/categories/reorder', { ids })
}
