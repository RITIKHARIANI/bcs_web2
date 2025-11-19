# Database Connection Pooling Setup

**Date:** November 19, 2025
**Status:** Production Configuration

---

## Overview

The application now uses **two separate database connection URLs** for optimal performance in serverless environments:

1. **Transaction Pooler (Port 6543)** - For web application database queries
2. **Session Pooler (Port 5432)** - For database migrations

This configuration follows Supabase/PgBouncer best practices for Next.js serverless deployments.

---

## Why Two Connection URLs?

### Transaction Pooler (Port 6543)
- Optimized for **serverless functions**
- Faster connection pooling
- Limited PostgreSQL protocol support (sufficient for queries)
- **Used by**: Next.js API routes, server components, server actions

### Session Pooler (Port 5432)
- Full **PostgreSQL protocol support**
- Required for **DDL operations** (CREATE, ALTER, DROP)
- Supports Prisma migrations
- **Used by**: `prisma migrate dev`, `prisma migrate deploy`, `prisma db push`

---

## Environment Variables Setup

### Local Development (.env)

Add **both** variables to your `.env` file:

```bash
# Transaction Pooler (Port 6543) - Used by web app for queries
DATABASE_URL_POOLED="postgresql://postgres.USER:PASSWORD@aws-1-us-east-1.pooler.supabase.com:6543/postgres"

# Session Pooler (Port 5432) - Used for migrations
DATABASE_URL="postgresql://postgres.USER:PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
```

Replace `USER` and `PASSWORD` with your actual Supabase credentials.

### Vercel Production

Add **both** environment variables in Vercel Dashboard:

1. Go to: **Project Settings → Environment Variables**
2. Add:
   - **Name:** `DATABASE_URL_POOLED`
   - **Value:** Your transaction pooler connection string (port 6543)
   - **Environments:** Production, Preview, Development
3. Ensure existing `DATABASE_URL` (port 5432) is already configured

---

## Prisma Schema Configuration

The `prisma/schema.prisma` file now uses both URLs:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL_POOLED")  // Transaction pooler for app queries
  directUrl = env("DATABASE_URL")          // Session pooler for migrations
}
```

- **`url`**: Used for database queries in your application
- **`directUrl`**: Used exclusively for running migrations

---

## How It Works

### During Development
```bash
# Running migrations uses DATABASE_URL (port 5432)
npm run db:migrate:dev

# App runtime queries use DATABASE_URL_POOLED (port 6543)
npm run dev
```

### During Deployment (Vercel)
```bash
# Vercel build command: prisma migrate deploy && next build
# - Migrations use DATABASE_URL (port 5432)
# - Built app uses DATABASE_URL_POOLED (port 6543)
```

---

## Troubleshooting

### Error: "Can't reach database server at port 6543"
**Solution:** Ensure `DATABASE_URL_POOLED` is set in your environment

### Migrations fail with "Invalid PostgreSQL protocol"
**Solution:** Verify `DATABASE_URL` (not `DATABASE_URL_POOLED`) uses port 5432

### App queries fail in production
**Solution:** Check that `DATABASE_URL_POOLED` is set in Vercel environment variables

---

## Migration from Old Setup

**Before (Single URL):**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // Used for everything
}
```

**After (Dual URL):**
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL_POOLED")  // App queries
  directUrl = env("DATABASE_URL")          // Migrations
}
```

**Action Required:**
- Add `DATABASE_URL_POOLED` to local `.env`
- Add `DATABASE_URL_POOLED` to Vercel environment variables
- Regenerate Prisma Client: `npm run db:generate`

---

## References

- [Supabase Connection Pooling Documentation](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma Connection Management](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections)
- [Next.js Serverless Functions Best Practices](https://vercel.com/docs/functions/serverless-functions)

---

**Last Updated:** November 19, 2025
**Related Files:**
- `prisma/schema.prisma` - Database configuration
- `.env` - Local environment variables (gitignored)
- `docs/DATABASE_MIGRATION_GUIDE.md` - Migration workflow
