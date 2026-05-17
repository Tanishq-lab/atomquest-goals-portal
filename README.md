# In-House Goal Setting & Tracking Portal

Modern HR performance management portal for goal setting, manager approval, quarterly check-ins, analytics, reporting, and auditability.

## Stack

- Next.js 15 App Router, React, TypeScript, Tailwind CSS
- shadcn-style local UI primitives, React Hook Form, Zod
- NextAuth credentials auth with JWT sessions and RBAC
- Prisma ORM with PostgreSQL
- Recharts analytics and TanStack Table reports
- Optional Groq API for AI goal suggestions and summaries

## Demo Accounts

All seeded users use password `Password123!`.

- `employee@test.com` - Employee
- `manager@test.com` - Manager L1
- `admin@test.com` - Admin / HR

## Setup

### Instant Demo Mode

Use `DEMO_MODE="true"` in a local `.env` so the portal can run without provisioning a database. This workspace already has that local demo `.env` configured for hackathon judging and local walkthroughs:

```bash
cd in-house-goals-portal
npm install
npm run dev
```

Open `http://localhost:3000` and sign in with one of the demo accounts below.

### Database-backed Mode

```bash
cd in-house-goals-portal
npm install
npm run db:push
npm run db:seed
npm run dev
```

For database-backed mode, copy `.env.example` to `.env`, set `DATABASE_URL`, set `DEMO_MODE="false"`, then run the database commands above.

## Environment

Required:

- `DATABASE_URL` - PostgreSQL connection string from Supabase, Railway, or local Postgres
- `NEXTAUTH_URL` - app URL, for local development use `http://localhost:3000`
- `NEXTAUTH_SECRET` - long random secret

Optional:

- `GROQ_API_KEY` - enables live AI-generated SMART goals and quarterly summaries
- `GEMINI_API_KEY` - reserved for an alternate free AI provider
- SMTP settings - reserved for email notification delivery

## Architecture

The app is organized around clear product boundaries:

- `app/(auth)` - login and signup routes
- `app/(dashboard)` - protected role dashboards, goals, and analytics pages
- `app/api` - REST endpoints for goals, approvals, check-ins, reports, analytics, audit logs, auth, and AI
- `components/dashboard` - reusable dashboard shell, charts, tables, workflow actions, and goal form
- `components/ui` - shadcn-style primitives used across the app
- `lib` - Prisma client, RBAC, auth, progress engine, validations, and service layer
- `prisma` - schema and realistic seed data

Role routing is enforced in `middleware.ts`; API permissions are enforced with `requireSession`.

## Database Model

The Prisma schema includes:

- `User` with `EMPLOYEE`, `MANAGER`, and `ADMIN` roles
- `Cycle` for HR performance windows
- `GoalSheet` with workflow states: `DRAFT`, `SUBMITTED`, `APPROVED`, `REWORK_REQUESTED`, `LOCKED`
- `Goal` with UoM, progress formula, target, weightage, status, and shared-goal linkage
- `QuarterlyUpdate` for goal setting, Q1, Q2, Q3, and Q4 check-ins
- `Comment`, `SharedGoal`, `AuditLog`, and `Notification`

Indexes and uniqueness constraints protect common queries and one goal sheet per employee per cycle.

## Business Rules Implemented

- Maximum 8 goals per sheet
- Minimum goal weightage is 10%
- Total sheet weightage must equal 100%
- Draft and rework sheets can be edited
- Approved or locked sheets cannot be edited by employees
- Admin/HR can unlock sheets
- Workflow changes create audit logs and notifications
- Shared goals are modeled so HR can push corporate KPIs while preserving linked employee goals
- Progress engine supports min, max, timeline, and zero-based calculations

## API Documentation

### `GET /api/goals`

Returns role-aware dashboard data. Employees receive their sheet; managers receive team sheets; admins receive all users, sheets, analytics, and audit logs.

### `POST /api/goals`

Creates or updates an employee goal sheet.

```json
{
  "cycleId": "cycle-id",
  "goals": [
    {
      "thrustArea": "Delivery Excellence",
      "title": "Ship roadmap commitments",
      "description": "Deliver committed roadmap items with high quality.",
      "uomType": "PERCENTAGE",
      "progressType": "MIN",
      "target": 95,
      "weightage": 35,
      "deadline": "2027-03-31",
      "status": "NOT_STARTED"
    }
  ]
}
```

Submit a sheet:

```json
{ "intent": "submit", "cycleId": "cycle-id" }
```

### `POST /api/approvals`

Manager/Admin workflow actions:

```json
{ "goalSheetId": "sheet-id", "action": "APPROVE", "comment": "Approved." }
```

Actions: `APPROVE`, `REJECT`, `RETURN`, `LOCK`, `UNLOCK`.

### `POST /api/check-ins`

Creates or updates a quarterly achievement.

```json
{
  "goalId": "goal-id",
  "quarter": "Q1",
  "achievement": 80,
  "status": "ON_TRACK",
  "narrative": "Delivered key quarterly milestone."
}
```

### `GET /api/reports?format=csv`

Exports a team or company-wide report. Use `format=excel` for Excel-compatible output.

### `GET /api/analytics`

Returns summary metrics and chart distributions for the signed-in role.

### `GET /api/audit-logs?q=LOCK`

Admin-only audit search.

### `POST /api/ai`

Returns SMART goal suggestions or quarterly summaries. Uses Groq when `GROQ_API_KEY` exists, otherwise returns deterministic demo-safe suggestions.

## Deployment

### Vercel + Supabase

1. Create a Supabase project and copy the pooled PostgreSQL connection string.
2. Import this repository into Vercel.
3. Set `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` in Vercel.
4. Run `npx prisma db push` and `npm run db:seed` from a trusted environment against the Supabase database.
5. Deploy.

### Railway

1. Create a Railway PostgreSQL service.
2. Add the database URL to `.env`.
3. Run `npm run db:push && npm run db:seed`.
4. Deploy the Next.js app with `npm run build` and `npm run start`.

## Hackathon Demo Flow

1. Sign in as `employee@test.com`.
2. Edit the goal sheet, fix validation messages, and submit for approval.
3. Sign in as `manager@test.com`, review team goals, approve or return for rework.
4. Sign in as `admin@test.com`, inspect users, export reports, view audit logs, and unlock a sheet.
5. Open Analytics to show completion, workflow, department, UoM, and status charts.
