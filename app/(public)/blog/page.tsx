import PublicLayout from '@/components/layouts/PublicLayout'
import PostCard, { Post } from '@/components/blog/PostCard'
import EmptyState from '@/components/ui/EmptyState'

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

export default function BlogPage() {
  return (
    <PublicLayout>
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-10 space-y-3">
          <p className="text-sm font-semibold text-blue-600">Blog</p>
          <h1 className="text-3xl font-bold text-gray-900">Calm notes on learning and teaching</h1>
          <p className="text-gray-600 max-w-3xl">
            Short, clear essays on building better learning experiences. No CMS yet—just thoughtful drafts.
          </p>
        </div>

        {posts.length === 0 ? (
          <EmptyState
            variant="blog"
            title="No posts yet"
            description="We are writing the first set of essays. Check back soon."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </main>
    </PublicLayout>
  )
}
