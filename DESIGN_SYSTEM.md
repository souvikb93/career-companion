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
| Nav surface | `bg-nav-surface` | light: `hsl(0 0% 99%)` / dark: `hsl(0 0% 8%)` | TopNav only — whiter in light, darker in dark for layer separation |
| Surface 1 | `bg-surface` | `#F4F3F0` | Cards on solid pages |
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
| `--glass-border` | `255 255 255` | Hairline on glass — use via `.glass-rule` (0.08 alpha) not raw |
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
| `.heading-1` | 28→32px | **Primary page header — ALL pages** |
| `.display-2` | 40→48px | Section heroes, landing hero (NOT page headers) |
| `.display-1` | 56→72px | Empty-state headlines |

> **Minimum body size on mobile is 16px** — avoids iOS auto-zoom. (UX rule `readable-font-size`.)

### 2.3 Spacing & radius

- 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 — stick to Tailwind's 4pt scale.
- **Page header**: Every primary page header MUST use `<h1 className="heading-1 mb-6">`. Applies to all pages: Tracker, Resume Builder, Letter Builder, Profile, Settings, AI Model, FAQ. MUST NOT use `display-2` for page-level h1 — that scale is reserved for section heroes only.
- **Radius**:
  - Primary/ghost CTA buttons: `rounded-full` only — these are pills.
  - Icon buttons (square): `rounded-xl`.
  - **All form field controls** (`input-base`, `textarea-base`, `field-trigger`, `glass-input`): `rounded-xl` (12px) — the login page is the canonical reference.
  - **Filter chips, selectable tiles, cards**: `rounded-2xl` (16px).
  - Short single-row size/density tiles (h-10): `rounded-xl`.
  - Modals / sheets: `rounded-3xl` (24px).
  - `rounded-full` is NOT for chips or tiles — it is reserved for CTA pills only.
  - MUST NOT override input radius with `rounded-2xl` — `rounded-xl` is the single standard for all form controls.
- **Borders**: 1px hairline only. `border-line` on solid surfaces, `border-white/50` on glass.
- **Dividers on glass surfaces**: Always use `.glass-rule` — never `border-line`. It resolves to `rgb(0 0 0 / 0.07)` in light and `rgb(255 255 255 / 0.08)` in dark, matching the glass component family (`glass-card`, `glass-nav`, etc.). Applies to all structural dividers: vertical split (`border-r glass-rule`), horizontal header/content (`border-b glass-rule`), and panel edges. MUST NOT use `border-line` on glass pages — it renders too heavy in both modes.

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

**Named animation utilities** (defined in `src/index.css`):

| Class | Duration | Use |
|---|---|---|
| `.animate-panel-in` | 320ms | Modal backdrop fade-in |
| `.animate-slide-in-right` | 560ms spring | Side panel slide-in |
| `.animate-library-item-in` | 460ms spring | Saved-item list entrance |
| `.animate-tip-icon-shine` | 650ms ease-out | One-shot warm glow on contextual tip icons (first appearance only) |

`.animate-tip-icon-shine` — applies a `brightness` + `drop-shadow` pulse using `animation-fill-mode: forwards`, single iteration. Only attach this class when the icon is appearing for the very first time (e.g. `count === 0` from localStorage). For subsequent appearances of the same tip, render the icon without the class. Covered by the `prefers-reduced-motion` block.

**Canonical scrim:** always `.modal-backdrop` — never `bg-ink/*` or raw `bg-black/*`. See §2.3 Backdrop/scrim for the full spec including dark mode values.

---

## 3 — Surface system

Three levels of surface, picked by the background underneath:

| Level | Class | When |
|---|---|---|
| Solid | `.card-surface` / `.card-large` | Settings, Profile, FAQ, CV builder, Cover Letter — pages with a solid `bg-background` |
| Glass L1.5 (nav) | `.glass-nav` | Sticky top nav bar — translucent frosted, whiter light / darker dark |
| Glass L2 (content) | `.glass-card` | Cards on pages with the gradient mesh — Jobs tracker, landing |
| Glass L3 (overlay) | `.glass-modal` | Modals, sheets, popovers when they appear over a mesh page |

Inputs follow the same split:
- Solid pages → `.input-base`
- Glass pages → `.glass-input`

Chips/filter pills / selectable tiles:
- All contexts → `.tile-surface` base + `border-brand text-brand` active state (see §4.5 and §4.9)
- `.glass-chip` / `.glass-chip-active` are retired for interactive selection — use `.tile-surface` instead

**Don't mix.** A page is either glass or solid — never half.

### Backdrop / scrim

Every modal, panel, drawer, and sheet MUST use `.modal-backdrop` for the dimming layer behind it — never `bg-ink/40`, `bg-ink/30`, `bg-black/80`, or any ad-hoc opacity. MUST NOT use `bg-ink/*` for scrims — `--ink` is near-white in dark mode and produces a bright overlay.

**Light mode:** `rgb(0 0 0 / 0.30)` + `blur(4px)` — pure black at 30%.  
**Dark mode:** `rgb(38 35 32 / 0.45)` + `blur(8px) saturate(130%) brightness(1.08)` — warm charcoal tint at 45%. Lets the background show through so the modal card pops clearly without a heavy black void. Do not override per-modal — this is the standard for all popups.

---

## 4 — Components (recipes)

All recipes live as classes in `index.css`. The Tailwind combinations below are documentation, not what you should be writing.

### 4.1 Buttons

| Recipe | Class | Size | Use |
|---|---|---|---|
| Primary CTA | `.btn-primary` | h-11 | One per screen — ink bg → brand on hover |
| Ghost | `.btn-ghost` | h-11 | Secondary actions — solid white bg + border, hover fills `surface-2` |
| Ghost compact | `.btn-ghost-sm` | h-9 | Settings rows, inline actions — same visual as ghost, smaller |
| Tertiary | `.btn-tertiary` | auto | Text-only, hover underlines |
| Icon primary | `.btn-icon-primary` | caller sets | Round/square send/FAB — ink → brand on hover |
| Icon secondary | `.btn-icon-sm` | h-7 w-7 typical | Muted ghost icon button — toolbar actions, zoom, section controls |
| Icon (40–48px square) | `rounded-xl bg-ink text-white hover:bg-brand` | h-10/h-12 | Square icon-only, never pill |

**Ghost button visual spec** — matches `split-panel-btn` (Google sign-in button) exactly:
- Light: `background: white` (solid, **no** frosted glass / backdrop-blur), `border: 1px solid var(--line)`, hover → `surface-2`
- Dark: `background: surface`, `border: line`, hover → `surface-hover`
- MUST NOT add `backdrop-blur` or `bg-white/50` — ghost buttons are always opaque

**Destructive button 3-tier schema** — mirrors neutral hierarchy with red semantics:

| Tier | Class | Mirrors | When to use |
|---|---|---|---|
| Tertiary | `.btn-danger-tertiary` | `.btn-tertiary` | Inline/list-item trigger with low visual weight (e.g. "Delete job" at bottom of sidebar) |
| Secondary | `.btn-danger` / `.btn-danger-sm` | `.btn-ghost` / `.btn-ghost-sm` | Settings Danger Zone row actions — white bg, red border, red text |
| Primary | `.btn-danger-primary` | `.btn-primary` | Final confirm inside a destructive modal **only** — solid red bg, white text |

- Light secondary: solid `bg-white`, `border-red-400`, `text-red-500`, hover `bg-red-50`
- Dark secondary: `background: surface`, `border: red-400/45`, `color: red-300`, hover tint `red/12`
- Light primary: `bg-red-500`, `text-white`, hover `brightness-110`
- Dark primary: `bg-red-700` (`#dc2626`), `text-white`, hover `brightness-112`
- Tertiary dark: `text-red-400`, hover `text-red-300` — no fill
- MUST NOT use inline `bg-red-500 text-white hover:bg-red-600` — always use `.btn-danger-primary`
- MUST NOT use `.btn-danger-primary` outside a confirmation dialog — it is point-of-no-return only

**Destructive selection row** (clear-data confirmation dialogs):

| Class | Role |
|---|---|
| `.danger-select-row` | Clickable option-row container — sets border, bg, hover tint |
| `.danger-select-row.is-checked` | Selected state — stronger red border + tint |
| `.danger-checkbox` | Square indicator inside the row — apply `rounded` or `rounded-md` as needed |
| `.danger-checkbox.is-checked` | Solid red bg + border |

- Add `is-checked` via `cn("danger-select-row", checked && "is-checked")`.
- Light: `border-line` base, hover/checked → `red-400/70` border + `red-500/4–6%` bg.
- Dark: same token, `red-500/40–50%` border + `red-500/8–10%` bg.
- MUST NOT use inline `border-red-300 bg-red-50/60` — always use `.danger-select-row.is-checked`

**Icon secondary button** (`.btn-icon-sm`):
- `grid place-items-center text-ink-muted rounded-xl transition-colors` base
- Light hover: `rgb(0 0 0 / 0.06)` background
- Dark hover: `rgb(255 255 255 / 0.10)` background
- Caller sets `h-*` and `w-*` (typically `h-7 w-7`); override `rounded-*` only if context demands (e.g. `rounded-full` for close X)
- MUST NOT use inline `hover:bg-black/[0.06]` without the paired `dark:hover:bg-white/10` — use `.btn-icon-sm`

**Google sign-in SVG exception** — the Google G logo SVG inside `AuthPage.tsx` uses hardcoded `#4285F4 #34A853 #FBBC05 #EA4335` hex values. These are Google brand colors and exempt from the "no raw hex" rule. Do not replace them with tokens.

Rules:
- Exactly **one primary CTA per screen**. Everything else is ghost / tertiary.
- Loading state → disable button, swap content for `<Loader2 className="animate-spin" />`.
- Min touch target 44×44 (mobile) / 48×48 (Android). Already baked into the height utilities below.
- **Disabled state** → add `disabled` attribute; style with `opacity-50 cursor-not-allowed pointer-events-none`. Never fake-disable without the semantic attribute.
- ~~`.btn-action` modifier~~ — **not implemented**, do not reference it.

### 4.2 Inputs

**Field control schema** — every form control (text input, textarea, select trigger, date trigger) shares one visual spec:

| Token | Light | Dark |
|---|---|---|
| Background | `transparent` | `hsl(var(--surface-2))` |
| Background hover | `hsl(var(--surface-hover))` | `hsl(var(--surface-hover))` |
| Border | `hsl(var(--line))` | `hsl(var(--line))` |
| Border focus | `hsl(var(--brand))` | `hsl(var(--brand))` |
| Text | `hsl(var(--ink))` | `hsl(var(--ink))` |
| Height | `h-11` (44px) | same |
| Radius | `rounded-xl` | same |
| Padding | `px-4` | same |
| Font size | `text-[14px]` | same |

**Classes:**

| Element | Class | Notes |
|---|---|---|
| `<input>` text | `.input-base` | Native input element |
| `<textarea>` | `.textarea-base` | Adds `py-3 resize-y` |
| `<button>` trigger (Select, DatePicker) | `.field-trigger` | Adds `flex items-center justify-between` |
| Phone number | `<PhoneInput>` (`phone-input.tsx`) | Uses `.phone-input-wrapper` token — flag+dial combo |
| OTP code entry | `<InputOTP>` + `<InputOTPGroup>` + `<InputOTPSlot>` (`input-otp.tsx`) | 6 separated boxes, brand border when filled |
| Glass page variant | `.glass-input` | For pages with the gradient mesh |

**`PhoneInput` schema:**
- Container: `.phone-input-wrapper` — same visual as `.input-base` but `focus-within:border-brand` (nested input triggers border)
- Left: country trigger — flag SVG + chevron, `border-r border-line/60` divider, `hover:bg-black/[0.04] dark:hover:bg-white/[0.06]`
- Right: number input — `flex-1 px-3 bg-transparent text-[14px] text-ink`
- Country popover: `glass-popover rounded-2xl z-[70]` (must be above modal z-index 50)
- Validation: use `isValidPhoneNumber()` from `react-phone-number-input` — not manual digit counting
- Default country via `defaultCountry` prop (e.g. `"DE"`)
- MUST NOT use `<input type="tel">` directly — always use `<PhoneInput>` for phone number fields

**`InputOTP` / `InputOTPSlot` schema:**
- Each slot: `h-12 w-10 rounded-xl border-2` — individual separated boxes (not connected)
- Empty: `border-line`; active (focused): `border-brand/60 bg-surface-hover`; filled: `border-brand`
- Caret: `bg-brand` blinking line, 20px tall
- Container gap: `gap-2.5` (10px between boxes)
- Usage: wrap `InputOTPGroup` + 6× `InputOTPSlot` inside `InputOTP maxLength={6}`
- MUST NOT build custom OTP inputs from individual `<input>` elements — use `InputOTP` library

- MUST NOT mix `.input-base` and `.field-trigger` on the same element type
- MUST NOT use shadcn default `bg-background border-input` on `SelectTrigger` — use `.field-trigger`
- MUST NOT set `h-10` on select triggers — all controls are `h-11` for touch-target compliance

| | Solid | Glass |
|---|---|---|
| Single line | `.input-base` | `.glass-input` |
| Multi line | `.textarea-base` | `textarea` with `.glass-input` class + `resize-none` |
| Button trigger | `.field-trigger` | Select, DatePicker |
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
    <h3 className="modal-heading pr-8">Title</h3>
    <p className="modal-body">Body copy.</p>
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

**Modal typography classes:**
- `.modal-heading` — `22px font-semibold text-ink mb-1`. Add `pr-8` when a close button occupies top-right.
- `.modal-body` — `14px text-ink-muted leading-relaxed mb-5`. Use `!mb-0` or `mb-N` override when spacing differs.
- MUST NOT use raw `text-[22px] font-semibold`, `text-[17px]`, or `text-[18px]` inline inside modals — always use `.modal-heading`.
- MUST NOT use raw `text-[13px]` or `text-[14px] text-ink-muted` inline inside modals — always use `.modal-body`.

**Button row rules (MUST follow):**
- Always `flex gap-3` row — never stack buttons vertically in a modal.
- Secondary / cancel action **always on the LEFT** (`btn-ghost flex-1 justify-center`).
- Primary / confirm action **always on the RIGHT** (`btn-primary flex-1 justify-center`).
- Destructive confirm uses `.btn-danger-primary flex-1 justify-center` — never inline red styles.
- Both buttons are `flex-1` so they share width equally.

**Close affordance rules:**
- Always an `absolute top-4 right-4` × icon button — never a third text button.
- Clicking the scrim also closes (wire `onClick` on the backdrop div).
- Escape key support is expected (add `useEffect` keydown listener or Radix Dialog).

**Progressive-disclosure tip pattern (DownloadModal):**

Some modals contain a contextual tip that is only useful the first few times. Rules:

- Use `localStorage` (not `sessionStorage`) to persist a display counter across sessions.
- Show the tip for the **first 2 opens only**; hide permanently from the 3rd open onwards.
- Key naming convention: `tracka_<feature>_tip_opens` (e.g. `tracka_download_tip_opens`).
- Read the counter **inside the `useEffect` that fires on `open`** — not in a `useState` initializer — so it reflects the latest value if the modal is toggled multiple times.
- On first open (`count === 0`): render tip + apply `.animate-tip-icon-shine` to the icon.
- On second open (`count === 1`): render tip, no shine animation.
- On third+ open (`count >= 2`): omit the tip block entirely from the DOM.
- Icon: `<Lightbulb>` from Lucide. Colour: `text-ink dark:text-yellow-400`.
- Tip box surface: `bg-surface-2/50 border border-line/50 rounded-xl px-3.5 py-3`.
- Never use `Sparkles` or AI-suggestive icons for factual tips — reserve `Sparkles` for AI-generated content only.

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

Filter chips (pipeline view buttons, category tabs, tag filters) use the **tile-surface + border-brand** pattern. `.glass-chip` / `.glass-chip-active` are retired.

```tsx
<button
  type="button"
  onClick={() => setView(v.id)}
  className={cn(
    "h-10 px-4 rounded-2xl border text-[13px] font-medium inline-flex items-center gap-2 transition-all duration-180 tile-surface shrink-0",
    active
      ? "border-brand text-brand"
      : "border-transparent text-ink hover:border-brand/25",
  )}
>
  <span>{label}</span>
  <span className={cn("text-[12px]", active ? "text-brand" : "text-ink-muted")}>{count}</span>
</button>
```

Rules:
- `rounded-2xl` always — chips are **not** pills (`rounded-full` is reserved for primary/ghost CTAs).
- Active: `border-brand text-brand` — orange stroke + orange text, no filled background.
- Inactive: `border-transparent` so the tile-surface fill reads as the selected affordance on activation.
- Count badge inherits the active colour (`text-brand`) or mutes (`text-ink-muted`) — always rendered as a second `<span>` inline.
- Works on both glass pages (mesh background) and solid pages — `tile-surface` adapts via `--glass-tint`.

### 4.8 Suggestion chip (quick-reply)

Used in chat UIs for predefined prompt options (tone selector, emphasis chips, etc.). Always `rounded-full` pills — these are **not** filter chips and do not use `tile-surface`.

```tsx
<button type="button" onClick={() => send(chip)} className="chip-suggestion">
  {chip}
</button>
```

Token spec:
- Light: `bg-surface-2` (`#EFEFED`), `border-line`, `text-ink`, hover → `bg-surface-hover`
- Dark: same surface tokens + border overridden to `hsl(0 0% 40%)` for legibility against dark bg
- MUST NOT use `bg-white/60` — opacity-on-white is not dark-mode-aware and renders as flat gray `#999` in dark mode
- `rounded-full` pill shape — these are conversational chips, not filter/selection chips
- Height `h-8` (32px) — compact, inline with chat bubbles

### 4.9 Selectable tile (2-D card variant)

Used for Design panel options: Theme, Size, Density, Page Mode. Same interaction contract as filter chips but with a two-dimensional, card-shaped layout.

**Theme tile (tall, 2-column grid):**
```tsx
<button
  type="button"
  onClick={() => set("theme", th.id)}
  className={cn(
    "p-3 rounded-2xl border text-left transition-all duration-180 tile-surface",
    active
      ? "border-brand text-brand"
      : "border-transparent text-ink hover:border-brand/25"
  )}
>
  <div className="text-[18px] leading-tight mb-1.5" style={{ fontFamily: th.fontPreview, color: "inherit" }}>
    Aa
  </div>
  <p className="text-[12px] font-semibold">{name}</p>
  <p className={cn("text-[12px]", active ? "text-brand" : "text-ink-muted")}>{desc}</p>
</button>
```

**Size / Density tile (short, flex row):**
```tsx
<button
  type="button"
  onClick={() => set("size", s.id)}
  className={cn(
    "flex-1 h-10 rounded-xl border text-[13px] font-medium transition-all duration-180 tile-surface",
    active
      ? "border-brand text-brand"
      : "border-transparent text-ink-muted hover:border-brand/25 hover:text-ink"
  )}
>
  {label}
</button>
```

**Page Mode tile (visual contrast preview):**
```tsx
<button
  type="button"
  onClick={() => set("page", pg.id)}
  className={cn(
    "flex flex-col items-center justify-center h-[76px] rounded-2xl border-2 transition-all duration-180",
    isLight ? "bg-white" : "bg-[#1c1a18]",
    active
      ? "border-brand"
      : isLight ? "border-black/[0.08] hover:border-black/20" : "border-white/[0.08] hover:border-white/20"
  )}
>
  <span className="text-[22px] font-semibold leading-none tracking-tight" style={{ color: isLight ? "#1a1818" : "#f0ebe4" }}>
    Tt
  </span>
</button>
```

Rules (all selectable tile variants):
- Base fill: `.tile-surface` — `rgb(var(--glass-tint) / 0.78)`, same formula as `.glass-modal`. Adapts automatically to dark mode.
- Active stroke: `border-brand` (orange) — **no filled background change**. Orange border + orange text is the complete selected signal.
- Inactive: `border-transparent` so the tile fill reads as a coherent surface, not a button.
- `rounded-2xl` for tall/wide tiles; `rounded-xl` only for the short single-row (h-10) size/density buttons.
- Page Mode tile is the exception: uses literal `bg-white` / `bg-[#1c1a18]` to demonstrate actual document page colour — `tile-surface` would incorrectly tint it.
- All body text inside a tile (desc, label) inherits `text-brand` when active — never leave subordinate text in `text-ink-muted` while the parent is active.

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

**Placeholder / empty-state action guard toasts:**

When a user triggers an action (e.g. download) on a document that is still in placeholder state, block the action silently then fire a `default` toast. Copy rules:
- Title: name the state clearly (`"Placeholder letter"`).
- Description: explain what to do, not what went wrong. Use "personalize" or "customize" — never "write" (too prescriptive). E.g. `"This is currently a placeholder letter. Please personalize it before downloading."`
- Never use `destructive` variant — the user hasn't made an error, the content just isn't ready.

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

MUST use Radix `<Select>` for ALL dropdowns — never a native `<select>`. Native select detaches on mobile, can't be styled for dark mode, and triggers unexpected browser focus rings.

**Full recipe** (status field, theme picker, any dropdown):

```tsx
<Select value={value} onValueChange={onChange}>
  <SelectTrigger className={cn(
    "w-full h-10 rounded-xl border border-line px-3 text-[14px] text-ink",
    "bg-transparent outline-none cursor-pointer",
    "transition-[border-color,background-color] duration-200 ease-out",
    "hover:bg-surface-hover focus:border-brand focus:ring-0 focus:ring-offset-0",
  )}>
    <SelectValue />
  </SelectTrigger>
  <SelectContent
    className="z-[55] overflow-hidden rounded-2xl border border-white/60 p-1 glass-popover shadow-lg"
    position="popper"
    sideOffset={6}
  >
    <SelectItem
      value={val}
      className="rounded-xl text-[14px] text-ink cursor-pointer py-2.5 pl-9 pr-3 focus:bg-black/[0.05] focus:text-ink data-[state=checked]:font-medium"
    >
      {label}
    </SelectItem>
  </SelectContent>
</Select>
```

Rules:
- **MUST NOT** use native `<select>` — detaches on mobile, white bg breaks dark mode, adds red browser ring.
- Trigger: `bg-transparent` always — never `bg-white` or `bg-surface`.
- Trigger: `focus:ring-0 focus:ring-offset-0` always — kills the `--ring` glow (`--ring` is brand orange, looks red-ish on dark).
- Content: `glass-popover` class handles light/dark background — never hardcode `bg-white`.
- Always `position="popper" sideOffset={6}` — anchors directly below trigger, no detach.
- `z-[55]` — above panels (z-50), below modals (z-[60]+).
- Desktop segmented control is fine for ≤3 options when space allows — use `sm:hidden` on Select + `hidden sm:flex` on segments for responsive split.

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

- `TopNav` is `h-16 sticky top-0 z-40 glass-nav`. The `.glass-nav` token gives a translucent frosted surface (whiter in light, darker in dark) with `backdrop-blur` and a hairline bottom border. **MUST NOT** use opaque `bg-nav-surface` or `bg-surface` — that kills the glass effect.
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

**Contextual / semantic icon colours:**

| Icon | Lucide name | Light | Dark | Use |
|---|---|---|---|---|
| AI / generated content | `Sparkles` | `text-brand` | `text-brand` | AI-generated output, AI actions only |
| Tip / hint | `Lightbulb` | `text-ink` | `text-yellow-400` | Factual contextual tips (non-AI) |

- MUST NOT use `Sparkles` for non-AI tips or hints — it implies AI involvement.
- MUST NOT use `Lightbulb` in brand-orange — it will be mistaken for a CTA.
- The warm yellow (`text-yellow-400`) on `Lightbulb` is **dark mode only**. In light mode it must be `text-ink` for contrast compliance.

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

## 7b — Dark mode

Tracka supports dark mode via `html.dark` class toggle. All tokens remap in the `html.dark {}` block in `src/index.css`.

### Neutral dark palette — MUST rules

1. **Never use blue-hued surfaces.** All dark surfaces MUST be neutral gray (HSL hue `0`, saturation `0%`). No hue 220/navy/slate.
2. **Glass tint is neutral.** `--glass-tint` MUST be achromatic RGB (e.g. `24 24 24`), never blue-shifted.
3. **Mesh background is neutral.** `--mesh-bg-start` / `--mesh-bg-end` MUST be pure dark grays (`#0a0a0a` / `#111111`).
4. **Brand orange stays the same.** `#FF5A2F` — no tint change needed, contrast is sufficient on neutral dark.

### Dark token reference

| Token | Value | Note |
|---|---|---|
| `--background` | `0 0% 7%` | Page base |
| `--surface` | `0 0% 10%` | Cards, nav |
| `--surface-2` | `0 0% 13%` | Input bg, secondary |
| `--surface-hover` | `0 0% 16%` | Hover state |
| `--line` | `0 0% 20%` | Hairlines |
| `--glass-tint` | `24 24 24` | Glass surface fill |
| `--panel-bg` | `18 18 18` | Split-panel bg |
| `--mesh-bg-start` | `#0a0a0a` | Gradient mesh start |
| `--mesh-bg-end` | `#111111` | Gradient mesh end |

### Input states (dark)

All `input-base` / `textarea-base` / `chat-input` in dark mode:
- Default: `bg: surface-2`, `border: line`
- Hover: `bg: surface-hover`
- Focus: `border: brand` (orange), `bg: surface-2`

These are defined in `src/index.css` dark overrides. Do not add inline dark Tailwind — use the token classes.

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
- [ ] Modal scrim: `.modal-backdrop` on its own `absolute inset-0` div — never `bg-ink/40` or any ad-hoc opacity, never merged with the centering container.
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
- [ ] Don't `rounded-full` something that should be a tile or chip — `rounded-full` is reserved for primary/ghost CTA pills only. Form field controls use `rounded-xl`; filter chips, selectable tiles, and cards use `rounded-2xl`.
- [ ] Don't use blue-hued dark surfaces — dark palette MUST be neutral gray (§7b).
- [ ] Don't add inline `dark:` Tailwind for input states — use `input-base` / `textarea-base` tokens (§7b).
- [ ] Don't merge the modal scrim and centering container — always separate layers (§4.4).
- [ ] Don't stack modal buttons vertically — always a horizontal `flex gap-3` row (§4.4).
- [ ] Don't reference `.btn-action` — it is not defined.
- [ ] Don't add `backdrop-blur` or `bg-white/50` to ghost buttons — `.btn-ghost` / `.btn-ghost-sm` are solid opaque (same as the Google sign-in button). Frosted glass is for nav, modals, and cards only.

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
| `src/components/ui/checkbox.tsx` | Checkbox — design system tokens (`border-line`, `bg-ink`, `rounded-[4px]`) |
| `src/components/ui/input-otp.tsx` | OTP input — 6 separated boxes, brand border states |
| `src/components/ui/phone-input.tsx` | Phone input — flag+dial country picker, `.phone-input-wrapper` token |
| `src/components/ui/select.tsx` | Select — `.field-trigger` on trigger, `rounded-xl` content |
| `DESIGN_SYSTEM.md` | This doc (single source of truth) |
| `CLAUDE.md` | Pointer so AI sessions load this doc automatically |
