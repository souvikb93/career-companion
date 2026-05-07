## Problem
TopNav uses `px-6` (24px), but page content uses `p-8` (32px). The orange logo is 8px left of the content column below it on every page.

## Fix
In `src/components/TopNav.tsx`, change the header padding from `px-6` to `px-8` so the logo's left edge lines up with the content below (table, jobs chips, CV builder columns, cover-letter columns).

This is a single one-line change affecting all three pages since they share TopNav.