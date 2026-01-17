const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function makeAdmin() {
  const email = 'kabirshuvo19@gmail.com'
  
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    })
    console.log(`✅ Successfully made ${user.email} an admin!`)
    console.log(`User: ${user.name || user.email}`)
    console.log(`Role: ${user.role}`)
  } catch (error) {
    if (error.code === 'P2025') {
      console.error(`❌ User with email ${email} not found in database.`)
      console.log('Please register this account first at /register')
    } else {
      console.error('❌ Error:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin()
