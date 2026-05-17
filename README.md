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
