'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { blogHref } from '@/lib/urls'
import type { BlogStatus } from '@prisma/client'

export type ArticleRow = {
  id: string
  title: string
  slug: string
  status: BlogStatus
  publishedAt: string | null
  updatedAt: string
  author?: { name: string | null; email: string | null } | null
}

type ArticleListActionsProps = {
  post: ArticleRow
  isAdmin: boolean
}

export default function ArticleListActions({ post, isAdmin }: ArticleListActionsProps) {
  const publicHref = blogHref(post.slug)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={post.status === 'PUBLISHED' ? 'success' : 'warning'} size="sm">
        {post.status === 'PUBLISHED' ? 'Published' : 'Draft'}
      </Badge>
      {isAdmin && post.author?.name && (
        <span className="text-xs text-gray-500">{post.author.name}</span>
      )}
      <Link href={`/dashboard/articles/${post.id}/edit`}>
        <Button variant="secondary" size="sm">
          Edit
        </Button>
      </Link>
      {post.status === 'PUBLISHED' && (
        <Link href={publicHref} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm">
            View
          </Button>
        </Link>
      )}
    </div>
  )
}
