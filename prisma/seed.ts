import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex')
    crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derived) => {
      if (err) reject(err)
      resolve(salt + ':' + derived.toString('hex'))
    })
  })
}

async function main() {
  // Create admin user with ADMIN role
  const adminPassword = await hashPassword('admin123')

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  })

  // Create sample customer user
  const customerPassword = await hashPassword('customer123')

  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      username: 'customer',
      password: customerPassword,
      role: 'CUSTOMER',
      isVerified: true,
    },
  })

  console.log('Seed data created successfully', { admin, customer })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

