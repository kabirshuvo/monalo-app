import React from 'react'
import Badge from '@/components/ui/Badge'

export type Post = {
  slug: string
  title: string
  excerpt: string
  date: string
  readingTime: string
  tags?: string[]
}

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{post.date}</span>
        <span>{post.readingTime}</span>
      </div>

      <div className="space-y-2">
        <a href={`/blog/${post.slug}`} className="block">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
            {post.title}
          </h3>
        </a>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} size="sm" variant="info">{tag}</Badge>
          ))}
        </div>
      )}

      <a
        href={`/blog/${post.slug}`}
        className="text-sm font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
      >
        Keep reading
        <span aria-hidden>→</span>
      </a>
    </article>
  )
}
