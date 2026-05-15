# Tracka — Session Context

> Paste this file at the start of a new chat to resume work with full context.

---

## Project

**Tracka** — career companion web app at `/Users/souvik/career-companion`.

- Stack: Vite + React 18 + TypeScript + Tailwind + Supabase (auth/DB) + Groq (AI)
- Dev server: `cd /Users/souvik/career-companion && npm run dev` → http://localhost:8080
- Deployed on Vercel

---

## Design System: Berlin Glass

Full spec lives in `DESIGN_SYSTEM.md`. Tokens + all utility classes are in `src/index.css`.

### Surface hierarchy (lightest → heaviest)
`glass-chip` → `glass-input` → `glass-btn` → `glass-nav` → `glass-card` → `glass-modal`

### Key utility classes
| Class | Use |
|---|---|
| `.glass-card` | Cards on gradient mesh pages |
| `.glass-modal` | Modals and drawers |
| `.glass-nav` | Sticky page headers (CV Builder, Letter Builder) |
| `.glass-page-panel` | Split-page right panel (Auth, Onboarding) — 72% opacity mobile, 92% desktop |
| `.glass-page-topbar` | Mobile top bars on split pages |
| `.glass-chip` / `.glass-chip-active` | Filter/toggle chips |
| `.glass-input` | Text inputs (h-11 rounded-2xl baked in) |
| `.glass-popover` | Select dropdowns, calendar popovers |
| `.btn-primary` | Primary CTA — always brand orange |
| `.btn-ghost` | Secondary CTA — rounded-full |
| `.active-fill` | Toggles, checkboxes, step indicators, FABs — light: `bg-ink`, dark: `bg-brand` |
| `.nav-item-active` | Sidebar/drawer active nav item |
| `.nav-item-hover` | Sidebar/drawer hover state |
| `.nav-drawer` | Mobile nav drawer surface |
| `.nav-hairline` | Nav border lines |
| `.nav-divider` | Nav divider bars |
| `.segmented-track` | SegmentedControl outer track in dark |
| `.segmented-tab-active` | SegmentedControl active thumb — forces dark ink text on white thumb |
| `.chat-input` | Letter Builder textarea — bg-transparent light, bg-surface-2 dark |
| `.split-panel-btn` | Secondary buttons on split panels (Onboarding) |

### Brand colours
- Accent/brand: `#FF5A2F` (orange) → `hsl(var(--brand))`
- Ink: `#151515` → `hsl(var(--ink))`
- Surface levels: `--surface`, `--surface-2`, `--surface-hover`

### Dark mode rules (§7b — binding)
1. **All dark styling lives in `src/index.css`** under `html.dark {}` — never use `dark:` Tailwind variants in component files.
2. Use named utility classes; components reference class names only.
3. Never use raw hex inside `dark:` variants.
4. Use `.active-fill` for anything that's `bg-ink` light / `bg-brand` dark.
5. Use `.glass-page-panel` for split-page right panels.
6. The document canvas (CV/letter editor) is always light — no dark override.

### Gotchas
- `btn-ghost` uses `rounded-full`, not `rounded-xl`
- `glass-input` has `h-11 rounded-2xl` baked in — override explicitly when needed
- Desktop Google sign-in button uses plain border + `bg-white` — no glass class, keep it that way
- `<Input>` (shadcn): add `focus-visible:ring-0 focus-visible:ring-offset-0` to suppress default ring when using `glass-input`
- Context-scoped dark rule: `html.dark .glass-modal .input-base, .textarea-base` automatically gets `bg-surface-2` — no per-component override needed

---

## Layout Pattern

**Separate mobile/desktop render trees** — `lg:hidden` (mobile) and `hidden lg:flex` (desktop). No shared Tailwind classes between trees; never mix responsive utilities across them. When adding mobile UI, create a new JSX block, don't modify the desktop block.

---

## Pages & Key Components

| File | Notes |
|---|---|
| `src/pages/AuthPage.tsx` | Split-page layout. Right panel: `.glass-page-panel`. Mobile topbar: `.glass-page-topbar`. Email-continue + back buttons use design system classes. |
| `src/pages/OnboardingPage.tsx` | Multi-step split-page. Step indicator + next/confirm buttons: `.active-fill`. `secondaryBtnClass`: `.split-panel-btn hover:bg-surface`. |
| `src/pages/JobsPage.tsx` | Pipeline tracker. Filter chips: `.glass-chip` / `.glass-chip-active`. Table: `.glass-card`. FAB: `.active-fill`. Desktop `+` always `bg-brand`. |
| `src/pages/CVBuilderPage.tsx` | CV editor. Mobile + desktop headers: `.glass-nav border-b border-white/20`. Separate mobile/desktop trees. |
| `src/pages/CoverLetterPage.tsx` | AI letter builder. Headers: `.glass-nav`. Send button `disabled={generating}` (never disabled by empty draft). Chat input: `.chat-input`. |
| `src/pages/SettingsPage.tsx` | Settings. Toggle + checkbox: `.active-fill`. |
| `src/components/TopNav.tsx` | Drawer: `.nav-drawer`. Active: `.nav-item-active`. Hover: `.nav-item-hover`. Borders: `.nav-hairline`. Dividers: `.nav-divider`. |
| `src/components/AccountLayout.tsx` | Sidebar layout for account pages. Same nav class pattern as TopNav. |
| `src/components/SegmentedControl.tsx` | Track: `.segmented-track`. Active tab: `.segmented-tab-active`. |
| `src/components/jobs/AddJobModal.tsx` | Smart add — URL scrape or text parse. Input backgrounds handled by context-scoped dark rule (no per-field override needed). |
| `src/components/jobs/JobDetailPanel.tsx` | Job detail slide-in panel. Dropdowns/calendar: `.glass-popover`. |

---

## Domain Logic

- **Onboarding gate**: `ProtectedRoute checkOnboarding` → redirects to `/onboarding` when `profiles.onboarding_completed === false`
- **Smart Add Job**: single textarea detects URL (→ Supabase `scrape-job` edge function) or pasted text (→ `parseJobFromText` via Groq)
- **Account deletion** (`SettingsPage.handleDeleteAccount`): checkbox-controlled — checked = wipe data + re-trigger onboarding; unchecked = sign out only, data preserved

---

## Last Session Summary (2026-05-15)

Completed a full dark mode design system audit and refactor:

- Rewrote DESIGN_SYSTEM.md §7b with token remapping table, utility class registry, and 6 binding rules
- Moved all `dark:` inline variants to named utility classes in `src/index.css`
- Added 15+ new utility classes for consistent dark mode across nav, panels, chips, inputs, etc.
- Fixed: Auth/Onboarding mobile gradient visible through panel (`.glass-page-panel` responsive opacity)
- Fixed: SegmentedControl unreadable in dark (`.segmented-tab-active` forces dark ink on white thumb)
- Fixed: CV Builder + Letter Builder mobile headers inconsistent with other pages → `.glass-nav`
- Fixed: Letter Builder send button was incorrectly disabled when draft empty — now `disabled={generating}` only
- Fixed: Chat input in Letter Builder blending into dark background → `background: hsl(var(--surface-2))` added to `html.dark .chat-input`
- Raised `--ink-muted` dark value to `0 0% 62%` globally — fixes secondary text readability without per-component overrides
