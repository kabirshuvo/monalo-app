import PublicLayout from '@/components/layouts/PublicLayout'
import CourseCard, { Course } from '@/components/courses/CourseCard'
import EmptyState from '@/components/ui/EmptyState'

const courses: Course[] = [
  {
    id: 'c-201',
    title: 'Learning Mindset',
    summary: 'Build habits that keep you curious, consistent, and kind to yourself.',
    level: 'Beginner',
    duration: '2h 10m',
    enrolled: true,
    progress: 35
  },
  {
    id: 'c-202',
    title: 'Writing for Clarity',
    summary: 'Practical frameworks to express ideas with calm, confident language.',
    level: 'Intermediate',
    duration: '3h 05m',
    enrolled: false
  },
  {
    id: 'c-203',
    title: 'Designing Learning Journeys',
    summary: 'Map outcomes, plan lessons, and guide learners with empathy.',
    level: 'Advanced',
    duration: '2h 45m',
    enrolled: false
  }
]

export default function CoursesPage() {
  return (
    <PublicLayout>
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10 space-y-3">
          <p className="text-sm font-semibold text-blue-600">Courses</p>
          <h1 className="text-3xl font-bold text-gray-900">A calm catalog for focused learning</h1>
          <p className="text-gray-600 max-w-3xl">
            Choose a course that meets you where you are. If you are enrolled, you will see your
            progress so you can pick up right where you left off.
          </p>
        </div>

        {courses.length === 0 ? (
          <EmptyState
            variant="courses-learner"
            title="No courses to show yet"
            description="We are curating the next set of lessons. Check back soon or explore the blog while we prepare."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
              />
            ))}
          </div>
        )}
      </main>
    </PublicLayout>
  )
}
