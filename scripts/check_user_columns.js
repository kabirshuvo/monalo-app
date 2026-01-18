const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

;(async () => {
  try {
    const rows = await prisma.$queryRaw`select column_name from information_schema.columns where table_name='users' order by ordinal_position;`
    console.log('users table columns:')
    for (const r of rows) console.log(' -', r.column_name || r.column_name)
  } catch (err) {
    console.error('Query failed:', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
})()
