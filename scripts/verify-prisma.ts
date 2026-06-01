import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  try {
    const result = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 AS ok`
    if (result[0]?.ok === 1) {
      console.log('✅ Connected')
    } else {
      console.error('❌ Unexpected result:', result)
      process.exit(1)
    }
  } catch (err) {
    console.error('❌ Connection failed:', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
