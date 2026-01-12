# Frontend Copy — Monalo App

This file contains the prioritized TODO list, integration notes, and developer guidance for the frontend implementation of the Monalo application. It was generated from a review of the backend and project brief on 2026-01-12.

## Quick overview

Monalo is a full-featured Next.js app (e-commerce, LMS, CMS) with RBAC and production-ready authentication. The backend uses NextAuth (credentials provider) + PrismaAdapter, PostgreSQL, and exposes API routes under app/api. Frontend should integrate using NextAuth client hooks, consume HTTP-only session cookies, and mirror backend validation rules.

## MVP — pages & flows (high priority)

- [ ] Setup frontend project / app folder
  - [ ] Create `app/` (Next.js App Router) or `pages/` structure consistent with repo.
  - [ ] Add Tailwind config and global styles.
- [ ] Authentication flows (must for everything else)
  - [ ] Login page (email + password) — client-side validation matching backend rules
  - [ ] Register page — show password rules, username availability check
  - [ ] Forgot password / Reset password (if backend supports)
  - [ ] Integrate NextAuth client (use `signIn`, `signOut`, `useSession`)
  - [ ] Redirects for protected pages (client and server-side)
- [ ] Role-aware dashboards / routing
  - [ ] Public landing / home page
  - [ ] Generic authenticated dashboard redirecting per role (admin, instructor, seller, student)
  - [ ] Admin dashboard: user management, role management (basic UI)
  - [ ] Instructor dashboard: courses management (list/create/edit)
  - [ ] Seller dashboard: shop & products management
  - [ ] Student/customer dashboard: orders, course progress
- [ ] E-Commerce flows
  - [ ] Product listing page
  - [ ] Product detail page (images, variants)
  - [ ] Cart UI & state
  - [ ] Checkout page (basic)
  - [ ] Order history and order detail
- [ ] LMS flows (basic)
  - [ ] Course list / catalog
  - [ ] Course detail + lessons
  - [ ] Lesson playback / content viewer
  - [ ] Progress tracking UI (consume backend progress API)
- [ ] CMS / Blog
  - [ ] Blog list and article detail pages
  - [ ] Simple admin UI to create/edit blog posts (if backend has endpoints)

## Essential integrations (backend connection)

- [ ] Map front-end routes to back-end API endpoints (generate API contract)
  - List endpoints and request/response shapes for auth, users, products, orders, courses, blog
- [ ] Implement client-side API wrappers / fetch utilities
  - [ ] Use fetch wrapper that handles JSON, errors, and refresh logic
- [ ] Session handling
  - [ ] Use NextAuth client for `getServerSession` or `useSession` where needed
  - [ ] Ensure HTTP-only cookie usage; do not store tokens in `localStorage`
- [ ] Form validation + error messages
  - [ ] Mirror backend validation (email format, password complexity)
  - [ ] Display safe error messages (no user enumeration hints)
- [ ] Role-based UI controls
  - [ ] Hide/show UI elements depending on role (enforce server-side too)

## Core UI & components

- [ ] Design system / shared components
  - [ ] Button, Input, Form, Modal, Dropdown, Badge, Avatar, Card
  - [ ] Responsive layout components (Header, Footer, Sidebar)
- [ ] Navigation & routing
  - [ ] Top nav with role-aware links
  - [ ] Mobile navigation / drawer
- [ ] Loading & error states
  - [ ] Skeletons for lists, spinners for API calls, global error banner
- [ ] Accessibility basics (a11y)
  - [ ] Keyboard navigation, ARIA attributes for components

## Data & Types

- [ ] Create TypeScript types/interfaces for API responses
  - [ ] Generate or hand-author types matching Prisma models (User, Product, Order, Course, etc.)
- [ ] Centralize types in `types/` or `lib/types/`

## Testing & Quality

- [ ] Linting & formatting
  - [ ] Ensure ESLint + Prettier + Tailwind rules
- [ ] Unit tests for critical components (Jest / Vitest)
- [ ] Integration / E2E tests for auth and checkout (Playwright / Cypress)
  - [ ] Login flow
  - [ ] Register + profile
  - [ ] Add to cart -> checkout
- [ ] Accessibility testing (axe)

## Performance & Monitoring

- [ ] Image optimization (Next/Image)
- [ ] Code-splitting / lazy load heavy components
- [ ] Add basic telemetry / error tracking (Sentry or similar)

## Dev & Infra

- [ ] `.env.local.example` with required env vars:
  - `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_API_BASE` (if needed)
- [ ] Document local dev steps in `Frontend_Copy.md` or README:
  - Install deps, prisma client requirement note, how to run backend + frontend locally
- [ ] CI: Setup GitHub Actions for lint, typecheck, tests
- [ ] Vercel deployment config (environment variables, build settings)

## Security & UX considerations

- [ ] Ensure no sensitive data is exposed in client bundles
- [ ] Show generic error messages for auth failures
- [ ] Input sanitization for any rich text editors (blogs/courses)

## Documentation & Product tasks

- [ ] Populate `Frontend_Copy.md` with:
  - Page/route map, API contract summary, role-to-page mapping, authentication flow diagrams
- [ ] Create a simple mock data / UI kit (Figma or storybook?) to speed up development
- [ ] Create checklist for Acceptance Criteria for each major flow (auth, checkout, course progress)

## Nice-to-have enhancements (post-MVP)

- [ ] Progressive Web App enhancements
- [ ] Offline sync for course progress
- [ ] Internationalization (i18n)
- [ ] Real-time notifications (WebSockets)
- [ ] Admin analytics dashboards

## Next steps

1. I added this file to the repo (Frontend_Copy.md). Verify its placement and content.
2. I can now scan the backend routes and generate a formal API contract that maps endpoints to the above pages.
3. I can open a PR with additional scaffolding (env example, component templates) if you'd like.

---

Generated on 2026-01-12 by GitHub Copilot assistant.
