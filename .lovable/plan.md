## Goal

Add a DE/EN language toggle in the top nav (left of the JD avatar), default to **German**, and translate all visible UI strings.

## Approach

Use a lightweight, dependency-free translation context (no i18next) — small, fast, and fits this app's scale.

### 1. Translation infrastructure

- New `src/lib/i18n.tsx` exporting:
  - `LanguageProvider` (wraps `App.tsx`)
  - `useT()` hook returning `{ t, lang, setLang }`
  - `t("key.path")` reads from a nested dictionary; falls back to the key if missing
  - Persists choice in `localStorage` (`app_lang`); default `"de"` when nothing stored
- New `src/lib/translations.ts` — flat-ish object of `de` and `en` strings, organized by area:
  - `nav.*` — Tracker, Resume, Letters
  - `menu.*` — Profile, AI Model, Settings, Support, Log out
  - `common.*` — Save, Library, Export, Cancel, Delete, Loading…, Layout, Classic/Modern/Compact, etc.
  - `tracker.*` — JobsPage strings, status badges, AddJobModal, JobDetailPanel
  - `resume.*` — CVBuilderPage labels, placeholders, section titles, buttons
  - `letter.*` — CoverLetterPage greetings, chat placeholders, default template placeholders
  - `auth.*` and other small surfaces

### 2. Toggle component

- New `src/components/LanguageToggle.tsx` — a small segmented pill with `DE | EN` (active = filled brand, inactive = muted), placed in `TopNav.tsx` immediately before the JD avatar.

### 3. Wire-up

- Wrap the app in `LanguageProvider` inside `App.tsx`.
- Replace hard-coded user-facing strings in:
  - `TopNav.tsx`, `AppLayout.tsx`
  - `pages/JobsPage.tsx`, `pages/CVBuilderPage.tsx`, `pages/CoverLetterPage.tsx`, `pages/Index.tsx`, `pages/NotFound.tsx`
  - `components/SaveModal.tsx`, `SavedCVsPanel.tsx`, `ExportMenu.tsx`, `ZoomControls.tsx`, `LayoutMenu.tsx`
  - `components/jobs/AddJobModal.tsx`, `JobDetailPanel.tsx`, `StatusBadge.tsx`
- Toast titles/descriptions also translated.

### 4. Default content (Resume / Letter placeholders)

The seeded resume + letter use bracketed placeholders like `[Your Name]`. These will also swap with language (e.g. `[Ihr Name]`, `[Firmenname]`, `Sehr geehrte/r [Name der einstellenden Person]`, …). Lorem ipsum stays as-is (it's pseudo-Latin, language-neutral).

### Translation quality

Yes — I will translate all visible strings into natural, professional German (Sie-form, standard hiring/HR vocabulary). Examples:

- Resume → **Lebenslauf** (page title: **Lebenslauf-Editor**)
- Cover Letter → **Anschreiben** (page title: **Anschreiben-Editor**)
- Tracker → **Bewerbungen**
- Save → **Speichern**, Library → **Bibliothek**, Export → **Exportieren**, Layout → **Layout**
- Add Experience → **Erfahrung hinzufügen**, Add Education → **Ausbildung hinzufügen**
- "Edit on the left, preview on the right" → **"Links bearbeiten, rechts ansehen"**
- Status badges: Saved/Applied/Interviewing/Offer/Rejected → Gespeichert/Beworben/Im Gespräch/Angebot/Abgelehnt

If a phrase is ambiguous in context, I'll pick the standard German hiring-domain term and we can refine after a first pass.

## Out of scope

- Backend/email content, scraped job-description text (stays in source language).
- AI-generated chat output stays in whatever the model returns (separate concern; can be added later by passing `lang` to the prompt).
- No URL-based locale routing; toggle is global state only.