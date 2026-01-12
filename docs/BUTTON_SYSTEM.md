# Button Component System

## Component Usage

```tsx
import { Button } from '@/components/ui'

// Primary action (main CTAs)
<Button variant="primary">Explore now</Button>
<Button variant="primary">Start learning</Button>

// Secondary action (supportive actions)
<Button variant="secondary">View details</Button>
<Button variant="secondary">Learn more</Button>

// Ghost action (low-priority, dismissive)
<Button variant="ghost">Skip for now</Button>
<Button variant="ghost">Maybe later</Button>

// Destructive action (careful/warning actions)
<Button variant="destructive">Move to archive</Button>
<Button variant="destructive">Discard changes</Button>
```

---

## Brand-Compliant Button Labels

### ✅ Primary Actions (Use `variant="primary"`)

**Learning Context:**
- Start learning
- Continue journey
- Begin this course
- Enroll now
- Complete lesson
- Save progress

**E-commerce Context:**
- Add to cart
- Complete order
- Secure checkout
- Continue shopping

**Content Creation:**
- Publish article
- Share your work
- Create course
- Start writing

**Account/Auth:**
- Create your account
- Sign in
- Continue
- Get started

### ✅ Secondary Actions (Use `variant="secondary"`)

**Discovery:**
- View details
- Learn more
- See all courses
- Browse collection
- Explore more

**Navigation:**
- Go back
- See progress
- View order
- Read article

**Profile/Settings:**
- Update profile
- Edit settings
- Change password

### ✅ Ghost Actions (Use `variant="ghost"`)

**Dismissive:**
- Skip for now
- Maybe later
- Not right now
- I'll decide later
- Remind me later

**Close/Cancel:**
- Close
- Cancel
- Go back

### ✅ Destructive Actions (Use `variant="destructive"`)

**Careful Actions:**
- Move to archive
- Remove from cart
- Discard changes
- Clear all
- End session
- Unpublish article
- Cancel order

---

## ❌ Never Use These Labels

### Technical/System Language
```tsx
❌ Submit
❌ Execute
❌ Process
❌ Initialize
❌ Confirm
❌ OK
❌ Proceed
```

### Harsh Delete Actions
```tsx
❌ Delete (use "Move to archive" or "Remove from cart")
❌ Remove (use specific context: "Remove from cart")
❌ Destroy
❌ Terminate
```

### Corporate/Robotic
```tsx
❌ Submit form
❌ Send request
❌ Process transaction
❌ Update record
```

---

## Component Props

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}
```

### Examples

```tsx
// Loading state (with brand-appropriate text)
<Button variant="primary" isLoading>
  Saving changes...
</Button>

// Disabled state
<Button variant="primary" disabled>
  Continue journey
</Button>

// Full width
<Button variant="primary" fullWidth>
  Start learning
</Button>

// Small size for inline actions
<Button variant="ghost" size="sm">
  Skip for now
</Button>

// Large size for hero CTAs
<Button variant="primary" size="lg">
  Explore courses
</Button>
```

---

## Context-Specific Patterns

### Authentication Forms
```tsx
<Button variant="primary" type="submit">Create your account</Button>
<Button variant="secondary">Sign in instead</Button>
<Button variant="ghost">Maybe later</Button>
```

### Course Enrollment
```tsx
<Button variant="primary">Enroll now</Button>
<Button variant="secondary">Preview lessons</Button>
<Button variant="ghost">Save for later</Button>
```

### Shopping Cart
```tsx
<Button variant="primary">Complete order</Button>
<Button variant="secondary">Continue shopping</Button>
<Button variant="destructive">Remove from cart</Button>
```

### Content Creation
```tsx
<Button variant="primary">Publish article</Button>
<Button variant="secondary">Save draft</Button>
<Button variant="destructive">Discard changes</Button>
```

### Lesson/Course Viewing
```tsx
<Button variant="primary">Continue journey</Button>
<Button variant="secondary">View notes</Button>
<Button variant="ghost">Close</Button>
```

---

## Accessibility Features

All buttons include:
- ✅ Keyboard navigation support (Tab, Enter, Space)
- ✅ Focus indicators (`focus:ring-2`)
- ✅ Disabled state handling
- ✅ Loading state with spinner
- ✅ Proper ARIA attributes
- ✅ Color contrast compliance

---

## Design Tokens

### Primary
- Background: `bg-blue-600`
- Hover: `bg-blue-700`
- Focus ring: `ring-blue-500`
- Use for: Main CTAs, primary user flows

### Secondary
- Background: `bg-gray-100`
- Text: `text-gray-900`
- Hover: `bg-gray-200`
- Use for: Supporting actions, alternative paths

### Ghost
- Text only: `text-gray-700`
- Hover: `bg-gray-100`
- Use for: Low-priority, dismissive actions

### Destructive
- Background: `bg-red-600`
- Hover: `bg-red-700`
- Focus ring: `ring-red-500`
- Use for: Archive, remove, discard actions

---

## Remember

> Every button label should sound like something a thoughtful friend would say, not a computer system.

When in doubt, ask: "Would I say this to someone face-to-face?" If not, rewrite it.
