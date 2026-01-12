import { notFound } from 'next/navigation'
import PublicLayout from '@/components/layouts/PublicLayout'
import EmptyState from '@/components/ui/EmptyState'
import type { Post } from '@/components/blog/PostCard'

const posts: Post[] = [
  {
    slug: 'learning-in-seasons',
    title: 'Learning in seasons',
    excerpt: 'How to embrace the natural ebbs and flows of focus, motivation, and rest without losing momentum.',
    date: 'Jan 10, 2026',
    readingTime: '6 min read',
    tags: ['mindset', 'habits']
  },
  {
    slug: 'write-gently-teach-clearly',
    title: 'Write gently, teach clearly',
    excerpt: 'Use warm, direct language to guide learners without overwhelming them with jargon.',
    date: 'Dec 28, 2025',
    readingTime: '5 min read',
    tags: ['writing', 'instructional-design']
  },
  {
    slug: 'designing-trust-in-learning',
    title: 'Designing for trust in learning',
    excerpt: 'Small signals—like thoughtful defaults and calm spacing—help learners feel safe to explore.',
    date: 'Dec 12, 2025',
    readingTime: '7 min read',
    tags: ['design', 'ux']
  }
]

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = posts.find((p) => p.slug === params.slug)

  if (!post) {
    notFound()
  }

  return (
    <PublicLayout>
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-gray-500">{post.date} · {post.readingTime}</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 leading-tight">{post.title}</h1>
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <article className="prose prose-neutral mt-8">
          <p>
            We are still setting up the CMS, so here is a placeholder draft. The real post will share
            practical patterns for calm learning experiences.
          </p>
          <p>
            In the meantime, imagine a thoughtfully written piece that respects your time, offers a few
            actionable takeaways, and keeps the tone warm and human.
          </p>
        </article>
      </main>
    </PublicLayout>
  )
}
