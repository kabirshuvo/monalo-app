import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole, AuthorizationError } from '@/lib/auth/role'
import { withCreatedBy } from '@/lib/auth/audit'
import { slugify } from '@/lib/format'
import { isShopCategoryId } from '@/lib/shop/categories'
import { listActiveShopProducts } from '@/lib/shop/queries'
import type { ProductCategory } from '@prisma/client'

/**
 * GET /api/products — public active products
 */
export async function GET() {
  try {
    const products = await listActiveShopProducts()
    return NextResponse.json(
      products.map((p) => ({
        ...p,
        status: 'ACTIVE' as const,
      }))
    )
  } catch (error) {
    console.error('[GET /api/products]', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

/**
 * POST /api/products — ADMIN or SELLER
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(['ADMIN', 'SELLER'])
    const userId = (session.user as { id?: string }).id
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }
    const body = await request.json()
    const name = String(body.name ?? '').trim()
    if (!name || name.length > 255) {
      return NextResponse.json({ error: 'Valid name is required' }, { status: 400 })
    }

    const price = Number(body.price)
    if (!Number.isInteger(price) || price < 0) {
      return NextResponse.json({ error: 'Price must be integer cents' }, { status: 400 })
    }

    const slug = body.slug ? String(body.slug).trim() : slugify(name)
    const stock = Number(body.stock ?? 0)
    const categoryRaw = body.category ? String(body.category) : 'OTHER_CRAFT'
    const category: ProductCategory = isShopCategoryId(categoryRaw)
      ? categoryRaw
      : 'OTHER_CRAFT'

    const product = await prisma.product.create({
      data: withCreatedBy(
        {
          name,
          slug,
          description: body.description ? String(body.description) : null,
          price,
          stock: Number.isInteger(stock) ? stock : 0,
          imageUrl: body.imageUrl ? String(body.imageUrl) : null,
          status: body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
          category,
        },
        userId
      ),
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('[POST /api/products]', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
