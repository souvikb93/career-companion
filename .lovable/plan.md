## Goal

Make the app fully bilingual: when DE is active, every visible string — including sample job data, dates, preview placeholders, input placeholders, save dialog defaults — appears in German. When EN is active, English. Remove brackets from preview placeholders.

## 1. Sample / "backend" job data → bilingual

`src/lib/jobs-data.ts` currently exports a fixed `SAMPLE_JOBS` array with English `location` strings (e.g. "Berlin, Germany") and English `description` text. Refactor:

- Keep `company`, `role`, `salary`, `link`, `dateAdded` (ISO) as language-neutral.
- Convert `location` and `description` per-job to `{ de: string; en: string }`.
- Add a small helper `localizeJobs(jobs, lang)` that returns the active-language strings, used by `jobs-store` when seeding.
- German locations: "Berlin, Deutschland", "Stockholm, Schweden", "München, Deutschland", "Walldorf, Deutschland", "London, Vereinigtes Königreich", "Herzogenaurach, Deutschland", "Amsterdam, Niederlande". German descriptions translated 1:1 from current English.
- `jobs-store` re-seeds (or remaps existing in-memory entries' `location`/`description`) when `lang` changes, so the tracker reflects the toggle live.

Date formatting in `JobsPage.formatDate` and the cover-letter `letterFor(today)` already use `toLocaleDateString(undefined, ...)` — change `undefined` to the active lang (`"de-DE"` / `"en-US"`) so "May 1" becomes "1. Mai".

## 2. Resume preview & editor — German placeholders, no brackets

In `src/pages/CVBuilderPage.tsx`, the `initial` CV object hardcodes English bracketed strings (`"[Your Name]"`, `"Company Name"`, `"[Month/Year]"`, `"[Year of Graduation]"`, `"University Name"`, etc.).

Refactor:
- Replace the static `initial` constant with a `makeInitial(t)` factory called inside the component, using new translation keys.
- Remove brackets everywhere in the preview/editor sample text.
- New `resume.sample.*` keys (DE / EN):
  - `yourName` → "Ihr Name" / "Your Name"
  - `professionalTitle` → "Ihre Berufsbezeichnung" / "Your Professional Title"
  - `email` → "Ihre E-Mail-Adresse" / "Your Email Address"
  - `phone` → "Ihre Telefonnummer" / "Your Phone Number"
  - `linkedin` → "Ihr LinkedIn-Profil" / "Your LinkedIn Profile"
  - `address` → "Ihre Stadt, Land" / "Your City, Country"
  - `jobTitle1` / `jobTitle2` → "Position 1" / "Position 2"
  - `companyName` → "Firmenname"
  - `present` → "Heute" / "Present"
  - `dateRangeStart` → "Monat/Jahr" (no brackets)
  - `university` → "Hochschulname" / "University Name"
  - `degree` → "Abschluss" / "Degree"
  - `gradYear` → "Jahr des Abschlusses" / "Year of Graduation"
  - `skill1/2/3` (or keep Lorem-style — but switch to neutral words like "Beispielkenntnis 1/2/3" / "Sample Skill 1/2/3").
- Also re-translate the input-field placeholders that still read English-ish in DE mode. Update `resume.startPlaceholder`, `endPlaceholder`, `gradDate` translations to drop bracket characters:
  - DE: `startPlaceholder` "Von (z. B. 2022)" ✓ already fine; `endPlaceholder` "Bis (z. B. Heute)" ✓; `gradDate` "Abschlussdatum" ✓.
  - EN: same — strip `[…]` if any remain.
- Re-render preview when `lang` changes: re-evaluate sample only if user hasn't edited (or simplest: always re-derive from `makeInitial(t)` until first edit). To keep it simple and predictable, replace the still-default values with the new locale's defaults whenever `lang` changes (track which fields equal the previous-lang default).

## 3. Cover-letter preview placeholders — remove brackets

`translations.ts` letter `ph_*` keys currently include square brackets ("[Firmenname]", "[Ihr Name]" etc.). Update both DE and EN placeholders to drop brackets:

- DE: "Firmenname", "Straße der Firma", "Stadt der Firma, Postleitzahl", "Ihr Name", "Ihre Straße", "Ihre Stadt, Postleitzahl", "Ihre E-Mail", "Ihre Telefonnummer", "Datum: Datum einfügen", "Betreff: Betreff einfügen", "Sehr geehrte Damen und Herren,", "Mit freundlichen Grüßen,".
- EN equivalents: "Company Name", "Company Street", "Company City, Postal Code", "Your Name", "Your Street", "Your City, Postal Code", "Your Email", "Your Phone Number", "Date: Insert date", "Subject: Insert subject", "Dear Hiring Manager,", "Sincerely,".

The hardcoded `letterFor(...)` template (English: "Dear Hiring Team," / "Sincerely, Jordan Doe") will be moved to `t()` keys (`letter.tmpl_dear`, `letter.tmpl_intro`, `letter.tmpl_body`, `letter.tmpl_close`, `letter.tmpl_signature`) so generated drafts switch language too.

## 4. Save dialog default name

In `CVBuilderPage`'s `<SaveModal defaultName={...}>` the default is `cv.fullName` (which is now "Ihr Name"). Change to a fixed friendly default per language using a new key:

- `resume.defaultSaveName` → DE "Lebenslauf", EN "Resume".
- When `targetJob` exists: `${t("resume.defaultSaveName")} — ${targetJob.company}`.

`SaveModal.tsx` already shows `defaultName` in the input field, so this fixes "Inside Dateiname → Lebenslauf" automatically.

## 5. Other German-mode gaps spotted during sweep

- `RemoveBtn` in `CVBuilderPage` uses `aria-label="Remove"` (untranslated). Switch to `t("common.remove")`.
- `renderCvAsText` in `CVBuilderPage` writes section headings "EXPERIENCE / EDUCATION / SKILLS" to exported plain-text — translate via `t("resume.sectionExperience")` etc. (uppercased).
- `ExportMenu` filenames / `handleExport` filename string `"cv-..."` and `"cover-letter-..."` stay neutral (filenames are fine in English).
- `AppLayout.tsx`, `TopNav.tsx`, `Index.tsx`, `NotFound.tsx`, `LanguageToggle.tsx`, `LayoutMenu.tsx`, `ExportMenu.tsx`, `ZoomControls.tsx`, `SavedCVsPanel.tsx`, `AddJobModal.tsx`, `StatusBadge.tsx` were already wired in the previous turn — quick re-scan to confirm no leftover hardcoded English (esp. tooltips, aria-labels, toast titles).
- Cover-letter heading `"For: …"` and the chat-step strings already use `t()`. Confirm none of the `pushStep` calls in `send`/`fetchFromUrl` use hardcoded strings.
- Confirm any `Dropdown`/`Select` `option` labels (e.g. SaveModal format options) are translated — they already use `t("formats.*")`. ✓
- Sample saved-CV / saved-letter library names ("Resume — Zalando…", "Cover Letter — N26…") — translate the leading word via `t("resume.defaultSaveName")` / `t("letter.defaultSaveName")` so the library list reads "Lebenslauf — Zalando …" in DE.

## 6. Files to edit (technical details)

- `src/lib/translations.ts` — add `resume.sample.*`, `resume.defaultSaveName`, `letter.tmpl_*`; rewrite `letter.ph_*` without brackets; ensure DE input placeholders are bracket-free.
- `src/lib/jobs-data.ts` — change `location`/`description` to `{ de, en }`; export `localizeJob(job, lang)`.
- `src/lib/jobs-store.tsx` — consume `lang` from `useT`, remap seeded jobs on language change.
- `src/pages/JobsPage.tsx` — pass `lang` to `formatDate` (or use `Intl.DateTimeFormat(lang)`).
- `src/pages/CVBuilderPage.tsx` — replace `initial` with `makeInitial(t)`; reset still-default fields on lang change; localize `aria-label="Remove"`; localize `renderCvAsText` headings; new save default name; update demo library names.
- `src/pages/CoverLetterPage.tsx` — `letterFor` becomes `letterFor(t, lang, ...)`; today's date uses `toLocaleDateString(lang)`; demo library names use `t("letter.defaultSaveName")`.

## 7. Verification

- Toggle DE → tracker shows German locations/descriptions, "1. Mai" dates, German status pills.
- Open Lebenslauf → preview shows "Ihr Name", "Firmenname", "Position 1", "Monat/Jahr – Heute", "Hochschulname", no brackets anywhere; input placeholders bracket-free in German.
- Click Speichern → Dateiname pre-filled with "Lebenslauf".
- Open Anschreiben → placeholders bracket-free, German salutation/closing; default draft generated by "Anpassen" is in German.
- Toggle EN → everything mirrors in English.

## Out of scope

- Translating real scraped job descriptions (live data from `scrape-job` edge function stays in source language).
- Translating user-entered content.
- AI-generated chat output beyond the existing canned step strings.
