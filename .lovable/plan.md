## Why the landing page still shows old jobs

The `/` route renders `JobsPage`, which reads from `JobsProvider`. The provider hydrates from `localStorage["jobs_v4"]` first and only falls back to the new `SAMPLE_JOBS` (12 companies) if that key is empty. Your browser already has saved data under that key, so the new dataset never loads.

## Fix: one-time forced reseed

Bump the storage key from `jobs_v4` → `jobs_v5` in `src/lib/jobs-store.tsx`. On next page load, the provider finds nothing under `jobs_v5`, falls back to `SAMPLE_JOBS`, and the landing-page table will show:

Google · Zalando · Spotify · Amazon · N26 · Delivery Hero · SAP · Meta · Adidas · Booking.com · Miro · Siemens

That's a single one-line change. No other files need to be touched — the landing page already shares the same store as the Tracker page.

## Heads-up

Any jobs you added manually in the browser will be cleared by the key bump (this is the same trade-off as the previous bump).
