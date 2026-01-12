# MonAlo Frontend Copy Guide

**Version:** 1.0  
**Last Updated:** January 12, 2026  
**Status:** Official Brand Voice Reference

---

## 1. Brand Voice & Tone

MonAlo speaks with warmth, clarity, and artistic sensibility. Our voice reflects the gentle illumination of learning—never harsh, never technical, always human.

### Core Principles

**Warm & Welcoming**
- Write like a thoughtful friend, not a system
- Use "you" and "your" to create connection
- Celebrate small wins and progress

**Calm & Clear**
- Short sentences over complex explanations
- Avoid jargon, acronyms, and technical terms
- Lead with empathy, especially in errors

**Artistic & Human**
- Favor poetic simplicity: "Begin your journey" over "Initialize session"
- Use natural metaphors: light, paths, growth, discovery
- Honor the craft of learning and creating

### What We Sound Like

✅ **MonAlo Voice**
- "Your progress has been saved"
- "Ready to continue learning?"
- "Let's explore what's new"
- "This course is waiting for you"

❌ **Not MonAlo Voice**
- "Data successfully persisted"
- "Proceed to next module"
- "Execute query"
- "Session timeout detected"

---

## 2. Button Copy

### Primary Actions
High-confidence, encouraging calls to action.

```
Explore now
Start learning
Continue journey
Save changes
Add to cart
Enroll now
Begin this course
Create your account
Share your work
Publish article
Complete order
```

### Secondary Actions
Supportive, informative actions.

```
View details
Learn more
See all courses
Browse collection
Go back
Read article
Preview lesson
Update profile
View order
See progress
```

### Ghost Actions
Gentle opt-outs and low-priority options.

```
Skip for now
Maybe later
Close
Not right now
Remind me later
I'll decide later
Cancel
```

### Destructive Actions
Clear but not alarming. Never use "Delete" alone.

```
Move to archive
Remove from cart
Discard changes
Clear all
End session
Unpublish article
Cancel order
```

---

## 3. Loading States

**Never use "Loading..." or "Please wait..."**

### Global Loading

```
✅ Preparing your experience...
✅ Just a moment...
✅ Getting things ready...
✅ Almost there...

❌ Loading data...
❌ Processing request...
❌ Please wait...
```

### Learning Context

```
✅ Opening your lesson...
✅ Loading your progress...
✅ Preparing this course...
✅ Gathering your notes...
✅ Finding where you left off...
```

### Shop Context

```
✅ Updating your cart...
✅ Preparing checkout...
✅ Processing your order...
✅ Securing your purchase...
✅ Confirming your order...
```

---

## 4. Empty States

Empty states should feel like invitations, not absences.

### Generic Empty State

```
**Nothing here yet**
This space is waiting for something wonderful.
```

### Blog Empty State

```
**No articles yet**
The first story is always the hardest to write—and the most rewarding.

[Start writing]
```

### Courses Empty State

**For Learners:**
```
**Your learning journey begins here**
Browse our collection and find what sparks your curiosity.

[Explore courses]
```

**For Instructors:**
```
**Ready to teach?**
Share your knowledge and light the way for others.

[Create your first course]
```

### Cart Empty State

```
**Your cart is empty**
Discover something that speaks to you.

[Browse shop]
```

### Orders Empty State

```
**No orders yet**
When you make a purchase, it will appear here.

[Start shopping]
```

---

## 5. Error Messages

Errors must be gentle, clear, and never blame the user.

### Authentication Errors

```
✅ We couldn't find an account with that email.
✅ That password doesn't match our records. Want to reset it?
✅ Your session has expired. Please sign in again.
✅ Please check your email and password.

❌ Invalid credentials
❌ Authentication failed
❌ User not found
❌ Access denied
```

### Form Validation Errors

```
✅ Please enter your email address.
✅ This email address doesn't look quite right.
✅ Your password needs at least 8 characters.
✅ These passwords don't match.
✅ Please choose a username.
✅ This field is required.

❌ Invalid input
❌ Validation error
❌ Field cannot be empty
```

### Network Errors

```
✅ We're having trouble connecting. Please check your internet.
✅ Something went wrong on our end. Please try again.
✅ We couldn't complete that action. Please try again in a moment.
✅ This is taking longer than expected. Please refresh the page.

❌ Network error 500
❌ Request timeout
❌ Connection refused
❌ Server unavailable
```

### Permission Errors

```
✅ You don't have access to this page.
✅ This content is for enrolled students only.
✅ Only the author can edit this article.

❌ Unauthorized access
❌ Permission denied
❌ 403 Forbidden
```

---

## 6. Success Messages

Celebrate actions without overwhelming the user.

### Generic Success

```
✅ Done!
✅ Saved.
✅ All set.
✅ Changes saved.
✅ Updated successfully.
```

### Learning-Specific Success

```
✅ Lesson complete! 🎉
✅ You've enrolled in this course.
✅ Progress saved. Keep going!
✅ Certificate unlocked!
✅ Note added to your collection.
✅ You've completed this course. Well done!
```

### Shop Success

```
✅ Added to cart.
✅ Order placed successfully!
✅ Payment confirmed. Thank you!
✅ Item removed from cart.
```

### Content Creation Success

```
✅ Article published.
✅ Draft saved.
✅ Course created successfully.
✅ Lesson added.
```

---

## 7. Toast Notifications

Toasts should be brief, warm, and actionable when needed.

### Success Toasts

```
✅ Welcome back!
✅ Changes saved.
✅ Your message has been sent.
✅ Article published successfully.
✅ Payment processed.
```

### Info Toasts

```
ℹ️ You have 3 new notifications.
ℹ️ Your session will expire in 5 minutes.
ℹ️ New course added to your wishlist.
ℹ️ Reminder: Complete your profile.
```

### Warning Toasts

```
⚠️ Your changes haven't been saved yet.
⚠️ This action can't be undone.
⚠️ Your session is about to expire.
⚠️ Low stock: Only 2 items remaining.
```

### Error Toasts

```
❌ We couldn't save your changes. Please try again.
❌ Something went wrong. Please refresh the page.
❌ Unable to process payment. Please check your details.
```

---

## 8. Rules for Developers

### Always Follow This Guide
This document is the **single source of truth** for all user-facing text in MonAlo. When writing UI copy:

1. **Check here first** before creating new copy
2. **Match the tone** even for unlisted scenarios
3. **When in doubt**, choose warmth and clarity over technical precision

### Never Expose Technical Details

```
❌ "Error 500: Internal Server Exception"
❌ "Database connection timeout"
❌ "Null reference exception"
❌ "API rate limit exceeded"

✅ "Something went wrong on our end. Please try again."
✅ "We're having trouble connecting right now."
✅ "This is taking longer than expected."
✅ "We've reached our limit. Please try again in a moment."
```

### Error Handling Philosophy

- **User errors** → Gentle guidance ("Please check your email address")
- **System errors** → Own the problem ("Something went wrong on our end")
- **Network errors** → Neutral explanation ("We're having trouble connecting")
- **Permission errors** → Clear boundaries ("You don't have access to this page")

### Consistency Checklist

Before shipping any user-facing text, ask:

- [ ] Would a friend say this?
- [ ] Is it warm without being cutesy?
- [ ] Does it avoid technical jargon?
- [ ] Is it clear what the user should do next?
- [ ] Does it match the MonAlo voice?

---

## Brand Note

**MonAlo** means "light of the mind"—illumination through learning, discovery through exploration. 

Every word we write should honor this philosophy. We're not building software; we're crafting spaces where curiosity is welcomed, growth is celebrated, and knowledge becomes a gentle, guiding light.

Write as if you're lighting a candle in someone's learning journey, not flipping a switch.

---

**For questions or additions to this guide, consult the design team.**
