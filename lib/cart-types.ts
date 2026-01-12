/**
 * Cart state types
 * 
 * Represents items in the shopping cart before checkout.
 * Persisted to localStorage only (no auth/sensitive data).
 */

export interface CartItem {
  productId: string
  name: string
  price: number // Price in cents
  quantity: number
}

export interface Cart {
  items: CartItem[]
  total: number // Total in cents
}
