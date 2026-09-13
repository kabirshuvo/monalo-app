import { PrismaClient, Role, ProductCategory } from '@prisma/client'
import { KIDS_BLOG_POSTS } from './data/kids-blog-posts'

// Seed/migrate always use direct Postgres (not Accelerate)
const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
    },
  },
})
import bcrypt from 'bcryptjs'

const PASSWORD = 'Test@1234'

const ROLES: Role[] = [
	Role.ADMIN,
	Role.CUSTOMER,
	Role.LEARNER,
	Role.WRITER,
	Role.SELLER,
	Role.DONOR,
	Role.BROWSER,
]

async function main() {
	console.log('\n🌱 Seeding test users for each Role...')

	const hashed = await bcrypt.hash(PASSWORD, 10)

	for (const role of ROLES) {
		const email = `${role.toLowerCase()}@monalo.test`
		const displayName = `${role.charAt(0) + role.slice(1).toLowerCase()} User`

		const existing = await db.user.findUnique({ where: { email } })
		if (existing) {
			console.log(`- Skipping existing: ${email}`)
			continue
		}

        const user = await db.user.create({
			data: {
				email,
				name: displayName,
				password: hashed,
				role,
				emailVerified: new Date(),
			},
		})

		console.log(`+ Created: ${user.email} (${role})`)
	}

	console.log('\n🛍️ Seeding craft shop products...')

	const products = [
		{
			name: 'Gypsum Lotus Planter',
			slug: 'gypsum-lotus-planter',
			description: 'Hand-sculpted gypsum planter with a soft matte finish. Made in MonAlo craft workshops.',
			price: 3200,
			stock: 12,
			imageUrl: null,
			category: ProductCategory.GYPSUM_POTTERY,
		},
		{
			name: 'Lavender Pillar Candle',
			slug: 'lavender-pillar-candle',
			description: 'Decorative pillar candle with a calm lavender scent and layered pastel wax.',
			price: 2400,
			stock: 20,
			imageUrl: null,
			category: ProductCategory.CANDLES,
		},
		{
			name: 'Hand-Carved Wooden Bowl',
			slug: 'hand-carved-wooden-bowl',
			description: 'Small serving bowl carved from local timber and finished with natural oil.',
			price: 3800,
			stock: 9,
			imageUrl: null,
			category: ProductCategory.WOOD_CRAFT,
		},
		{
			name: 'Bamboo Wind Chime',
			slug: 'bamboo-wind-chime',
			description: 'Light bamboo tubes tuned for a gentle outdoor sound. Woven hanger included.',
			price: 2800,
			stock: 14,
			imageUrl: null,
			category: ProductCategory.BAMBOO_CRAFT,
		},
		{
			name: 'MonAlo Nature Journal',
			slug: 'monalo-nature-journal',
			description: 'Illustrated workbook for young naturalists — field notes, sketches, and gentle prompts.',
			price: 1600,
			stock: 30,
			imageUrl: null,
			category: ProductCategory.BOOKS,
		},
		{
			name: 'Stories from the Hill',
			slug: 'stories-from-the-hill',
			description: 'A paperback collection of student writing and folklore from MonAlo School.',
			price: 1400,
			stock: 18,
			imageUrl: null,
			category: ProductCategory.BOOKS,
		},
		{
			name: 'Handwoven Journal',
			slug: 'handwoven-journal',
			description: 'Soft-cover journal with handwoven detail. Supports student art programs.',
			price: 1800,
			stock: 24,
			imageUrl: null,
			category: ProductCategory.OTHER_CRAFT,
		},
	]

	for (const p of products) {
		const exists = await db.product.findFirst({
			where: { slug: p.slug, deletedAt: null },
		})
		if (exists) {
			console.log(`- Skipping product: ${p.slug}`)
			continue
		}
		await db.product.create({ data: { ...p, status: 'ACTIVE' } })
		console.log(`+ Product: ${p.name}`)
	}

	console.log('\n📚 Seeding courses...')

	const courses = [
		{
			title: 'Learning Mindset',
			description: 'Build habits that keep you curious, consistent, and kind to yourself.',
			isPaid: false,
		},
		{
			title: 'Writing for Clarity',
			description: 'Practical frameworks to express ideas with calm, confident language.',
			isPaid: false,
		},
	]

	for (const c of courses) {
		const exists = await db.course.findFirst({
			where: { title: c.title, deletedAt: null },
		})
		if (exists) continue
		await db.course.create({ data: c })
		console.log(`+ Course: ${c.title}`)
	}

	console.log('\n📝 Seeding blog posts...')

	const writer = await db.user.findFirst({ where: { role: 'WRITER' } })

	for (const p of KIDS_BLOG_POSTS) {
		const exists = await db.blog.findFirst({ where: { slug: p.slug } })
		if (exists) {
			console.log(`- Skipping blog: ${p.slug}`)
			continue
		}
		await db.blog.create({
			data: {
				title: p.title,
				slug: p.slug,
				excerpt: p.excerpt,
				content: p.content,
				metaTitle: p.metaTitle,
				metaDescription: p.metaDescription,
				status: 'PUBLISHED',
				publishedAt: p.publishedAt,
				authorId: writer?.id,
			},
		})
		console.log(`+ Blog: ${p.title}`)
	}

	console.log('\n🎨 Seeding gallery artworks...')

	const seller = await db.user.findFirst({ where: { role: 'SELLER' } })
	// Gallery tables require migration 20260520T140000_gallery
	const hasGallery =
		typeof (db as { artwork?: { create: unknown } }).artwork?.create === 'function'
	if (seller && hasGallery) {
		await db.artistProfile.upsert({
			where: { userId: seller.id },
			create: {
				userId: seller.id,
				displayName: 'Monalo Studio Collective',
				bio: 'Student and community artists creating work to fund Monalo School programs.',
			},
			update: {},
		})

		const artworks = [
			{
				title: 'Morning Light on the Hill',
				slug: 'morning-light-hill',
				description: 'Soft landscape in watercolor — calm hills at dawn.',
				price: 12500,
				medium: 'Watercolor',
				dimensions: '18 × 24 in',
				year: 2025,
				status: 'ACTIVE' as const,
				imageUrl:
					'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
			},
			{
				title: 'Study in Indigo',
				slug: 'study-in-indigo',
				description: 'Abstract piece exploring depth and rest.',
				price: 8900,
				medium: 'Acrylic',
				dimensions: '16 × 20 in',
				year: 2026,
				status: 'ACTIVE' as const,
				imageUrl:
					'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1200&q=80',
			},
			{
				title: 'Thread and Memory',
				slug: 'thread-and-memory',
				description: 'Textile-inspired mixed media celebrating craft and story.',
				price: 15000,
				medium: 'Mixed media',
				dimensions: '12 × 16 in',
				year: 2024,
				status: 'ACTIVE' as const,
				imageUrl:
					'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=80',
			},
			{
				title: 'Lotus on Still Water',
				slug: 'lotus-still-water',
				description: 'Quiet botanical study in soft greens and cream.',
				price: 9800,
				medium: 'Gouache',
				dimensions: '11 × 14 in',
				year: 2025,
				status: 'ACTIVE' as const,
				imageUrl:
					'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80',
			},
			{
				title: 'Village Evening Market',
				slug: 'village-evening-market',
				description: 'Warm lights and crowded stalls — a memory of home.',
				price: 14200,
				medium: 'Oil on canvas',
				dimensions: '20 × 24 in',
				year: 2025,
				status: 'ACTIVE' as const,
				imageUrl:
					'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80',
			},
			{
				title: 'Clay Hands at Work',
				slug: 'clay-hands-at-work',
				description: 'Studio moment — hands shaping gypsum and clay.',
				price: 7600,
				medium: 'Photography print',
				dimensions: '16 × 20 in',
				year: 2026,
				status: 'ACTIVE' as const,
				imageUrl:
					'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=80',
			},
			{
				title: 'Monsoon Window',
				slug: 'monsoon-window',
				description: 'Rain on glass, soft blues — contemplation in a frame.',
				price: 11000,
				medium: 'Watercolor',
				dimensions: '14 × 18 in',
				year: 2026,
				status: 'ACTIVE' as const,
				imageUrl:
					'https://images.unsplash.com/photo-1515405295579-ba7b45403062?auto=format&fit=crop&w=1200&q=80',
			},
		]

		for (const a of artworks) {
			const exists = await db.artwork.findFirst({
				where: { slug: a.slug, deletedAt: null },
			})
			if (exists) {
				await db.artwork.update({
					where: { id: exists.id },
					data: {
						title: a.title,
						description: a.description,
						price: a.price,
						medium: a.medium,
						dimensions: a.dimensions,
						year: a.year,
						status: a.status,
						imageUrl: a.imageUrl,
					},
				})
				console.log(`~ Upserted artwork: ${a.title}`)
				continue
			}
			await db.artwork.create({
				data: { ...a, artistId: seller.id },
			})
			console.log(`+ Artwork: ${a.title}`)
		}
	} else if (seller && !hasGallery) {
		console.log('- Skipping gallery seed (run: npx prisma migrate deploy && npx prisma generate)')
	}

	console.log('\n✅ Seeding complete')
}

main()
	.catch((err) => {
		console.error('Seed error:', err)
		process.exit(1)
	})
	.finally(async () => {
		await db.$disconnect()
	})
