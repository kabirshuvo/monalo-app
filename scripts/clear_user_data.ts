import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Safety: require explicit env var to prevent accidental data loss
  if (process.env.CONFIRM_CLEAR !== 'true') {
    console.log('Abort: To run this script set CONFIRM_CLEAR=true in the environment')
    console.log('Example: CONFIRM_CLEAR=true node -r ts-node/register scripts/clear_user_data.ts')
    process.exit(1)
  }

  try {
    console.log('Starting clear of user-related data (safe order)')

    async function safeDelete(action: () => Promise<{ count: number }>, label: string) {
      try {
        const res = await action()
        console.log(`  - deleted ${res.count} ${label}`)
      } catch (err: any) {
        // If the underlying table/model doesn't exist, log and continue
        if (err && err.code === 'P2021') {
          console.warn(`  - skipped ${label}: table does not exist`)
          return
        }
        throw err
      }
    }

    console.log('Deleting Accounts...')
    await safeDelete(() => prisma.account.deleteMany({}), 'accounts')

    console.log('Deleting Sessions...')
    await safeDelete(() => prisma.session.deleteMany({}), 'sessions')

    console.log('Deleting PasswordResetTokens...')
    await safeDelete(() => prisma.passwordResetToken.deleteMany({}), 'password reset tokens')

    console.log('Deleting Users...')
    await safeDelete(() => prisma.user.deleteMany({}), 'users')

    console.log('Clear completed successfully')
  } catch (err) {
    console.error('Error while clearing data:', err)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()
