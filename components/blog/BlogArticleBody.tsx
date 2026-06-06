'use client'

import { sanitizeBlogHtml } from '@/lib/blog/sanitize'

type BlogArticleBodyProps = {
  content: string
  className?: string
}

const proseMedia =
  'prose prose-neutral dark:prose-invert max-w-none ' +
  '[&_img]:my-8 [&_img]:rounded-xl [&_img]:border [&_img]:border-gray-200 dark:[&_img]:border-zinc-800 ' +
  '[&_.blog-video-embed]:my-8 [&_.blog-video-embed_iframe]:aspect-video [&_.blog-video-embed_iframe]:w-full [&_.blog-video-embed_iframe]:rounded-xl [&_.blog-video-embed_iframe]:border [&_.blog-video-embed_iframe]:border-gray-200 dark:[&_.blog-video-embed_iframe]:border-zinc-800 ' +
  '[&_[data-youtube-video]]:my-8 [&_[data-youtube-video]_iframe]:aspect-video [&_[data-youtube-video]_iframe]:w-full [&_[data-youtube-video]_iframe]:rounded-xl'

/** Renders blog HTML or plain text paragraphs. */
export default function BlogArticleBody({ content, className = '' }: BlogArticleBodyProps) {
  const trimmed = content.trim()
  const isHtml = /<[a-z][\s\S]*>/i.test(trimmed)

  if (isHtml) {
    return (
      <div
        className={`${proseMedia} ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(trimmed) }}
      />
    )
  }

  return (
    <article className={`${proseMedia} ${className}`}>
      {trimmed.split('\n\n').filter(Boolean).map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </article>
  )
}
