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
  // Create roles
  await prisma.role.upsert({
    where: { name: 'customer' },
    update: {},
    create: { name: 'customer', description: 'Default customer role' },
  })

  await prisma.role.upsert({
    where: { name: 'writer' },
    update: {},
    create: { name: 'writer', description: 'Content writer role' },
  })

  await prisma.role.upsert({
    where: { name: 'learner' },
    update: {},
    create: { name: 'learner', description: 'Course learner role' },
  })

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'Administrator role' },
  })

  // Create admin user
  const adminPasswordHash = await hashPassword('admin123')

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      passwordHash: adminPasswordHash,
      userRoles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
  })

  console.log('Seed data created successfully', { admin })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

