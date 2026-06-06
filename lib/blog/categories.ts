/** Slug → category label for guardian/kids articles (matches seed data). */
const BLOG_CATEGORIES: Record<string, string> = {
  'screen-time-boundaries': 'Digital life',
  'homework-routines': 'School',
  'school-night-sleep': 'Wellbeing',
  'school-anxiety': 'Wellbeing',
  'bullying-response': 'Safety',
  'shy-kid-confidence': 'Growth',
  'picky-eating': 'Health',
  'morning-routines': 'Home',
  'talking-about-feelings': 'Connection',
  'friendships-social-skills': 'Growth',
  'after-school-meltdowns': 'Wellbeing',
  'reading-together': 'Learning',
  'kids-say-bored': 'Home',
  'resilience-disappointment': 'Growth',
  'sibling-rivalry': 'Family',
  'parent-teacher-meetings': 'School',
  'digital-safety-basics': 'Digital life',
  'outdoor-play-weather': 'Health',
  'homework-help-balance': 'School',
  'test-anxiety-strategies': 'School',
  'chores-responsibility': 'Home',
  'gaming-limits': 'Digital life',
  'back-to-school-transitions': 'School',
  'gratitude-habits': 'Connection',
  'when-to-get-a-tutor': 'Learning',
  'mindfulness-young-children': 'Wellbeing',
  'effort-over-grades': 'Growth',
  'co-parenting-school': 'Family',
  'teen-independence': 'Teens',
  'calm-learning-corner': 'Home',
}

export function blogCategoryForSlug(slug: string): string | undefined {
  return BLOG_CATEGORIES[slug]
}

export function blogCategoryMap(): Record<string, string> {
  return BLOG_CATEGORIES
}
