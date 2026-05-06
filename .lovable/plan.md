## Goal

Redefine the button system so primary, secondary, and tertiary buttons have predictable, consistent states — no more lift/shadow on secondary actions. Apply the new secondary style to all three header buttons (Save, Library, Export) on the Resume and Letters pages.

## 1. Primary button (`.btn-primary` in `src/index.css`)

| State | Background | Text | Notes |
|---|---|---|---|
| Default | `--ink` (#151515) | white | rounded-full, bold uppercase |
| Hover | `--brand` (#FD5D2E / current 13 100% 59%) | white | color swap only — no lift, no shadow |
| Active | `--brand` | white | same as hover |
| Disabled | `--ink` | white, opacity 50% | `disabled:opacity-50`, no hover swap |

Implementation: rewrite `.btn-primary` to use `bg-ink text-white hover:bg-brand active:bg-brand disabled:opacity-50 disabled:hover:bg-ink transition-colors`. Remove `hover:-translate-y-0.5`, `hover:shadow-lg`, `active:translate-y-0`, `active:shadow-none`.

Note: today the brand orange token is #FF5A2F (13 100% 59%). The user spec says #FD5D2E. They render almost identically, so we keep the existing `--brand` token unless the user wants the exact hex updated.

## 2. Secondary button (`.btn-ghost` in `src/index.css`)

Match the JD profile button in `TopNav.tsx`:
`bg-surface-2 border border-line text-ink hover:bg-surface-hover transition-colors`

| State | Background | Text | Border |
|---|---|---|---|
| Default | `--surface-2` | `--ink` | `--line` |
| Hover | `--surface-hover` | `--ink` | `--line` |
| Active | `--surface-hover` | `--ink` | `--line` |
| Disabled | `--surface-2` | `--ink` 50% | `--line` |

Remove `hover:-translate-y-0.5`, `hover:shadow-md`, `hover:bg-ink`, `hover:text-background`, `hover:border-ink`, `active:translate-y-0`, `active:shadow-none`. Keep rounded-full, h-11, uppercase styling.

## 3. Apply to Resume + Letters page header buttons

The three header buttons on each page are:

- **Resume** (`src/pages/CVBuilderPage.tsx`): Save, Library, Export
- **Letters** (`src/pages/CoverLetterPage.tsx`): Save, Library, Export

Save and Library already use `.btn-ghost`, so they pick up the new style automatically.

Export is rendered by `src/components/ExportMenu.tsx` with inline classes. Update its trigger className to use the same secondary style (extract to `.btn-ghost` or align the inline classes to match: `bg-surface-2 border border-line text-ink hover:bg-surface-hover`, no lift/shadow).

## 4. Out of scope

- Tier-1 action buttons elsewhere (Tailor, Build CV, Send) keep `.btn-primary` and will inherit the new color-swap behavior automatically.
- The `.btn-action` / `.btn-trigger` utilities are unused on these pages after this change; leaving them in place for now (can clean up later if desired).
- Tertiary/icon buttons (zoom, close, chip remove) are not mentioned in this request; leaving as-is.

## Files to change

- `src/index.css` — rewrite `.btn-primary` and `.btn-ghost`
- `src/components/ExportMenu.tsx` — align trigger className to new secondary style