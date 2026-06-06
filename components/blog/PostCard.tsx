'use client'

import React from 'react'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { blogHref } from '@/lib/urls'

export type Post = {
  slug: string
  title: string
  excerpt: string
  date: string
  readingTime: string
  pointsLabel?: string
  category?: string
}

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const href = blogHref(post.slug)

  return (
    <article className="group flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-zinc-400 gap-2">
        <span>{post.date}</span>
        <span className="text-right">
          {post.readingTime}
          {post.pointsLabel ? ` · ${post.pointsLabel}` : ''}
        </span>
      </div>

      <div className="space-y-2">
        {post.category && (
          <Badge size="sm" variant="info">
            {post.category}
          </Badge>
        )}
        <Link href={href} className="block">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-50 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
            {post.title}
          </h3>
        </Link>
        <p className="text-gray-600 dark:text-zinc-300 text-sm leading-relaxed line-clamp-2">
          {post.excerpt}
        </p>
      </div>

      <Link
        href={href}
        className="text-sm font-semibold text-purple-700 dark:text-purple-300 hover:underline inline-flex items-center gap-1"
      >
        Keep reading
        <span aria-hidden>→</span>
      </Link>
    </article>
  )
}
