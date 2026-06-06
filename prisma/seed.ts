import { PrismaClient, Role } from '@prisma/client'

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
			name: 'Handwoven Journal',
			slug: 'handwoven-journal',
			description: 'Soft-cover journal with handwoven detail. Supports student art programs.',
			price: 1800,
			stock: 24,
			imageUrl: null,
		},
		{
			name: 'Ceramic Studio Mug',
			slug: 'ceramic-studio-mug',
			description: 'Wheel-thrown mug from Monalo craft workshops.',
			price: 2200,
			stock: 15,
			imageUrl: null,
		},
		{
			name: 'Natural Dye Scarf',
			slug: 'natural-dye-scarf',
			description: 'Lightweight scarf dyed with local plants. Limited run.',
			price: 4500,
			stock: 8,
			imageUrl: null,
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
	const { KIDS_BLOG_POSTS } = await import('./data/kids-blog-posts')

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
			},
			{
				title: 'Thread and Memory',
				slug: 'thread-and-memory',
				description: 'Textile-inspired mixed media — pending public release.',
				price: 15000,
				medium: 'Mixed media',
				dimensions: '12 × 16 in',
				year: 2024,
				status: 'PENDING_REVIEW' as const,
			},
		]

		for (const a of artworks) {
			const exists = await db.artwork.findFirst({
				where: { slug: a.slug, deletedAt: null },
			})
			if (exists) continue
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
