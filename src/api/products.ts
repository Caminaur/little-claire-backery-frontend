import client from './client'
import type { Product, ProductVariant, VariantImage, PaginatedResponse } from '@/types'

export async function getProducts(page = 1): Promise<PaginatedResponse<Product>> {
  const { data } = await client.get<PaginatedResponse<Product>>('/api/products', { params: { page } })
  return data
}

export async function getProduct(id: number): Promise<Product> {
  const { data } = await client.get<Product>(`/api/products/${id}`)
  return data
}

export async function createProduct(payload: Partial<Product>): Promise<Product> {
  const { data } = await client.post<Product>('/api/products', payload)
  return data
}

export async function updateProduct(id: number, payload: Partial<Product>): Promise<Product> {
  const { data } = await client.put<Product>(`/api/products/${id}`, payload)
  return data
}

export async function deleteProduct(id: number): Promise<void> {
  await client.delete(`/api/products/${id}`)
}

// Variants
export async function getVariants(productId: number): Promise<ProductVariant[]> {
  const { data } = await client.get<ProductVariant[]>(`/api/products/${productId}/variants`)
  return data
}

export async function createVariant(productId: number, payload: Partial<ProductVariant>): Promise<ProductVariant> {
  const { data } = await client.post<ProductVariant>(`/api/products/${productId}/variants`, payload)
  return data
}

export async function updateVariant(productId: number, variantId: number, payload: Partial<ProductVariant>): Promise<ProductVariant> {
  const { data } = await client.put<ProductVariant>(`/api/products/${productId}/variants/${variantId}`, payload)
  return data
}

export async function deleteVariant(productId: number, variantId: number): Promise<void> {
  await client.delete(`/api/products/${productId}/variants/${variantId}`)
}

// Images
export async function getVariantImages(productId: number, variantId: number): Promise<VariantImage[]> {
  const { data } = await client.get<VariantImage[]>(`/api/products/${productId}/variants/${variantId}/images`)
  return data
}

export async function createVariantImage(productId: number, variantId: number, payload: { image_url: string; position: number }): Promise<VariantImage> {
  const { data } = await client.post<VariantImage>(`/api/products/${productId}/variants/${variantId}/images`, payload)
  return data
}

export async function deleteVariantImage(productId: number, variantId: number, imageId: number): Promise<void> {
  await client.delete(`/api/products/${productId}/variants/${variantId}/images/${imageId}`)
}
