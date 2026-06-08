import Link from 'next/link'
import {
  getShopCategory,
  CATEGORY_ACCENT_CLASSES,
  type ShopCategoryId,
} from '@/lib/shop/categories'

type ProductCategoryBadgeProps = {
  category: ShopCategoryId
  linked?: boolean
  size?: 'sm' | 'md'
}

export default function ProductCategoryBadge({
  category,
  linked = false,
  size = 'sm',
}: ProductCategoryBadgeProps) {
  const meta = getShopCategory(category)
  const accent = CATEGORY_ACCENT_CLASSES[meta.accent]
  const className = `${accent.badge} inline-flex items-center gap-1 rounded-full font-medium ${
    size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'
  }`

  const content = (
    <>
      <span aria-hidden>{meta.emoji}</span>
      {meta.label}
    </>
  )

  if (linked) {
    return (
      <Link href={`/shop?category=${meta.slug}`} className={`${className} hover:opacity-90`}>
        {content}
      </Link>
    )
  }

  return <span className={className}>{content}</span>
}
