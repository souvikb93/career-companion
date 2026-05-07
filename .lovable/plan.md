## Issue

In the Letter preview, the left column ([Company Name] block) appears to bleed toward/past the page edge while the right column has proper margin — the two header columns don't share the same horizontal padding as the body text.

Likely causes to investigate and fix in `src/pages/CoverLetterPage.tsx`:

1. **Two-column header `grid grid-cols-2`** stretches edge-to-edge inside the article padding, so the left column starts at the page's left padding and the right column ends at the right padding — visually that's correct, but with `gap-8` and unequal text lengths the left side looks flush left while the right looks balanced. Fix by giving each column equal max-width and consistent alignment, or by tightening the grid so it sits within the same content rhythm as the body paragraphs.

2. **Page centering in the preview pane**: the scaled `<article>` (transform: scale + origin-top-left) sits inside a wrapper sized to `794 * zoom`. Verify `mx-auto` actually centers it; if not, ensure the wrapper width matches the rendered scaled width and the parent section uses `flex justify-center` so the page is horizontally centered regardless of zoom.

3. **Padding symmetry**: confirm the `padding` shorthand (64px classic / 40px compact) applies equally on both sides, and that `paddingLeft` isn't being unintentionally overridden by the modern-layout rule.

## Plan

- Take a fresh screenshot of `/cover-letter` at the user's viewport to confirm the exact misalignment.
- In `CoverLetterPage.tsx` preview block:
  - Wrap the scaled page in a `flex justify-center` container so the A4 sheet is always centered in the preview pane.
  - Keep the article padding symmetric (`padding: 64px` for classic/modern body, `40px` for compact); apply the modern accent bar via inner offset, not by changing `paddingLeft`, so left/right padding stay equal.
  - For the placeholder header, replace the `grid grid-cols-2 gap-8` with a `flex justify-between` so the left block hugs the left content edge and the right block hugs the right content edge — same rhythm as the body paragraphs below.
- Re-screenshot and visually verify both columns align with the body text's left/right edges.

## Out of scope
- No changes to letter content, chat, save/export, or layout selector behavior.
