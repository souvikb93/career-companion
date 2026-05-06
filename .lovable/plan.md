# Unify button hover states (2 tiers)

## Why two tiers, not one
Action buttons commit something — a small lift + shadow gives tactile feedback. Dropdown and icon triggers just reveal a surface; they must stay anchored so the menu doesn't open from a moved position. This pattern matches Material, Apple HIG, and Carbon.

## The two tiers

**Tier 1 — Action buttons (lift + tint)**
- Used for: Save, Add Job, Fetch Job, Cancel, Custom CV, Cover Letter, filter chips, "Add Job" CTA
- Hover: `hover:bg-*` tint + `hover:-translate-y-0.5` + `hover:shadow-md`
- Active: `active:translate-y-0 active:shadow-none`
- Transition: `transition-all duration-200 ease-out`

**Tier 2 — Triggers & icon buttons (tint only)**
- Used for: Export dropdown trigger, JD avatar, close X, ZoomControls +/−, sidebar nav items, dropdown menu items
- Hover: `hover:bg-surface-2` (or `hover:bg-surface-hover` for nav)
- No translate, no shadow
- Transition: `transition-colors duration-200`

## Files to update

1. **`src/index.css`** — add two utility classes so we don't repeat Tailwind chains:
   - `.btn-action` → tier-1 hover (lift + shadow + tint)
   - `.btn-trigger` → tier-2 hover (tint only)
   - Update existing `.btn-primary` to compose `.btn-action` behavior
2. **`src/components/ExportMenu.tsx`** — trigger button: remove any lift, keep `hover:bg-surface-2` only
3. **`src/components/TopNav.tsx`** — JD avatar trigger: tint only (already close, just normalize)
4. **`src/components/ZoomControls.tsx`** — +/− icon buttons: tint only
5. **`src/pages/JobsPage.tsx`** — filter chips & Add Job FAB: tier-1 lift
6. **`src/pages/CoverLetterPage.tsx`** & **`src/pages/CVBuilderPage.tsx`** — Save / Custom CV / Cover Letter buttons: tier-1 lift
7. **`src/components/jobs/AddJobModal.tsx`** — Cancel + Fetch Job: tier-1 lift
8. **`src/components/jobs/JobDetailPanel.tsx`** — close X (tier-2), Custom CV / Cover Letter (tier-1)
9. **`src/components/SaveModal.tsx`** & **`src/components/SavedCVsPanel.tsx`** — same split

## Acceptance check
- Open Export menu → trigger highlights but doesn't move; menu opens from same spot ✓
- Open JD menu → same behavior ✓
- Hover Save / Add Job → lifts 1px with soft shadow ✓
- Hover dropdown menu items → bg tint, no movement ✓
- Hover close (X) and zoom +/− → bg tint only ✓
- All transitions feel like one design system, not multiple ✓
