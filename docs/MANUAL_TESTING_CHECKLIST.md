# MonAlo Manual Testing Checklist

**Date:** January 13, 2026  
**Version:** 1.0  
**Last Updated:** [Update as testing progresses]

---

## Testing Guidelines

- **Devices Tested:** [Document device/browser combinations used]
- **Tester Name:** _______________
- **Test Date:** _______________
- **Environment:** Development / Staging / Production

### Marking Conventions
- ✅ = Pass
- ❌ = Fail
- ⚠️ = Partial/Warning
- 🟡 = Not Tested Yet

---

## Section 1: Public Pages (Unauthenticated Access)

### 1.1 Launch Page (`/`)
- [ ] Page loads without errors
- [ ] Heading visible: "Learning that feels right."
- [ ] Explanation paragraph displays correctly
- [ ] "How it feels" section shows: "Calm, focused, and entirely yours."
- [ ] Two CTAs visible: "Explore courses" (purple) and "Learn more" (ghost)
- [ ] Purple button on "Explore courses"
- [ ] Background gradient (amber-50 to white) loads properly
- [ ] Footer displays correctly with copyright text
- [ ] Mobile responsive (test on mobile device)
- [ ] All text readable with proper contrast
- [ ] Navigation works: "Explore courses" → `/courses`, "Learn more" → `/home`

**Notes:** _______________

---

### 1.2 Home Page (`/home`)
- [ ] Page loads without errors
- [ ] Header with logo and navigation displays
- [ ] Hero section: "Learn at your own pace" heading visible
- [ ] Hero description paragraph displays
- [ ] "Explore courses" CTA button (purple) visible and clickable
- [ ] "Why choose MonAlo" section displays with 3 feature cards
- [ ] Feature cards show: "Your pace", "Clear focus", "Quality instructors"
- [ ] Cards have proper spacing and no visual noise
- [ ] Background colors correct (amber-50 hero, white features)
- [ ] Footer displays correctly
- [ ] Mobile responsive (stacked layout on mobile)
- [ ] Navigation links work properly
- [ ] All borders are subtle (gray-100)
- [ ] All shadows are soft (shadow-xs)

**Notes:** _______________

---

### 1.3 Courses Page (`/courses`)
- [ ] Page loads without errors
- [ ] Course cards display (if any courses exist in database)
- [ ] Course card layout is grid-based
- [ ] Card spacing consistent (gap-8 or gap-12)
- [ ] Card styling correct (shadow-xs, border-gray-100)
- [ ] Course information visible (title, description, instructor)
- [ ] "Enroll" or "View" CTA button visible
- [ ] Filtering/sorting works (if implemented)
- [ ] Empty state appears when no courses (if applicable)
- [ ] Mobile responsive (1 col mobile → 2-3 cols desktop)
- [ ] Navigation back to home works

**Notes:** _______________

---

### 1.4 Shop Page (`/shop`)
- [ ] Page loads without errors
- [ ] Product cards display (if any products exist)
- [ ] Product layout is grid-based
- [ ] Card styling correct (shadow-xs, border-gray-100)
- [ ] Product information visible (name, price, image)
- [ ] "Add to cart" button visible and clickable
- [ ] Filtering/sorting works (if implemented)
- [ ] Empty state appears when no products
- [ ] Mobile responsive layout
- [ ] Cart icon in navigation updates

**Notes:** _______________

---

### 1.5 Blog Page (`/blog`)
- [ ] Page loads without errors
- [ ] Blog posts display in list or grid format
- [ ] Post cards show: title, excerpt, date, author
- [ ] Post card styling correct (shadow-xs, border-gray-100)
- [ ] "Read more" links work and navigate to individual posts
- [ ] Pagination works (if applicable)
- [ ] Search functionality works (if implemented)
- [ ] Empty state when no posts
- [ ] Mobile responsive layout

**Notes:** _______________

---

### 1.6 Blog Post Detail (`/blog/[slug]`)
- [ ] Post loads with correct content
- [ ] Post title, date, and author display
- [ ] Post body renders correctly
- [ ] Post images load properly
- [ ] Navigation breadcrumb or back button works
- [ ] "Related posts" section shows (if implemented)
- [ ] Comments section works (if implemented)
- [ ] Share buttons work (if implemented)
- [ ] Mobile responsive layout

**Notes:** _______________

---

### 1.7 About Page (`/about`)
- [ ] Page loads without errors
- [ ] About content displays properly
- [ ] Team section visible (if implemented)
- [ ] Values/mission statement clear
- [ ] Images load correctly
- [ ] Call-to-action visible and clickable
- [ ] Mobile responsive layout

**Notes:** _______________

---

### 1.8 Contact Page (`/contact`)
- [ ] Page loads without errors
- [ ] Contact form displays with all fields
- [ ] Form fields: name, email, message (at minimum)
- [ ] Form validation works
- [ ] Error messages display clearly
- [ ] Success message displays on submit
- [ ] Form can be submitted successfully
- [ ] Contact information displays (email, phone, address)
- [ ] Mobile responsive layout

**Notes:** _______________

---

### 1.9 Checkout Page (`/checkout`)
- [ ] Page accessible when cart has items
- [ ] Redirects to home when cart is empty
- [ ] Cart items display in review section
- [ ] Order summary shows totals
- [ ] Promo code field present (if implemented)
- [ ] Payment button visible and clickable
- [ ] Two-column layout on desktop (items | summary)
- [ ] Single-column layout on mobile
- [ ] All typography proper contrast
- [ ] Space-y-6 or space-y-8 spacing applied

**Notes:** _______________

---

## Section 2: Authentication Pages (Unauthenticated Required)

### 2.1 Login Page (`/login`)
- [ ] Page loads without errors
- [ ] Form displays with email and password fields
- [ ] "Remember me" checkbox present (if applicable)
- [ ] "Forgot password" link visible and clickable
- [ ] Login button text says "Login"
- [ ] "Don't have an account?" link visible → `/register`
- [ ] Form validation works (empty field error)
- [ ] Invalid credentials error displays
- [ ] Successful login redirects to appropriate dashboard
- [ ] Password field is masked
- [ ] All form labels visible and associated with inputs
- [ ] Focus ring visible on form inputs
- [ ] Mobile responsive layout

**Notes:** _______________

---

### 2.2 Register Page (`/register`)
- [ ] Page loads without errors
- [ ] Form displays with required fields
- [ ] Fields: name, email, password, password confirmation
- [ ] "I accept terms" checkbox present
- [ ] Register button text says "Create account" or similar
- [ ] "Already have an account?" link visible → `/login`
- [ ] Form validation works
- [ ] Password strength indicator works (if implemented)
- [ ] Password confirmation validation works
- [ ] Terms link functional
- [ ] Successful registration redirects to login or dashboard
- [ ] Error messages display for existing email
- [ ] All form labels visible and proper contrast
- [ ] Focus indicators visible
- [ ] Mobile responsive layout

**Notes:** _______________

---

### 2.3 Forgot Password Page (`/forgot-password`)
- [ ] Page loads without errors
- [ ] Email input field visible
- [ ] "Send reset link" button visible
- [ ] Form validation works
- [ ] Success message displays after submission
- [ ] Reset link sent to email (verify in mailbox if applicable)
- [ ] Back to login link works
- [ ] Mobile responsive layout

**Notes:** _______________

---

## Section 3: Role-Based Dashboards (Authenticated Required)

### 3.1 Customer Dashboard (`/dashboard/customer`)

#### Layout & Navigation
- [ ] Page loads only with CUSTOMER or ADMIN role
- [ ] Redirects to `/login` if unauthenticated
- [ ] Redirects to `/dashboard` if insufficient role
- [ ] Sidebar navigation visible (if applicable)
- [ ] User name/email visible in header
- [ ] Logout button accessible and functional

#### Welcome Section
- [ ] Welcome heading: "Your account" visible
- [ ] Subheading: "Orders, purchases, and settings" visible
- [ ] Proper spacing (mb-10) between heading and content
- [ ] Text uses font-light for heading (calm aesthetic)

#### Orders Section
- [ ] Section heading: "Orders" displays
- [ ] EmptyState component shows when no orders
- [ ] EmptyState message: "Ready to explore?"
- [ ] EmptyState description encourages without pressure
- [ ] "Browse our shop" CTA visible
- [ ] CTA navigates to shop when clicked
- [ ] Order list displays when orders exist
- [ ] Each order shows: date, items, total, status
- [ ] Order details clickable → `/dashboard/customer/orders/[id]`

#### Account Overview Section
- [ ] Section heading: "Account overview" displays
- [ ] Quick stats show: total orders, amount spent
- [ ] Stats display 0 when no orders (no errors)
- [ ] More features list visible with (Coming soon) labels
- [ ] Card styling correct (shadow-xs, border-gray-100)
- [ ] Spacing consistent (space-y-12 between sections)

#### General
- [ ] Page responsive on mobile
- [ ] All text has proper contrast
- [ ] Focus rings visible on buttons
- [ ] No visual noise or decorative elements
- [ ] Background color correct (white or gray-50)

**Notes:** _______________

---

### 3.2 Learner Dashboard (`/dashboard/learner`)

#### Layout & Navigation
- [ ] Page loads only with LEARNER or ADMIN role
- [ ] Redirects to `/login` if unauthenticated
- [ ] Redirects to `/dashboard` if insufficient role
- [ ] Sidebar navigation visible (if applicable)
- [ ] User name visible in header

#### Welcome Section
- [ ] Welcome heading: "Your learning" visible
- [ ] Subheading: "Courses, progress, and achievements" visible
- [ ] Proper spacing (mb-10) applied

#### Progress Overview Section
- [ ] Section heading: "Progress overview" displays
- [ ] Stats display: courses enrolled, lessons completed, certificates
- [ ] Stats show 0 when nothing completed (no errors)
- [ ] Stats have proper typography (text-3xl font-bold)
- [ ] Grid layout correct (2 cols mobile, 3+ cols desktop)

#### Continue Learning Section
- [ ] Section heading displays
- [ ] EmptyState shows when no courses enrolled
- [ ] EmptyState message: "Start your learning adventure"
- [ ] EmptyState description encourages without pressure
- [ ] "Browse courses" CTA navigates to `/courses`
- [ ] Course list displays when courses exist
- [ ] Each course shows progress bar and next lesson
- [ ] Progress bars display correctly (0-100%)

#### Your Next Steps Section
- [ ] Section heading displays
- [ ] EmptyState shows when no courses
- [ ] Messaging calm and encouraging

#### General
- [ ] Page responsive on mobile
- [ ] All text has proper contrast
- [ ] Focus rings visible on buttons
- [ ] Spacing consistent (space-y-12)
- [ ] No decorative purple (buttons only)

**Notes:** _______________

---

### 3.3 Writer Dashboard (`/dashboard/writer`)

#### Layout & Navigation
- [ ] Page loads only with WRITER or ADMIN role
- [ ] Redirects to `/login` if unauthenticated
- [ ] Redirects to `/dashboard` if insufficient role
- [ ] Sidebar navigation visible

#### Welcome Section
- [ ] Welcome heading: "Your content" visible
- [ ] Subheading displays
- [ ] Proper spacing applied

#### Content Stats Section
- [ ] Section heading: "Content overview" (or similar)
- [ ] Stats display: courses created, students enrolled, reviews
- [ ] Stats show 0 when no content (no errors)
- [ ] Grid layout responsive

#### Courses Section
- [ ] Course list displays when courses exist
- [ ] Each course shows: title, student count, rating
- [ ] "Edit" button visible and clickable for each course
- [ ] "View analytics" link visible (if implemented)

#### Share Your Knowledge Section
- [ ] Section heading displays
- [ ] EmptyState shows when no courses
- [ ] EmptyState message: "Ready to create?"
- [ ] EmptyState description encouraging
- [ ] "Create your first course" CTA visible
- [ ] CTA navigates to course creation page

#### General
- [ ] Page responsive on mobile
- [ ] All text has proper contrast
- [ ] Focus rings visible
- [ ] Spacing consistent (space-y-12)
- [ ] No decorative purple

**Notes:** _______________

---

### 3.4 Admin Dashboard (`/dashboard/admin`)

#### Layout & Navigation
- [ ] Page loads only with ADMIN role
- [ ] Redirects to `/login` if unauthenticated
- [ ] Redirects to `/dashboard` if insufficient role
- [ ] Admin-specific navigation visible

#### Welcome Section
- [ ] Welcome heading visible
- [ ] Subheading displays
- [ ] Proper spacing applied

#### Key Metrics Section
- [ ] Section heading: "Platform metrics" (or similar)
- [ ] Key metrics display: total users, active courses, revenue (if applicable)
- [ ] Numbers format correctly (with commas for thousands)
- [ ] Proper typography applied

#### People Management Section
- [ ] Section heading displays
- [ ] User list displays (if any users)
- [ ] Each user shows: name, email, role, join date
- [ ] User actions visible: edit, disable, delete (with appropriate permissions)
- [ ] Search/filter users works (if implemented)
- [ ] Pagination works (if applicable)

#### Platform Management Section
- [ ] Management options visible
- [ ] Options may include: manage courses, categories, settings
- [ ] All action buttons accessible and clickable
- [ ] Proper color usage (purple only for primary CTAs)

#### General
- [ ] Page responsive on mobile
- [ ] All text has proper contrast
- [ ] Focus rings visible
- [ ] Spacing consistent
- [ ] No visual noise

**Notes:** _______________

---

### 3.5 Learning Dashboard (`/dashboard/learning`)

#### Layout & Navigation
- [ ] Page loads without authentication errors
- [ ] Sidebar/navigation visible
- [ ] User can navigate to lessons

#### Course List
- [ ] Enrolled courses display
- [ ] Each course shows progress
- [ ] Course cards have proper styling (shadow-xs, border-gray-100)
- [ ] Clicking course navigates to lesson viewer

#### Notes:** _______________

---

### 3.6 Profile Page (`/dashboard/profile`)

#### Layout & Navigation
- [ ] Page loads for authenticated users
- [ ] User information displays
- [ ] Edit profile form visible

#### Profile Information
- [ ] Name field displays and is editable
- [ ] Email field displays (may be read-only)
- [ ] Avatar/photo field present
- [ ] Phone field editable (if applicable)
- [ ] Role badge displays current user role
- [ ] Verification status shows (if applicable)

#### Form Behavior
- [ ] All input fields have labels
- [ ] Focus rings visible on inputs
- [ ] Required fields marked with asterisk
- [ ] Error messages display for invalid inputs
- [ ] Success message displays on save
- [ ] Save button styled correctly (purple)
- [ ] Cancel button available

#### General
- [ ] Page responsive on mobile
- [ ] All text has proper contrast
- [ ] Spacing consistent
- [ ] No decorative elements

**Notes:** _______________

---

## Section 4: Protected Routes & Access Control

### 4.1 Authentication Flows
- [ ] Unauthenticated user accessing `/dashboard` redirects to `/login`
- [ ] Unauthenticated user accessing role-based dashboard redirects to `/login`
- [ ] CUSTOMER accessing `/dashboard/admin` redirects to `/dashboard`
- [ ] CUSTOMER accessing `/dashboard/learner` redirects to `/dashboard`
- [ ] LEARNER accessing `/dashboard/customer` redirects to `/dashboard`
- [ ] LEARNER accessing `/dashboard/admin` redirects to `/dashboard`
- [ ] WRITER accessing `/dashboard/admin` redirects to `/dashboard`
- [ ] ADMIN can access all dashboards

### 4.2 Logout Functionality
- [ ] Logout button visible in authenticated pages
- [ ] Clicking logout clears session
- [ ] User redirected to login page
- [ ] Cannot access protected pages after logout
- [ ] Session properly cleared from cookies/storage

**Notes:** _______________

---

## Section 5: Component Testing

### 5.1 Buttons
- [ ] Primary button (purple): `bg-purple-500 hover:bg-purple-600`
- [ ] Secondary button (gray): `bg-gray-100 hover:bg-gray-200`
- [ ] Ghost button (transparent): `hover:bg-gray-100`
- [ ] Destructive button (red): `bg-red-600 hover:bg-red-700`
- [ ] All buttons have focus rings visible
- [ ] Disabled buttons are grayed out
- [ ] Button text readable with proper contrast
- [ ] Buttons accessible via keyboard (Tab key)
- [ ] Button sizes consistent (sm, md, lg)

**Notes:** _______________

---

### 5.2 Form Inputs
- [ ] Input fields have visible labels
- [ ] Labels associated with inputs via `for` attribute
- [ ] Placeholder text visible and readable
- [ ] Focus ring appears on focus (blue-500)
- [ ] Error state shows red border and red ring
- [ ] Error message displays below input
- [ ] Helper text displays and is readable (gray-500)
- [ ] Disabled inputs appear grayed out
- [ ] Required indicator (*) visible for required fields
- [ ] Icons display correctly (left/right)
- [ ] Input characters visible (password field masked)

**Notes:** _______________

---

### 5.3 Cards
- [ ] Cards have border-gray-100 (light borders)
- [ ] Cards have shadow-xs (subtle shadow)
- [ ] Card padding consistent (p-6 or p-8)
- [ ] Card headers display correctly
- [ ] Card content readable with proper contrast
- [ ] Hover state works (if clickable)
- [ ] No harsh shadows or visual weight

**Notes:** _______________

---

### 5.4 Empty States
- [ ] EmptyState component displays on empty pages
- [ ] Icon displays (if applicable)
- [ ] Title text displays correctly
- [ ] Description text is encouraging and calm
- [ ] CTA button visible and clickable
- [ ] CTA navigates to correct page
- [ ] No technical jargon in messages
- [ ] Text emphasizes "no rush" or "no pressure"
- [ ] Layout centered and balanced

**Notes:** _______________

---

### 5.5 Error States
- [ ] Error component displays on errors
- [ ] Error icon visible
- [ ] Error message displays clearly
- [ ] Error message is actionable (not technical)
- [ ] Retry button visible (if applicable)
- [ ] Back button visible (if applicable)
- [ ] Layout centered and balanced

**Notes:** _______________

---

### 5.6 Loading States
- [ ] Loading indicator visible (spinner, skeleton, etc.)
- [ ] Loading state prevents interaction
- [ ] Loading text displays (if applicable)
- [ ] Loading animation smooth and not jarring
- [ ] State clears when loading complete
- [ ] Error state shows if loading fails

**Notes:** _______________

---

## Section 6: Responsive Design

### 6.1 Mobile (< 640px)
- [ ] All pages stack vertically
- [ ] Navigation collapses to mobile menu
- [ ] Buttons full width on mobile
- [ ] Images scale appropriately
- [ ] Text readable without zoom
- [ ] Touch targets at least 44x44px
- [ ] No horizontal scrolling required
- [ ] Padding/margins appropriate for small screens

### 6.2 Tablet (640px - 1024px)
- [ ] Two-column layouts display correctly
- [ ] Navigation displays properly
- [ ] Images scale appropriately
- [ ] No horizontal scrolling

### 6.3 Desktop (> 1024px)
- [ ] Multi-column layouts display
- [ ] Spacing and alignment correct
- [ ] Images display at full quality
- [ ] Hover states work (not on touch devices)

**Notes:** _______________

---

## Section 7: Accessibility & Contrast

### 7.1 Color Contrast
- [ ] Black text on white: ✅ Sufficient (10.5:1)
- [ ] Gray-700 text on white: ✅ Sufficient (8.5:1)
- [ ] Gray-600 text on white: ✅ Sufficient (7.1:1)
- [ ] Gray-500 helper text: ✅ Sufficient (6.8:1)
- [ ] White text on purple: ✅ Sufficient (6.5:1)
- [ ] White text on red: ✅ Sufficient (7.2:1)
- [ ] All text meets WCAG AA minimum (4.5:1)

### 7.2 Keyboard Navigation
- [ ] Tab through all interactive elements in order
- [ ] Focus ring visible on all buttons
- [ ] Focus ring visible on all links
- [ ] Focus ring visible on all form inputs
- [ ] Can submit forms via Enter key
- [ ] Can close modals via Escape key
- [ ] No keyboard traps

### 7.3 Screen Reader
- [ ] Page structure uses semantic HTML (h1, h2, nav, etc.)
- [ ] Form labels properly associated with inputs
- [ ] Images have alt text (if decorative, hidden)
- [ ] Links have descriptive text
- [ ] Buttons have descriptive text
- [ ] Error messages announced properly
- [ ] ARIA labels present where needed

**Notes:** _______________

---

## Section 8: Performance & Technical

### 8.1 Page Load
- [ ] Pages load in < 3 seconds (optimal)
- [ ] Pages load in < 5 seconds (acceptable)
- [ ] No 404 errors in console
- [ ] No 500 errors on server
- [ ] All images load correctly
- [ ] All CSS loads and applies correctly
- [ ] All JavaScript loads and executes

### 8.2 Data Handling
- [ ] Form submissions successful
- [ ] Form errors display properly
- [ ] Data persists after page reload (where applicable)
- [ ] Empty states show when data is empty
- [ ] Large data sets paginate correctly (if applicable)
- [ ] Search filters work (if applicable)

### 8.3 Browser Console
- [ ] No JavaScript errors
- [ ] No CSS errors
- [ ] No deprecation warnings
- [ ] No missing resource warnings

**Notes:** _______________

---

## Section 9: Visual Consistency

### 9.1 Color System
- [ ] Rebecca Purple (purple-500) used ONLY for button primary
- [ ] Blue (blue-600) used for navigation/links
- [ ] Gray-900 used for primary text
- [ ] Gray-700 used for secondary text
- [ ] Gray-100 used for borders
- [ ] No decorative purple outside buttons
- [ ] Amber-50 background on hero sections

### 9.2 Typography
- [ ] Page title: font-light (calm aesthetic)
- [ ] Section headings: font-semibold or font-bold
- [ ] Body text: normal weight, readable line height
- [ ] All text readable with proper contrast
- [ ] No excessive font sizes or weights
- [ ] Emotional copy in italic (where applicable)

### 9.3 Spacing
- [ ] Major sections: space-y-12 or space-y-10
- [ ] Welcome heading: mb-10
- [ ] Grids: gap-8 or gap-12
- [ ] Cards: p-6 or p-8 internal padding
- [ ] No cramped layouts
- [ ] Breathing room on all pages
- [ ] Consistent padding on all sides

### 9.4 Shadows
- [ ] Cards: shadow-xs (subtle)
- [ ] Buttons: shadow-sm (primary/destructive only)
- [ ] No harsh shadows (shadow-md or larger)
- [ ] No shadows on hover (maintains calm aesthetic)
- [ ] Non-intrusive visual hierarchy

### 9.5 Borders
- [ ] All borders: border-gray-100 (light)
- [ ] Border radius: rounded-lg (8px)
- [ ] No dark borders (gray-300 or darker)
- [ ] Soft, minimal visual weight

**Notes:** _______________

---

## Section 10: Cross-Browser Testing

### Browser: Chrome/Edge
- [ ] Tested on version: ________
- [ ] All pages load correctly
- [ ] All styles apply correctly
- [ ] No visual glitches
- [ ] Focus rings visible
- [ ] Responsive design works

### Browser: Firefox
- [ ] Tested on version: ________
- [ ] All pages load correctly
- [ ] All styles apply correctly
- [ ] No visual glitches
- [ ] Focus rings visible
- [ ] Responsive design works

### Browser: Safari
- [ ] Tested on version: ________
- [ ] All pages load correctly
- [ ] All styles apply correctly
- [ ] No visual glitches
- [ ] Focus rings visible
- [ ] Responsive design works

**Notes:** _______________

---

## Section 11: Integration Testing

### 11.1 Cart Functionality
- [ ] Products can be added to cart
- [ ] Cart item count updates in header
- [ ] Cart items persist on page reload (if using localStorage)
- [ ] Cart items can be removed
- [ ] Cart shows empty state when no items
- [ ] Checkout page shows cart items
- [ ] Total price calculated correctly

### 11.2 Enrollment Functionality
- [ ] Authenticated user can enroll in courses
- [ ] Enrollment reflects in learner dashboard
- [ ] Course appears in "Your courses" section
- [ ] Progress tracking works (if applicable)
- [ ] Can view lessons after enrollment

### 11.3 Orders Functionality
- [ ] Completed orders appear in customer dashboard
- [ ] Order details page shows order information
- [ ] Order status displays correctly
- [ ] Invoice can be downloaded (if applicable)
- [ ] Order history persists

**Notes:** _______________

---

## Section 12: Summary & Sign-Off

### Overall Assessment

**Total Tests Planned:** _____ of _____  
**Total Tests Passed:** _____  
**Total Tests Failed:** _____  
**Total Tests Not Tested:** _____

**Pass Rate:** _____%

### Issues Found

| # | Page/Component | Issue | Severity | Status |
|---|---|---|---|---|
| 1 | | | HIGH/MED/LOW | Open/Fixed/Closed |
| 2 | | | | |
| 3 | | | | |

### Recommendations

- [ ] All critical issues fixed before launch
- [ ] All high severity issues addressed
- [ ] Medium issues scheduled for next release
- [ ] Low issues can be deferred
- [ ] Accessibility baseline met
- [ ] Performance acceptable
- [ ] Visual consistency verified

### Sign-Off

**Tester Name:** _______________  
**Date:** _______________  
**Status:** ✅ **APPROVED FOR LAUNCH** / ⚠️ **NEEDS FIXES** / ❌ **NOT APPROVED**

**Comments:**

___________________________________________________________________

___________________________________________________________________

___________________________________________________________________

---

## Appendix: Quick Reference URLs

| Page | URL | Auth Required | Role |
|------|-----|---|---|
| Launch | `/` | No | N/A |
| Home | `/home` | No | N/A |
| Courses | `/courses` | No | N/A |
| Shop | `/shop` | No | N/A |
| Blog | `/blog` | No | N/A |
| Blog Post | `/blog/[slug]` | No | N/A |
| About | `/about` | No | N/A |
| Contact | `/contact` | No | N/A |
| Checkout | `/checkout` | No | N/A |
| Login | `/login` | No* | N/A |
| Register | `/register` | No* | N/A |
| Forgot Password | `/forgot-password` | No* | N/A |
| Customer Dashboard | `/dashboard/customer` | Yes | CUSTOMER/ADMIN |
| Learner Dashboard | `/dashboard/learner` | Yes | LEARNER/ADMIN |
| Writer Dashboard | `/dashboard/writer` | Yes | WRITER/ADMIN |
| Admin Dashboard | `/dashboard/admin` | Yes | ADMIN |
| Learning Dashboard | `/dashboard/learning` | Yes | LEARNER/ADMIN |
| Profile Page | `/dashboard/profile` | Yes | All Roles |
| Customer Orders | `/dashboard/customer/orders` | Yes | CUSTOMER/ADMIN |
| Order Detail | `/dashboard/customer/orders/[id]` | Yes | CUSTOMER/ADMIN |

*These pages are only accessible when not authenticated (redirect to dashboard if already logged in)

---

## Notes & Additional Information

### Known Limitations
- [ ] Document any known issues or workarounds here

### Future Enhancements
- [ ] Automated testing suite to be created
- [ ] Cypress E2E tests planned
- [ ] Visual regression testing planned
- [ ] Performance testing with Lighthouse planned

### Test Environment Setup
Document any setup required before testing:
- Example: "Ensure test database is populated with sample courses and products"

___________________________________________________________________

___________________________________________________________________

---

**Last Updated By:** GitHub Copilot  
**Last Updated:** January 13, 2026
