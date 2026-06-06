import Badge from '@/components/ui/Badge'
import BlogReactions from '@/components/blog/BlogReactions'
import type { BlogArticleStats, BlogReactionCounts } from '@/lib/blog/stats'

type BlogArticleMetaProps = {
  slug: string
  stats: BlogArticleStats
  date: string
  authorName?: string | null
  category?: string
  initialCounts?: BlogReactionCounts
}

export default function BlogArticleMeta({
  slug,
  stats,
  date,
  authorName,
  category,
  initialCounts,
}: BlogArticleMetaProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {category && (
          <Badge variant="info" size="sm">
            {category}
          </Badge>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-500 dark:text-zinc-400">
          <span>{date}</span>
          {authorName && <span>{authorName}</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default" size="sm">
            {stats.readLabel}
          </Badge>
          <Badge variant="success" size="sm">
            {stats.pointsLabel}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 dark:text-zinc-400">{stats.pointsHint}</p>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/50 p-4">
        <BlogReactions slug={slug} initialCounts={initialCounts} />
      </div>
    </div>
  )
}
