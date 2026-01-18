// Temporary runner to execute prisma/seed.ts in CommonJS mode
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
  // Skip reading the project's tsconfig.json to avoid incompatible options
  skipProject: true,
})

require('./seed.ts')
