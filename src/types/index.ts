export interface Category {
  id: number
  name: string
  description: string | null
  image_url: string | null
  is_visible: boolean
  position: number
  price_display: 'auto' | 'price_box' | 'inline_banner'
  is_full_width: boolean
}

export interface ProductVariant {
  id: number
  product_id: number
  label: string | null
  price: string
  position: number
  is_active: boolean
}

export interface VariantImage {
  id: number
  product_variant_id: number
  image_url: string
  position: number
}

export interface Product {
  id: number
  category_id: number
  name: string
  description: string | null
  is_active: boolean
  variants: ProductVariant[]
}

export interface Menu {
  id: number
  name: string
  description: string | null
  is_active: boolean
  pdf_url: string | null
}

export interface Promotion {
  id: number
  title: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: string
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
}

export interface ContactRequest {
  id: number
  name: string
  email: string
  phone: string
  message: string | null
  type: 'general' | 'catering'
  is_read: boolean
}

export interface User {
  id: number
  email: string
}

export interface PaginatedResponse<T> {
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
