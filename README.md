# WildFinds — Campus Lost & Found Platform

A Next.js-based lost-and-found application built for Cebu Institute of Technology - University. Users can browse lost and found items, submit reports, and view their reporting history.

## Project Description

**WildFinds** is a platform designed to reunite lost items with their owners on campus. Users can:

- **Browse** active lost and found reports with search and filtering
- **Submit reports** for lost or found items with photos and details
- **Track submissions** by viewing their reporting history
- **Create accounts** for persistent item ownership and report management

The platform uses a lost-item / found-item matching workflow with authenticated report submission.

## Current Status

**Active features:**
- Live Supabase item browsing with client-side search, filtering, and pagination
- User authentication (signup/login/logout)
- Report submission for lost and found items
- Image upload to storage bucket
- Report ownership and authenticated-user history
- PostgreSQL reference number generation for items

**Prototype features (mock-backed, local state only):**
- Claim and match routes (no database operations)

**Not implemented:**
- Admin dashboard
- Moderation and approval workflows
- Claim/match review process
- Complete server-side session management
- Role-based access control

For architectural details and project history, see [HANDOVER.md](HANDOVER.md).

## Technology Stack

- **Next.js 16** with App Router and TypeScript
- **React 19** for UI components
- **Supabase** for authentication, database, and storage
- **ESLint** for code quality

## Quick Start

### Prerequisites

- Node.js (v18 or later)
- Supabase project with the schema applied
- Environment variables configured

### Installation

```bash
npm install
```

### Local Development

1. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Add your Supabase public URL and anon key
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build and Production

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

**Note:** The build passes with 0 errors and 2 expected warnings from `@next/next/no-img-element` in image preview components.

## Environment Variables

Create a `.env.local` file (or use `.env.example` as a template) with the following public values:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-public-key>
```

Do not commit `.env.local` or include real secret values.

## Architecture

### Folder Structure

```
src/
  app/              Next.js App Router routes and global styles
  features/         Feature-specific modules (items, reports, authentication)
  core/             Core utilities and helpers
  infrastructure/   Supabase clients and configuration
  shared/           Shared components and utilities
  legacy/           Quarantined legacy code (claim-match prototype)
```

### Dependency Direction

- App routes → Features, Core, Shared
- Features → Core, Infrastructure, Shared
- Core → Infrastructure, Shared
- Infrastructure → Shared
- Shared → External dependencies only

### Routes

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Home: browse active items with search/filter/tabs/pagination | Active |
| `/about` | Static product, workflow, features, and team info | Active |
| `/history` | Authenticated user's claimed and closed items | Active |
| `/item/[id]` | Item details with live Supabase data | Active |
| `/item/[id]/claim` | Claim item flow | Prototype (local state only) |
| `/match/[id]` | Match lost/found items | Prototype (local state only) |
| `/my-reports` | Authenticated user's submitted reports | Active |
| `/report/lost` | Submit a lost-item report | Active |
| `/report/found` | Submit a found-item report | Active |
| `/login` | Supabase Auth UI | Active |
| `/signup` | Supabase Auth signup | Active |

## Database and SQL

The `supabase/` directory contains one schema setup script and nine follow-up SQL scripts:

- **schema.sql** — Canonical database schema with tables, functions, triggers, and RLS policies
- **migration_*.sql** — Follow-up migration and privilege-management scripts for existing databases

Git history and filenames do not prove whether any script has been applied to a particular Supabase project. Verify the target database before running them.

### Key Database Objects

**Tables:**
- `profiles` — User metadata linked to auth users
- `items` — Lost/found item records
- `reports` — User submissions linking items to profiles
- `claims` — Claim records for items (public insert, no browser update yet)
- `matches` — Potential lost/found item matches (RLS enabled, no browser policy)

**Functions:**
- `generate_reference_number(type, date)` — Generates unique reference numbers (e.g., L20260731-1)
- `handle_new_user()` — Trigger that creates a user profile on signup
- `update_updated_at_column()` — Maintains `updated_at` timestamps

**Security:**
- Row-level security (RLS) enforces user ownership on profiles, reports, and items
- Authenticated users can only see and modify their own data unless they have moderator/admin role
- Anonymous users can read submitted/active/matched items
- Storage bucket policies control image uploads and access

### Migration and Setup

1. Apply `schema.sql` to a new Supabase database
2. For existing databases, apply each `migration_*.sql` in order
3. Create an `item-images` storage bucket in Supabase dashboard
4. Configure storage policies (see `migration_add_item_images_storage_policies.sql` for reference)

**Important:** SQL migrations must be applied manually through the Supabase dashboard or CLI. The repository does not include automatic migration runners. Verify each migration's status before re-applying.

## Authentication

### Client-Side Behavior

- **Session persistence:** Intentionally disabled (`persistSession: false`)
- **Token refresh:** Intentionally disabled (`autoRefreshToken: false`)
- **Implications:** Users must log in again after a browser reload

This design is suitable for a campus-only application where persistent login across sessions is not required. To enable persistent sessions, modify `src/infrastructure/supabase/clients/browserSupabaseClient.ts`.

### Authentication Flow

1. **Signup:** User provides email, password, and full name; Supabase creates an auth user
2. **Profile creation:** Database trigger automatically creates a default `user` profile
3. **Login:** User enters email and password; successful login stores the session
4. **Protected actions:** Report submission requires an authenticated profile

### Server-Side Auth (SSR)

A server Supabase client exists in `src/infrastructure/supabase/clients/serverSupabaseClient.ts` but is not currently used by any routes or middleware. Routes are not protected by server-side auth checks.

## Authorization

The database schema defines four user roles:

- `user` — Default for new signups; can submit reports and view own history
- `moderator` — Can view all reports (limited use; no update/delete policies)
- `admin` — Intended for full admin access (limited use; no policies implemented)
- `owner` — System administrator role

**Current limitations:** No admin dashboard, no role editor, and no role-based mutation policies exist. Roles are defined in the database but not enforced in the application.

## Known Limitations

### Active Warnings

- `src/features/items/shared/components/ItemImage.tsx:16` — Using `<img>` instead of Next.js `<Image>` component (ESLint warning)
- `src/features/reports/submission/components/ReportImageUploader.tsx:19` — Same as above

### Incomplete Features

- **Claim/match forms:** Local state only; no database insert operations
- **Admin functions:** No dashboard, moderation UI, or approval workflows
- **Report history:** Only accessible through `/history` for resolved items; active reports are not listed for users
- **Session persistence:** Browser reload loses authentication state

### Design Constraints

- All visible items are loaded into the browser; client-side filtering is not paginated at the database level
- Filter state is not preserved in the URL
- Image uploads are not transactional; partial data can remain if any step fails
- Claim/match data is inserted only to the database with no browser RLS policies yet

## Supabase Ownership

### Infrastructure Layer (`src/infrastructure/supabase/`)

Owns all Supabase client configuration:
- Browser and server client creation
- Auth session helpers
- Supabase-specific configuration (URL, keys, feature flags)

### Feature Layers (`src/features/`)

Own feature-specific data operations:
- `authentication/` — Login/signup flows
- `items/` — Item browsing queries
- `reports/` — Report submission and storage integration

### Application Routes (`src/app/`)

Do not directly own Supabase operations; delegate to features and core helpers.

### Legacy Code (`src/legacy/claim-match-prototype/`)

Isolated mock-based prototypes. Do not interact with production Supabase operations.
