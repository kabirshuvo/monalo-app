This scaffold adds App Router routes, API route handlers, components, libs, prisma schema, middleware, and types.

To use:

1. Install Prisma and generate client:

```bash
npm install prisma @prisma/client
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js || ts-node prisma/seed.ts
```

2. Start dev server:

```bash
npm run dev
```
