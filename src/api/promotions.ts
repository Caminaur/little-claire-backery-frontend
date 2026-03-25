import type { Promotion, Product, PaginatedResponse } from '@/types'
import { mockPromotions, delay } from '@/mock/store'

export async function getPromotions(_page = 1): Promise<PaginatedResponse<Promotion>> {
  await delay()
  return mockPromotions.getAll(_page)
}

export async function getPromotion(id: number): Promise<Promotion> {
  await delay()
  return mockPromotions.getById(id)
}

export async function createPromotion(payload: Partial<Promotion>): Promise<Promotion> {
  await delay()
  return mockPromotions.create(payload)
}

export async function updatePromotion(id: number, payload: Partial<Promotion>): Promise<Promotion> {
  await delay()
  return mockPromotions.update(id, payload)
}

export async function deletePromotion(id: number): Promise<void> {
  await delay()
  mockPromotions.delete(id)
}

export async function getPromotionProducts(promotionId: number): Promise<Product[]> {
  await delay()
  return mockPromotions.getProducts(promotionId)
}

export async function addPromotionProduct(promotionId: number, productId: number): Promise<void> {
  await delay()
  mockPromotions.addProduct(promotionId, productId)
}

export async function removePromotionProduct(promotionId: number, productId: number): Promise<void> {
  await delay()
  mockPromotions.removeProduct(promotionId, productId)
}
