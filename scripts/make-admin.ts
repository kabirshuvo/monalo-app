import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function makeAdmin(email: string) {
  try {
    // The `role` field was removed from the schema; this script no longer
    // updates roles. Instead, verify the user exists and print a note.
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      console.error('❌ User not found')
      return
    }
    console.log(`ℹ️  Found user: ${user.email} (${user.name || 'no name'})`)
    console.log('Note: role management has been removed from the database schema.')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.log('Usage: npm run make-admin user@example.com')
  process.exit(1)
}

makeAdmin(email)
