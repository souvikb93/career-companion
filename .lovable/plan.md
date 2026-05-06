## Changes to Resume Builder page (`src/pages/CVBuilderPage.tsx`)

**1. Header**

- Change `<h1>Resume</h1>` → `Resume Builder`.
- Always dont show subtitle "Edit on the left, preview on the right." r.
- Keep alignment as-is (title , left-aligned in the existing header bar).

**2. "Add Experience" / "Add Education" buttons (`AddBtn` component)**

- Convert from the current pill-outline (border-brand, rounded-full, uppercase) to a tertiary text-link style: no border, no background, brand color text, small `Plus` icon, hover underline.
- Applies to both "Add experience" and "Add education" since they share `AddBtn`.

**3. Experience & Education cards — add in-card header**

- Each card gets a header row: left side shows `Experience 1`, `Experience 2`, … (or `Education 1`, `Education 2`, …) — numbered by index in the array, incrementing automatically.
- Right side: the close (X) button, properly aligned in the header row (flex justify-between) instead of absolutely positioned over the inputs (which currently overlaps the Company input — see screenshot).
- Remove the `absolute top-3 right-3` positioning on `RemoveBtn` for these cards; the header row provides natural alignment with padding so it no longer collides with the input fields.
- Inputs grid stays unchanged below the header.

## Out of scope

No business-logic, data, or routing changes. Pure presentation tweaks to the Resume Builder page.