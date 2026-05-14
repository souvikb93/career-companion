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
- **Exit animations** should be 60–70% of the enter duration (feel faster to dismiss): enter 240ms → exit ~150ms.
- Use `ease-out` for entering elements, `ease-in` for exiting.

**Canonical scrim opacity:** `bg-ink/40` for modals and dialogs. `bg-ink/20` for lightweight panels (e.g. side panel). Do not use `bg-ink/30` — the codebase has legacy instances at this value; standardise to 40 when touching those components.

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
- **Disabled state** → add `disabled` attribute; style with `opacity-50 cursor-not-allowed pointer-events-none`. Never fake-disable without the semantic attribute.
- ~~`.btn-action` modifier~~ — **not implemented**, do not reference it.

### 4.2 Inputs

| | Solid | Glass |
|---|---|---|
| Single line | `.input-base` | `.glass-input` |
| Multi line | `.textarea-base` | `textarea` with `.glass-input` class + `resize-none` |
| Label | `.field-label` (always visible, never placeholder-only) | same |
| Helper text | `text-[12px] text-ink-muted mt-1` | same |
| Error | `border-red-600` on input + `text-[12px] text-red-600 mt-1` below | same |
| Required indicator | `<span aria-hidden="true" className="text-red-500 ml-0.5">*</span>` next to label | same |
| Disabled | `opacity-50 cursor-not-allowed` + `disabled` attribute | same |

**Placeholder styling** — global rule in `@layer base`: `color: rgb(var(--ink) / 0.45)` + `font-style: italic`. Do NOT override with `placeholder:text-*` Tailwind utilities.

**Error accessibility** — error messages below fields must use `role="alert"` or be associated via `aria-describedby` so screen readers announce them:
```tsx
<p id="email-error" role="alert" className="text-[12px] text-red-600 mt-1">Required</p>
<input aria-describedby="email-error" … />
```

Always place errors **below the field**, never only at the top.

### 4.3 Cards

| Recipe | Class |
|---|---|
| Standard card | `.card-surface` |
| Large feature card | `.card-large` (rounded-[28px]) |
| Glass card | `.glass-card` |

### 4.4 Modal / dialog

Glass modal recipe — use `.glass-modal` for the panel. **Always separate the backdrop into its own `absolute` div** — merging it with the centering container kills the glass-modal's `backdrop-filter`.

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center px-4">
  {/* scrim — blur + dim on its own layer */}
  <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
  {/* panel — glass blur samples through the scrim layer */}
  <div className="relative glass-modal w-full max-w-[400px] p-6 animate-in fade-in zoom-in-95 duration-200">
    {/* × close button */}
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      className="absolute top-4 right-4 h-8 w-8 rounded-full grid place-items-center text-ink-muted hover:text-ink hover:bg-black/[0.06] transition-colors duration-150"
    >
      <X className="h-4 w-4" />
    </button>
    <h3 className="text-[17px] font-semibold text-ink mb-1 pr-8">Title</h3>
    <p className="text-[14px] text-ink-muted leading-relaxed mb-5">Body copy.</p>
    {/* Button row */}
    <div className="flex gap-3">
      <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">
        Cancel
      </button>
      <button type="button" onClick={onConfirm} className="btn-primary flex-1 justify-center">
        Confirm
      </button>
    </div>
  </div>
</div>
```

**Button row rules (MUST follow):**
- Always `flex gap-3` row — never stack buttons vertically in a modal.
- Secondary / cancel action **always on the LEFT** (`btn-ghost flex-1 justify-center`).
- Primary / confirm action **always on the RIGHT** (`btn-primary flex-1 justify-center`).
- Destructive confirm uses inline `bg-red-500 text-white … hover:bg-red-600` instead of `btn-primary`.
- Both buttons are `flex-1` so they share width equally.

**Close affordance rules:**
- Always an `absolute top-4 right-4` × icon button — never a third text button.
- Clicking the scrim also closes (wire `onClick` on the backdrop div).
- Escape key support is expected (add `useEffect` keydown listener or Radix Dialog).

**Z-index slots:**
| Layer | z-index | Use |
|---|---|---|
| Side panel scrim | z-40 | Panel backdrop |
| Side panel | z-50 | Detail panels, SaveModal |
| Delete confirm | z-[60] | Confirm on top of panel |
| Unsaved / system modal | z-[70] | Highest priority dialogs |

**Sizing:**
- Default max-width: `max-w-[400px]` for two-action modals.
- Destructive confirm: `max-w-[360px]` (smaller = feels more focused).
- Always `px-4` on the outer wrapper to keep edge margin on mobile.

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

### 4.7 Accordion (FAQ / collapsible)

Interactive text in accordions follows a two-rule state model:

| State | Desktop | Mobile |
|---|---|---|
| Closed, idle | `text-ink` | `text-ink` |
| Closed, hovered | `text-brand` (`lg:group-hover:text-brand`) | no hover — stays `text-ink` |
| Open / expanded | `text-brand` (persistent) | `text-brand` (persistent) |

**Why:** On desktop, hover previews the action. Once open, orange persists to signal the active state — removing it on mouse-leave would feel disconnected from the visible answer. On mobile there is no hover concept; state is strictly open/closed only.

Implementation pattern:
```tsx
<span className={cn(
  "transition-colors",
  open ? "text-brand" : "text-ink lg:group-hover:text-brand"
)}>
  {question}
</span>
```

### 4.8 Informational badge / tag

Used to label items with metadata (e.g. "Recommended", "Fast", "Beta"). These are **not interactive** — they must never look like buttons.

Recipe — frosted glass chip, ink text, no color tint:
```tsx
<span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/40 backdrop-blur-md border border-white/50 text-ink">
  {label}
</span>
```

Rules:
- **Never** use solid `bg-ink` or colored backgrounds — that reads as a button or status indicator.
- **Never** use brand/accent color on the text — orange is reserved for interactive and active states.
- Keep size at `text-[11px]` so it reads as subordinate metadata, not a headline.
- Use on glass surfaces only (over the mesh background). On solid pages use `bg-surface-2 border-line` instead.

### 4.10 Background mesh

Defined in `src/components/BackgroundGradientAnimation.tsx`. Default colour palette is brand-orange–tinted. Use only on:

- The Jobs tracker page (current trial)
- Future landing / marketing pages
- Onboarding hero (TBD)

**Never** on dense content pages (settings, profile, CV builder, cover letter). The animation taxes the GPU and the visual noise fights with form fields.

Mount it as `containerClassName="absolute inset-0 -z-10"` inside a `relative` page wrapper, with `interactive={false}` unless the page is short.

### 4.11 Toast / notification

Position: **bottom-center** on mobile, **bottom-right** on desktop. Never top-center (clashes with dynamic content entering from top).

```tsx
{/* Shadcn/Radix toast — already wired via useToast() */}
toast({ title: "Saved", description: "Your CV has been saved." });
toast({ title: "Error", description: "Could not save.", variant: "destructive" });
```

Rules:
- Auto-dismiss: **4 seconds** for success/info; **6 seconds** for errors (user needs time to read).
- Toast container must have `aria-live="polite"` for info and `aria-live="assertive"` for errors (Shadcn's `<Toaster>` handles this).
- Never show more than **2 toasts stacked**. If a third fires, replace the oldest.
- **Never** use a toast for actions that require user confirmation — use a modal.
- Variants: `default` (neutral) and `destructive` (red). No other variants — info/warning map to `default`.

### 4.12 Loading states

**Rule: spinner < 1 s wait; skeleton ≥ 1 s wait or known layout.**

| Scenario | Pattern |
|---|---|
| Button async action | Disable button, show `<Loader2 className="h-4 w-4 animate-spin" />` inline |
| Page section loading | `animate-pulse` skeleton matching the shape of the content |
| Full page loading | Centered `<Loader2 className="h-6 w-6 animate-spin text-ink-muted" />` |
| AI generation (long) | Typing indicator dots + streaming text — never a blocking spinner |

Skeleton recipe (solid pages):
```tsx
<div className="animate-pulse space-y-3">
  <div className="h-4 bg-surface-2 rounded-full w-3/4" />
  <div className="h-4 bg-surface-2 rounded-full w-1/2" />
</div>
```

### 4.13 Status badge

The coloured pill used in the Jobs tracker. Always pair colour with text (WCAG 1.4.1).

```tsx
// Use the <StatusBadge status={s} /> component — do not recreate inline.
// Colour map lives in STATUS_DOT_CLASS in src/lib/jobs-data.ts
```

Status colour reference:

| Status | Dot class | Badge background |
|---|---|---|
| Saved | `bg-status-saved` | `bg-transparent border border-line` |
| Applied | `bg-status-applied` | `bg-status-applied` |
| Assignment | `bg-amber-400` | `bg-amber-400` |
| Interviewing | `bg-amber-600` | `bg-amber-600` |
| Offer | `bg-status-offer` | `bg-status-offer` |
| Rejected | `bg-ink-muted` | `bg-ink-muted` |

Rules:
- Never use status colour alone — the text label inside the badge is mandatory.
- Status dot without text (e.g. table row) must have an `aria-label` on its container.

### 4.14 Segmented control

Used for mobile tab switching (Chat / Preview, Editor / Preview).

```tsx
// Use the <SegmentedControl options={…} value={…} onChange={…} /> component.
```

Rules:
- Max **3 segments** before it becomes too cramped on 375px screens.
- Active segment: filled `bg-white` pill. Inactive: transparent, `text-ink-muted`.
- The control itself sits in a `bg-white/30 backdrop-blur-md` strip below the mobile header.

### 4.15 Custom Select (Radix / glass)

The Radix `<Select>` on glass pages (e.g. status field in Job Detail).

```tsx
<SelectContent
  className="z-[55] overflow-hidden rounded-2xl border border-white/60 p-1 bg-white/60 backdrop-blur-xl shadow-lg"
  position="popper"
  sideOffset={6}
>
```

Rules:
- Always `position="popper"` — avoids layout-shift on open.
- Background: `bg-white/60 backdrop-blur-xl` on glass pages. On solid pages: `bg-surface border-line`.
- `z-[55]` — sits above panels (z-50) but below modals (z-[60]+).
- `sideOffset={6}` — 6px gap between trigger and dropdown.

### 4.16 Tooltip

For icon-only buttons where an `aria-label` alone doesn't surface in visible UI.

```tsx
// Use Radix <Tooltip> wrapping the trigger:
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild><button aria-label="Export">…</button></TooltipTrigger>
    <TooltipContent className="text-[12px] font-medium bg-ink text-white rounded-lg px-2.5 py-1.5 shadow-md">
      Export as PDF
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

Rules:
- Tooltip text must be keyboard-reachable (Radix handles this via focus trigger).
- Don't put actionable content (buttons, links) inside a tooltip — use a popover instead.
- z-index: `z-[80]` — always above everything else.

---

## 5 — Layout patterns

### 5.0 Breakpoints & responsive strategy

| Breakpoint | px | Tailwind prefix | Target |
|---|---|---|---|
| Mobile S | 375 | (default, no prefix) | iPhone SE, small Android |
| Mobile L | 430 | (default) | iPhone 15 Pro Max |
| Tablet | 768 | `md:` | iPad portrait |
| Desktop S | 1024 | `lg:` | **Primary desktop breakpoint** |
| Desktop L | 1440 | `xl:` | Large monitors |

**Mobile-first always.** Write base styles for mobile, add `lg:` for desktop. The `md:` tablet breakpoint is rarely used — most layouts go directly from mobile to desktop at `lg:`.

**Separate render trees over shared classes for complex layouts.** Use `lg:hidden` / `hidden lg:block` to fully swap the mobile and desktop JSX rather than modifying shared elements with many responsive variants. This prevents class-order bugs and keeps code readable.

**Height units:** Use `h-[calc(100dvh-64px)]` (not `100vh`) on mobile to account for browser chrome collapsing. `dvh` = dynamic viewport height.

### 5.1 Z-index master table

| Layer | z-index | Element |
|---|---|---|
| Base | `z-0` | Normal content flow |
| Floating | `z-10` | Floating zoom controls, tooltips in preview |
| Sticky nav | `z-40` | TopNav, panel scrim |
| Side panel / modal | `z-50` | Job detail panel, SaveModal |
| Delete confirm | `z-[60]` | Confirm on top of panel |
| Unsaved / system modal | `z-[70]` | Highest priority dialogs |
| Tooltip | `z-[80]` | Always above modals |
| Mesh background | `z-[-10]` | Behind all content |

### 5.2 App shell

- `TopNav` is `h-16 sticky top-0 z-40 bg-surface border-b border-line`. **For the glass trial it stays opaque** — only convert to `.glass-nav` once we standardise glass across all main pages.
- Main content: `min-h-[calc(100dvh-64px)]`.

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

2. **Visible focus ring** — never remove `focus-visible`. Use this token for every custom interactive element:
   ```css
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2
   ```
   The `ring-offset-2` ensures the ring is visible over both glass and solid surfaces.

3. **Touch target ≥ 44×44px** on mobile. If the visual element is smaller (e.g. an icon), pad with `p-2` or `h-9 w-9` minimum.

4. **Keyboard nav** — tab order matches visual order. Modals must trap focus (use Radix Dialog or manually manage with `focus-trap`). Escape must always close.

5. **Don't convey info by colour alone.** Status dots must have a text label. Error states must use an icon or text, not just a red border.

6. **`prefers-reduced-motion`** — background blobs already pause via CSS. For all other animations use:
   ```css
   @media (prefers-reduced-motion: reduce) {
     /* disable or reduce your animation */
     animation-duration: 0.01ms !important;
     transition-duration: 0.01ms !important;
   }
   ```
   In Tailwind: `motion-safe:animate-pulse` (only animates when motion is allowed).

7. **`aria-live` for dynamic content** — toasts, inline errors, and status changes must be announced:
   - Success/info toasts: `aria-live="polite"`
   - Error messages: `role="alert"` (implicitly `aria-live="assertive"`)
   - Loading states that complete: announce completion with a visually-hidden `aria-live` region.

8. **`field-label` at 11px** — this passes contrast only at the specific ink-on-surface ratio. Do not reduce further and do not use on coloured or glass backgrounds where contrast may drop below 4.5:1.

---

## 7b — Dark mode stance

**Tracka does not currently support dark mode.** The Berlin Glass aesthetic depends on the cream/white background and the animated orange mesh — both require a light context.

If dark mode is added in a future version:
- All glass tokens (`--glass-tint`, `--glass-border`) must be remapped for dark backgrounds.
- The brand orange (`#FF5A2F`) loses contrast on dark — a lighter tint (`#FF7A56`) would be needed.
- Never toggle dark mode by inverting colours — redesign the token set.
- Until the token set is defined, do **not** add `dark:` Tailwind variants to components.

---

## 7c — Print styles (Cover Letter)

The letter page is rendered on-screen but exported as PDF and intended for printing. Rules:

- The `.letter-page` canvas is `background: white` with no transparency — safe to print.
- `shadow-2xl` is a screen-only effect; PDF export strips it automatically.
- `font-sans` (Inter/Satoshi) embeds correctly in PDF via Puppeteer/wkhtmltopdf — do not substitute a web-only font.
- Body text at `14px / 1.7` maps to approximately **10.5pt** in print — the minimum acceptable for business correspondence.
- The brand spine in `modern` layout (`bg-brand w-3`) prints as orange if the user enables "Print backgrounds" — intentional.
- **Never** add `print:` Tailwind variants to the app shell (nav, sidebars). Only the letter canvas should be print-visible.

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
- [ ] Animate only `transform` / `opacity`. 180ms for hover, 240ms for modal enter, 150ms exit.
- [ ] Show one primary CTA per screen — everything else is ghost or tertiary.
- [ ] Empty states use the `eyebrow-mono + display-1` recipe.
- [ ] Errors live **below** the field, not in a summary at top (unless multiple errors in a long form).
- [ ] Error messages use `role="alert"` or `aria-describedby` — not just a red border.
- [ ] Modal button row: secondary LEFT (`btn-ghost`), primary RIGHT (`btn-primary`), both `flex-1`.
- [ ] Modal scrim: `bg-ink/40` on its own `absolute` div — never merged with the centering container.
- [ ] Use `focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2` on all interactive elements.
- [ ] Disabled buttons/inputs use `disabled` attribute + `opacity-50 cursor-not-allowed`.
- [ ] Use `h-[calc(100dvh-…)]` not `100vh` for full-screen mobile layouts.
- [ ] Z-index must follow the master table in §5.1 — don't invent new values.

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
- [ ] Don't add `dark:` Tailwind variants — dark mode is not currently supported (§7b).
- [ ] Don't merge the modal scrim and centering container — always separate layers (§4.4).
- [ ] Don't stack modal buttons vertically — always a horizontal `flex gap-3` row (§4.4).
- [ ] Don't reference `.btn-action` — it is not defined.

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
