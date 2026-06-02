# MonAlo Redesign Map (Consistency Checklist)

This is the actionable checklist to redesign “every possible page” while staying consistent with `docs/DESIGN_SYSTEM.md`.

---

## Global (applies everywhere)

- **Header**: consistent navbar structure and auth controls
- **Theme**: System/Light/Dark toggle present in navbar
- **Buttons**: use the same variants + labels (`docs/BUTTON_SYSTEM.md`)
- **Page container**: consistent max width and padding
- **Cards/Inputs**: consistent surfaces and spacing

---

## Primary CTAs (site-wide rules)

- **Public**: “Get started” is the primary conversion CTA.
- **Learning**: “Continue journey” is the primary progress CTA.
- **Commerce**: “Add to cart” / “Secure checkout” are primary depending on context.
- **Content**: “Publish article” / “Start writing” are primary.

Only **one** primary CTA per section (hero, auth card, checkout summary, etc.).

---

## Pages to redesign (route groups)

### Landing / Public marketing

- `/` (launch landing)
  - Hero left: Get started (primary) + Browse courses (secondary)
  - Keep gradient / brand calm; remove random color drift
- `/home` (School page)
  - Align typography + CTA semantics with `/`
- `/courses`
  - Cards consistent: title, description, progress badge, CTA placement
- `/gallery`, `/gallery/[slug]`
  - Art card style unified with shop/product cards
- `/shop`, `/shop/[slug]`
  - Product grid, consistent filters/search (if present)
- `/blog`, `/blog/[slug]`
  - Same typography system, consistent post cards and spacing
- `/about`, `/team`, `/contact`
  - Consistent section rhythm + footer CTA

### Auth

- `/login`
- `/register`
- `/forgot-password`
- `/verify-request`
- `/verify-email`
- `/reset-password`

Unify all auth pages into:
- same split layout
- same card component
- same button order and microcopy

### Dashboard (role hubs)

- `/dashboard`
- `/dashboard/admin`, `/dashboard/seller`, `/dashboard/customer`, `/dashboard/writer`, `/dashboard/learning`

Goals:
- consistent page header pattern (title + short subtitle + right-side actions)
- consistent table/card patterns
- consistent empty states

### Learning

- `/dashboard/learning`
- `/dashboard/learning/courses/[courseId]/lessons/[lessonId]`

Goals:
- “Continue journey” always prominent
- progress components consistent
- lesson nav predictable (Back/Next/Continue)

### Profile

- `/profile`
- `/dashboard/profile`

Goals:
- consistent form styling
- avatar selection UI consistent with overall theme

### Commerce

- `/checkout`
- `/dashboard/customer/orders`, `/dashboard/customer/orders/[id]`

Goals:
- clear summary panel
- consistent price typography + spacing
- one “Secure checkout” primary CTA

### EcoPenguin

- `/learning/ecopenguin`
- `/learning/ecopenguin/categories/[slug]`
- `/learning/ecopenguin/categories/[slug]/[itemSlug]`

Goals:
- keep EcoPenguin playful, but still obey global tokens:
  - same button meanings
  - same surfaces and input styles
  - only accent visuals differ (illustrations, celebratory animations)

---

## Component-level consistency targets

We already have reusable UI primitives in `components/ui/*`. Standardize usage:

- `Button` everywhere (no bespoke button styles per page)
- `Card` for surfaces
- `Input`, `Select`, `Tabs`, `Modal`, `Alert`, `Toast`, `EmptyState`

If a page uses raw `<button>` styling, replace with `Button`.

---

## “Done” definition (for the redesign)

- Visual consistency across all routes listed above
- Theme toggle works and all components respond
- Navbar/auth controls consistent across desktop + mobile
- Auth pages feel premium and smooth
- No one-off styles unless documented as an exception

