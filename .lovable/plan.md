## Update default cover letter template (`src/pages/CoverLetterPage.tsx`)

Replace the current `DEFAULT_LETTER` constant with a structured dummy template that renders when the user lands on the Letters page (no target job selected).

**Layout in the A4 preview:**
- Top row: two columns
  - Left: company placeholders (`[Company Name]`, `[Company Street]`, `[Company City, Postal Code]`)
  - Right: applicant placeholders (`[Your Name]`, `[Your Street]`, `[Your City, Postal Code]`, `[Your Email]`, `[Your Phone Number]`)
- Below: `Date: [Date Placeholder]`
- Then: `Subject: [Subject Placeholder]`
- Then: `Dear [Hiring Manager's Name],`
- Body: two Lorem ipsum paragraphs (as provided)
- Sign-off: `Sincerely,` + `[Your Name]`

**Implementation approach:**
- The preview currently renders `letter` (string) inside a `<pre>`. To support the two-column header (company left / applicant right), switch the preview article from a single `<pre>` to a structured JSX block when the letter is the default template, OR always render structured JSX with editable placeholders.
- Simplest non-invasive approach: keep `letter` as a string for the chat/AI flow, but render the default landing state as structured JSX (two-column header grid + body) inside the preview article. When a real letter is generated (via tailor/chat), fall back to the existing `<pre>` rendering.
- Detect "default state" by tracking whether the letter has been customized (e.g., compare against `DEFAULT_LETTER` or add an `isDefault` flag set to false when chat/tailor updates the letter).

**Out of scope:**
- No changes to chat, save/load, export, or job-tailoring logic.
- Placeholders are visual only — not interactive form fields.
