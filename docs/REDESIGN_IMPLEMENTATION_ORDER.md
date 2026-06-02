# Redesign Implementation Order (Safe + Consistent)

This is the sequence that keeps the UI consistent while avoiding breakage.

---

## Phase 1 — Foundation (shared primitives)

1. **Theme system**
   - Add System/Light/Dark toggle
   - Ensure all UI primitives respond consistently
2. **Core tokens**
   - Align `app/globals.css` variables with the design system
3. **UI primitives audit**
   - `Button` + `Card` + `Input` + `Select` + `Tabs` + `Modal` + `Alert` + `Toast`
   - Remove any page-local button styles (replace with `Button`)

---

## Phase 2 — Navigation + conversion

4. **Navbar (PublicLayout)**
   - Right side: theme toggle + auth controls
   - Logged out: Log in (ghost) + Get started (primary)
   - Logged in: Dashboard (primary) + avatar menu
5. **Landing (`/`)**
   - Hero left CTA: Get started + Browse courses
   - Section rhythm: benefits → how it works → featured → proof → footer CTA

---

## Phase 3 — Auth experience

6. **Unify auth pages**
   - `/login` + `/register` share one layout and consistent card UI
   - Ensure magic link + Google are first-class and calm
7. **Support auth pages**
   - forgot/reset/verify pages match the same layout and components

---

## Phase 4 — Product surfaces

8. **Public content pages**
   - `/courses`, `/blog`, `/gallery`, `/shop` and detail pages
   - Standardize grids, cards, empty states
9. **Dashboards**
   - consistent page headers
   - consistent tables/cards
10. **Learning**
   - consistent lesson navigation and progress UI
11. **Checkout & Orders**
   - consistent summary + primary CTA
12. **Profile**
   - consistent form UX and avatar selection styling

---

## Phase 5 — EcoPenguin alignment

13. **EcoPenguin**
   - keep playful visuals, but inherit global tokens/components

---

## Acceptance checklist

- One primary CTA per section
- Theme toggle everywhere + readable contrast
- Button variants/labels match `docs/BUTTON_SYSTEM.md`
- No route uses “random” colors; everything maps to tokens

