## 1. Default Resume placeholder template

On `src/pages/CVBuilderPage.tsx`, replace the current `initial` CV data with placeholder content matching the requested template. The preview will render the same fields it already does (name, contact line, summary, experience, education, skills) — only the seed values change.

New seed values:
- **fullName:** `[Your Name]`
- **professional title:** `[Your Professional Title]` (new field, shown under name in preview)
- **phone / email / linkedIn / location:** `[Your Phone Number]`, `[Your Email Address]`, `[Your LinkedIn Profile]`, `[Your Address or City, Country]`
- **summary:** "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vitae sapien id nulla ullamcorper convallis."
- **experiences:** two entries — `Job Title 1 / Company Name / [Month/Year] – Present` and `Job Title 2 / Company Name / [Month/Year] – [Month/Year]`, each with two short Lorem ipsum bullet lines in the description.
- **education:** one entry — `Degree / University Name / [Year of Graduation]` with a Lorem ipsum line.
- **skills:** `Lorem ipsum`, `Dolor sit amet`, `Consectetur adipiscing`.

Small preview tweak: render the optional professional title beneath the name (single line, muted) so the placeholder reads naturally.

No editor structure, save/load, export, or tailoring logic changes.

## 2. Layout selector (Resume + Letter)

Placement: **top toolbar**, on both pages, immediately to the left of the Save button — a small button labeled "Layout" with a layout icon, opening a dropdown menu with three options:

- **Classic** — current centered single-column look (default)
- **Modern** — two-column with a left sidebar for contact + skills, main column for summary/experience/education
- **Compact** — single column with tighter spacing, smaller headings, denser line-height to fit more on one page

Behavior:
- Selection is stored in component state (and persisted to `localStorage` per page: `cv_layout`, `letter_layout`) so it survives reloads.
- The preview area renders one of three layout variants based on the current selection. Same data, different presentation.
- A subtle check mark indicates the active option in the dropdown.

Files touched:
- `src/pages/CVBuilderPage.tsx` — toolbar button + 3 preview layout variants
- `src/pages/CoverLetterPage.tsx` — toolbar button + 3 letter layout variants (Classic = current two-column header; Modern = left accent bar with sender block; Compact = tighter margins/typography)
- New small component `src/components/LayoutMenu.tsx` — shared dropdown using existing shadcn `dropdown-menu` primitives, to keep both pages consistent.

## Out of scope
- No backend changes, no schema changes.
- Layouts are visual-only; export still uses the existing text renderer.
