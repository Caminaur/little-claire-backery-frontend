import type { Product, ProductVariant, VariantImage, PaginatedResponse } from '@/types'
import { mockProducts, delay } from '@/mock/store'

export async function getProducts(_page = 1): Promise<PaginatedResponse<Product>> {
  await delay()
  return mockProducts.getAll(_page)
}

export async function getProduct(id: number): Promise<Product> {
  await delay()
  return mockProducts.getById(id)
}

export async function createProduct(payload: Partial<Product>): Promise<Product> {
  await delay()
  return mockProducts.create(payload)
}

export async function updateProduct(id: number, payload: Partial<Product>): Promise<Product> {
  await delay()
  return mockProducts.update(id, payload)
}

export async function deleteProduct(id: number): Promise<void> {
  await delay()
  mockProducts.delete(id)
}

// Variants
export async function getVariants(productId: number): Promise<ProductVariant[]> {
  await delay()
  return mockProducts.getVariants(productId)
}

export async function createVariant(productId: number, payload: Partial<ProductVariant>): Promise<ProductVariant> {
  await delay()
  return mockProducts.createVariant(productId, payload)
}

export async function updateVariant(productId: number, variantId: number, payload: Partial<ProductVariant>): Promise<ProductVariant> {
  await delay()
  return mockProducts.updateVariant(productId, variantId, payload)
}

export async function deleteVariant(productId: number, variantId: number): Promise<void> {
  await delay()
  mockProducts.deleteVariant(productId, variantId)
}

// Images
export async function getVariantImages(productId: number, variantId: number): Promise<VariantImage[]> {
  await delay()
  return mockProducts.getImages(productId, variantId)
}

export async function createVariantImage(productId: number, variantId: number, payload: { image: File; position: number }): Promise<VariantImage> {
  await delay()
  return mockProducts.createImage(productId, variantId, payload.image, payload.position)
}

export async function deleteVariantImage(productId: number, variantId: number, imageId: number): Promise<void> {
  await delay()
  mockProducts.deleteImage(productId, variantId, imageId)
}
