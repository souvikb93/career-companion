# Tracka Design System — v2 "Berlin Glass"

A working spec for the Tracka UI. Tokens live in [`src/index.css`](src/index.css), and Tailwind utilities are exposed via [`tailwind.config.ts`](tailwind.config.ts). Every reusable pattern in this doc has a corresponding utility class — **don't recreate combinations inline**, use the class.

---

## 1 — Philosophy

Tracka is a job-hunt tool aimed at design-aware professionals in Europe. The aesthetic borrows from the Berlin design-network school: **editorial typography over an animated brand-orange mesh, frosted glass surfaces, single accent colour, sharp scale jumps, hairline borders**.

Three rules that override everything else:

1. **One accent.** Orange is the only chromatic colour. Status colours exist but must be paired with a label/icon (per WCAG 1.4.1).
2. **Hierarchy via scale.** Big leaps between body (16px) and display (56–72px). Don't bump font-weight when you mean to bump size.
3. **Glass sits over mesh; cream sits over solid.** Don't mix surface systems on the same page.

---

## 2 — Foundations

### 2.1 Colour tokens

All tokens are HSL custom properties in `:root`. Use the semantic Tailwind class, never raw hex.

| Token | Tailwind | Value | Use |
|---|---|---|---|
| Background base | `bg-background` | `#F3F3F1` | Solid pages (settings, profile) |
| Surface 1 | `bg-surface` | `#F4F3F0` | Cards on solid pages, sticky TopNav |
| Surface 2 | `bg-surface-2` | `#EFEFED` | Hover fills, secondary chips |
| Surface hover | `bg-surface-hover` | `#FAFAF8` | Row hover on solid pages |
| Ink (text) | `text-ink` | `#151515` | Primary text, headings |
| Ink muted | `text-ink-muted` | `#4A4A4A` | Helper text, eyebrows, descriptions |
| Line | `border-line` | `#A7A39B` | Hairline borders on solid surfaces |
| Brand | `text-brand` / `bg-brand` | `#FF5A2F` | The only accent — CTAs, active states, focus rings |
| Success | `text-success` | `#10B981` | Success states only — never decorative |

**Glass tokens** (RGB, used with `/<alpha>` modifier in CSS):

| Token | Value | Use |
|---|---|---|
| `--glass-tint` | `255 255 255` | Translucent layer fill |
| `--glass-border` | `255 255 255` | Hairline on glass at 40–60% alpha |
| `--glass-shadow` | `21 21 21` (ink) | Layered shadow under glass |

### 2.2 Typography

- **Body font**: Satoshi → Helvetica Neue → system-ui
- **Wordmark**: ABeeZee (`.logo-wordmark` only — don't use for UI)
- All headings: `font-weight: 600`, `letter-spacing: -0.01em`, antialiased

**Scale** (use these classes — don't write `text-[Xpx]` inline):

| Class | Size | Use |
|---|---|---|
| `.eyebrow-mono` | 12px, uppercase, tracking `0.2em` | Section labels, page anchors over display headlines |
| `.eyebrow` | 12px, uppercase, tracking `0.08em` | Column headers, eyebrow above non-display text |
| `.field-label` | 11px, uppercase, tracking `0.08em` | Form input labels |
| Body | 14–16px | Default body, descriptions |
| `.heading-2` | 22px | Card section headings |
| `.heading-1` | 28→32px | Page titles on solid pages |
| `.display-2` | 40→48px | Section heroes |
| `.display-1` | 56→72px | Empty-state headlines, landing hero |

> **Minimum body size on mobile is 16px** — avoids iOS auto-zoom. (UX rule `readable-font-size`.)

### 2.3 Spacing & radius

- 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 — stick to Tailwind's 4pt scale.
- **Radius**:
  - Buttons: `rounded-full` (pills) for primary/ghost CTAs; `rounded-xl` for inline icon buttons.
  - Inputs / chips: `rounded-2xl` (16px).
  - Cards: `rounded-2xl`.
  - Modals / sheets: `rounded-3xl` (24px).
- **Borders**: 1px hairline only. `border-line` on solid surfaces, `border-white/50` on glass.

### 2.4 Motion

| Token | Value | Use |
|---|---|---|
| `--motion-fast` | 180ms | Hover, colour change |
| `--motion-base` | 240ms | Modal enter / exit |
| `--motion-slow` | 400ms | Page transitions |
| `--motion-mesh` | 30s | Background blob loops |
| `--ease-out` | `cubic-bezier(0.22, 0.61, 0.36, 1)` | Default UI easing |

- Only animate `transform` and `opacity`. Never animate `width / height / top / left`.
- Always respect `prefers-reduced-motion` — the mesh background blobs already pause via CSS in `index.css`.

---

## 3 — Surface system

Three levels of surface, picked by the background underneath:

| Level | Class | When |
|---|---|---|
| Solid | `.card-surface` / `.card-large` | Settings, Profile, FAQ, CV builder, Cover Letter — pages with a solid `bg-background` |
| Glass L2 (content) | `.glass-card` | Cards on pages with the gradient mesh — Jobs tracker, landing |
| Glass L3 (overlay) | `.glass-modal` | Modals, sheets, popovers when they appear over a mesh page |

Inputs follow the same split:
- Solid pages → `.input-base`
- Glass pages → `.glass-input`

Chips/filter pills:
- Solid → `border border-line bg-surface-2`
- Glass → `.glass-chip` / `.glass-chip-active`

**Don't mix.** A page is either glass or solid — never half.

---

## 4 — Components (recipes)

All recipes live as classes in `index.css`. The Tailwind combinations below are documentation, not what you should be writing.

### 4.1 Buttons

| Recipe | Class | Markup |
|---|---|---|
| Primary CTA | `.btn-primary` | `<button className="btn-primary">…</button>` |
| Ghost | `.btn-ghost` | Surface-2 background, same shape |
| Tertiary | `.btn-tertiary` | Text-only, hover underlines |
| Icon (40–48px square) | `rounded-xl bg-ink text-white hover:bg-brand` | Square, never pill |

Rules:
- Exactly **one primary CTA per screen**. Everything else is ghost / tertiary.
- Loading state → disable button, swap content for `<Loader2 className="animate-spin" />`.
- Min touch target 44×44 (mobile) / 48×48 (Android). Already baked into the height utilities below.
- Use `.btn-action` modifier for "consequential" buttons that should lift on hover.

### 4.2 Inputs

| | Solid | Glass |
|---|---|---|
| Single line | `.input-base` | `.glass-input` |
| Multi line | `.textarea-base` | _(none yet — use `.glass-input` styles on a textarea)_ |
| Label | `.field-label` (always visible, never placeholder-only) | same |
| Helper text | `text-[12px] text-ink-muted mt-1` | same |
| Error | `border-red-600` on input + `text-[12px] text-red-600 mt-1` below | same |

Always place errors **below the field**, never only at the top.

### 4.3 Cards

| Recipe | Class |
|---|---|
| Standard card | `.card-surface` |
| Large feature card | `.card-large` (rounded-[28px]) |
| Glass card | `.glass-card` |

### 4.4 Modal / dialog

Glass modal recipe — use `.glass-modal` for the panel. The backdrop should be `bg-ink/40 backdrop-blur-sm`.

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center">
  <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onCancel} />
  <div className="relative glass-modal p-6 w-full max-w-sm mx-4">…</div>
</div>
```

Rules:
- Always provide a close affordance (Escape key + visible × button).
- Confirm before dismissing modals with unsaved changes.
- Don't trap focus inside a non-modal popover — only modals.

### 4.5 Filter chip

```tsx
<button className={cn("h-10 px-4 rounded-full inline-flex items-center gap-2 text-[13px] font-medium glass-chip", active && "glass-chip-active")}>
  <span>{label}</span>
  <span className={cn("text-[12px]", active ? "text-brand" : "text-ink-muted")}>{count}</span>
</button>
```

### 4.6 Empty state

The signature Tracka empty state — display headline over mono eyebrow:

```tsx
<div className="py-24 px-6 text-center">
  <p className="eyebrow-mono mb-5">— Section name</p>
  <h2 className="display-1">Headline</h2>
  <p className="text-[16px] text-ink-muted mt-4 max-w-md mx-auto">One line of context.</p>
  <button className="btn-primary mt-8 h-12 px-6">Primary action</button>
</div>
```

### 4.7 Background mesh

Defined in `src/components/BackgroundGradientAnimation.tsx`. Default colour palette is brand-orange–tinted. Use only on:

- The Jobs tracker page (current trial)
- Future landing / marketing pages
- Onboarding hero (TBD)

**Never** on dense content pages (settings, profile, CV builder, cover letter). The animation taxes the GPU and the visual noise fights with form fields.

Mount it as `containerClassName="absolute inset-0 -z-10"` inside a `relative` page wrapper, with `interactive={false}` unless the page is short.

---

## 5 — Layout patterns

### 5.1 App shell

- `TopNav` is `h-16 sticky top-0 z-40 bg-surface border-b border-line`. **For the glass trial it stays opaque** — only convert to `.glass-nav` once we standardise glass across all main pages.
- Main content: `min-h-[calc(100vh-64px)]`.

### 5.2 Account section (Profile / AI Model / Settings / FAQ)

- Sidebar: `w-60` fixed, `border-r border-line bg-surface`.
- Content: `px-10 py-8`, `max-w-2xl`, `space-y-5`. Solid surfaces.

### 5.3 Glass page (Jobs tracker)

- `relative` page wrapper containing the mesh + content.
- Toolbar row: glass chips + glass input + dark icon-button CTA.
- Single glass card holding the table.

### 5.4 Split page (Auth / Onboarding)

- `grid lg:grid-cols-2`, left = `bg-[#F4F3F0]`, right = `bg-white`.

### 5.5 Cover letter document (A4 page)

The generated letter is a **document**, not a UI surface — it should look credible printed on paper. It lives at 794×1123px (A4 at 96dpi) and is fully opaque white over the workspace mesh.

**Page geometry**

- Container: `width: 794px`, `min-height: 1123px`, `background: white`, drop shadow `shadow-2xl`.
- Inner padding: **80px top, 72px left/right, 96px bottom**. Compact layout: 56/64/72.
- `modern` layout adds a 12px brand-orange spine on the left edge (already implemented).

**Vertical rhythm**

Use these gaps between blocks (top → bottom):

1. Address row (recipient left, sender right) → **40px** → Date
2. Date → **24px** → Subject
3. Subject → **28px** → Salutation
4. Salutation → **20px** → Body para 1
5. Body para → **14px** → next body para
6. Last body para → **28px** → Signoff line
7. Signoff → **40px** → Sender name (space for handwritten signature)

**Typography scale** (size / weight / color / line-height)

| Element | Size | Weight | Color | LH |
|---|---|---|---|---|
| Letterhead (sender name) | 26px | 600 | ink | 1.2 |
| Sender contact lines | 12px | 400 | ink-muted | 1.6 |
| Recipient (company name) | 14px | 500 | ink | 1.5 |
| Recipient address lines | 12px | 400 | ink-muted | 1.5 |
| Date | 13px | 400 | ink-muted | 1.5 |
| Subject | 15px | 600 | ink | 1.5 |
| Salutation | 14px | 400 | ink | 1.6 |
| Body paragraph | 14px | 400 | ink | **1.7** |
| Signoff | 14px | 400 | ink | 1.5 |
| Signature | 15px | 600 | ink | 1.2 |

Body is set at **14px / 1.7** — equivalent to ~11pt in print. This is the smallest size that still reads comfortably on A4 at 1:1. Don't go smaller. Body is also `text-align: justify` with `hyphens: auto` for an editorial, paper-like feel.

**Font family**

- Whole document: `font-sans` (Inter inherited from app). Modern, neutral, ATS-friendly.
- Do **not** mix serif and sans inside the letter.
- No bold inside body paragraphs — emphasis goes through sentence structure, not weight.

**Color**

- Body: `ink` (#0F0F0E equivalent).
- Address & date: `ink-muted` for visual softness so the body remains the focus.
- Subject and sender's signature name: full `ink` + 600 to anchor the page.
- **Never** use `brand` inside the letter body. The brand stays on app chrome only (the `modern` left spine is the one exception).

**Hierarchy rules**

- Sender name (right column top) is the largest type on the page — it functions as the letterhead.
- Recipient (left column) is smaller and softer — the document is "from you, to them".
- Subject is the only line that's both bold AND larger than body — earns its own line.

**Density target**

A cover letter should occupy **roughly 70–85% of the A4 page** vertically. To hit that:

- Body must be **3 paragraphs of 80–130 words each** (total ~280–360 words).
- The generator prompt enforces this length range — see `generateCoverLetter` in `src/lib/groq.ts`.
- If a letter looks sparse, fix it in the prompt, not by inflating padding or font size.

**Class tokens** (defined in `src/index.css`)

- `.letter-page` — A4 canvas with print padding
- `.letter-head-row` — flex row, recipient left + sender right
- `.letter-sender-name` — 24/600 letterhead
- `.letter-meta` — 11px ink-muted contact line
- `.letter-recipient` — recipient stack
- `.letter-subject` — 14/600 subject line
- `.letter-body` — 13/400/1.75 body paragraph

Always use these classes — do not write `text-[13px] leading-relaxed` inline.

---

## 6 — Iconography

- **Lucide only.** Never use emojis as functional icons.
- Default size 16px (`h-4 w-4`), large 20px, inline-text 14px.
- Icon colour follows text colour — `text-ink-muted` for secondary, inherits otherwise.
- Always include an `aria-label` on icon-only buttons (UX rule `aria-labels`).

---

## 7 — Accessibility minimums (non-negotiable)

These are CRITICAL-priority and apply to every component:

1. **Contrast ≥ 4.5:1** for body text, ≥ 3:1 for large/display text. Verify when picking text colour against glass surfaces — `text-ink` over `glass-card` is fine; `text-ink-muted` may fall below the bar on darker mesh sections.
2. **Visible focus ring** on every interactive element. Don't remove the default; if you customise, use a 2px brand-orange ring.
3. **Touch target ≥ 44×44px** on mobile, ≥ 48×48px on Android.
4. **Keyboard nav** — tab order matches visual order; modals trap focus; Escape closes.
5. **Don't convey info by colour alone.** Status dots must have a label next to them.
6. **Respect `prefers-reduced-motion`.** Background blobs are already paused via CSS; do the same for any new long-running animation.

---

## 8 — Rules for AI agents writing UI code

A checklist to run through before considering a UI change "done". This expands and pins the UI/UX Pro Max skill priorities to Tracka's specific system.

### MUST

- [ ] Use the **named utility class** when one exists (`btn-primary`, `glass-card`, `display-1`). Don't open-code its Tailwind combination.
- [ ] Use **semantic colour tokens** (`bg-surface`, `text-ink-muted`) — never raw hex outside `index.css`.
- [ ] Pick the **surface level** that matches the page: glass on mesh pages, cream on solid pages. Never both on the same screen.
- [ ] Pair every status colour with a label or icon.
- [ ] Add `aria-label` to icon-only buttons.
- [ ] Keep min body 16px on mobile, min touch target 44×44.
- [ ] Animate only `transform` / `opacity`. 180ms for hover, 240ms for modal.
- [ ] Show one primary CTA per screen — everything else is ghost or tertiary.
- [ ] Empty states use the `eyebrow-mono + display-1` recipe.
- [ ] Errors live **below** the field, not in a summary at top (unless multiple errors in a long form).

### MUST NOT

- [ ] Don't use emojis as icons — Lucide only.
- [ ] Don't write `text-[48px]` inline when `display-2` exists.
- [ ] Don't introduce new font families.
- [ ] Don't introduce a new colour without adding a token to `index.css` first.
- [ ] Don't put glass surfaces over solid pages (no backdrop to refract → looks broken).
- [ ] Don't animate layout properties (`width`, `height`, `top`, `left`).
- [ ] Don't remove `focus-visible` outlines.
- [ ] Don't add the gradient mesh to dense form pages.
- [ ] Don't `rounded-2xl` something that should be a pill — pills (`rounded-full`) are reserved for primary/ghost CTAs.

### When in doubt

1. Find the closest matching component recipe in §4.
2. If nothing fits, build it using the foundation tokens in §2, then **add a new utility class to `index.css`** before using it twice.
3. If the colour or motion you need isn't in §2, propose a token addition in the PR — don't inline it.

---

## 9 — File map

| File | Role |
|---|---|
| `src/index.css` | All tokens, utility classes |
| `tailwind.config.ts` | Token → Tailwind class wiring, animations |
| `src/components/BackgroundGradientAnimation.tsx` | The mesh background |
| `src/lib/utils.ts` | `cn()` for class merging |
| `DESIGN_SYSTEM.md` | This doc (single source of truth) |
| `CLAUDE.md` | Pointer so AI sessions load this doc automatically |
