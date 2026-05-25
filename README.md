# Gadget Zone Online POS

Gadget Zone Online POS is a new cloud POS project for Gadget Zone. It is inspired by the existing desktop Gadget Zone POS, but it is a separate codebase and a separate GitHub repository.

This project does not modify the desktop POS app, the Vercel download website, or any released portable app folders.

## Current Status

This first milestone creates the production foundation only:

- Next.js App Router app with TypeScript
- Tailwind CSS user interface foundation
- Supabase client/server helpers
- Protected-route middleware placeholder
- Dashboard and module placeholder pages
- Initial Supabase schema migration
- Safe demo seed data
- CI workflow for lint, typecheck, and build
- Desktop app audit and MVP planning docs

The full cashier POS flow is intentionally not built yet.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase Auth and Postgres
- Vercel
- npm

## Local Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment Variables

Copy `.env.example` to `.env.local` when Supabase credentials are available.

Required values:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_NAME=Gadget Zone Online POS
```

Important:

- `.env.local` must never be committed.
- `SUPABASE_SERVICE_ROLE_KEY` must only be used on the server.
- Browser code must only use `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Supabase Setup

The schema foundation lives in:

```text
supabase/migrations/0001_initial_schema.sql
supabase/seed.sql
supabase/config.toml
```

The first migration creates:

- organizations
- branches
- profiles
- product categories
- products and services
- customers
- suppliers
- invoices and invoice items
- payments
- repairs and repair status history
- expenses
- daily closings
- app settings
- audit logs

It also enables Row Level Security and adds organization-scoped policies for authenticated users.

## Vercel Deployment

This app is intended for Vercel. Configure the same environment variables in Vercel before production deployment.

The CI workflow runs:

```bash
npm ci
npm run lint
npm run typecheck
npm run build
```

## Development Phases

1. Foundation and audit: complete in this milestone.
2. Supabase project connection and authentication.
3. Organization onboarding and staff roles.
4. Product, category, supplier, and inventory CRUD.
5. POS checkout with invoices, payments, discounts, and customer credit.
6. Repairs workflow.
7. Expenses, daily closing, and reports.
8. PDF/receipt generation and print workflows.

## Audit Docs

See:

- `docs/desktop-audit.md`
- `docs/feature-map.md`
- `docs/business-rules.md`
- `docs/mvp-scope.md`
- `docs/architecture.md`

