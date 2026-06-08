import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function makeAdmin(email: string) {
  try {
    const normalized = email.trim().toLowerCase()
    const user = await prisma.user.update({
      where: { email: normalized },
      data: { role: 'ADMIN' },
      select: { email: true, name: true, role: true },
    })
    console.log(`✅ ${user.email} is now ${user.role}`)
    if (user.name) console.log(`   Name: ${user.name}`)
  } catch (error: unknown) {
    const code = typeof error === 'object' && error && 'code' in error ? (error as { code?: string }).code : undefined
    if (code === 'P2025') {
      console.error(`❌ No user found with email ${email}`)
      console.log('Register that account first, then run this script again.')
    } else {
      console.error('❌ Error:', error)
    }
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

const email = process.argv[2]

if (!email) {
  console.error('Usage: npm run make-admin user@example.com')
  process.exit(1)
}

makeAdmin(email)
