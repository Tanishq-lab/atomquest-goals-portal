# 🎯 AtomQuest Hackathon 1.0 — In-House Goal Setting & Tracking Portal

> A production-quality HR performance management portal built for the **AtomQuest Hackathon 1.0** challenge.  
> Features a premium glassmorphic UI, full RBAC, quarterly check-ins, analytics, CSV reporting, and audit trails.

---

## 🚀 Live Demo

> **Demo URL:** _(deploy to Vercel — see instructions below)_  
> **Local:** `http://localhost:3000` after running `npm run dev`

### One-tap login (no typing required!)

| Role | Email | Password |
|:---|:---|:---|
| 👤 Employee | `employee@test.com` | `Password123!` |
| 👔 Manager | `manager@test.com` | `Password123!` |
| 🛡️ Admin / HR | `admin@test.com` | `Password123!` |

The login page has **Quick Login buttons** — click to sign in instantly as any role.

---

## ✅ Hackathon Requirements Coverage

| # | Criterion | Status |
|:---|:---|:---|
| 1 | End-to-end portal functionality | ✅ Complete |
| 2 | BRD adherence (100% weightage, max 8 goals, min 10%) | ✅ Enforced client + server |
| 3 | User-friendly UI | ✅ Glassmorphic, role-aware, animated |
| 4 | Bug-free under edge cases | ✅ Zod validation + demo mode |
| 5 | Good-to-have features | ✅ CSV export, AI suggestions, shared KPIs, audit logs |
| 6 | Cost optimisation | ✅ Serverless + scale-to-zero architecture |

---

## 🏗️ Tech Stack

| Layer | Technology |
|:---|:---|
| Framework | Next.js 15 (App Router) + TypeScript |
| UI | React + Tailwind CSS (Glassmorphic design) |
| Auth | NextAuth.js (JWT sessions + RBAC) |
| Validation | Zod + React Hook Form |
| ORM | Prisma (PostgreSQL) |
| Charts | Recharts |
| State | Zustand |
| AI (optional) | Groq API / Gemini API |

---

## ⚡ Quick Start (No Database Needed)

```bash
git clone https://github.com/YOUR_USERNAME/atomquest-goals-portal.git
cd atomquest-goals-portal
npm install
# DEMO_MODE=true is already set in .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click any role button to sign in.

---

## 🗄️ Full Database Setup (Optional)

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env: set DATABASE_URL, NEXTAUTH_SECRET, DEMO_MODE=false

npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

---

## 🌐 Deploy to Vercel (3 minutes)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import repo
3. Set environment variables:
   - `NEXTAUTH_SECRET` = any random string
   - `NEXTAUTH_URL` = your Vercel URL
   - `DEMO_MODE` = `true`
4. Click **Deploy** ✅

---

## 📐 Architecture

```
Browser (React + Tailwind)
       │ HTTPS
Vercel Edge (Middleware + Caching)
       │ SSR
Next.js Serverless Functions (API Routes + Server Components)
       │ Prisma Client
PostgreSQL (Supabase / Neon / Railway)
```

**Key design decisions:**
- **Serverless-first** → scales to zero when not in use (cost optimised)  
- **Demo Mode** → full portal runs without a database (perfect for judging)  
- **RBAC enforced at middleware + API layer** → no route is unprotected  
- **Zod schemas shared** between client forms and server handlers → single source of truth for all validation

---

## 📋 Business Rules Implemented

- ✅ Maximum **8 goals** per sheet
- ✅ Minimum **10% weightage** per goal  
- ✅ Total weightage must equal **exactly 100%** (live progress bar enforces this)
- ✅ **DRAFT / REWORK_REQUESTED** sheets are editable; approved/locked are read-only
- ✅ Only **Admin/HR** can unlock approved sheets
- ✅ Every workflow change creates an **AuditLog entry**
- ✅ **Shared KPIs** pushed by HR are linked across employee sheets; only weightage is adjustable
- ✅ Progress engine supports **MIN, MAX, TIMELINE, ZERO-based** formulas

---

## 🎬 Demo Flow for Evaluators

1. **Employee journey** → Sign in as `employee@test.com` → Go to **Goals** → See the goal form with live 100% weightage bar → Submit for approval
2. **Manager journey** → Sign in as `manager@test.com` → Go to **Goals** → Review Riya's submitted sheet → Approve or Return for Rework
3. **Admin journey** → Sign in as `admin@test.com` → Go to **Dashboard** → See org-wide analytics → Click **Download CSV Report** → Go to admin controls → Push shared KPI to employees

---

## 📁 Project Structure

```
app/
  (auth)/login        # Login page with role quick-login buttons
  (dashboard)/
    dashboard/        # Role-specific overview dashboards
    goals/            # Goal management (Employee: form, Manager: review, Admin: all)
    analytics/        # Analytics charts page
  api/                # REST endpoints (goals, approvals, check-ins, reports, AI...)
components/
  dashboard/          # GoalForm, CheckInPanel, Charts, ManagerActions, AdminControls
  ui/                 # Button, Card, Input, Badge primitives
lib/
  auth.ts             # NextAuth config with demo mode support
  demo-data.ts        # Rich mock data (no DB needed in demo mode)
  goals-service.ts    # All business logic + RBAC checks
  validations.ts      # Zod schemas (shared client + server)
prisma/
  schema.prisma       # Full database model
  seed.ts             # Seed data for database-backed mode
```


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
