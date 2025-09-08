# Environment Configuration

This project uses **2 environment files** for different deployment scenarios:

## 📁 Environment Files

### `.env` (Development & Schema Operations)
- **Purpose:** Local development and database schema operations
- **Database:** Supabase Session Pooler (Port 5432)
- **Use for:** 
  - `npm run dev` (local development)
  - `npx prisma db push` (schema migrations)
  - `npx prisma migrate dev`

### `.env.production` (Vercel Production)
- **Purpose:** Production deployment on Vercel
- **Database:** Supabase Transaction Pooler (Port 6543)
- **Use for:** Production runtime queries with connection pooling

## 🚀 Usage

**Local Development:**
```bash
npm run dev
# Uses .env automatically
```

**Schema Changes:**
```bash
npx prisma db push
# Uses .env (Session Pooler supports DDL)
```

**Production Deployment:**
```bash
# Copy values from .env.production to Vercel environment variables
# Vercel will use Transaction Pooler for better performance
```

## 🔧 Database Connection Types

| Environment | Pooler Type | Port | Purpose |
|-------------|------------|------|---------|
| Development | Session | 5432 | Schema changes, local dev |
| Production | Transaction | 6543 | Runtime queries, better performance |

## 🛡️ Security Notes

- Never commit actual secrets to version control
- Update `NEXTAUTH_SECRET` in production
- Update `NEXTAUTH_URL` to your actual domain
