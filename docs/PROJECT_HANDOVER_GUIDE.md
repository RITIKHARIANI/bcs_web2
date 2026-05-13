# Project Handover Guide: Move to GitHub Organization + New Dev Environment

**Last Updated:** May 2026

## Context

Ritik is handing over the project to Professor Willits. Currently:
- **Production repo:** `jonwillits/bcs_web2` → deployed to `brainandcognitivescience.com` via **prof's personal Vercel**
- **Dev repo (Ritik's fork):** `RITIKHARIANI/bcs_web2` → deployed to `bcs-web2.vercel.app` via **Ritik's personal Vercel**
- **Prod database:** Prof's personal Supabase account
- **Dev database:** Ritik's personal Supabase account
- **Prod email:** Prof's personal Resend account
- **Dev email:** Ritik's personal Resend account
- **Prod error tracking:** Prof's personal Sentry account
- **Dev error tracking:** Ritik's personal Sentry account (or not set up)

All services (GitHub, Vercel, Supabase, Resend, Sentry) are on personal accounts — there is no shared "university account" for any of them.

The professor wants to (a) continue developing independently, (b) optionally move the repo to an org account, and (c) consolidate dev + prod databases under his own Supabase account. This guide covers the full handover.

---

## Recommended Architecture (Post-Handover)

```
┌─────────────────────────────────────────────────────────────┐
│                    GITHUB ORGANIZATION                       │
│  e.g. "bcs-elearning" (or any name)                         │
│  Repo: bcs-elearning/bcs_web2  ← source of truth            │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌──────────────────────────┐    ┌──────────────────────────────┐
│   PRODUCTION             │    │   DEVELOPMENT                │
│ Vercel: prof's existing  │    │ Vercel: prof's (2nd project) │
│ Domain: brain...         │    │ URL: bcs-dev.vercel.app      │
│ DB: Supabase project #1  │    │ DB: Supabase project #2      │
│ Email: Resend (existing) │    │ Email: "console" (no Resend) │
│ Sentry: existing project │    │ Sentry: 2nd project or skip  │
│ Repo: org/bcs_web2 main  │    │ Repo: jonwillits/bcs_web2    │
└──────────────────────────┘    └──────────────────────────────┘
```

---

## Step 1: Create GitHub Organization

This is optional but recommended. It cleanly separates "the project" from "the professor's personal account."

1. Go to https://github.com/organizations/plan → choose the **Free** plan
2. Name it something like `bcs-elearning` or `uiuc-bcs` (whatever makes sense)
3. Add the professor as **Owner**
4. Optionally add Ritik or other collaborators as Members

**If the professor decides NOT to use an org:** Skip this step and Step 2. The professor's personal repo stays as production, and he creates a second personal repo or uses branches for dev. The fork-based workflow still works — he just forks his own repo (GitHub allows this via "create a new repository from template" or by creating a bare clone). However, **an org is cleaner** because GitHub natively supports forking org repos to personal accounts.

---

## Step 2: Transfer Repo to Organization

1. On GitHub: `jonwillits/bcs_web2` → **Settings** → **Danger Zone** → **Transfer repository**
2. Transfer to the new org (e.g., `bcs-elearning`)
3. The repo becomes `bcs-elearning/bcs_web2`
4. GitHub automatically creates a redirect from `jonwillits/bcs_web2` → `bcs-elearning/bcs_web2`

**Impact on prof's production Vercel:**
- Vercel follows GitHub repo transfers automatically — the connection should survive
- Verify in prof's Vercel dashboard: **Project → Settings → Git** → confirm it shows the new org repo
- If Vercel lost the connection: reconnect to `bcs-elearning/bcs_web2`, same branch (`main`)

**Impact on Ritik's fork:**
- Ritik's fork (`RITIKHARIANI/bcs_web2`) will automatically re-point to the new org repo as its upstream
- No action needed on Ritik's side (his fork continues to work)

---

## Step 3: Professor Forks the Org Repo

1. Professor goes to `bcs-elearning/bcs_web2` on GitHub
2. Clicks **Fork** → creates `jonwillits/bcs_web2` (his personal fork)
3. This is the professor's **development** repo — same model Ritik used

```bash
# Professor clones his fork
git clone https://github.com/jonwillits/bcs_web2.git
cd bcs_web2

# Add upstream (org repo)
git remote add upstream https://github.com/bcs-elearning/bcs_web2.git

# Verify
git remote -v
# origin    https://github.com/jonwillits/bcs_web2.git (fork)
# upstream  https://github.com/bcs-elearning/bcs_web2.git (org/prod)
```

---

## Step 4: Create Dev Vercel Project for Professor

The professor already has one Vercel project (production, connected to what was `jonwillits/bcs_web2`, now the org repo). He needs a **second** Vercel project for dev.

1. Professor logs into **Vercel** (same personal account that has the prod project)
2. **Add New → Project** → Import from GitHub → select `jonwillits/bcs_web2` (the fork)
3. Project name: e.g., `bcs-dev` (will get URL like `bcs-dev.vercel.app`)
4. **Framework:** Next.js (auto-detected)
5. **Build Command:** `npm run vercel:build`
6. **Install Command:** `npm run vercel:install`
7. **Environment Variables:** Set all dev variables (see Step 6)

The professor's existing Vercel project stays connected to the **org repo** for production. He now has two Vercel projects:
- **Existing project** → org repo → production (`brainandcognitivescience.com`)
- **New project** → personal fork → development (`bcs-dev.vercel.app`)

---

## Step 5: Create Dev Database (Supabase)

Supabase free tier allows **2 active projects** per account. The professor's personal Supabase account already has the production project. He creates a second one for dev in the same account.

1. Go to https://supabase.com/dashboard → **New Project**
2. Name: e.g., `bcs-dev` (or `bcs-etextbook-dev`)
3. Region: same as prod (`us-east-1`) for consistency
4. Set a database password → **save it**
5. Once created, go to **Settings → Database** to get connection strings:
   - **Transaction pooler (port 6543):** Use as `DATABASE_URL`
   - **Session pooler (port 5432):** Use as `DIRECT_URL`

### Initialize the dev database schema

```bash
# In the cloned fork directory, create a .env.local with the new dev DB credentials:
DATABASE_URL="postgresql://postgres.[DEV_PROJECT_ID]:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[DEV_PROJECT_ID]:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres"

# Apply all migrations to the new dev database
npx prisma migrate deploy

# Seed data
npm run seed:achievements
npm run seed:playgrounds
```

### Enable Row Level Security

RLS must be enabled on all public tables — same as production. The migration files handle schema but not RLS policies. Copy RLS policies from production using Supabase dashboard or run the same SQL statements used during initial setup.

**Alternative (paid tier):** If the professor is on Supabase Pro ($25/project/month), he can use **Supabase Branching** which auto-creates preview databases from migrations. But for most cases, a second free project is simpler.

---

## Step 6: Dev Environment Variables (Professor's Vercel)

Set these on the professor's **new dev** Vercel project (the one connected to his fork). Full template at `.env.development.example`.

```bash
# Database (NEW dev Supabase project)
DATABASE_URL="postgresql://postgres.[DEV_ID]:[DEV_PASSWORD]@...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[DEV_ID]:[DEV_PASSWORD]@...pooler.supabase.com:5432/postgres"

# Auth
NEXTAUTH_URL="https://bcs-dev.vercel.app"   # Professor's dev Vercel URL
NEXTAUTH_SECRET="[generate-new: openssl rand -base64 32]"

# Email — use "console" for dev (logs to Vercel logs instead of sending real emails)
# No Resend API key needed for "console" mode
EMAIL_PROVIDER="console"
EMAIL_FROM="noreply@localhost"
EMAIL_FROM_NAME="BCS E-Learning (DEV)"

# Supabase file storage (NEW dev project)
NEXT_PUBLIC_SUPABASE_URL="https://[DEV_PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[dev-anon-key]"

# Access control
ADMIN_EMAILS="jonwillits@illinois.edu"
SUPER_ADMIN_EMAIL="jonwillits@illinois.edu"

# Canvas (optional — reuse same encryption key or generate new)
CANVAS_BASE_URL="https://canvas.illinois.edu"
CANVAS_TOKEN_ENCRYPTION_KEY="[openssl rand -hex 32]"

# Sentry (optional for dev — leave blank to skip error tracking)
NEXT_PUBLIC_SENTRY_DSN=""
SENTRY_ORG=""
SENTRY_PROJECT=""
SENTRY_AUTH_TOKEN=""

# Telemetry & flags
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_ENABLE_RICH_TEXT_EDITOR=true
NEXT_PUBLIC_ENABLE_GRAPH_VISUALIZATION=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Email for Dev (Resend)

For development, use `EMAIL_PROVIDER="console"` — this logs emails to the Vercel deployment logs instead of sending real emails. No Resend account or API key is needed.

If the professor wants to send **real emails** from dev (e.g., to test email verification flows end-to-end), he can:
1. Use his existing Resend account (same one as prod)
2. Create a second API key for dev
3. Set `EMAIL_PROVIDER="resend"` and `RESEND_API_KEY="re_[dev_key]"` on the dev Vercel project
4. Use `onboarding@resend.dev` as `EMAIL_FROM` (Resend's free testing sender — no domain verification needed)

### Sentry for Dev

Sentry is optional for dev. Options:
- **Skip it:** Leave all `SENTRY_*` env vars blank. The build still succeeds; source maps just won't upload and errors won't be tracked.
- **Use a second Sentry project:** In the same Sentry account, create a project like `bcs-etextbook-dev`. Set its DSN and auth token on the dev Vercel project. This keeps dev errors separate from production.

---

## Step 7: Codebase Cleanup (Code Changes)

These are code changes to remove Ritik-specific hardcoded values. Make these changes in the professor's fork, then PR to the org repo.

### 7a. Footer GitHub link
**File:** `src/components/Footer.tsx` line 100
- Change: `https://github.com/RITIKHARIANI/bcs_web2` → `https://github.com/bcs-elearning/bcs_web2` (org URL)

### 7b. CORS fallback URL
**File:** `next.config.ts` line 119
- Change: `'https://bcs-etextbook.vercel.app'` → `process.env.NEXTAUTH_URL || 'https://brainandcognitivescience.com'`
- This makes CORS use the actual deployment URL rather than a hardcoded one

### 7c. HTTPS redirect URL
**File:** `next.config.ts` line 150
- Change: `'https://bcs-etextbook.vercel.app/:path*'` → `` `${process.env.NEXTAUTH_URL || 'https://brainandcognitivescience.com'}/:path*` ``
- Same rationale — use env var instead of hardcoded

### 7d. Support email
**File:** `src/app/auth/pending-approval/page.tsx` line 99
- The `mailto:support@brainandcognitivescience.org` is fine — this is the production support email
- No change needed (or make it configurable via env var if desired)

### 7e. Documentation updates
**File:** `docs/DEV_PROD_WORKFLOW.md`
- Update all references from `RITIKHARIANI/bcs_web2` → `jonwillits/bcs_web2` (prof's fork)
- Update org repo references from `jonwillits/bcs_web2` (as prod) → `bcs-elearning/bcs_web2`
- Update dev URL from `bcs-web2.vercel.app` → `bcs-dev.vercel.app` (prof's dev URL)

**File:** `.env.development.example`
- Update `NEXTAUTH_URL` from `https://bcs-web2.vercel.app` → `https://bcs-dev.vercel.app` (or a generic placeholder)

**File:** `CLAUDE.md`
- Update dev URL, GitHub references, and test credentials section

---

## Step 8: Production Vercel — Verify After Transfer

After the repo transfer to the org:

1. Go to prof's **existing Vercel project (production) → Settings → Git**
2. Confirm it's connected to `bcs-elearning/bcs_web2` branch `main`
3. Trigger a redeploy to verify everything still works
4. Check: site loads, auth works, database connects, emails send

---

## Step 9: Create Test Accounts on Dev

Once the dev environment is running:

```bash
# Register on the dev site (bcs-dev.vercel.app)
# Use the professor's email so it gets auto-admin
# Or use the existing test account creation scripts:
node scripts/create-test-faculty.js
node scripts/create-test-student.js
```

---

## Step 10: Decommission Ritik's Dev Environment

Once the professor's dev environment is working:

1. **Ritik's Vercel project** (`bcs-web2.vercel.app`): Delete or leave inactive
2. **Ritik's Supabase project**: Delete or leave (contains only test data)
3. **Ritik's Resend account**: No longer needed for this project (or keep if used for other projects)
4. **Ritik's Sentry project**: No longer needed for this project
5. **Ritik's fork** (`RITIKHARIANI/bcs_web2`): Can be archived or deleted

---

## Quick Answers

**Q: How does the professor set up a dev environment?**
Fork the org repo to his personal GitHub, create a second Vercel project on his account connected to the fork, create a second Supabase project on his account for dev DB.

**Q: The professor's GitHub is currently production — what to do?**
Transfer the repo to a GitHub org. The org repo becomes production. Professor forks it to his personal account for dev.

**Q: Can the repo move to an org? Would it break things?**
Yes, and it won't break things. GitHub creates automatic redirects. Vercel (on prof's personal account) follows repo transfers. Just verify the Git connection in Vercel after transfer.

**Q: Can one Supabase account have two databases (dev + prod)?**
Yes. Supabase free tier allows 2 projects per account. Professor creates a second project in the same personal Supabase account for dev. Both get independent databases with the same schema (applied via `prisma migrate deploy`).

---

## Verification Checklist

- [ ] Org created, repo transferred, prof can access org repo
- [ ] Prof's fork created, cloned, upstream remote set
- [ ] Dev Supabase project created, schema migrated, seeds run
- [ ] Dev Vercel project created, all env vars set
- [ ] Dev site loads at prof's Vercel URL
- [ ] Auth works (register, login, email verification)
- [ ] Production site still works after repo transfer
- [ ] Codebase hardcoded URLs updated and committed
- [ ] Documentation updated with new repo/URL references
