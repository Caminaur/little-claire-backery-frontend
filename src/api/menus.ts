import type { Menu, Category, Product, PaginatedResponse } from '@/types'
import { mockMenus, delay } from '@/mock/store'

export async function getMenus(_page = 1): Promise<PaginatedResponse<Menu>> {
  await delay()
  return mockMenus.getAll(_page)
}

export async function getMenu(id: number): Promise<Menu> {
  await delay()
  return mockMenus.getById(id)
}

export async function createMenu(payload: Partial<Menu>): Promise<Menu> {
  await delay()
  return mockMenus.create(payload)
}

export async function updateMenu(id: number, payload: Partial<Menu>): Promise<Menu> {
  await delay()
  return mockMenus.update(id, payload)
}

export async function deleteMenu(id: number): Promise<void> {
  await delay()
  mockMenus.delete(id)
}

// Menu categories
export async function getMenuCategories(menuId: number): Promise<Category[]> {
  await delay()
  return mockMenus.getCategories(menuId)
}

export async function addMenuCategory(menuId: number, categoryId: number, position: number): Promise<void> {
  await delay()
  mockMenus.addCategory(menuId, categoryId, position)
}

export async function reorderMenuCategories(menuId: number, categories: { id: number; position: number }[]): Promise<void> {
  await delay()
  mockMenus.reorderCategories(menuId, categories)
}

export async function removeMenuCategory(menuId: number, categoryId: number): Promise<void> {
  await delay()
  mockMenus.removeCategory(menuId, categoryId)
}

// Menu products
export async function getMenuProducts(menuId: number): Promise<Product[]> {
  await delay()
  return mockMenus.getProducts(menuId)
}

export async function addMenuProduct(menuId: number, productId: number, position: number): Promise<void> {
  await delay()
  mockMenus.addProduct(menuId, productId, position)
}

export async function reorderMenuProducts(menuId: number, products: { id: number; position: number }[]): Promise<void> {
  await delay()
  mockMenus.reorderProducts(menuId, products)
}

export async function removeMenuProduct(menuId: number, productId: number): Promise<void> {
  await delay()
  mockMenus.removeProduct(menuId, productId)
}
