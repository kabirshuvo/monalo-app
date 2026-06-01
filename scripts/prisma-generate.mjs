import { execSync } from 'node:child_process'

// Always generate the standard client — driver adapters (PrismaPg) replace the engine at runtime.
// Do NOT pass --no-engine: it is incompatible with the { adapter } option.
execSync('prisma generate', { stdio: 'inherit' })
