
# Plan: Authentication + JD Dropdown Pages

## 1. Auth Page (`/auth`)

A single, clean page matching tracka's existing look (same background gradient animation, surface cards, ink colors, primary button style).

**Layout**
- Centered card on the animated gradient background
- Tracka logo + wordmark at the top
- Heading: "Sign in to tracka"
- Subtext: "Enter your email — we'll send you a 6-digit code"

**Flow (two steps in the same card)**
1. **Step 1 — Email**: Email input + primary "Send code" button + "Continue with Google" button below a divider
2. **Step 2 — Code**: 6-digit OTP input (using existing `input-otp` component), "Verify & sign in" primary button, "Resend code" link, "Use a different email" back link

**Behavior**
- First-time emails auto-create the account (no separate signup tab)
- Google button uses Lovable's managed Google OAuth (works out of the box, no setup needed from you)
- After successful auth → redirect to `/` (Job Tracker)
- Toast notifications for errors ("invalid code", "code expired", etc.)

## 2. Auth State + Route Protection

- Add `useAuth` hook that listens to auth state changes and exposes `user`, `session`, `loading`, `signOut`
- Wrap protected routes (`/`, `/cv`, `/cover-letter`) so unauthenticated users get redirected to `/auth`
- `/auth` is the only public route
- The JD avatar in TopNav shows the user's initials (from email) once logged in
- The "Logout" item in the dropdown actually signs out and redirects to `/auth`

## 3. JD Dropdown Pages

Currently the dropdown items (Profile, AI Model, Settings, Support) are decorative. I'll wire them to real routes and build basic pages for each, all using the existing design system (surface cards, ink text, primary buttons, gradient background).

| Menu item | Route | What's on it |
|---|---|---|
| Profile | `/profile` | Display name, email (read-only), avatar initials, "Save changes" button. Pulls from / writes to a `profiles` table. |
| AI Model | `/ai-model` | Radio selector for which Lovable AI model to use for CV/cover letter generation (Gemini Flash, Gemini Pro, GPT-5 Mini, GPT-5). Saved per-user. |
| Settings | `/settings` | Language preference (already have toggle — mirror it here), theme/appearance placeholder, "Delete account" danger zone. |
| Support | `/support` | Static page: FAQ, contact email, link to docs. No backend needed. |

All four pages reuse `AppLayout` so the TopNav stays visible.

## 4. Backend (Lovable Cloud)

**Auth config**
- Enable email OTP (passwordless) — no email confirmation step needed since the code itself confirms the email
- Enable Google managed OAuth (zero setup)
- Disable password method (since we're going OTP-only)

**Database**
- `profiles` table: `id`, `user_id` (FK to auth users), `display_name`, `preferred_ai_model`, `created_at`, `updated_at`
- RLS policies: each user can only read/update their own profile
- Trigger: auto-create a profile row when a new user signs up

## 5. Design / Visual

- Reuse `BackgroundGradientAnimation` on the auth page so it feels like part of the app
- Auth card uses `bg-surface`, `border-line`, `text-ink` tokens
- Buttons use the existing primary style (black with orange hover) — same pattern you just applied to the "Add Job" button
- OTP slots styled to match the input borders already in the app
- Same `tracka` wordmark + logo at the top of the auth page

## Technical details (for reference)

- Auth: Supabase email OTP via `supabase.auth.signInWithOtp({ email })` then `supabase.auth.verifyOtp({ email, token, type: 'email' })`
- Google: `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })` via the managed integration (I'll run the configure-social-auth tool which generates the integration code)
- `useAuth` hook sets up `onAuthStateChange` BEFORE calling `getSession()` (correct order to avoid race conditions)
- Protected route wrapper: simple component that checks `session` and `<Navigate to="/auth" />` if absent
- New routes added to `App.tsx`; new menu items in `TopNav.tsx` become `NavLink`s with `to=` props
- About 4 new pages + 1 auth page + 1 hook + 1 protected-route wrapper. Small, focused files.

## Out of scope (can add later)
- Email branding (custom-branded OTP email from your own domain) — the default Lovable email works fine to start
- Password reset (not needed — OTP replaces passwords entirely)
- Multi-language for the new pages beyond what's already in `i18n`

---

Want me to go ahead and build this? If yes I'll start with the backend (auth config + profiles table), then the auth page, then wire up the four dropdown pages.
