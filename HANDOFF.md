# Tracka — Session Handoff

> Last updated: 2026-05-14. Read before starting any UI work.

---

## 1. What the project is

**Tracka** — career companion app. Stack: Vite + React 18 + TypeScript + Tailwind + Supabase (auth/DB) + Groq (AI). Deployed on Vercel.

Primary working directory: `/Users/souvik/career-companion`

Run locally:
```bash
cd /Users/souvik/career-companion
npm run dev     # starts on http://localhost:8080
```

---

## 2. Design system — Berlin Glass

All tokens + utility classes live in `src/index.css`. **Read `DESIGN_SYSTEM.md` before touching UI.**

### Glass surface hierarchy (lightest → heaviest)
| Class | blur | bg alpha | border alpha | Use for |
|---|---|---|---|---|
| `.glass-chip` | 12px | 0.30 | 0.40 | Filter chips, secondary surfaces |
| `.glass-input` | 12px | 0.40 | 0.50 | Form inputs on gradient background |
| `.glass-btn` | 20px + sat140% | 0.50 | 0.55 | **NEW** Interactive glass buttons (e.g. Google sign-in) |
| `.glass-nav` | 20px + sat140% | 0.55 | 0.50 | Sticky frosted nav |
| `.glass-card` | 24px | 0.40 | 0.50 | Content cards |
| `.glass-modal` | 48px | 0.78 | 0.70 | Dialogs / sheets |

`.glass-btn` was **added this session** — it didn't exist before.

### Other key design tokens / classes
- `.btn-primary` — bg-ink, rounded-full, uppercase tracking
- `.btn-ghost` — glass frosted, rounded-**full** (not xl — watch out)
- `.glass-input` has `h-11 rounded-2xl` baked in; override with `h-12 rounded-xl` on auth page
- Background: `<BackgroundGradientAnimation>` — animated orange/cream mesh
- Brand accent: `#FF5A2F` (orange)
- Ink: `#151515`

---

## 3. Mobile-only work done this session

**All changes were mobile-only.** Desktop layouts were deliberately left untouched. The pattern used: completely separate render trees with `lg:hidden` (mobile) and `hidden lg:flex` (desktop) — no shared Tailwind classes between the two, so no style leakage.

### Files changed this session

#### `src/index.css`
- Added `.glass-btn` utility (see table above)

#### `src/components/TopNav.tsx`
- Completely rewritten
- Left: logo + "tracka" wordmark
- Right: hamburger `<Menu>` icon button
- Opens slide-in `<aside>` with 3 sections:
  1. Navigation (Tracker / Resume / Letters)
  2. Account settings (Profile / AI Model / Settings / FAQ + LanguageToggle)
  3. Account (Sign out)
- User email shown in footer of the panel

#### `src/components/AuthCharacters.tsx`
- Added `idleMode?: boolean` prop
- When `idleMode=true`: skips mousemove tracking, runs a `setInterval` cycling through `IDLE_SEQUENCE` positions (8 positions, 2200ms each)
- `idleForce = { x: idleLook.x * 0.6, y: idleLook.y * 0.6 }` passed to all EyeBall/Pupil via `forceLookX/Y`
- Used on mobile auth page so characters animate without needing cursor

#### `src/pages/AuthPage.tsx`
Two completely separate render trees:

**Mobile tree** (`lg:hidden`):
- Top bar: logo left, LanguageToggle right, `h-14`, `bg-white/50 backdrop-blur-md`
- Layout: `flex flex-col`, `minHeight: calc(100vh - 56px)`
- Form section: `shrink-0 px-8 pt-10 pb-4` (takes only natural height)
- H1: 32px, left-aligned, tight tracking
- Email input: uses `glass-input h-12 rounded-xl` ← design system class
- Continue button: `w-full h-12 rounded-xl bg-ink text-white`
- Divider + "or continue with" label
- Google button: uses `glass-btn w-full h-12 rounded-xl` ← design system class
- Illustration section: `flex-1 flex items-center justify-center` (fills remaining space, centers illustration)
- Illustration scaling: `scale(0.6) translateX(38px)` with `transformOrigin: "top left"`, container `width: 288, height: 204`
- `<AuthCharacters idleMode />` — idle animation, no mouse tracking

**Desktop tree** (`hidden lg:flex`) — **unchanged from original**.

#### `src/lib/translations.ts`
Added keys used on mobile auth:
- `auth.subtitleMobile` — "Track your job search, all in one place."
- `auth.orMobile` — "or continue with"
- `auth.continueShort` — "Continue"
- German equivalents also added

#### `src/pages/OnboardingPage.tsx`
- Sticky top bar: `sticky top-0 z-20 h-14 border-b border-white/30 bg-white/60 backdrop-blur-xl shrink-0`
- Logo left, skip button right
- Content area: `flex-1 overflow-y-auto flex items-center justify-center`

#### `src/components/AccountLayout.tsx`
- Mobile: `md:hidden` horizontal scrollable pill-tab strip for section navigation
- Desktop: `hidden md:block` vertical sidebar (unchanged)

#### `src/pages/JobsPage.tsx`
- Padding: `p-4 sm:p-8`
- Mobile job rows: compact 2-line card (company+role line, status+chevron line)
- FAB bottom: `style={{ bottom: "max(20px, env(safe-area-inset-bottom, 20px))" }}`

---

## 4. Illustration centering math (AuthPage mobile)

Characters in `AuthCharacters` visually span x=0 to ~x=405 within a 480px-wide component → visual center ≈ 202px. Container center = 240px. Gap = 38px.

With `transformOrigin: "top left"` + `scale(0.6)`:
- `translateX(38px)` pre-scale shifts the center: (202+38) × 0.6 = 144px = center of 288px visual container ✓
- Container must be `width: 288, height: 204` with `overflow: hidden`

---

## 5. Known gotchas

- `btn-ghost` uses `rounded-full`, not `rounded-xl` — don't use it for the auth buttons
- `glass-input` has `h-11 rounded-2xl` baked in via `@apply` — always override explicitly on auth page (`h-12 rounded-xl`)
- Desktop Google button uses plain `border border-line bg-white hover:bg-surface` — no glass at all. Keep it that way.
- The `<Input>` shadcn component passes `className` down to the underlying `<input>` — adding `glass-input` works, but also add `focus-visible:ring-0 focus-visible:ring-offset-0` to suppress the shadcn focus ring
- `AuthCharacters` width is fixed at 480px in its JSX — the parent must clip/scale it

---

## 6. What's left / possible next steps

Nothing was explicitly committed this session. Possible things to do next:
- Test the mobile auth screen on a real device (safe-area insets, keyboard push-up)
- Polish the "sent" step on mobile auth (currently styled but not reviewed)
- Review `JobsPage` mobile on small screens
- Commit all changes with a descriptive message
- Any further pages that need mobile treatment
