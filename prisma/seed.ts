import { PrismaClient, Role } from '@prisma/client'

const db = new PrismaClient()
import bcrypt from 'bcrypt'

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
	const posts = [
		{
			title: 'Learning in seasons',
			slug: 'learning-in-seasons',
			excerpt: 'Embrace the natural ebbs and flows of focus without losing momentum.',
			content:
				'Learning is not a straight line. Monalo School invites you to work in seasons — times of deep focus and times of rest.\n\nWhen motivation dips, small steps still count. Return when you are ready.',
			status: 'PUBLISHED' as const,
			publishedAt: new Date('2026-01-10'),
		},
		{
			title: 'Write gently, teach clearly',
			slug: 'write-gently-teach-clearly',
			excerpt: 'Warm, direct language helps learners feel safe to explore.',
			content:
				'Good teaching writing is calm and precise. Avoid jargon when a plain word will do.\n\nYour students are people first — honor their time and attention.',
			status: 'PUBLISHED' as const,
			publishedAt: new Date('2025-12-28'),
		},
	]

	for (const p of posts) {
		const exists = await db.blog.findFirst({ where: { slug: p.slug } })
		if (exists) continue
		await db.blog.create({
			data: {
				...p,
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
