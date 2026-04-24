import client from './client'
import type { Category, PaginatedResponse } from '@/types'

export async function getCategories(page = 1, search = ''): Promise<PaginatedResponse<Category>> {
  const params: Record<string, string> = { page: String(page) }
  if (search) params.search = search
  const { data } = await client.get<PaginatedResponse<Category>>('/api/categories', { params })
  return data
}

export async function uploadCategoryImage(id: number, file: File): Promise<Category> {
  const form = new FormData()
  form.append('image', file)
  const { data } = await client.post<Category>(`/api/categories/${id}/image`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
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
