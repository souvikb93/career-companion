# Tracka — Project Documentation

## 1. Project Overview

**Tracka** is a modern job-hunting companion application designed for design-aware professionals in Europe. It helps users track job applications throughout the entire pipeline (saved → applied → active → assessment → offer) with AI-powered job parsing, CV builder integration, and cover letter generation.

### Key Vision
- **Editorial design** inspired by Berlin design network
- **Frosted glass surfaces** with animated brand-orange mesh background
- **Single accent color** (orange #FF5A2F) for all CTAs and active states
- **Intelligent job tracking** with Supabase persistence and AI analysis
- **Built-in document generators** for CVs and cover letters

---

## 2. Technology Stack

### Frontend
- **React 18.3** — Component framework with hooks
- **TypeScript 5.8** — Static typing
- **Vite 5.4** — Build tool and dev server (port 8080)
- **Tailwind CSS 3.4** — Utility-first styling with custom Berlin Glass design system
- **React Router 6.30** — SPA routing with protected routes

### UI & Components
- **Radix UI** — Headless component primitives (26+ components)
- **shadcn/ui** — Pre-built component library built on Radix
- **Lucide React** — Icon library (all UI icons)
- **Sonner** — Toast notifications
- **React Hook Form** — Form state management
- **Recharts** — Data visualization (unused currently)

### Backend & Data
- **Supabase** — PostgreSQL database + Auth (JWT-based) + Edge Functions
  - `profiles` table: user metadata, onboarding state, AI model preference
  - `jobs` column: JSONB array stored on profiles (not a separate table)
- **Groq** — LLM for job parsing and CV/letter generation

### Build & Development
- **TypeScript** — Strict mode enabled
- **ESLint** — Code quality
- **Vitest** — Unit testing framework
- **PostCSS** — CSS processing
- **SWC** — Fast TypeScript/React compilation

### Deployment
- **Vercel** — Planned deployment target (SPA rewrites configured in `vercel.json`)
- **Environment variables**: Supabase URL/Key, Groq API key (managed via `.env.local`)

---

## 3. Codebase Structure

### `/src` — Main Application

#### **Core Files**
| File | Purpose |
|------|---------|
| `main.tsx` | Entry point, mounts React app to DOM |
| `App.tsx` | Root router with ErrorBoundary, provider stack (Auth → Language → Profile → Jobs) |
| `index.css` | Design system tokens (colors, typography, motion, animations) + Tailwind directives |

#### **`/components` — Reusable UI Components**
| File | Purpose |
|------|---------|
| `TopNav.tsx` | Sticky navigation bar with language/theme toggle, auth menu |
| `AppLayout.tsx` | Layout wrapper for protected pages (nav + sidebar + content) |
| `AccountLayout.tsx` | Sidebar layout for account section (/profile, /ai-model, /settings, /faq) |
| `ProtectedRoute.tsx` | Route guard: blocks unauthenticated + unfinished onboarding users |
| `BackgroundGradientAnimation.tsx` | Animated orange mesh background (30s loop) |
| `BuildFromJobCard.tsx` | Card to launch CV/letter builders with pre-selected job |
| `ExportMenu.tsx` | Menu for exporting CV/letter to PDF/DOCX |
| `SavedCVsPanel.tsx` | Right sidebar showing saved CV drafts |
| `LanguageToggle.tsx` | EN/DE language switcher |
| `Avatar.tsx` | User avatar with fallback initials |
| `NavLink.tsx` | Router link with active state styling |
| `ZoomControls.tsx` | +/− zoom buttons for print preview |
| `LayoutMenu.tsx` | Layout/template selector dropdown |
| `SaveModal.tsx` | Modal for saving CV/letter drafts |
| `AuthCharacters.tsx` | Illustrative characters for auth pages |
| `StatusBadge.tsx` | Job status indicator with color coding |

#### **`/components/jobs` — Job Management**
| File | Purpose |
|------|---------|
| `AddJobModal.tsx` | Modal for adding jobs (textarea → URL detection → AI parsing → review) |
| `JobDetailPanel.tsx` | Right sidebar showing full job details + status dropdown + notes + CV/letter CTAs |
| `StatusBadge.tsx` | Status dot + label component |

#### **`/components/ui` — shadcn/ui Primitives**
Pre-built component library (accordion, alert, avatar, badge, button, card, checkbox, dialog, dropdown, form, input, label, modal, popover, progress, radio, scroll-area, select, separator, sheet, slider, tabs, textarea, toast, tooltip, etc.) — don't modify these directly, they're from the upstream library.

#### **`/pages` — Route Pages**
| File | Purpose |
|------|---------|
| `Index.tsx` | Redirects to `<JobsPage />` |
| `JobsPage.tsx` | Main tracker: jobs table with filtering, search, pipeline views (all/saved/in-progress/completed) + guided onboarding micro-interaction |
| `CVBuilderPage.tsx` | CV editor with live preview, multiple templates, export |
| `CoverLetterPage.tsx` | Cover letter editor with templates, job context integration, export |
| `OnboardingPage.tsx` | Multi-step onboarding: collect name, location, bio, AI model preference, role/industry |
| `AuthPage.tsx` | Login/signup with email OTP, social login |
| `ProfilePage.tsx` | User bio, location, AI model toggle |
| `AIModelPage.tsx` | Select between Groq/Claude for CV/letter generation |
| `SettingsPage.tsx` | Language, theme, account deletion (with data wipe checkbox) |
| `SupportPage.tsx` | FAQ, support links |
| `NotFound.tsx` | 404 page |

#### **`/lib` — Business Logic & State**
| File | Purpose |
|------|---------|
| `jobs-store.tsx` | React context for job management: sync from Supabase, cache to localStorage, CRUD operations (addJob, updateJob, setJobs) |
| `jobs-data.ts` | Job type definitions, status enum, status → view mapping, status colors, demo seed data (removed) |
| `profile-store.tsx` | React context for user profile: sync from Supabase, onboarding state, AI model preference |
| `i18n.tsx` | Internationalization context (EN/DE) + useT() hook |
| `translations.ts` | All UI text strings (EN + DE) |
| `groq.ts` | Groq API integration: `parseJobFromText(rawText)` for AI job parsing |
| `exporters.ts` | Document generation: `generateCV()`, `generateCoverLetter()` using docx + jsPDF |
| `saved-cvs.ts` | localStorage-based CV draft management |
| `storage.ts` | localStorage utilities (read/write with error handling) |
| `utils.ts` | Utility functions (cn for className merging, etc.) |

#### **`/hooks` — React Hooks**
| File | Purpose |
|------|---------|
| `useAuth.tsx` | Authentication context: user state, login, logout, signup with Supabase |
| `use-toast.ts` | Toast notification hook (from shadcn/ui) |
| `use-mobile.tsx` | Responsive breakpoint hook for mobile detection |

#### **`/integrations` — External Service Integration**
| File | Purpose |
|------|---------|
| `/supabase/client.ts` | Supabase client initialization |
| `/supabase/types.ts` | Auto-generated TypeScript types for Supabase schema (profiles table only, jobs is JSONB column) |

#### **`/test` — Testing**
| File | Purpose |
|------|---------|
| `example.test.ts` | Example test file (Vitest) |
| `setup.ts` | Vitest setup (jsdom environment) |

#### **Config Files**
| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite configuration (SWC, React plugin, alias for @) |
| `tailwind.config.ts` | Tailwind extend config (custom Berlin Glass tokens exposed) |
| `tsconfig.json` | TypeScript strict mode configuration |
| `eslint.config.js` | ESLint rules (React hooks, refresh) |
| `vercel.json` | SPA rewrites for Vercel deployment |

### `/supabase` — Backend Configuration
| File | Purpose |
|------|---------|
| `config.toml` | Supabase local dev config |
| `migrations/20260511000000_add_jobs_to_profiles.sql` | Migration: added `jobs` JSONB column to profiles table |

### Root Config Files
| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts (dev, build, test, lint) |
| `.env.local` | Local environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_KEY, GROQ_API_KEY) |
| `DESIGN_SYSTEM.md` | Comprehensive design guide + token reference |
| `CLAUDE.md` | Project notes for AI sessions |

---

## 4. Key Features Implemented

### ✅ Authentication & Authorization
- Email OTP login/signup via Supabase Auth
- Protected routes (redirect to /auth if not logged in)
- Onboarding gate (redirect to /onboarding if onboarding_completed === false)
- Profile creation on signup
- Account deletion with optional data wipe

### ✅ Job Tracking & Management
- **Smart job input**: Single textarea that detects URL vs. pasted text
  - **URL mode**: Supabase edge function `scrape-job` extracts job details
  - **Text mode**: Groq LLM parses unstructured job posting text
- **Pipeline views**: All / Saved / In Progress / Completed filtering
- **Status management**: Saved → Applied → Assignment/Interviewing → Assessment → Offer → Accepted/Rejected
- **Job persistence**: Dual-write pattern (localStorage cache + Supabase JSONB)
- **Search & filter**: Real-time filtering by company/role
- **Job detail panel**: Right sidebar with status dropdown, salary edit, notes, CV/letter CTAs

### ✅ Guided Onboarding Micro-interaction
- After first job added, **pulse animation** appears on job row (1.2s)
- Auto-opens **job detail panel** with smooth slide-in animation
- Only shows for **first 3 jobs** (tracked via localStorage "jobs_added_count")
- **Respects prefers-reduced-motion** accessibility preference
- Smooth panel animations: backdrop fade-in (250ms) + sidebar slide-in (300ms)

### ✅ CV Builder
- Multiple CV templates (modern, classic, minimal, etc.)
- Live preview with responsive layouts
- Job context integration (auto-fill from selected job)
- Export to PDF/DOCX
- Save drafts to localStorage

### ✅ Cover Letter Builder
- Template selection (formal, conversational, creative)
- Job-specific integration (company, role, description auto-populated)
- Live preview
- Export to PDF/DOCX
- Draft saving

### ✅ Internationalization (i18n)
- English (EN) and German (DE) support
- Language toggle in TopNav
- All UI strings translated + stored in `lib/translations.ts`
- Language persisted in localStorage + Supabase preference

### ✅ AI Integration
- **Groq LLM** for job parsing (extract company, role, location, salary, description)
- **Groq LLM** for CV generation (tailor to job)
- **Groq LLM** for cover letter generation (context-aware)
- Fallback graceful error handling

### ✅ Design System
- **Berlin Glass v2**: frosted glass surfaces + animated orange mesh background
- **One accent color** (orange #FF5A2F) + semantic status colors
- **Typography scale**: 6 levels from 11px (field-label) to 72px (display-1)
- **Motion tokens**: 4 duration levels + consistent easing
- **Surface system**: Solid pages use `.card-surface`, glass pages use `.glass-card`
- **All animations respect** `prefers-reduced-motion`

### ✅ Responsive Design
- Mobile-first approach with Tailwind breakpoints
- Glass surfaces on larger screens (Jobs page)
- Solid surfaces on settings/profile pages
- Touch-friendly 44×44px minimum touch targets
- Viewport meta tag configured (no user-zoom disabling)

### ✅ Error Handling
- **ErrorBoundary** component catches React crashes + displays error message + reload button
- **Graceful Supabase failures**: localStorage fallback when Supabase is down
- **Form validation**: inline errors below fields, clear on user input
- **Toast notifications** for success/error feedback

---

## 5. Current Bugs & Issues

### ✅ Recently Fixed
1. **Modal disappearing on tab switch** (FIXED)
   - Root cause: profile-store.tsx useEffect dependency on [user] caused re-fetch when Supabase auth state refreshed with new user object reference
   - Solution: Changed dependency to [user?.id] to only re-fetch on actual ID change

2. **Jobs not persisting across sessions** (FIXED)
   - Root cause: jobs column missing from Supabase profiles table
   - Solution: Ran migration `ALTER TABLE public.profiles ADD COLUMN jobs jsonb NOT NULL DEFAULT '[]'::jsonb`

3. **Demo data re-seeding overwriting deleted jobs** (FIXED)
   - Root cause: readInitialJobs() was checking localStorage version key and re-seeding if mismatch
   - Solution: Removed automatic seed logic; now respects explicit empty arrays from Supabase

4. **AddJobModal white screen after form changes** (FIXED)
   - Root cause: jobs-store.tsx was querying non-existent jobs column in database
   - Solution: Added ErrorBoundary to App.tsx + ran database migration

5. **Missing panel animations** (FIXED)
   - Root cause: `animate-panel-in` and `animate-slide-in-right` classes used but not defined
   - Solution: Added keyframe animations to index.css with reduced-motion support

### 🟡 Known Non-Critical Issues
- None currently tracked

### 📋 Future Improvements
- Add analytics tracking (job application funnel)
- Email notifications for interview reminders
- LinkedIn job import integration
- Custom CV template builder
- Interview prep guides per role

---

## 6. Design System Reference

### Color Tokens (HSL in CSS variables)
```css
--background: 60 8% 95%;       /* #F3F3F1 - solid page bg */
--surface: 45 10% 95%;         /* #F4F3F0 - cards on solid */
--surface-2: 60 6% 93%;        /* #EFEFED - hover fills */
--ink: 0 0% 8%;                /* #151515 - primary text */
--ink-muted: 0 0% 29%;         /* #4A4A4A - helper text */
--brand: 13 100% 59%;          /* #FF5A2F - accent only */
```

### Typography Classes
- `.eyebrow-mono` — 12px uppercase (0.2em tracking)
- `.eyebrow` — 12px uppercase (0.08em tracking)
- `.heading-2` — 22px semibold
- `.heading-1` — 28→32px responsive
- `.display-2` — 40→48px responsive
- `.display-1` — 56→72px responsive

### Surface Classes
- `.card-surface` — solid page cards
- `.card-large` — 28px rounded feature cards
- `.glass-card` — frosted glass cards (L2)
- `.glass-modal` — modal overlay (L3, more opaque)
- `.glass-input` — glass surface inputs
- `.glass-chip` — filter pill chips

### Button Classes
- `.btn-primary` — orange CTA, pill-shaped
- `.btn-ghost` — translucent surface button
- `.btn-tertiary` — text-only link button

### Motion
- `--motion-fast`: 180ms hover/color
- `--motion-base`: 240ms modal
- `--motion-slow`: 400ms page transition
- `--ease-out`: `cubic-bezier(0.22, 0.61, 0.36, 1)` (default easing)

See `DESIGN_SYSTEM.md` for comprehensive token reference.

---

## 7. Dependencies & Installation

### Prerequisites
- **Node.js** 18+ (npm 9+)
- **Git**
- Supabase account (free tier sufficient)
- Groq API key (free model: `mixtral-8x7b-32768`)

### Setup Instructions

#### 1. Clone & Install
```bash
git clone <repository-url>
cd career-companion
npm install
```

#### 2. Supabase Setup
```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Initialize local Supabase
supabase init

# Start local Supabase
supabase start

# Apply migrations (adds jobs column)
supabase db push

# Or run migration manually in Supabase SQL Editor:
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS jobs jsonb NOT NULL DEFAULT '[]'::jsonb;
```

#### 3. Environment Variables
Create `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key
GROQ_API_KEY=your-groq-api-key
```

Get values from:
- **Supabase URL & Key**: Supabase dashboard → Settings → API
- **Groq API Key**: https://console.groq.com (free tier available)

#### 4. Start Dev Server
```bash
npm run dev
# Opens http://localhost:8080
```

#### 5. Type Checking
```bash
npm run build  # Includes TypeScript check
./node_modules/.bin/tsc --noEmit  # or run check without building
```

#### 6. Testing
```bash
npm test        # Run tests once
npm run test:watch  # Watch mode
```

#### 7. Linting
```bash
npm run lint
```

#### 8. Production Build
```bash
npm run build   # Creates /dist directory
npm run preview # Preview production build locally
```

### Deployment to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_KEY
# - GROQ_API_KEY
```

(SPA rewrites already configured in `vercel.json`)

---

## 8. Database Schema

### Supabase `profiles` Table
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id text NOT NULL UNIQUE,
  display_name text,
  preferred_ai_model text DEFAULT 'groq',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  onboarding_completed boolean DEFAULT false,
  jobs jsonb DEFAULT '[]'::jsonb  -- Array of Job objects
);
```

### Job Type Definition
```typescript
interface Job {
  id: string;                    // UUID
  company: string;              // e.g., "Acme GmbH"
  role: string;                 // e.g., "Senior Designer"
  location: string;             // e.g., "Berlin, Germany"
  salary?: string;              // e.g., "€60k–80k"
  description?: string;         // Job posting text
  link?: string;                // Job posting URL
  status: JobStatus;            // 'saved' | 'applied' | 'assignment' | 'assessment' | 'offer' | 'accepted' | 'rejected'
  notes?: string;               // User's internal notes
  dateAdded: string;            // ISO date: "2026-05-14"
  locationI18n?: Record<string, string>;  // Localized location (internal)
  descriptionI18n?: Record<string, string>; // Localized description (internal)
}

type JobStatus = 'saved' | 'applied' | 'assignment' | 'assessment' | 'offer' | 'accepted' | 'rejected';
```

---

## 9. Key Architectural Decisions

### 1. **Jobs Storage: JSONB on profiles table**
- ✅ Simpler: no separate jobs table, foreign key, or joins
- ✅ Faster: single row read for all user data
- ✅ Trade-off: not query-able at scale, but fine for <5000 jobs per user

### 2. **Dual-Write: localStorage + Supabase**
- localStorage = fast cache, offline support
- Supabase = source of truth, cross-device sync
- On sync fail: app keeps running on cache (resilient)

### 3. **React Context for State Management**
- JobsProvider → jobs context
- ProfileProvider → profile context
- AuthProvider → auth context
- LanguageProvider → i18n context
- Simple, no external state library needed

### 4. **Inline Form Validation**
- Errors only on blur or submit attempt
- Errors clear as user types
- Not on keystroke (reduces noise)

### 5. **One-Time Onboarding Hints**
- Micro-interaction shows for first 3 jobs only
- Tracked via localStorage "jobs_added_count"
- Guides users to discover job detail panel without nagging

### 6. **Berlin Glass Design System**
- Aesthetic-first: form follows brand story
- Constraint-based: all tokens in CSS variables
- Accessibility-first: all animations respect prefers-reduced-motion
- Mobile-first: solid layout, glass overlay on larger screens

---

## 10. Scripts & Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server (http://localhost:8080) |
| `npm run build` | Production build to /dist |
| `npm run build:dev` | Build with dev mode (source maps) |
| `npm run preview` | Preview production build locally |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | TypeScript type check only |

---

## 11. Common Tasks

### Add a New Feature
1. Create component in `/components`
2. Add text keys to `lib/translations.ts` (EN + DE)
3. Use design system classes from `index.css`
4. Follow Berlin Glass surface rules (solid vs. glass)
5. Test TypeScript: `npm run build`

### Debug Supabase Sync
1. Check browser DevTools → Application → localStorage → `jobs_v7`
2. Check Supabase dashboard → SQL Editor → `SELECT jobs FROM profiles WHERE id = '...'`
3. Check `jobs-store.tsx` → `fetchJobsFromSupabase()` logs
4. If mismatch: delete localStorage key, refresh page (forces re-sync)

### Test Responsive Design
1. In Chrome DevTools: press F12 → toggle device toolbar (Ctrl+Shift+M)
2. Test mobile (375px), tablet (768px), desktop (1440px)
3. Ensure no horizontal scroll
4. Test touch targets 44×44px minimum

### Test Accessibility
1. DevTools → Settings → Rendering → check "Emulate CSS media feature prefers-reduced-motion"
2. Verify animations become static or disabled
3. Test keyboard navigation (Tab through all interactive elements)
4. Test screen reader (VoiceOver on Mac: Cmd+F5)

---

## 12. Quick Reference Links

- **Design System**: See `DESIGN_SYSTEM.md` for tokens, components, and rules
- **Project Notes**: See `CLAUDE.md` for AI session context (onboarding gates, deletion flow, etc.)
- **Supabase Docs**: https://supabase.com/docs
- **Groq API**: https://console.groq.com/docs/quickstart
- **Tailwind**: https://tailwindcss.com/docs
- **React Router**: https://reactrouter.com/docs
- **Radix UI**: https://www.radix-ui.com/docs/primitives/overview/introduction

---

## 13. Recent Changes (Latest Session)

### Added Guided Onboarding Micro-interaction
- JobsPage now tracks `jobs_added_count` in localStorage
- When job added: triggers `animate-guided-pulse` on row for 1.2s
- After 1.2s: auto-selects job → opens detail panel with smooth animations
- Only shows for first 3 jobs (good for onboarding discovery)
- **NEW**: Added missing panel animations to `index.css`:
  - `animate-panel-in`: backdrop fade-in (250ms)
  - `animate-slide-in-right`: panel slide from right (300ms)
  - Both respect `prefers-reduced-motion`

### Fixed Panel Animation Classes
- JobDetailPanel uses `animate-panel-in` and `animate-slide-in-right`
- These animations were missing from CSS → added with proper accessibility support

### TypeScript Check
- ✅ No compilation errors
- ✅ All types properly defined
- ✅ Ready for production

---

## 14. Troubleshooting

### "Jobs not persisting after logout"
- **Cause**: Supabase jobs column missing or sync failed
- **Fix**: 
  1. Check Supabase dashboard: SQL Editor → `SELECT jobs FROM profiles WHERE id = '<user_id>'`
  2. If column missing: run migration (see Database Schema section)
  3. Clear localStorage: DevTools → Application → delete `jobs_v7` key
  4. Refresh page (will re-sync from Supabase)

### "Modal disappears when I switch tabs"
- **Cause**: Usually profile-store re-fetching on auth state refresh
- **Fix**: This was fixed in latest version. If still happening:
  1. Check browser Console for errors
  2. Check Supabase connection status
  3. Clear localStorage and try again

### "White screen after adding job"
- **Cause**: Usually TypeScript error or missing database column
- **Fix**:
  1. Check browser Console (F12) for error message
  2. Run `npm run build` to catch TypeScript errors
  3. Check Supabase jobs column exists
  4. ErrorBoundary should catch React crashes with helpful message

### "Animations not working"
- **Cause**: CSS classes not loaded or prefers-reduced-motion enabled
- **Fix**:
  1. Verify `index.css` includes animation definitions
  2. Check DevTools → Settings → Rendering → prefers-reduced-motion (disable for testing)
  3. Hard refresh: Cmd+Shift+R (macOS) or Ctrl+Shift+R (Windows)

---

## 15. Git Workflow

```bash
# Create feature branch
git checkout -b feature/job-filtering

# Develop & test
npm run dev

# Type check before commit
npm run build

# Commit with clear message
git add .
git commit -m "feat: add job status filtering to tracker"

# Push & create PR
git push origin feature/job-filtering
```

---

## 16. Contact & Support

For issues or questions:
1. Check `CLAUDE.md` for project context
2. Check `DESIGN_SYSTEM.md` for design rules
3. Review recent changes in this file (section 13)
4. Check Supabase dashboard for data consistency
5. Run TypeScript check: `npm run build`

---

**Last Updated**: 2026-05-14  
**Status**: ✅ Production-Ready (pending Vercel deployment)  
**Guided Onboarding**: ✅ Fully Implemented with Accessibility Support
