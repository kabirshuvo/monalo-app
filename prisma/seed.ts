import db from '../lib/db'
import { Role } from '@prisma/client'
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
