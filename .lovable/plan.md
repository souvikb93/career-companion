## Changes

**1. Remove hover lift + shadow on Add Job modal buttons** (`src/components/jobs/AddJobModal.tsx`)
The four action buttons (Enter Manually, Fetch Job, Back, Add Job) currently use `hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-none`. Remove those classes so the buttons stay flat on hover (keep the color/opacity hover states).

**2. Unify the close (X) icon style across popups**
Adopt the Add Job modal's X style as the standard:
- Absolute top-right (`top-4 right-4`)
- `h-9 w-9` round, no border, no background
- `text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors`
- `X` icon at `h-4 w-4`

Apply this to:
- `src/components/SaveModal.tsx` (currently uses a bordered `bg-surface-2` circle inline in the header — replace with the absolute, borderless version)
- `src/components/SavedCVsPanel.tsx` (Library panel close button — align to same style)

**3. Rename "Name" → "File name" in Save modal** (`src/components/SaveModal.tsx`)
Change the label text and update the input placeholder accordingly. Affects both Save Resume and Save Cover Letter popups since they share this component.

## Out of scope
No business-logic changes; purely presentation tweaks.