## Goals

1. Make the new 12-job dataset actually appear on the Tracker page (currently masked by cached localStorage).
2. Add a third button tier (tertiary, text-only link style) to the design system and use it for the "Open" actions in the Library panel.
3. Replace the Save modal format pills with a real dropdown (default PDF), and align Save / Cancel / close buttons with the new primary & secondary styles.

## Changes

### 1. Force fresh job data on the Tracker

`src/lib/jobs-store.tsx`
- Bump `STORAGE_KEY` from `"jobs_v3"` → `"jobs_v4"` so any browser still holding old cached jobs reloads `SAMPLE_JOBS` from `jobs-data.ts` (the 12 companies you provided).

### 2. Add tertiary button to the design system

`src/index.css` (under `@layer components`)
- Add `.btn-tertiary`:
  - inline-flex, no background, no border, no padding box
  - text style: `text-[12px] font-bold uppercase tracking-[0.08em] text-ink`
  - hover: `text-brand`
  - active: `text-brand`
  - disabled: `opacity-50` (no color change)
  - `transition-colors duration-200 ease-out`

This becomes the documented third tier alongside `.btn-primary` (black → orange) and `.btn-ghost` (secondary surface).

### 3. Use tertiary for "Open" in Library panel

`src/components/SavedCVsPanel.tsx`
- Replace the orange pill "Open" button with `<button className="btn-tertiary">Open</button>`.
- Leave the trash icon button as-is (icon-only ghost behavior).

### 4. Save modal — dropdown + new button styles

`src/components/SaveModal.tsx`
- Replace the three format pill buttons with a single native-styled `<select>` using our `input-base` look:
  - Options: PDF, DOC, TXT
  - Default value: `pdf` (already the initial state)
  - Add a subtle chevron via background SVG or a wrapping div with a `ChevronDown` icon to keep visual parity with our inputs.
- Cancel button → `className="btn-ghost flex-1 justify-center"` (new secondary).
- Save button → `className="btn-primary flex-1 justify-center"` (new primary: black → orange on hover).
- Close (X) icon button: keep the circular icon control but switch to the secondary token set (`bg-surface-2 border-line text-ink hover:bg-surface-hover`) so it follows the secondary behavior (color-only, no movement).

### 5. Sweep remaining stray buttons in Letters/CV pages

Same pattern already applied to the Tracker `+` and Library buttons — extend to the two spots still using the old `bg-brand … hover:-translate-y-0.5 hover:shadow-md` pattern so the design system is consistent everywhere:

`src/pages/CoverLetterPage.tsx`
- "Tailor" button (URL fetch action) → `btn-primary` (keep loader/icon children).
- Chat "Send" icon button → square 44×44 variant of primary: `bg-ink text-white hover:bg-brand active:bg-brand transition-colors` (no lift/shadow).
- User chat bubble background stays brand (it's a message bubble, not a button).

`src/pages/CVBuilderPage.tsx` (mirror change if the same Send/Tailor patterns exist there).

`src/pages/JobsPage.tsx`
- Mobile floating `+` (sm:hidden) and EmptyState "Add Job" → `btn-primary` styling (black → orange, no lift).

## Notes for the user

- Tertiary = text-only link styled like our uppercase button labels; it turns orange on hover. Use it for low-emphasis actions inside cards/lists (e.g. "Open" in the Library).
- After this change the Tracker will reset to the 12 sample jobs once. Any jobs you added manually in the browser will be cleared because the storage key changes.
