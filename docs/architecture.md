# Architecture

## Overview

Gadget Zone Online POS is a Next.js application backed by Supabase Auth and Supabase Postgres. Vercel hosts the web app. Supabase Row Level Security protects organization-scoped business data.

## Application Layers

- `src/app`: App Router pages
- `src/components/layout`: Shell, sidebar, and topbar
- `src/components/ui`: Small reusable UI primitives
- `src/lib/supabase`: Browser, server, and middleware Supabase clients
- `src/lib/env.ts`: Environment parsing and safe defaults
- `supabase/migrations`: Database schema
- `supabase/seed.sql`: Safe demo data

## Data Model

The first schema uses:

- organizations for tenant isolation
- branches for shop locations
- profiles linked to Supabase Auth users
- business tables with `organization_id`
- branch-specific tables with `branch_id`
- RLS policies scoped through `current_organization_id()`

## Security Model

- Supabase Auth owns login identity.
- `profiles` maps auth users to organizations and roles.
- RLS policies restrict reads/writes to the current user's organization.
- Service role key is only for server-only administrative tasks and must never be exposed to browser code.

## Deployment

Vercel should receive:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_NAME`

CI runs lint, typecheck, and build on push to main and pull requests.

