import client from './client'
import type { Product, ProductVariant, VariantImage, PaginatedResponse } from '@/types'

export async function getProducts(page = 1, search = ''): Promise<PaginatedResponse<Product>> {
  const params: Record<string, string> = { page: String(page) }
  if (search) params.search = search
  const { data } = await client.get<PaginatedResponse<Product>>('/api/products', { params })
  return data
}

export async function uploadProductImage(id: number, file: File): Promise<Product> {
  const form = new FormData()
  form.append('image', file)
  const { data } = await client.post<Product>(`/api/products/${id}/image`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function getAllProducts(): Promise<Product[]> {
  const first = await getProducts(1)
  if (first.meta.last_page === 1) return first.data
  const rest = await Promise.all(
    Array.from({ length: first.meta.last_page - 1 }, (_, i) => getProducts(i + 2))
  )
  return [first.data, ...rest.map(p => p.data)].flat()
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

export async function createVariantImage(productId: number, variantId: number, payload: { image: File; position: number }): Promise<VariantImage> {
  const form = new FormData()
  form.append('image', payload.image)
  form.append('position', String(payload.position))
  const { data } = await client.post<VariantImage>(
    `/api/products/${productId}/variants/${variantId}/images`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return data
}

export async function deleteVariantImage(productId: number, variantId: number, imageId: number): Promise<void> {
  await client.delete(`/api/products/${productId}/variants/${variantId}/images/${imageId}`)
}
