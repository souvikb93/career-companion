# Tracka — project notes for AI sessions

## Design system (read before touching any UI)

Tracka has a documented design system at [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md). **Read it before making any visual change.** All tokens, component recipes, and binding rules ("MUST / MUST NOT") live there.

Highlights:
- The aesthetic is **Berlin Glass**: editorial typography + frosted glass surfaces + an animated brand-orange mesh background.
- Tokens are CSS variables in [`src/index.css`](src/index.css). All reusable patterns have a utility class — use the class, don't recreate the Tailwind combination inline.
- **One accent colour** (orange). Status colours must always be paired with a label or icon.
- **Surface levels**: `.card-surface` on solid pages, `.glass-card` on pages with the gradient mesh. Never mix.
- **Typography scale**: `.eyebrow-mono` / `.display-1` / `.display-2` / `.heading-1` / `.heading-2`. Don't write `text-[Xpx]` inline.

Run the full checklist in §8 of `DESIGN_SYSTEM.md` before considering any UI work done.

## Stack

- Vite + React + TypeScript + Tailwind
- Supabase (auth, profile storage), Groq (AI), localStorage (jobs cache)
- Routing via React Router; SPA rewrites configured in `vercel.json`
- Type check: `./node_modules/.bin/tsc --noEmit`

## Domain logic

- **Onboarding gate**: `ProtectedRoute checkOnboarding` redirects to `/onboarding` when `profiles.onboarding_completed === false`.
- **Account deletion**: in `SettingsPage.handleDeleteAccount`. Checkbox-controlled — checked = wipe data + onboarding on re-login; unchecked = sign out only, data preserved.
- **Smart Add Job**: single textarea accepts a URL (→ Supabase `scrape-job` edge function) or pasted text (→ `parseJobFromText`). Detects mode via `isUrl()`.
