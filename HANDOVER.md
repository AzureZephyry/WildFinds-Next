# WildFinds Project Handover

This document describes the repository at `main`, commit `8c4d74a` (`Add authenticated report ownership foundation`). It is intended to let another senior developer continue without the previous chat history.

## Executive Summary

WildFinds is a campus lost-and-found application for Cebu Institute of Technology - University. The active application is `wildfinds-next`, a Next.js App Router frontend backed by Supabase. The parent directory also contains the original static frontend; those HTML/CSS/JavaScript files are legacy and are not imported by Next.js.

The current product can browse live unresolved reports, search/filter/paginate them, show resolved-item history, create accounts, log in/out, submit lost/found reports, upload report images, create profiles through an Auth trigger, and associate reports with authenticated profiles.

The major unfinished boundary is the item action flow. Dynamic item details and claim/match pages still use mock data. Claim/match forms only update local React state. There is no admin dashboard, no active middleware, and no complete server-side session or moderation workflow.

## 1. Architecture

### Repository layout

Legacy files at the workspace root:

- `index.html`, `about.html`, `item-details.html`
- `report-lost.html`, `report-found.html`
- `claim-item.html`, `confirm-match.html`
- `script.js`, `styles.css`

Active project:

```text
wildfinds-next/
  public/                 Next.js scaffold assets
  src/
    app/                  App Router pages and global CSS
    components/           Shared UI components
    data/                 Building options and legacy mock items
    hooks/                Client-side data/filter hooks
    lib/supabase/         Browser, server, and auth helpers
    types/                TypeScript contracts
    utils/                Search, filtering, validation, report helpers
  supabase/
    schema.sql            Canonical schema, functions, triggers, RLS
    migration_add_report_profile_id.sql
                           Existing-database ownership migration
  .env.example             Required public Supabase variables
  .env.local               Local values; do not commit
  package.json              Scripts and dependencies
  next.config.ts            Empty Next config object
  tsconfig.json             Strict TS config and @/* alias
```

`.next`, `node_modules`, and `next-env.d.ts` are generated/local files. `AGENTS.md` says this project uses a newer Next.js version and relevant guides under `node_modules/next/dist/docs/` should be consulted before code changes. `CLAUDE.md` only references `AGENTS.md`.

### Routes

- `/` - client homepage with listings, search, filters, tabs, pagination.
- `/about` - static product, workflow, feature, and team content.
- `/history` - client Supabase query for claimed and closed items.
- `/item/[id]` - dynamic details route, currently reads `mockItems`.
- `/item/[id]/claim` - claim route, currently reads `mockItems` and is local-only.
- `/match/[id]` - match route, currently reads `mockItems` and is local-only.
- `/report/lost` and `/report/found` - shared authenticated report form.
- `/login` and `/signup` - client Supabase Auth UI.

There is no `/admin` route, protected route group, route handler, or `middleware.ts`.

### Root shell and components

`src/app/layout.tsx` is a server root layout that loads Geist fonts, metadata, global CSS, and `LayoutClient`. `LayoutClient` owns the drawer state and renders `Header`, `Drawer`, and route content. `globals.css` is the primary style surface.

Main components:

- `Header`: browser session lookup, auth-state listener, login/signup/logout controls.
- `Drawer`: Home, History, About, How It Works, and Team navigation.
- `ItemCard`, `ItemSummary`, `ItemImage`, `ReferenceBadge`: listing/detail display.
- `SearchBar`, `FilterBar`, `Tabs`, `Pagination`: homepage controls.
- `SkeletonList`, `EmptyState`, `ErrorState`: loading/failure states.
- `ReportForm`: validation, auth gate, upload, reference RPC, item/report inserts.
- `ImageUploader`: local image preview and file selection.
- `ClaimMatchForm`: shared claim/match presentation; no database call.
- `HistoryCard`: resolved item display.
- `FormField`, `ValidationMessage`, `HashScroll`: shared form/about helpers.

### Hooks, types, utilities

`useItems` queries visible Supabase items on mount, maps snake_case fields to `ItemCardItem`, and exposes `items`, `isLoading`, and `error`. `useSearchAndFilter` memoizes tab filtering, text search, then structured filters.

`utils/searchItems.ts` performs case-insensitive substring search over reference number, name, category, location, status, brand, color, description, building, and identifying marks. `utils/filterItems.ts` handles lost/found tabs and exact category/status/building/date filters. `utils/validation.ts` validates report fields, email, phone, image MIME type, and length limits. `data/buildingOptions.ts` contains the fixed building list. `data/mockItems.ts` is legacy data still used by dynamic flows.

`types/items.ts` is the primary listing contract. `types/reports.ts` defines form values/errors/props and the post-submit payload. `types/item.ts` is an older overlapping item interface. `utils/reportUtils.ts` contains fixed categories plus legacy client report helpers. `utils/referenceGenerator.ts` is now a throwing compatibility stub because numbering moved to PostgreSQL.

### Supabase modules and data flow

`src/lib/supabase/client.ts` reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, returning a shared browser client or `null`. It configures `persistSession: false` and `autoRefreshToken: false`.

`src/lib/supabase/auth.ts` provides `getCurrentSession`, `getCurrentUser`, and `getCurrentProfileId`. `src/lib/supabase/server.ts` creates an `@supabase/ssr` server client using Next cookies, but is currently unused by pages, middleware, or route handlers.

Homepage flow:

1. `page.tsx` mounts `useItems`.
2. `useItems` selects visible rows from `public.items` ordered by newest `created_at`.
3. Filter options are derived from loaded rows.
4. `useSearchAndFilter` applies tab, search, and filters in the browser.
5. The result is sliced into ten-item pages and rendered by `ItemCard`.

Report flow:

1. The lost/found route renders `ReportForm`.
2. The form resolves the current profile and redirects unauthenticated users to `/login?redirect=/report/{type}`.
3. Client validation runs.
4. An optional image uploads to `item-images`.
5. PostgreSQL `generate_reference_number` is called.
6. An `items` row is inserted with `status = 'submitted'`.
7. The new item ID is loaded by reference number.
8. A `reports` row is inserted with `profile_id`.
9. The page shows the reference and submitted status.

This is not transactional. An item or storage object can remain if a later step fails.

## 2. Features Completed

### Live Supabase browsing

The homepage reads `items` with statuses `submitted`, `active`, and `matched`, ordered newest first. Anonymous visibility is also restricted by RLS. Search, filters, tabs, and pagination are implemented client-side.

### History

`/history` selects items with status `claimed` or `closed`, orders by `resolved_at` descending, and separates them into Claimed Items and Closed Items. It has loading, error, and empty states.

### Authentication UI

Signup collects full name, email, password, and confirmation, performs local validation, and calls `supabase.auth.signUp` with `full_name` metadata. It displays an email-confirmation message if needed. Login calls `signInWithPassword`, reports Supabase errors, and redirects to a safe local redirect or `/`. The Header listens for auth changes and Logout calls `signOut`.

### Profiles and ownership

`public.profiles` is keyed to `auth.users.id`. A database trigger creates a default `user` profile after signup. ReportForm resolves the profile before insert and writes `reports.profile_id`; the RLS insert policy verifies that the ID belongs to the current auth user.

### Report submission

Lost and found forms share `ReportForm`. Required UI fields include item name, reporter name, category, location, building, date, time, brand, color, contact number, and email. Description, identifying marks, and image are optional. The form has field-length, email, phone, and image-type validation.

### Reference numbers

The PostgreSQL function returns an `L` or `F` prefix, `YYYYMMDD`, and incrementing suffix, such as `L20260731-1`. It uses an advisory transaction lock for the type/date sequence. The client retries up to three times after a reference uniqueness conflict.

### Storage upload

The form accepts JPEG/JPG/PNG/WebP, uploads a randomized filename to `item-images`, calls `getPublicUrl`, and stores the URL in `items.image_url`. The code assumes the bucket exists and is public; the repository SQL does not create it or its policies.

### Not actually completed

Claims, matches, item detail, moderation, approval, admin dashboard, role management, and server-side route protection are not complete even though there is schema/UI groundwork for some of them.

## 3. Database

The canonical SQL is `supabase/schema.sql`. Existing databases also need `supabase/migration_add_report_profile_id.sql`, which safely adds `reports.profile_id`, the foreign key, and index.

### `public.profiles`

- `id uuid primary key references auth.users(id) on delete cascade`
- `full_name text`
- `email text not null`
- `role text not null default 'user'`, constrained to `owner`, `admin`, `moderator`, `user`
- `created_at`, `updated_at` timestamptz with `now()` defaults

A profile maps one-to-one to an Auth user. Authenticated users can select/update only their own profile. There is no client role-management policy.

### `public.items`

- `id uuid primary key default gen_random_uuid()`
- `reference_number text not null unique`
- `type text not null`, `lost` or `found`
- `name text not null`, `category text not null`
- `description`, `brand`, `color`, `identifying_marks`, `building` text fields
- `location text not null`
- `date_reported date not null`, `time_reported time not null`
- `image_url text`
- `status text not null default 'submitted'`, constrained to `submitted`, `active`, `matched`, `claimed`, `closed`
- `created_at`, `updated_at` timestamptz
- `resolved_at timestamptz`

Reports reference items through `reports.item_id`; claims use `claims.item_id`; matches reference an item as either `lost_item_id` or `found_item_id`. Public select exposes submitted/active/matched. Authenticated insert requires submitted. No update/delete policy exists, so browser status transitions are not currently possible.

### `public.reports`

- `id uuid primary key default gen_random_uuid()`
- `item_id uuid not null references items(id) on delete cascade`
- `profile_id uuid references profiles(id) on delete set null`
- `reporter_name`, `email`, `contact_number` text not null
- `submitted_at timestamptz default now()`
- `review_status text default 'pending'`, constrained to pending/approved/rejected

There is an index on `profile_id`. Authenticated users can insert/read/update their own reports. They can delete their own reports only when the linked item is submitted or active. Moderator/admin/owner profiles can select all reports, but no moderator/admin mutation policies exist.

### `public.claims`

- `id uuid primary key default gen_random_uuid()`
- `item_id uuid not null references items(id) on delete cascade`
- `claimant_name`, `contact_info`, `details` text not null
- `status text default 'submitted'`, constrained to submitted/pending_review/approved/rejected/withdrawn
- `created_at`, `reviewed_at`

Only an unrestricted public insert policy is created. There are no select/update/delete policies. The current form never inserts here.

### `public.matches`

- `id uuid primary key default gen_random_uuid()`
- `lost_item_id`, `found_item_id` UUID foreign keys to items with cascade deletion
- `status text default 'submitted'`, constrained to submitted/pending_review/approved/rejected/withdrawn
- `created_at`, `reviewed_at`
- `matches_lost_found_different` prevents the same item on both sides

RLS is enabled but no matches policy is created, so browser access is denied. The current form never inserts here.

### Functions and triggers

- `handle_new_user()` is `security definer`, uses `search_path = public`, copies Auth full-name metadata/email, and inserts role `user`.
- `on_auth_user_created` fires after inserts on `auth.users`.
- `generate_reference_number(report_type, report_date)` validates inputs, locks the type/date sequence, and returns the next reference.
- `update_updated_at_column()` updates `updated_at` before changes to items/profiles.

### RLS and policy changes

RLS is enabled on profiles, items, reports, claims, and matches. The schema drops and recreates named policies to synchronize policy names. The latest SQL changes added profiles, the Auth trigger, `reports.profile_id`, its index/foreign key, and ownership policies. The separate migration exists for live databases that already have the older reports table.

### Storage

The app expects a public `item-images` bucket. No bucket creation statement or `storage.objects` policies are in the repository. Supabase dashboard/project setup is required.

## 4. Authentication

Signup calls `auth.signUp` with full-name metadata. Supabase inserts `auth.users`; the database trigger creates `profiles`. If email confirmation is enabled, signup may return no session and the UI remains with a confirmation message. If a session exists, it redirects.

Login calls `auth.signInWithPassword`; successful login redirects to a validated local `redirect` query or `/`. Login/signup pages check `getSession` and redirect already-authenticated users home.

Header calls `getSession` and subscribes to `onAuthStateChange`. Logout calls `signOut` and the listener updates the Header.

Important current behavior: the browser client explicitly uses `persistSession: false` and `autoRefreshToken: false`. Sessions are not intentionally persisted across reloads and tokens are not auto-refreshed. `server.ts` has a cookie-based SSR client helper, but it is dead code today. There is no middleware, auth callback, password reset, OAuth, email verification route, or server redirect guard.

ReportForm checks for a current profile on mount and immediately before insert. Missing auth/profile redirects to Login. New profiles are expected to come from the database trigger; there is no profile editor or role editor.

## 5. Authorization

The schema supports `owner`, `admin`, `moderator`, and `user`; new users receive `user`. Anonymous users can read visible items. Authenticated users can create submitted items and own/read/update/delete reports subject to the policies above. Moderator/admin/owner can read all reports.

There is no active route-level or server-level role guard. No admin UI exists. There are no policies for role changes, item status updates, claim review, match review, or admin mutations. Claims are insert-only and matches have no browser policy. The role column is therefore only partially enforced.

## 6. Admin Dashboard

No admin dashboard is implemented. There are no admin pages, layouts, statistics queries, moderation queues, approval actions, claim/match review screens, or audit trail. Database groundwork consists of the profile role check and the reports `review_status` field/policy for broad report reads. A future dashboard would need server-side role checks and mutation policies, not only client visibility changes.

## 7. Homepage

`src/app/page.tsx` is client-rendered. `useItems` selects item fields including identity, descriptive fields, date/time, image URL, and status; filters to submitted/active/matched and orders by newest creation time.

Search normalizes to lowercase and performs substring matching across reference number, name, category, location, status, brand, color, description, building, and identifying marks. Tabs filter `type`; selects filter category/status/building; the date input performs an exact date match. Options are derived from loaded rows.

The result array is sliced at ten items per page. Page changes and filter/search/tab changes reset to page one. A skeleton is shown during the initial query and a 220ms client loading delay is added when browse state changes. Query errors use an EmptyState reload action.

This is not server search or pagination. All visible rows are loaded into the browser, filters are not in the URL, there is no debounce or realtime refresh, and the dynamic detail links still point into mock-data routes. The top panel visibly includes a Lost report link; the Found route exists but is not equivalently surfaced there.

## 8. Known Bugs

### Live items do not have live details

- Symptoms: A homepage item with a real Supabase UUID may show “Item unavailable”; newly submitted items cannot be viewed in details.
- Cause: `src/app/item/[id]/page.tsx` searches `mockItems`.
- Status: Unresolved.
- Attempted fix: Homepage migration to Supabase did not migrate the detail path.

### Found claim URL is wrong

- Symptoms: Details builds `/claim/{id}` for found items, but the route is `/item/{id}/claim`.
- Cause: Link path and folder path differ.
- Status: Unresolved.
- Attempted fix: None visible.

### Claims/matches disappear

- Symptoms: Forms report success locally but no row is created; refresh loses the result.
- Cause: `ClaimMatchForm` only sets local `isSubmitted`.
- Status: Unresolved.
- Attempted fix: Shared UI form exists, but no Supabase insert was added.

### Auth is not server-protected or persistent

- Symptoms: Direct requests are not role-protected and sessions may disappear after reload.
- Cause: No middleware/server guards; browser client disables persistence/refresh; SSR helper unused.
- Status: Unresolved.
- Attempted fix: Client login/signup and auth listener were added.

### Storage depends on undocumented external setup

- Symptoms: Upload fails when `item-images` or its policies are absent.
- Cause: The repository does not create the bucket or storage policies.
- Status: Unresolved in repository configuration.
- Attempted fix: Upload error handling was improved, but infrastructure SQL was not added.

### Report insert can leave partial data

- Symptoms: An item can exist without a report, or an orphaned image can remain.
- Cause: Upload, item insert, item lookup, and report insert are independent client operations.
- Status: Unresolved design risk.
- Attempted fix: Explicit checks/retries/error messages; no transaction or compensation.

### Lint fails

- Symptoms: `npm run lint` exits nonzero.
- Cause: Four React `set-state-in-effect` errors in `src/app/page.tsx`, `src/components/Header.tsx`, and `src/components/ImageUploader.tsx`.
- Status: Unresolved; build still passes.
- Warnings: unused `HistoryItemRecord`, unused `referenceDisplay`, unused `ComponentPropsWithoutRef`, unused stub parameters, and raw `<img>` warnings.

### RLS gaps

Items have no update/delete policy. Claims have public insert but no reads/updates/deletes. Matches have RLS but no policies. Admin report access is read-only. Claims/matches have no authenticated profile ownership columns.

## 9. Current Branch State

Branch is `main`, at `8c4d74a`, aligned with `origin/main` at the last status check, with no uncommitted changes.

### Completed

Next.js migration; shared shell; Supabase client; live homepage listing; client search/filter/tabs/pagination; resolved history; PostgreSQL reference generation; lost/found report forms; validation; image upload integration; Auth signup/login/logout UI; profiles trigger; report ownership; schema migration; successful production build.

### In progress

Local Auth/environment verification and the broader move from mock detail flows to live data.

### Not started

Database-backed detail, claims, matches, admin dashboard, moderation/approval mutations, role management, server session middleware, user-owned report history, automated tests, and storage bucket migration/policies.

### Blocked or externally dependent

Local/production operation requires correct Supabase URL/key, the current schema/migration, and the `item-images` bucket/policies. Vercel settings are not stored in the repository; equivalent environment values must be configured there.

## 10. Technical Debt

- `mockItems` remains in production dynamic routes.
- `types/item.ts` overlaps with `types/items.ts`.
- `createReportSubmission` and `generateItemId` are legacy helpers.
- `referenceGenerator.ts` is a throwing compatibility stub.
- Query mappings use local interfaces/casts instead of generated Supabase types.
- Nullable client configuration creates runtime branches throughout the UI.
- Auth persistence and token refresh are disabled.
- SSR Supabase helper is unused.
- ReportForm owns too many persistence responsibilities and has no rollback.
- Client-side all-row filtering/pagination will not scale.
- Pagination renders every page button.
- Raw `<img>` elements are used; file size is not limited.
- Storage filenames have minimal sanitization and no explicit per-user policy.
- Inline styles and unused scaffold assets remain.
- About text still calls some now-started features “future improvements.”
- README is still the Create Next App README and lacks WildFinds setup/deployment/schema instructions.
- There are no unit, integration, browser, or migration tests.

## 11. Recent Changes

1. `a894cd5` - Migrated the static WildFinds frontend to Next.js and introduced Supabase.
2. `c25f103` and `20273fd` - Fixed report persistence and improved Supabase error handling.
3. `130a6a7` - Moved reference generation into PostgreSQL with advisory locking.
4. `dbdb512` - Replaced homepage mock data with Supabase items.
5. `864001b` - Restricted homepage to unresolved/visible statuses.
6. `932cc81` - Added the Supabase-backed resolved history page.
7. `f070a9a` - Synchronized schema, functions, triggers, and RLS policy names.
8. `1e15fd2` - Added profiles and the new-user profile trigger.
9. `1b6023d` - Corrected policy synchronization names.
10. `1a81fcb` - Added login/signup UI, Header auth state, logout, and client auth helpers.
11. `8c4d74a` - Added `reports.profile_id`, safe migration, ownership policies, profile lookup, and authenticated report insertion.

The project direction evolved from static/mock UI to a live Supabase MVP, then added Auth and ownership after the basic data flow was working.

## 12. Recommended Next Task

### Migrate the item detail and action flow to live Supabase data

This is the single highest-priority task because it is the broken continuation of the main user journey. A user can see a live report on the homepage, but cannot reliably open its details or complete the intended claim/match action.

Replace `mockItems` reads in `/item/[id]`, `/item/[id]/claim`, and `/match/[id]` with database queries; correct the found-item claim URL; and make the forms persist to `claims`/`matches` under an explicit auth/RLS model. Handle missing and non-visible statuses safely. This connects the working browse/report foundation to the actual lost-and-found recovery workflow.

## Validation Snapshot

- `npm run build` passes: Next.js 16.2.12 compiles TypeScript and generates all listed routes.
- `npm run lint` fails with 4 errors and reports 8 warnings, primarily React hook set-state-in-effect rules and unused/raw image warnings.
- `npm run dev` reports `.env.local` loaded when started from `wildfinds-next`.
- Production route output includes `/`, `/about`, `/history`, dynamic item/claim/match routes, login/signup, and both report routes.
