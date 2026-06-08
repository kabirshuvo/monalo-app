import type { HomeSurfaceHeroProps } from '@/components/home/HomeSurfaceHero'

export const HOME_SURFACE_HEROES: HomeSurfaceHeroProps[] = [
  {
    eyebrow: 'Blog',
    title: 'Stories, ideas, and quiet inspiration',
    description:
      'Read articles from MonAlo writers — learning tips, craft notes, and school news. Earn points while you read.',
    href: '/blog',
    cta: 'Read the blog',
    emoji: '✍️',
    gradient: 'from-violet-50/80 to-indigo-50/60 dark:from-violet-950/40 dark:to-indigo-950/30',
  },
  {
    eyebrow: 'Craft shop',
    title: 'Handmade goods that fund the school',
    description:
      'Gypsum pottery, artisan candles, wood and bamboo crafts — every purchase supports students and programs at Monalo School.',
    href: '/shop',
    cta: 'Browse the shop',
    secondaryHref: '/shop?category=gypsum-pottery',
    secondaryCta: 'Gypsum pottery',
    emoji: '🏺',
    gradient: 'from-amber-50/90 to-orange-50/70 dark:from-amber-950/35 dark:to-orange-950/25',
  },
  {
    eyebrow: 'Gallery',
    title: 'Art from our studio collective',
    description:
      'Watercolors, acrylics, and original pieces by Monalo artists. Collect work that helps keep creative programs alive.',
    href: '/gallery',
    cta: 'View gallery',
    emoji: '🎨',
    gradient: 'from-rose-50/80 to-pink-50/60 dark:from-rose-950/35 dark:to-pink-950/25',
  },
  {
    eyebrow: 'Team',
    title: 'Freelance skills for hire',
    description:
      'Software, design, video, and personal-assistant services from the Monalo team — client revenue flows back to the school.',
    href: '/team',
    cta: 'Meet the team',
    emoji: '🤝',
    gradient: 'from-emerald-50/80 to-teal-50/60 dark:from-emerald-950/35 dark:to-teal-950/25',
  },
  {
    eyebrow: 'Learn',
    title: 'Courses built for real growth',
    description:
      'Structured lessons, progress tracking, and Eco Penguin for young learners — study at your pace with MonAlo courses.',
    href: '/courses',
    cta: 'Explore courses',
    secondaryHref: '/learning/ecopenguin',
    secondaryCta: 'Eco Penguin',
    emoji: '📚',
    gradient: 'from-sky-50/80 to-blue-50/60 dark:from-sky-950/35 dark:to-blue-950/25',
  },
]
