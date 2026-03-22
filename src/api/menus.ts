import client from './client'
import type { Menu, Category, Product, PaginatedResponse } from '@/types'

export async function getMenus(page = 1): Promise<PaginatedResponse<Menu>> {
  const { data } = await client.get<PaginatedResponse<Menu>>('/api/menus', { params: { page } })
  return data
}

export async function getMenu(id: number): Promise<Menu> {
  const { data } = await client.get<Menu>(`/api/menus/${id}`)
  return data
}

export async function createMenu(payload: Partial<Menu>): Promise<Menu> {
  const { data } = await client.post<Menu>('/api/menus', payload)
  return data
}

export async function updateMenu(id: number, payload: Partial<Menu>): Promise<Menu> {
  const { data } = await client.put<Menu>(`/api/menus/${id}`, payload)
  return data
}

export async function deleteMenu(id: number): Promise<void> {
  await client.delete(`/api/menus/${id}`)
}

// Menu categories
export async function getMenuCategories(menuId: number): Promise<Category[]> {
  const { data } = await client.get<Category[]>(`/api/menus/${menuId}/categories`)
  return data
}

export async function addMenuCategory(menuId: number, categoryId: number, position: number): Promise<void> {
  await client.post(`/api/menus/${menuId}/categories`, { category_id: categoryId, position })
}

export async function reorderMenuCategories(menuId: number, categories: { id: number; position: number }[]): Promise<void> {
  await client.put(`/api/menus/${menuId}/categories/order`, { categories })
}

export async function removeMenuCategory(menuId: number, categoryId: number): Promise<void> {
  await client.delete(`/api/menus/${menuId}/categories/${categoryId}`)
}

// Menu products
export async function getMenuProducts(menuId: number): Promise<Product[]> {
  const { data } = await client.get<Product[]>(`/api/menus/${menuId}/products`)
  return data
}

export async function addMenuProduct(menuId: number, productId: number, position: number): Promise<void> {
  await client.post(`/api/menus/${menuId}/products`, { product_id: productId, position })
}

export async function reorderMenuProducts(menuId: number, products: { id: number; position: number }[]): Promise<void> {
  await client.put(`/api/menus/${menuId}/products/order`, { products })
}

export async function removeMenuProduct(menuId: number, productId: number): Promise<void> {
  await client.delete(`/api/menus/${menuId}/products/${productId}`)
}
