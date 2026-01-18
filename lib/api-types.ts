/**
 * Centralized API Response Types
 *
 * These types match the Prisma models and represent the shape of API responses.
 * Use these for type-safe API calls and data handling throughout the app.
 *
 * Usage:
 *   import type { User, Product, Order, Course, Blog } from '@/lib/api-types'
 *   const user = await api.get<User>('/api/user')
 */

import type { Role } from '@prisma/client'

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string
  email?: string | null
  role: Role
  name?: string | null
  avatar?: string | null
  phone?: string | null
  points: number
  level: number
  badge: string
  isVerified: boolean
  lastLoginAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * User profile for display (excludes sensitive fields)
 */
export type UserProfile = Pick<User, 'id' | 'name' | 'avatar' | 'email' | 'role' | 'points' | 'level' | 'badge'>

/**
 * Session user (minimal, from NextAuth)
 */
export interface SessionUser {
  email?: string | null
  image?: string | null
  name?: string | null
  role?: Role
}

// ============================================================================
// Product Types
// ============================================================================

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'

export interface Product {
  id: string
  name: string
  slug: string
  description?: string | null
  price: number // Price in cents
  sku?: string | null
  stock: number
  status: ProductStatus
  imageUrl?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ProductWithImages extends Product {
  images?: ProductImage[]
}

export interface ProductImage {
  id: string
  url: string
  alt?: string | null
  order: number
}

// ============================================================================
// Order Types
// ============================================================================

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED'

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  totalAmount: number // Total in cents
  paymentStatus: PaymentStatus
  paymentMethod?: string | null
  paymentId?: string | null
  stripeSessionId?: string | null
  shippingAddress?: string | null
  shippingStatus?: string | null
  trackingNumber?: string | null
  createdAt: Date
  updatedAt: Date
  paidAt?: Date | null
  shippedAt?: Date | null
  deliveredAt?: Date | null
}

export interface OrderWithItems extends Order {
  items?: OrderItem[]
  user?: UserProfile
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  priceSnapshot: number // Price in cents at time of order
  subtotal: number // quantity * priceSnapshot
}

export interface OrderItemWithProduct extends OrderItem {
  product?: Product
}

// ============================================================================
// Course Types
// ============================================================================

export interface Course {
  id: string
  title: string
  description?: string | null
  content?: string | null
  price?: number | null // Price in cents; null = free
  isPaid: boolean
  imageUrl?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CourseWithLessons extends Course {
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  description?: string | null
  content?: string | null
  videoUrl?: string | null
  order: number
  duration?: number | null // Duration in seconds
  createdAt: Date
  updatedAt: Date
}

export interface UserLessonProgress {
  id: string
  userId: string
  courseId: string
  lessonId: string
  completed: boolean
  completedAt?: Date | null
  watchedMinutes: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Course enrollment status for learner
 */
export interface CourseProgress {
  courseId: string
  coursesEnrolled: number
  lessonsCompleted: number
  progress: number // Percentage 0-100
  lastAccessed?: Date | null
}

// ============================================================================
// Blog Types
// ============================================================================

export interface Blog {
  id: string
  title: string
  content: string
  authorId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface BlogWithAuthor extends Blog {
  author?: UserProfile
}

/**
 * Blog preview for listing (excerpt, not full content)
 */
export interface BlogPreview {
  id: string
  title: string
  excerpt: string
  authorId?: string | null
  createdAt: Date
}

// ============================================================================
// Activity Log Types
// ============================================================================

export interface ActivityLog {
  id: string
  userId: string
  action: string
  route?: string | null
  reason?: string | null
  userRole?: string | null
  pointsEarned: number
  timestamp: Date
}

// ============================================================================
// API Response Envelope (Optional)
// ============================================================================

/**
 * Standard API response envelope for consistent error/success handling
 */
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  status: number
}

/**
 * Paginated list response
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ============================================================================
// Request Body Types
// ============================================================================

/**
 * User registration payload
 */
export interface RegisterRequest {
  email?: string | null
  phone?: string | null
  password: string
  name?: string | null
}

/**
 * User login payload
 */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * Product creation/update payload
 */
export interface ProductRequest {
  name: string
  slug: string
  description?: string
  price: number
  sku?: string
  stock: number
  status: ProductStatus
  imageUrl?: string
}

/**
 * Course creation/update payload
 */
export interface CourseRequest {
  title: string
  description?: string
  content?: string
  price?: number
  isPaid: boolean
  imageUrl?: string
}

/**
 * Lesson creation/update payload
 */
export interface LessonRequest {
  courseId: string
  title: string
  description?: string
  content?: string
  videoUrl?: string
  order: number
  duration?: number
}

/**
 * Order creation payload
 */
export interface OrderRequest {
  items: Array<{
    productId: string
    quantity: number
  }>
  shippingAddress?: string
}

/**
 * Blog post creation/update payload
 */
export interface BlogRequest {
  title: string
  content: string
}
