import type { HomeSurfaceHeroProps } from '@/components/home/HomeSurfaceHero'

export const HOME_SURFACE_HEROES: HomeSurfaceHeroProps[] = [
  {
    eyebrow: 'Blog',
    title: 'Stories, ideas, and quiet inspiration',
    description:
      'Read articles from MonAlo writers — learning tips, craft notes, and school news. Earn points while you read.',
    href: '/blog',
    cta: 'Read the blog',
    planet: 'saturn',
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
    planet: 'mars',
  },
  {
    eyebrow: 'Gallery',
    title: 'Art from our studio collective',
    description:
      'Watercolors, acrylics, and original pieces by Monalo artists. Collect work that helps keep creative programs alive.',
    href: '/gallery',
    cta: 'View gallery',
    planet: 'venus',
  },
  {
    eyebrow: 'Team',
    title: 'Freelance skills for hire',
    description:
      'Software, design, video, and personal-assistant services from the Monalo team — client revenue flows back to the school.',
    href: '/team',
    cta: 'Meet the team',
    planet: 'jupiter',
  },
  {
    eyebrow: 'Learn',
    title: 'Courses built for real growth',
    description:
      'Structured lessons, progress tracking, and Eco Penguin for young learners — study at your pace with MonAlo courses.',
    href: '/courses',
    cta: 'Explore courses',
    secondaryHref: '/learning',
    secondaryCta: 'Eco Penguin',
    planet: 'earth',
  },
]
