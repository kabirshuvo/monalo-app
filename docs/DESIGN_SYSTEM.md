# MonAlo Design System (Single Source of Truth)

This doc defines the **shared rules** for every page: landing, navbar, auth, dashboard, learning, shop, gallery, EcoPenguin.
If a UI decision isn’t covered elsewhere, treat this as the default.

---

## Goals

- **Consistency**: same spacing, typography, and button meanings everywhere.
- **Clarity**: one primary action per screen section.
- **Calm energy**: friendly, minimal, not “salesy”.
- **Accessibility**: keyboard + focus states + contrast.

---

## IA / Navigation Principles

- **Public routes** are discoverable: Learn, Shop, Gallery, Blog, About, Team, Contact.
- **Authenticated routes** prioritize: Dashboard + the user’s “next step” (Learning).
- Avoid route-dependent navbar logic when possible; drive UI from **auth status** and **role** only.

---

## Color & Theme

### Theme Modes

- **System / Light / Dark** (default: System)
- Theme toggle lives in the **navbar right side**.

### Token Names (conceptual)

Use tokens (not hard-coded page-specific colors) wherever possible:

- **Background**
  - `bg/base`: main page background
  - `bg/surface`: cards, nav, panels
  - `bg/elevated`: modals/dropdowns
- **Text**
  - `text/primary`: headings and main copy
  - `text/secondary`: supporting copy
  - `text/muted`: helper labels, hints
- **Borders**
  - `border/subtle`: inputs and card borders
- **Brand**
  - `brand/primary`: primary CTAs + key highlights

### Brand Color Direction

Current code uses a **purple primary**. Keep it as the brand anchor (don’t mix purple on some pages and blue on others).

---

## Typography

### Hierarchy

- **H1**: one per page (hero title or page title)
- **H2**: section titles
- **Body**: readable line-length; avoid dense blocks
- **Microcopy**: short, calm, and specific

### Voice

- Prefer “thoughtful friend” language (matches `docs/BUTTON_SYSTEM.md`).
- Avoid robotic labels (Submit / Execute / Proceed).

---

## Layout Grid & Spacing

### Page containers

- Default container max width: **`max-w-7xl`**
- Content sections: **24–40px vertical padding** (responsive)
- Cards: consistent radius and border

### Spacing scale

Use a consistent step scale (`2, 3, 4, 6, 8, 10, 12, 16` in Tailwind terms).
Avoid one-off paddings per page unless the layout demands it.

---

## Buttons (CTA Rules)

This app already has a button system; keep semantics consistent:

- **Primary**: the main CTA (one per section).
- **Secondary**: supportive alternative.
- **Ghost**: low-priority / “back” / “later”.
- **Destructive**: rare; confirm intent.

### CTA allocation rules

- **Hero area**: one Primary + one Secondary.
- **Forms**: Primary submit, Secondary “switch flow”, Ghost cancel/back.
- **Cards**: keep actions consistent (e.g. “View details” secondary; “Add to cart” primary when inside cart context).

### Naming rules

Follow `docs/BUTTON_SYSTEM.md` as the source of approved labels.

---

## Inputs & Forms

- Labels always visible (don’t rely only on placeholders).
- Error messages are human and actionable.
- Field spacing is consistent (label → input → help/error).

---

## Navbar Standard

### Structure

- Left: Logo
- Middle (desktop): public navigation links
- Right: **Theme toggle**, then auth controls

### Auth controls

- **Logged out**: `Log in` (ghost) + `Get started` (primary)
- **Logged in**: `Dashboard` (primary) + avatar menu (Profile/Settings/Logout)

### Behavior

- Mobile menu mirrors desktop content (same link set, same auth controls).
- Sticky header is OK; keep shadow/border subtle.

---

## Landing Page Standard

### Above the fold

- Left aligned hero content
- Primary CTA: **Get started**
  - Logged out → Auth entry
  - Logged in → Dashboard/Learning
- Secondary CTA: **Browse courses**

### Sections

Keep a predictable set (order can vary):

1. Benefits (3–5 cards)
2. How it works (3 steps)
3. Featured courses / categories
4. Social proof (short)
5. Footer CTA (repeat Get started)

---

## Auth Pages (Login/Register)

### Design

- **Unified experience** (same layout and visuals)
- Split layout:
  - Left: brand + 2–3 calm benefits
  - Right: auth card

### Priority order

1. **Continue with Google**
2. Divider
3. **Email → Continue** (magic link)

### Microcopy

- “No password needed” (if true)
- “Trouble with Google? Use email instead”

---

## Cards & Surfaces

- Cards should share:
  - border style
  - radius
  - shadow level
  - padding
- Don’t mix multiple card styles across features.

---

## Quality bar (must-pass)

- Keyboard navigation works
- Visible focus state
- No text on low-contrast surfaces
- Button meanings don’t change between pages
- “Get started” always routes correctly by auth state

