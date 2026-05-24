import { execSync } from 'node:child_process'

const noEngine = process.env.PRISMA_NO_ENGINE === '1'
const cmd = noEngine ? 'prisma generate --no-engine' : 'prisma generate'

execSync(cmd, { stdio: 'inherit' })
