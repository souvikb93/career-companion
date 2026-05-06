# Seed CV & Cover Letter library with dummy data

Both libraries (Resume and Cover Letter pages) currently seed with **1 sample item**. I'll bump that to **6–7 realistic items each**, themed around the German companies already in the Jobs list (Zalando, Delivery Hero, FlixBus, N26, etc.) so the libraries feel populated and tell a coherent product story.

## What changes

### 1. `src/pages/CVBuilderPage.tsx` — seed `saved_cvs_v1`
Bump storage key to `saved_cvs_v2` (so existing single-item caches refresh) and seed with 6 CVs. Each is a tweaked copy of the base `initial` CV with:
- A name like "Resume — Zalando Senior Designer"
- A tailored `summary` line referencing the company/role
- Reordered `skills` to highlight role-relevant ones
- Realistic `savedAt` dates spread over the past 2 weeks

Examples:
- Resume — Zalando Senior Designer (3 days ago)
- Resume — Delivery Hero Product Engineer (5 days ago)
- Resume — N26 Product Designer (1 week ago)
- Resume — FlixBus Brand Designer (1 week ago)
- Resume — Bolt Frontend Engineer (10 days ago)
- Master Resume — General (12 days ago)

### 2. `src/pages/CoverLetterPage.tsx` — seed `saved_letters_v1`
Bump storage key to `saved_letters_v2`. Seed with 6 cover letters generated via the existing `letterFor(company, role, description)` helper, one per major job in the Jobs list:
- Cover Letter — Zalando, Senior Product Designer
- Cover Letter — Delivery Hero, Product Engineer
- Cover Letter — N26, Product Designer
- Cover Letter — FlixBus, Brand Designer
- Cover Letter — Bolt, Frontend Engineer
- Cover Letter — GetYourGuide, Senior Engineer

Each gets a `jobLabel` and a realistic `savedAt` timestamp.

## Acceptance check
- Open Resume page → "Library" panel shows 6 saved resumes with varied names and dates ✓
- Open Cover Letter page → "Library" panel shows 6 saved cover letters ✓
- Loading any saved item populates the editor correctly ✓
- New saves still prepend to the list ✓
