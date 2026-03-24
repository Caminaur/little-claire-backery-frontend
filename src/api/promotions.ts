import client from './client'
import type { Promotion, Product, PaginatedResponse } from '@/types'
import staticPromotions from '@/data/promotions.json'

export async function getPromotions(_page = 1): Promise<PaginatedResponse<Promotion>> {
  return staticPromotions as PaginatedResponse<Promotion>
}

export async function getPromotion(id: number): Promise<Promotion> {
  const { data } = await client.get<Promotion>(`/api/promotions/${id}`)
  return data
}

export async function createPromotion(payload: Partial<Promotion>): Promise<Promotion> {
  const { data } = await client.post<Promotion>('/api/promotions', payload)
  return data
}

export async function updatePromotion(id: number, payload: Partial<Promotion>): Promise<Promotion> {
  const { data } = await client.put<Promotion>(`/api/promotions/${id}`, payload)
  return data
}

export async function deletePromotion(id: number): Promise<void> {
  await client.delete(`/api/promotions/${id}`)
}

export async function getPromotionProducts(promotionId: number): Promise<Product[]> {
  const { data } = await client.get<Product[]>(`/api/promotions/${promotionId}/products`)
  return data
}

export async function addPromotionProduct(promotionId: number, productId: number): Promise<void> {
  await client.post(`/api/promotions/${promotionId}/products`, { product_id: productId })
}

export async function removePromotionProduct(promotionId: number, productId: number): Promise<void> {
  await client.delete(`/api/promotions/${promotionId}/products/${productId}`)
}
